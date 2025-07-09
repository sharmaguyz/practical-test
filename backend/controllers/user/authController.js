const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserRoles = require('../../models/user_roles');
const cognitoService = require('../../services/cognito');
const userService = require('../../services/user');
const USER_ROLES  = require('../../config/enums/role');
const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');
const tokenBlacklistModel = require('../../models/token_blacklist');
exports.login = async (req, res) => {
    try {
        const { email, password, isChecked, courseId } = req.body;
        const emailExists = await cognitoService.checkEmailExists(email);
        if (!emailExists) {
            return sendError(res,{ message: 'Invalid credentials. Please verify your email and password.' }, 401);
        }
        const user = await userService.userExist(email);
        if (user?.user?.isApproved == 'pending') {
            return sendError(res,{ message: 'Your account is under review and has not been approved by the admin yet. Please try logging in again later.' }, 403);
        }
        if (user?.user.isApproved == 'suspended') {
            return sendError(res,{ message: 'Your account has been suspended. Please contact support.' }, 403);
        }
        if (user?.user.awsApproved === 'pending') {
            try {
                await userService.resendCode(user.user)
            } catch (err) {
                console.error("Resend verification error: ", err.message);
            }
            return sendError(res,{ message: 'Your account has not been verified yet. A new verification code has been sent to your email.',isAuth: true }, 403);
        }
        const cognitoResponse = await cognitoService.signin(user.user.cognitoUserName,password);
        if(!cognitoResponse.success){
            if(cognitoResponse.message === "Incorrect username or password."){
                return sendError(res,{ message: 'Invalid credentials. Please verify your email and password.' }, 401);
            }
        }
        const roleId = user.user.role;
        const roleName = await UserRoles.getRoleName(roleId);
        const isMatch = await bcrypt.compare(password, user.user.password);
        if (!isMatch) {
            return sendError(res,{ message: 'Invalid credentials. Please verify your email and password.' }, 401);
        }
        const rolename = roleName.name
        if(courseId && rolename === USER_ROLES.STUDENT){
            const alreadyExist = await userService.courseExistInCart(user.user.id,courseId);
            if(alreadyExist.message !== 'Already exist') await userService.addToCart(user.user.id,1,courseId);
        }else if(courseId && rolename === USER_ROLES.INSTRUCTOR){
            return sendError(res,{ message: "Please login with student credentials." },400);
        }
        const expiresIn = isChecked ? '7d' : '24h';
        const token = jwt.sign(
            { id: user.user.id, email: user.user.email },
            process.env.JWT_SECRET,
            { expiresIn }
        );
        return sendSuccess(res,{ message: 'Student loggedin successfully.',token, id: user.user.id, email: user.user.email, role: roleName, IdToken: cognitoResponse.IdToken,AccessToken: cognitoResponse.AccessToken, RefreshToken: cognitoResponse.RefreshToken },'SUCCESS',200);
    } catch (error) {
        return sendError(res,{ message: 'Login failed',error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
exports.signup = async (req, res) => {
    try {
        const { email, fullName} = req.body;
        const emailExists = await cognitoService.checkEmailExists(email);
        if(emailExists){
            return sendError(res,{ message: 'Email already exist! Please login' },409);
        }
        const user = await userService.userExist(email);
        if (user.success) {
            return sendError(res,{ message: 'Email already exist! Please login' },409);
        }
        const role = await UserRoles.getRoleId(USER_ROLES.STUDENT);
        if (!role) {
            return sendError(res,{ message: 'Could not assign user role' });
        }
        const userServiceResponse = await userService.create(req.body,role); 
        if(userServiceResponse.success){
            return sendSuccess(res,{ message: 'User registered successfully',user: { email: email, fullName: fullName, id: userServiceResponse.id }},'SUCCESS',201);
        }   
        throw new Error("Error while signing up");   
    } catch (error) {
        return sendError(res,{ message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userService.userExist(email);
        if (!user.success) {
            return sendSuccess(res,{ message: 'If this email exists, a reset link has been sent' },'SUCCESS',200);
        }
        const serviceResponse = await userService.forgotPassword(user.user);
        if(serviceResponse.success){
            return sendSuccess(res,{ message: 'If this email exists, a reset link has been sent' },'SUCCESS',200);
        }
        throw new Error("Password reset failed");
    } catch (error) {
        return sendError(res,{ message: 'Password reset failed', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
exports.verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email) {
            return sendError(res,{ message: "Unable to proceed with the verification. Please check your input and try again." },401);
        }
        if (!code) {
            return sendError(res,{ message: "Verification code is required!" },422);
        }
        const user = await userService.userExist(email);
        if (!user.success) {
            return sendError(res,{ message: "User not found!" },404);
        }
        const verifyUser = await userService.verifyUser(user.user,code,res);
        if(!verifyUser.success) return sendError(res,{ message: verifyUser.message },verifyUser.status || 400);
        if (verifyUser.success) return sendSuccess(res,{ message: "User verified successfully!"},'SUCCESS',200);
        throw new Error("Verification Failed");
    } catch (error) {
        return sendError(res,{ message: "Something went wrong during verification", error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
exports.resendCode = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return sendError(res,{ message: "Email is required" },422);
        }
        const user = await userService.userExist(email);
        if (!user.success) {
            return sendError(res,{ message: "User not found" },404);
        }
        const serviceResponse = await userService.resendCode(user.user);
        if(serviceResponse.success) return sendSuccess(res,{ message: "Verification code sent successfully.Please check your registered account" },'SUCCESS',200);
        throw new Error("Error in resending code");
    } catch (error) {
        message = 'Something went wrong!';
        if(error.message == 'Attempt limit exceeded, please try after some time.'){
            message = 'You’ve tried too many times. Please wait a few minutes and try again.';
        }
        return sendError(res,{ message: message, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
exports.checkToken = async (req,res) => {
    try {
        const { token } = req.query;
        const user = await userService.findByToken(token);
        if(user.success){
            if (user.resetPasswordToken !== token || new Date(user.resetPasswordExpires) < new Date()) {
                return sendError(res,{ mesage: 'Password reset token is invalid or has expired' },400);
            }
            return sendSuccess(res,{ message:"Link is active", email: user.email },200);
        }else if(!user.success){
            return sendError(res,{ mesage: 'Invalid token or email' },400);
        }
        throw new Error("Error while checking reset token");
    } catch (error) {
        return sendError(res,{ message: 'Something went wrong', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
exports.resetPassword = async (req,res) => {
    try {
        const { email, token, newPassword } = req.body;
        const user = await userService.userExist(email);
        if(!user.success) return sendError(res,{ mesage: 'Invalid token or email' },400);
        if (user.user.resetPasswordToken !== token || new Date(user.user.resetPasswordExpires) < new Date()) return sendError(res,{ mesage: 'Password reset token is invalid or has expired' },400);
        const response = await userService.resetPassword(user.user.id,newPassword);
        if(response.success) return sendSuccess(res,{ message: 'Your password has been updated successfully' },);
    } catch (error) {
        return sendError(res,{ message: 'Something went wrong', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
exports.logout = async (req,res) => {
    try {
        const token = getTokenFromRequest(req);
        if (token) {
            await tokenBlacklistModel.addToken(token);
        }
        return sendSuccess(res,{ message:"Logout successfully"},200);
    } catch (error) {
        return sendError(res,{ message: 'Something went wrong', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
exports.changePassword = async (req, res) => {
    try {
        const accessToken = getTokenFromRequest(req);
        const userId = req.user.id;
        if (!accessToken) return sendError(res, { message: 'UnAuthorized action' }, 401);
        const { oldPassword, newPassword } = req.body;
        const checkUser = await userService.getUserFromAccessToken(accessToken);
        if (!checkUser.success || !checkUser.userinfo) {
            return sendError(res, { message: 'Unauthorized action' }, 401);
        }
        const checkCurrentPassword = await userService.verifyCurrentPassword(checkUser.userinfo.username, oldPassword);
        if (!checkCurrentPassword.success && checkCurrentPassword.code === 404) {
            return sendError(res, { message: "Please enter correct old password!" }, 404);
        }
        const passwordChangeResponse = await userService.changePassword(accessToken, oldPassword, newPassword,userId);
        if (passwordChangeResponse.success && passwordChangeResponse.statusCode == 200) {
            return sendSuccess(res, { message: 'Password changed successfully' }, 'SUCCESS', 200);
        }else if(!passwordChangeResponse.success && passwordChangeResponse.statusCode == 400){
            return sendError(res, { message: "Attempt limit exceeded, please try after some time." }, 400);
        }
        throw new Error("Password change failed! Retry after some time");
    } catch (error) {
        return sendError(res, {
            message: 'Something went wrong',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

exports.refreshAccessToken = async (req,res) => {
    try {
        const { refreshToken, username } = req.body;
        if(!refreshToken || !username) return sendError(res,{ message: "Refreshtoken aor username is required" },422);
        const result = await cognitoService.refreshAccessToken(refreshToken,username);
        if(result.success && result.statusCode == 200) return sendSuccess(res,{ message: "Token generated successfully", result },200);
        else throw new Error(result.message);
    } catch (error) {
        return sendError(res,{ message: 'Something went wrong', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
}
function getTokenFromRequest(req) {
    return req.headers['x-access-token'] || req.headers?.authorization?.split(' ')[1];
}

