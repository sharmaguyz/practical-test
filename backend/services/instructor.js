const UserModel = require('../models/users');
const cognitoService = require('.././services/cognito');
const sendMail = require('.././config/helpers/emailHelper');
const crypto = require('crypto');
const USER_ROLES = require('.././config/enums/role');
const InstructorMetaData = require('../models/instructor_meta_data');
const CourseModel = require('.././models/course');
const AdminModel = require('.././models/admin');
var moment = require('moment-timezone');


class InstructorService {
    async userExist(email) {
        try {
            const exist = await UserModel.findByEmail(email);
            if (exist) return { success: true, user: { id: exist.id, fullName: exist.fullName, cognitoUserName: exist.cognitoUserName, isApproved: exist.isApproved, awsApproved: exist.awsApproved, role: exist.role, email: exist.email, password: exist.password, resetPasswordToken: exist.resetPasswordToken, resetPasswordExpires: exist.resetPasswordExpires, createdBy: exist.createdBy } };
            return { success: false };
        } catch (error) {
            return { success: false };
        }
    }
    async create(data, role, password) {
        try {
            const cognitoResponse = await cognitoService.signup(data.email, password, data.fullName);
            if (!cognitoResponse.success) {
                throw new Error(cognitoResponse.error);
            }
            const cognitoUserName = cognitoResponse.username;
            const createdInstructor = await InstructorMetaData.create({
                ...data,
                role: role.roleId,
                password: password,
                cognitoSub: cognitoResponse.sub,
                cognitoUserName: cognitoUserName,
                createdBy: USER_ROLES.INSTRUCTOR
            });
            sendMail({
                to: data.email,
                subject: 'Succesfully Registered',
                template: 'instructor-registration',
                templateData: {
                    userName: `${data.fullName}`,
                    password: password,
                }
            });
            return { success: true, id: createdInstructor.user.id }
        } catch (error) {
            return { success: false, error: process.env.NODE_ENV === 'development' ? error.message : undefined };
        }
    }
    async forgotPassword(user) {
        try {
            const resetToken = crypto.randomBytes(20).toString('hex');
            await UserModel.updateResetToken(user.id, resetToken);
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            sendMail({
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
    async verifyUser(user, code, res) {
        try {
            const verifyUser = await cognitoService.verifyUser(user.cognitoUserName, code);
            const errorType = verifyUser.message;
            if (errorType.includes("Invalid code provided") || errorType.includes("Invalid verification code provided, please try again.")) {
                return res.status(400).json({ success: false, message: "Verification failed! Invalid code provided, please request a code again.", });
            }
            if (errorType.includes("User cannot be confirmed. Current status is CONFIRMED")) {
                return res.status(409).json({ success: false, message: "User already verified!" });
            }
            await UserModel.cognitoAccountVerified(user.id);
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    }
    async resendCode(user) {
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
            if (result) {
                return { success: true, resetPasswordToken: result.resetPasswordToken, resetPasswordExpires: result.resetPasswordExpires, email: result.email };
            }
        } catch (error) {
            return { success: false };
        }
    }
    async resetPassword(userId, newPassword) {
        try {
            const user = await UserModel.findById(userId);
            if (user) {
                const cognitoResult = await cognitoService.resetPassword(user.cognitoUserName, newPassword);
                if (cognitoResult.success) {
                    const result = await UserModel.updatePassword(userId, newPassword);
                    if (result) return { success: true };
                }
            }
            return { success: false };
        } catch (error) {
            return { success: false };
        }
    }
    async verifyCurrentPassword(username, currentPassword) {
        try {
            const result = await cognitoService.verifyCurrentPassword(username, currentPassword);
            if (result.success && result.code == 200) return { success: true, code: result.code };
            if (!result.success && result.code == 404) return { success: false, code: result.code };
        } catch (error) {
            return { success: false, code: 500 }
        }
    }
    async changePassword(accessToken, oldPassword, newPassword, userId) {
        try {
            const result = await cognitoService.changePassword(accessToken, oldPassword, newPassword);
            if (result.success) {
                await UserModel.updatePassword(userId, newPassword);
                return { success: true, statusCode: 200 }
            } else if (!result.success) {
                return { success: false, statusCode: result.statusCode };
            };
        } catch (error) {
            return { success: false }
        }
    }
    async getUserFromAccessToken(accessToken) {
        try {
            const user = await cognitoService.getUserFromAccessToken(accessToken);
            if (user.success && user.statusCode == 200) return { success: true, userinfo: user.userInfo };
            if (!user.success && user.statusCode == 401) return { success: false, code: 401 };
        } catch (error) {
            return { success: false, code: 500 }
        }
    }
    async myProfile(userId) {
        try {
            const instructor = await UserModel.findById(userId);
            if (!instructor) return { success: false, code: 404 };
            const instructorMetaData = await InstructorMetaData.findByUserId(userId);
            if (instructorMetaData) return { success: true, instructor: instructor, instructorMetaData: instructorMetaData, code: 200 };
        } catch (error) {
            return { success: false, code: 500 };
        }
    }
    async courseList(instructorID, limit, page, searchText) {
        try {
            const response = await CourseModel.list(instructorID, limit, page, searchText);
            if (response.success) return { success: true, response: response };
        } catch (error) {
            return { success: false };
        }
    }
    async saveCourse(body) {
        try {
            const response = await CourseModel.create(body);
            if (response) return { success: true, response: response };
        } catch (error) {
            return { success: false };
        }
    }
    async editCourse(courseId) {
        try {
            const response = await CourseModel.findById(courseId);
            if (response) return { success: true, response: response };
        } catch (error) {
            return { success: false };
        }
    }
    async updateCourse(body) {
        try {
            const course = await CourseModel.findById(body.courseId);
            const date = moment().format("MMM DD, YYYY");
            if (!course) {
                return { success: false };
            }

            const getAdmins = await AdminModel.getAllActiveAdmins();
            const instructor = await UserModel.findById(course.instructorId);
            const response = await CourseModel.update(body);
            //check if send for approval course
            if (course.isApproved === "rejected" && body.isApproved === "pending") {
                getAdmins.map((admin) => {
                    sendMail({
                        to: admin.email,
                        subject: `Request for Course Approval - ${body.courseName}`,
                        template: 'course-approval-to-admin',
                        templateData: {
                            userName: admin.name,
                            courseName: body.courseName,
                            instructorName: instructor ? instructor.fullName : 'N/A',
                            courseSubmission: date,
                            categoryName: body.courseCategory,
                        }
                    });
                });
            }

            //check if send for publish course
            if (course.isApproved === "completed" && ['', 'rejected'].includes(course.published) && body.published === "pending") {
                getAdmins.map((admin) => {
                    sendMail({
                        to: admin.email,
                        subject: `Request for Course Publish - ${body.courseName}`,
                        template: 'course-publish-to-admin',
                        templateData: {
                            userName: admin.name,
                            courseName: body.courseName,
                            instructorName: instructor ? instructor.fullName : 'N/A',
                            courseSubmission: date,
                            categoryName: body.courseCategory,
                        }
                    });
                });
            }

            if (response) return { success: true };
        } catch (error) {
            return { success: false };
        }
    }
    async deleteCourse(courseId) {
        try {
            const response = await CourseModel.delete(courseId);
            if (response) return { success: true };
        } catch (error) {
            return { success: false };
        }
    }
    async topicTeach(instructorId) {
        try {
            const response = await InstructorMetaData.topicTeach(instructorId);
            if (response) return { success: true, response: response };
        } catch (error) {
            return { success: false };
        }
    }
}
module.exports = new InstructorService();