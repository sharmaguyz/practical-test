const OrderModel = require('.././models/order');
const BillingAddressModel = require('.././models/billing_address');
const CourseModel = require('.././models/course');
const sendMail = require('.././config/helpers/emailHelper');
// const { paypal,paypalClient } = require('.././config/paypal/paypal');
const UserModel = require('.././models/users');
const CartModel = require('.././models/cart');
const PaymentSettingModel = require('.././models/payment_setting');
const AdminModel = require('.././models/admin');
class OrderService {
    async placeOrder (data){
        try {
          
            const result = await BillingAddressModel.create(data);
              const newData = {
                ...data,
                billingAddressId: result.item.id
            }
            const orderResult = await OrderModel.create(newData);
            if(orderResult.insertItem.id) return { success: true, code: 201, orderId: orderResult.insertItem.id };
        } catch (error) {
            return { success: false, code: 500 };
        }
    }
    async changeOrderStatus(sessionId,paymentStatus,status,type){
        try {
            const result = await OrderModel.orderStatus(sessionId,paymentStatus,status,type);
            if(result) return { success: true, code: 200 };
        } catch (error) {
            return { success: false, code: 500, error: error };
        }
    }
    async getPlacedOrder(sessionId,type){
        try {
            const courseIds = await OrderModel.getPlacedCourses(sessionId,type);
            const courses = await CourseModel.findByCourseIds(courseIds);
            if(type == 'paypal'){
                const { success } = await this.capturePaypalPayment(sessionId);
                if(!success) return { success: false, code: 500 };
            }
            if(courses.length > 0) return { success: true, code: 200, courses: courses };
        } catch (error) {
            return { success: false, code: 500, error: error };
        }
    }
    async sendPaymentSuccessMail(sessionId, email, fullName, type) {
        try {
            const courseIds = await OrderModel.getPlacedCourses(sessionId, type);
            if (!courseIds?.length) return;
            const courses = await CourseModel.findByCourseIds(courseIds);
            if (!courses?.length) return;
            const { orderId } = await OrderModel.findBySessionId(sessionId, type);
            const invoiceDetail = await CourseModel.invoiceDetail(orderId, courses[0].courseId);
            const instructorIds = [...new Set(courses.map(c => c.instructorId))];
            const instructors = await UserModel.findByIds(instructorIds);
            const instructorMap = new Map();
            instructors.forEach(inst => {
                instructorMap.set(inst.id, {
                    name: inst.fullName || inst.name || 'Instructor',
                    email: inst.email
                });
            });
            await Promise.all([
                this.sendStudentMail({ email, fullName, courses, invoiceDetail }),
                this.sendInstructorsMail({ fullName, courses, instructorMap, invoiceDetail }),
                this.sendAdminPurchaseMail({ fullName, courses, invoiceDetail, instructorMap }),
            ]);
        } catch (error) {
            console.error("sendPaymentSuccessMail failed:", error);
            return { success: false, code: 500, error };
        }
    }
    async sendInstructorsMail({ fullName, courses, instructorMap, invoiceDetail }) {
        console.log("maincourses",courses);
        const instructorCourseMap = new Map();
        courses.forEach(course => {
            if (!instructorMap.has(course.instructorId)) return;
            if (!instructorCourseMap.has(course.instructorId)) {
                instructorCourseMap.set(course.instructorId, []);
            }
            instructorCourseMap.get(course.instructorId).push(course);
        });
        const mailPromises = [];
        for (const [instructorId, instructroCourses] of instructorCourseMap.entries()) {
            const instructor = instructorMap.get(instructorId);
            if (!instructor?.email || !Array.isArray(instructroCourses)) continue;
            let courseData = '', invoiceCourses = '';
            instructroCourses.forEach((c, i) => {
                courseData += `<tr>
                    <td>${i + 1}</td>
                    <td><img src="${c.courseImage}" alt="Course ${i + 1}" style="display:block;border:1px solid #ccc;width:50px !important"></td>
                    <td>${c.courseName}</td>
                    <td>$${c.price}.00</td>
                    <td style="color:green;font-weight:bold;">Paid</td>
                </tr>`;
                invoiceCourses += `<tr>
                    <td style="border: 1px solid #ccc; padding: 8px 10px;">${i + 1}</td>
                    <td style="border: 1px solid #ccc; padding: 8px 10px;">${c.courseName}</td>
                    <td style="border: 1px solid #ccc; padding: 8px 10px;">${c.startDate}</td>
                    <td style="border: 1px solid #ccc; padding: 8px 10px;">${c.endDate}</td>
                    <td style="border: 1px solid #ccc; padding: 8px 10px;">$${c.price}.00</td>
                </tr>`;
            });
            mailPromises.push(sendMail({
                to: instructor.email,
                subject: 'A Student Enrolled in your course(s)',
                template: 'course-buy-instructor',
                templateData: {
                    userName: fullName,
                    courses : instructroCourses,
                    courseData,
                    invoiceDetail,
                    invoiceCourses,
                    instructorName: instructor.name,
                }
            }));
        }
        return Promise.all(mailPromises);
    }
    async sendStudentMail({ email, fullName, courses, invoiceDetail }) {
        let courseData = '', invoiceCourses = '';
        courses.forEach((c, i) => {
            courseData += `<tr>
                <td>${i + 1}</td>
                <td><img src="${c.courseImage}" alt="Course ${i + 1}" style="display:block;border:1px solid #ccc;width:50px !important"></td>
                <td>${c.courseName}</td>
                <td>$${c.price}.00</td>
                <td style="color:green;font-weight:bold;">Paid</td>
            </tr>`;
            invoiceCourses += `<tr>
                <td style="border: 1px solid #ccc; padding: 8px 10px;">${i + 1}</td>
                <td style="border: 1px solid #ccc; padding: 8px 10px;">${c.courseName}</td>
                <td style="border: 1px solid #ccc; padding: 8px 10px;">${c.startDate}</td>
                <td style="border: 1px solid #ccc; padding: 8px 10px;">${c.endDate}</td>
                <td style="border: 1px solid #ccc; padding: 8px 10px;">$${c.price}.00</td>
            </tr>`;
        });
        return sendMail({
            to: email,
            subject: 'Course Payment successful!',
            template: 'course-payment-success',
            templateData: {
                userName: fullName,
                courses,
                courseData,
                invoiceDetail,
                invoiceCourses
            }
        });
    }
    async sendAdminPurchaseMail({ fullName, courses, invoiceDetail, instructorMap }) {
        let courseData = '', invoiceCourses = '';
        courses.forEach((c, i) => {
            const instructorName = instructorMap.get(c.instructorId)?.name || 'N/A';
            courseData += `<tr>
                <td>${i + 1}</td>
                <td><img src="${c.courseImage}" alt="Course ${i + 1}" style="display:block;border:1px solid #ccc;width:50px !important"></td>
                <td>${c.courseName}</td>
                <td>${instructorName}</td>
                <td>$${c.price}.00</td>
                <td style="color:green;font-weight:bold;">Paid</td>
            </tr>`;
            invoiceCourses += `<tr>
                <td style="border: 1px solid #ccc; padding: 8px 10px;">${i + 1}</td>
                <td style="border: 1px solid #ccc; padding: 8px 10px;">${c.courseName}</td>
                <td style="border: 1px solid #ccc; padding: 8px 10px;">${c.startDate}</td>
                <td style="border: 1px solid #ccc; padding: 8px 10px;">${c.endDate}</td>
                <td style="border: 1px solid #ccc; padding: 8px 10px;">$${c.price}.00</td>
            </tr>`;
        });
        const admins = await AdminModel.getAllActiveAdmins();
        const adminEmails = admins.map(a => a.email).filter(Boolean);
        if (!adminEmails.length) return;
        return sendMail({
            to: adminEmails,
            subject: 'Student Course Purchase Notification',
            template: 'course-buy-admin',
            templateData: {
                userName: fullName,
                courses,
                courseData,
                invoiceDetail,
                invoiceCourses
            }
        });
    }

