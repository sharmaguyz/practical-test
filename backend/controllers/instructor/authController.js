const UserRoles = require('../../models/user_roles');
const cognitoService = require('../../services/cognito');
const { generateSecurePassword } = require('../commonController');
const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');
const instructorService = require('../../services/instructor');
exports.signup = async (req, res) => {
    try {
        const { email, fullName } = req.body;
        const emailExists = await cognitoService.checkEmailExists(email);
        if(emailExists){
            return sendError(res,{ message: 'Email already exist! Please login' },409);
        }
        const user = await instructorService.userExist(email);
        if (user.success) {
            return sendError(res,{ message: 'Email already exist! Please login' },409);
        }
        const role = await UserRoles.getRoleId("INSTRUCTOR");
        if (!role) {
            return res.status(500).json({ message: 'Could not assign user role' });
        }
        const password = generateSecurePassword(12);
        const instructorServiceResponse = await instructorService.create(req.body,role,password);
        if(instructorServiceResponse.success){
            return sendSuccess(res,{ message: 'Instructor registered successfully',instructor: { email: email, fullName: fullName, id: instructorServiceResponse.id }},'SUCCESS',201);
        }   
        throw new Error("Error while signing up");  
    } catch (error) {
        return sendError(res, {
            message: 'Something went wrong',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },500);
    }
};
exports.changePassword = async (req, res) => {
    try {
        const accessToken = getTokenFromRequest(req);
        const userId = req.user.id;
        if (!accessToken) return sendError(res, { message: 'UnAuthorized action' }, 401);
        const { oldPassword, newPassword } = req.body;
        const checkUser = await instructorService.getUserFromAccessToken(accessToken);
        if (!checkUser.success || !checkUser.userinfo) {
            return sendError(res, { message: 'Unauthorized action' }, 401);
        }
        const checkCurrentPassword = await instructorService.verifyCurrentPassword(checkUser.userinfo.username, oldPassword);
        if (!checkCurrentPassword.success && checkCurrentPassword.code === 404) {
            return sendError(res, { message: "Please enter correct old password!" }, 404);
        }
        const passwordChangeResponse = await instructorService.changePassword(accessToken, oldPassword, newPassword, userId);
        if (passwordChangeResponse.success && passwordChangeResponse.statusCode == 200) {
            return sendSuccess(res, { message: 'Password changed successfully' }, 'SUCCESS', 200);
        } else if (!passwordChangeResponse.success && passwordChangeResponse.statusCode == 400) {
            return sendError(res, { message: "Attempt limit exceeded, please try after some time." }, 400);
        }
        throw new Error("Password change failed! Retry after some time");
    } catch (error) {
        return sendError(res, {
            message: 'Something went wrong',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },500);
    }
}
function getTokenFromRequest(req) {
    return req.headers['x-access-token'];
}

