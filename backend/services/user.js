const UserModel = require('../models/users');
const cognitoService = require('.././services/cognito');
const sendMail = require('.././config/helpers/emailHelper');
const CommonHelper = require('.././config/helpers/common');
const crypto = require('crypto');
const USER_ROLES  = require('.././config/enums/role');
const UserMetaData = require('../models/users_meta_data');
const CourseModel = require('../models/course');
const CartModel = require('../models/cart');
const BillingAddressModel = require('../models/billing_address');
const workspaceService = require('.././services/workspaceService');
const WORKSPACES_ID = require('../config/enums/workspaces');
class UserService {
    async userExist(email){
        try {
            const exist = await UserModel.findByEmail(email);
            if(exist) return { success : true, user:{ id: exist.id, fullName: exist.fullName, cognitoUserName: exist.cognitoUserName, isApproved: exist.isApproved, awsApproved: exist.awsApproved, role: exist.role, email: exist.email,password: exist.password, resetPasswordToken:exist.resetPasswordToken, resetPasswordExpires:exist.resetPasswordExpires, createdBy:exist.createdBy } };
            return { success : false };
        } catch (error) {
            return { success : false };
        }
    }
    async findByUserId(userId){
        try {
            const user = await UserModel.findById(userId);
            if(user) return { success: true, user: user };
        } catch (error) {
            return { success : false };
        }
    }
    async create(data,role){
        try {
            const country = data.country ? CommonHelper.getCountryNameByCountryCode(data.country) : "";
            const state = data.country && data.state ? CommonHelper.getStateNameByStateCode(data.country, data.state) : "";
            const city = data.city || "";
            const addressParts = [city, state, country].filter(part => part && part.trim() !== "");
            const address = addressParts.join(", ");
            const cognitoResponse = await cognitoService.signup(data.email, data.password, data.fullName, address);
            if (!cognitoResponse.success) {
                throw new Error(cognitoResponse.error);
            }
            const cognitoUserName = cognitoResponse.username;
            const createdUser = await UserModel.create({
                ...data,
                role: role.roleId,
                cognitoSub: cognitoResponse.sub,
                cognitoUserName: cognitoUserName,
                createdBy:USER_ROLES.STUDENT
            });
            await sendMail({
                to: data.email,
                subject: 'Succesfully Registered',
                template: 'user-registeration',
                templateData: {
                    userName: `${data.fullName}`,
                }
            });
            return { success: true, id: createdUser.user.id}
        } catch (error) {
            return { success: false ,error: process.env.NODE_ENV === 'development' ? error.message : undefined};
        }
    }
    async forgotPassword(user){
        try {
            const resetToken = crypto.randomBytes(20).toString('hex');
            await UserModel.updateResetToken(user.id, resetToken);
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            await sendMail({
                to: user.email,
                subject: 'Password Reset Request',
                template: 'password-reset',
                templateData: {
                    userName: `${user.fullName}`,
                    resetUrl: resetUrl,
                }
            }); 
            return { success: true };
        } catch (error) {
            return { success: false }
        }
    }
    async verifyUser(user, code) {
        try {
            const verifyUser = await cognitoService.verifyUser(user.cognitoUserName, code);
            const errorType = verifyUser.message;
            if (errorType.includes("Invalid code provided") || errorType.includes("Invalid verification code provided, please try again.")) {
                return {
                    success: false,
                    status: 400,
                    message: "Verification failed! Invalid code provided, please request a code again.",
                };
            }
            // if (errorType.includes("User cannot be confirmed. Current status is CONFIRMED")) {
            //     await UserModel.cognitoAccountVerified(user.id);
            //     return {
            //         success: true,
            //         status: 200,
            //     };
            // }
            await UserModel.cognitoAccountVerified(user.id);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                status: 500,
                message: "Internal error during verification.",
            };
        }
    }

    async resendCode(user){
        try {
            const resendResult = await cognitoService.resendVerificationCode(user.cognitoUserName);
            if (!resendResult.success) {
                return { success: false };
            }
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    }
    async findByToken(token) {
        try {
            const result = await UserModel.findByToken(token);
            if(result){
                return { success: true, resetPasswordToken:result.resetPasswordToken, resetPasswordExpires:result.resetPasswordExpires, email:result.email};
            }
        } catch (error) {
            return { success : false };
        }
    }
    async resetPassword(userId,newPassword) {
        try {
            const user = await UserModel.findById(userId);
            if(user){
                const cognitoResult = await cognitoService.resetPassword(user.cognitoUserName,newPassword);
                if(cognitoResult.success){
                    const result = await UserModel.updatePassword(userId,newPassword);
                    if(result) return { success: true };
                }
            }
            return { success: false };
        } catch (error) {
            return { success: false };
        }
    }
    async verifyCurrentPassword(username, currentPassword){
        try {
            const result = await cognitoService.verifyCurrentPassword(username,currentPassword);
            if(result.success && result.code == 200) return { success: true, code: result.code };
            if(!result.success && result.code == 404) return { success: false, code: result.code };
        } catch (error) {
            return { success: false,code: 500 }
        }
    }
    async changePassword(accessToken, oldPassword, newPassword,userId){
        try {
            const result = await cognitoService.changePassword(accessToken, oldPassword, newPassword);
            if(result.success && result.statusCode == 200) {
                await UserModel.updatePassword(userId,newPassword);
                return { success: true, statusCode: 200 }
            }else if(!result.success && result.statusCode == 400){
                return { success: false, statusCode: result.statusCode};
            }else{
                throw new Error("Something went wrong");
            }
        } catch (error) {
            return { success: false };
        }
    }
    async getUserFromAccessToken(accessToken) {
        try {
            const user = await cognitoService.getUserFromAccessToken(accessToken);
            if(user.success && user.statusCode == 200) return { success: true, userinfo: user.userInfo };
            if(!user.success && user.statusCode == 401) return { success: false, code: 401 };
        } catch (error) {
            return { success: false, code: 500 };
        }
    }
    async myProfile(userId) {
        try {
            const student = await UserModel.findById(userId);
            if (!student) return { success: false, code: 404 };
            const userMetaData = await UserMetaData.findByUserId(userId);
            const countryName = CommonHelper.getCountryNameByCountryCode(userMetaData.country);
            const stateName = CommonHelper.getStateNameByStateCode(userMetaData.country,userMetaData.state);
            userMetaData.country = countryName;
            userMetaData.state = stateName;
            if (userMetaData) return { success: true, student: student, userMetaData: userMetaData, code: 200 };
        } catch (error) {
            return { success: false, code: 500 };
        }
    }
    async courseList(page, searchText, sortOrder) {
        try {
            const courses = await UserModel.courseList(16, page, searchText, 'createdAt', sortOrder);
            if (courses.success) {
                return {
                    success: true,
                    courses: courses.courses,
                    pagination: courses.pagination,
                    code: 200
                };
            } else {
                return {
                    success: false,
                    code: courses.code || 500,
                    message: courses.message || 'Unknown error'
                };
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                message: error.message
            };
        }
    }
    async courseSuggestions(searchText){
        try {
            const courses = await UserModel.courseSuggestions(searchText);
            if(courses) return { code: 200, suggestions: courses };
        } catch (error) {
            console.log(error.message);
            return {
                success: false,
                code: 500,
                message: error.message
            };
        }
    }
    async courseDetail(id){
        try {
            const detail = await CourseModel.courseDetail(id);
            if(detail.code == 200) return { success:true, code: 200, detail: detail.course };
            else return { success: false, code: detail.code || 500, message: detail.message || 'Unknown error' };
        } catch (error) {
            console.log(error);
            return { success: false, code: 500, message: error.message };
        }
    }
    async addToCart(userId,quantity,courseId){
        try {
            const course = await CourseModel.findById(courseId);
            const price = course.price;
            const image = course.courseImage;
            const name = course.courseName;
            const result = await CartModel.create(userId,quantity,courseId,price,name,image);
            return { item: result.cartItem, code: 201};
        } catch (error) {
            return { success: false, code: 500, message: error.message };
        }
    }
    async courseExistInCart(userId,courseId){
        try {
            const result = await CartModel.findByCourseId(userId,courseId);
            if(result) return { message: "Already exist" };
            return { message: "Not exist" };
        } catch (error) {
            return { success: false, code: 500, message: error.message };
        }
    }
    async myCart(userId){
        try {
            const result = await CartModel.findByUserId(userId);
            const billingAddress = await BillingAddressModel.findByUserId(userId);
            if(result) return { success: true, code: 200, items: result, billingAddress: billingAddress };
        } catch (error) {
            console.log(error);
            return { success: false, code: 500, message: error.message };
        }
    }
    async deleteCartItem(cartId,userId){
        try {
            const result = await CartModel.deleteItem(cartId,userId);
            if(result) return { success: true, code: 200}
        } catch (error) {
            return { success: false, code: 500, message: error.message };
        }
    }
    async deleteByCourseId(courseIds,userId){
        try {
            const result = await CartModel.deleteByCourses(courseIds,userId);
            if(result) return { success: true, code: 200 };
        } catch (error) {
            console.log(error)
        }
    }
    async myPurchasedCourses(userId){
        try {
            const result = await UserModel.myPurchasedCourses(userId);
            if(result.length > 0) return { success:true, code: 200, courses: result };
        } catch (error) {
            return { success: false, code: 500, message: error };
        }
    }
    async studentPurchasedCoursesCount(courseId) {
        try {
            const count = await CourseModel.studentPurchasedCoursesCount(courseId);
            return { success: true, count: count ?? 0 };
        } catch (error) {
            return { success: false, code: 500, message: error.message || 'Error occurred' };
        }
    }
    async cloneStudentCoursesWorkspace(studentId,courseIds){
        try {
            const student = await UserModel.findById(studentId);
            courseIds.forEach(async element => {
                const course = await CourseModel.findById(element);
                const insertData  = await this.createWorkspace(student,element,course);
            });
        } catch (error) {
            
        }
    }
    async createWorkspace(student, courseId, course) {
        try {
            let insertData, userName;
            userName = CommonHelper.generateUsername(student.cognitoUserName, course.courseName, course.operatingSystem);
            const password = workspaceService.generateTempPassword();
            await workspaceService.verifyUserExists(userName, student.fullName, password);
            const workspaceBundle = await workspaceService.cloneWorkspace(WORKSPACES_ID[course.operatingSystem], userName);
            if (workspaceBundle) {
                insertData = {
                    user_id: student.id,
                    course_id: courseId,
                    workspace_id: workspaceBundle.WorkspaceId,
                    bundle_id: workspaceBundle.BundleId,
                    state: workspaceBundle.State,
                    user_name: workspaceBundle.UserName,
                    operating_system: course.operatingSystem.toLowerCase(),
                    password: password
                };
            }
            return insertData;
        } catch (error) {
            console.log(error);
        }
    }

}
module.exports = new UserService();