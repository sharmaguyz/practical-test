const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');
const orderService = require('../../services/order');
const userService = require('../../services/user');
// const stripe = require('../../config/stripe/stripe');
// const { paypal,paypalClient } = require('../../config/paypal/paypal');
const sendMail = require('../../config/helpers/emailHelper');
const PaymentSettingModel = require('../../models/payment_setting');
module.exports = {
    placeOrder: async(req,res) => {
        try {
            const { cart_items,payment_method } = req.body;
            const line_items = cart_items.map(course => ({
                price_data: {
                    currency: 'usd',
                    unit_amount: course.price * 100,
                    product_data: { name: course.courseName },
                },
                quantity: 1,
            }));
            const userId = req.user.id;
            const { user } = await userService.findByUserId(userId);
            if(!user) return sendError(res, { message: 'Invalid user' },404);
            if(payment_method == 'stripe'){
                const stripeSettings = await PaymentSettingModel.findByPlatform('stripe');
                if (!stripeSettings || !stripeSettings.secretKey) {
                    return sendError(res, { message: 'Stripe payment settings not configured.'}, 500);
                }
                const stripe = require('stripe')(stripeSettings.secretKey); 
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    mode: 'payment',
                    line_items,
                    metadata: {
                        userId,
                        courseIds: cart_items.map(c => c.course_id).join(','),
                    },
                    customer_email: user.email,
                    success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=stripe`,
                    cancel_url: `${process.env.FRONTEND_URL}/checkout`,
                });
                req.body.userId = userId;
                req.body.sessionId = session.id;
                const result = await orderService.placeOrder(req.body);
                if(result.code == 201){
                    return sendSuccess(res,{ cart_items: line_items,url: session.url },'SUCCESS',201);
                }
            }else{
                const paypalSettings = await PaymentSettingModel.findByPlatform('paypal');
                if (!paypalSettings || !paypalSettings.clientId || !paypalSettings.secretKey) {
                    return sendError(res, { message: 'PayPal payment settings not configured.' }, 500);
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
                const request = new paypal.orders.OrdersCreateRequest();
                const totalAmount = cart_items
                .reduce((sum, item) => sum + parseFloat(item.price), 0)
                .toFixed(2);
                console.log("totalAmount===>",totalAmount);
                request.headers['Prefer'] = 'return=representation';
                request.requestBody({
                    intent: 'CAPTURE',
                    purchase_units: [
                        {
                        reference_id: `ORDER-${Date.now()}`,
                        description: 'Course purchase',
                        amount: {
                            currency_code: 'USD',
                            value: totalAmount,
                            breakdown: {
                                item_total: {
                                    currency_code: 'USD',
                                    value: totalAmount,
                                },
                            },
                        },
                        items: cart_items.map((course) => ({
                            name: course.courseName,
                            unit_amount: {
                                currency_code: 'USD',
                                value: parseFloat(course.price).toFixed(2),
                            },
                            quantity: '1',
                        })),
                        },
                    ],
                    application_context: {
                        brand_name: 'Practical Academy',
                        user_action: 'PAY_NOW',
                        return_url: `${process.env.FRONTEND_URL}/payment-success?session_id=ORDER_PLACEHOLDER&type=paypal`,
                        cancel_url: `${process.env.FRONTEND_URL}/checkout`,
                    },
                });
                const order = await paypalClient.execute(request);
                const approvalUrl = order.result.links.find((l) => l.rel === 'approve')?.href;
                req.body.userId = userId;
                req.body.sessionId = order.result.id;
                const result = await orderService.placeOrder(req.body);
                if(result.code == 201){
                    return sendSuccess(res,{ cart_items: line_items,url: approvalUrl },'SUCCESS',201);
                }
            }
            throw new Error("Error while placing order");
        } catch (error) {
            return sendError(res,{ message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined },500);
        }
    },
    webHook: async(req,res) => {
        try {
            const sig = req.headers['stripe-signature'];
            let event;
            const stripeSettings = await PaymentSettingModel.findByPlatform('stripe');
            const stripe = require('stripe')(stripeSettings.secretKey); 
            try {
                if(!stripeSettings.webhookSecret) return sendError(res, { message: "Webhook Secret not found." },404);
                event = stripe.webhooks.constructEvent(req.body, sig, stripeSettings.webhookSecret);
            } catch (err) {
                console.error('❌ Webhook signature verification failed:', err.message);
                return sendError(res,{ message:`Webhook Error: ${err.message}` },400);
            }
            const session = event.data.object;
            const studentEmail = session.customer_email;
            const { user } = await userService.userExist(studentEmail);
            switch (event.type) {
                case 'checkout.session.completed':
                   
                case 'checkout.session.async_payment_succeeded':
                    const studentId = session.metadata?.userId;
                    const courseIds = session.metadata?.courseIds?.split(',') ?? [];
                    await orderService.changeOrderStatus(session.id, 'paid', 'completed','stripe');
                    await userService.deleteByCourseId(courseIds,studentId);
                    await orderService.sendPaymentSuccessMail(session.id,studentEmail,user.fullName,'stripe');
                    // await userService.cloneStudentCoursesWorkspace(studentId,courseIds);
                    break;
                case 'checkout.session.async_payment_failed':
                    console.warn('❌ Delayed payment failed for session:', session.id);
                    await orderService.changeOrderStatus(session.id, 'failed', 'canceled','stripe');
                    await orderService.sendPaymentFailedMail(session.id,studentEmail,user.fullName,'stripe');
                    break;
                case 'checkout.session.expired':
                    console.log('ℹ️ Checkout session expired:', session.id);
                    await orderService.changeOrderStatus(session.id, 'failed', 'canceled','stripe');
                    break;
            }
            return sendSuccess(res, { message: "Recieved successfully!" },'SUCCESS',200);
        } catch (error) {
            return sendError(res,{ message: 'Something went wrong! Please try after some time', error: error.message },500);
        }
    },
    getPlacedCourses: async(req,res) => {
        try {
            const { sessionId, type } = req.query;
            const courses = await orderService.getPlacedOrder(sessionId,type);
            if(courses.code == 200) return sendSuccess(res,{ courses: courses.courses, message: "Order get successfully." },'SUCCESS',200);
        } catch (error) {
            return sendError(res,{ message: 'Something went wrong! Please try after some time', error: error.message },500);
        }
    },
   
}