    async sendPaymentFailedMail(sessionId,email,fullName,type){
        try {
            const courseIds = await OrderModel.getPlacedCourses(sessionId,type);
            const courses = await CourseModel.findByCourseIds(courseIds);
            let courseData = "";
            courses.forEach(function (c, i) {
                courseData += `<tr>
                    <td>${i + 1}</td>
                    <td>
                        <img src="${c.courseImage}" alt="Course ${i + 1}" style="display:block;border:1px solid #ccc;width:50px !important">
                    </td>
                    <td>${c.courseName}</td>
                    <td>$${c.price}.00</td>
                    <td style="color:red;font-weight:bold;">Failed</td>
                </tr>`;
            });
            if(courses.length > 0){
                await sendMail({
                    to: email,
                    subject: 'Course Payment Failed!',
                    template: 'course-payment-failed',
                    templateData: {
                        userName: `${fullName}`,
                        courses: courses,
                        courseData
                    }
                });
            };
        } catch (error) {
            console.log(error);
            return { success: false, code: 500, error: error };
        }
    }
    async sendPaymentDeclinedMail(sessionId,email,fullName,type){
        try {
            const courseIds = await OrderModel.getPlacedCourses(sessionId,type);
            const courses = await CourseModel.findByCourseIds(courseIds);
            let courseData = "";
            courses.forEach(function (c, i) {
                courseData += `<tr>
                    <td>${i + 1}</td>
                    <td>
                        <img src="${c.courseImage}" alt="Course ${i + 1}" style="display:block;border:1px solid #ccc;width:50px !important">
                    </td>
                    <td>${c.courseName}</td>
                    <td>$${c.price}.00</td>
                    <td style="color:red;font-weight:bold;">Declined</td>
                </tr>`;
            });
            if(courses.length > 0){
                await sendMail({
                    to: email,
                    subject: 'Course Payment Declned!',
                    template: 'course-payment-declined',
                    templateData: {
                        userName: `${fullName}`,
                        courses: courses,
                        courseData
                    }
                });
            };
        } catch (error) {
            console.log(error);
            return { success: false, code: 500, error: error };
        }
    }
    async capturePaypalPayment(orderId) {
        const { userId } = await OrderModel.findBySessionId(orderId,'paypal');
        const user = await UserModel.findById(userId);
        const paypalSettings = await PaymentSettingModel.findByPlatform('paypal');
        if (!paypalSettings || !paypalSettings.clientId || !paypalSettings.secretKey) {
            return { success: false, message: "Invalid Paypal credentials" };
        }
        const paypal = require('@paypal/checkout-server-sdk');
        let environment;
        if (paypalSettings.paypalMode === 'sandbox') {
            environment = new paypal.core.SandboxEnvironment(
                paypalSettings.clientId,
                paypalSettings.secretKey
            );
        } else {
            environment = new paypal.core.LiveEnvironment(
                paypalSettings.clientId,
                paypalSettings.secretKey
            );
        }
        const paypalClient = new paypal.core.PayPalHttpClient(environment);
        try {
            const request = new paypal.orders.OrdersCaptureRequest(orderId);
            request.requestBody({});
            const capture = await paypalClient.execute(request);
            if (capture.result.status === 'COMPLETED') {
                await this.changeOrderStatus(orderId,'paid','completed','paypal');
                await this.sendPaymentSuccessMail(orderId,user.email,user.fullName,'paypal');
                const courseIds = await OrderModel.getPlacedCourses(orderId,'paypal');
                await CartModel.deleteByCourses(courseIds,user.id);
                return { success: true };    
            }
            if(['PENDING', 'IN_PROGRESS'].includes(capture.result.status)){
                await this.changeOrderStatus(orderId,'pending','pending','paypal');
                return { success: true };    
            }
            if(['FAILED', 'VOIDED', 'CANCELLED', 'DECLINED'].includes(capture.result.status)){
                await this.changeOrderStatus(orderId,'failed','canceled','paypal');
                await this.sendPaymentFailedMail(orderId,user.email,user.fullName,'paypal');
                return { success: true };    
            }
        } catch (error) {
            if(error.statusCode == 422 && error.message?.includes('INSTRUMENT_DECLINED')){
                await this.changeOrderStatus(orderId,'declined','canceled','paypal');
                await this.sendPaymentDeclinedMail(orderId,user.email,user.fullName,'paypal');
            }
            return { success: false };
        }
    }
}
module.exports = new OrderService();