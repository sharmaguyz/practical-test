// services/CognitoService.js
const { Issuer } = require('openid-client');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const {
    CognitoIdentityProviderClient,
    AdminDeleteUserCommand,
    ListUsersCommand,
    AdminSetUserPasswordCommand,
    GetUserCommand,
    ChangePasswordCommand,
    AdminCreateUserCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const client_id = process.env.AWS_CLIENT_ID;
const client_secret = process.env.AWS_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const cognitoUrl = process.env.AWS_COGNITO_URL;
const poolId = process.env.AWS_POOL_ID;
const { getSecretHash, generateUsername } = require('../controllers/commonController');

class CognitoService {
    constructor() {
        this.client = null;
        this.initializeClient();
    }
    async initializeClient() {
        try {
            const issuer = await Issuer.discover(`${cognitoUrl}${poolId}`);
            this.client = new issuer.Client({
                client_id,
                client_secret,
                redirect_uris: FRONTEND_URL,
                response_types: ['code']
            });
            console.log('Cognito client initialized.');
        } catch (err) {
            console.error('Failed to initialize Cognito client:', err);
        }
    }
    getCognitoClient() {
        return new CognitoIdentityProviderClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    async checkEmailExists(email) {
        try {
            const client = this.getCognitoClient();
            const command = new ListUsersCommand({
                UserPoolId: poolId,
                Filter: `email = \"${email}\"`
            });
            const response = await client.send(command);
            return response.Users && response.Users.length > 0;
        } catch (error) {
            console.error("Error checking email existence:", error?.response?.data || error.message);
            throw new Error("Failed to check email existence.");
        }
    }
    async signup(email, password, fullName, address = "USA") {
        try {
            const username = generateUsername(fullName);
            const secretHash = getSecretHash(username, client_secret, client_id);
            const params = {
                ClientId: client_id,
                SecretHash: secretHash,
                Username: username,
                Password: password,
                UserAttributes: [
                    { Name: 'email', Value: email },
                    { Name: 'name', Value: fullName },
                    { Name: 'address', Value: address },
                ]
            };

            const response = await axios.post(cognitoUrl,
                JSON.stringify(params),
                {
                    headers: {
                        'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp',
                        'Content-Type': 'application/x-amz-json-1.1',
                    }
                }
            );
            const sub = response.data.UserSub;
            return { success: true, sub, username };
        } catch (error) {
            const errorData = error.response?.data || {};
            console.error("Cognito signup failed:", errorData);
            return {
                success: false,
                error: errorData.message || error.message || 'Unknown signup error'
            };
        }
    }
    async signin(username, password) {
        try {
            const secretHash = getSecretHash(username, client_secret, client_id);
            const payload = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: client_id,
                AuthParameters: {
                    USERNAME: username,
                    PASSWORD: password,
                    SECRET_HASH: secretHash
                }
            };
            const response = await axios.post(cognitoUrl,
                JSON.stringify(payload),
                {
                    headers: {
                        'Content-Type': 'application/x-amz-json-1.1',
                        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
                    }
                }
            );
            const result = response.data.AuthenticationResult;
            const decoded = jwt.decode(result.IdToken);
            const sub = decoded?.sub;
            return {
                success: true,
                IdToken: result.IdToken,
                AccessToken: result.AccessToken,
                RefreshToken: result.RefreshToken,
                cognitoSub: sub
            };
        } catch (error) {
            const errMsg = error?.response?.data?.message || error?.response?.data?.__type || error.message;
            return {
                success: false,
                message: errMsg || "Cognito login failed",
            };
        }
    }
    async verifyUser(username, code) {
        try {
            const secretHash = getSecretHash(username, client_secret, client_id);
            const payload = {
                ClientId: client_id,
                Username: username,
                ConfirmationCode: code,
                SecretHash: secretHash,
            };
            const response = await axios.post(cognitoUrl,
                JSON.stringify(payload),
                {
                    headers: {
                        'Content-Type': 'application/x-amz-json-1.1',
                        'X-Amz-Target': 'AWSCognitoIdentityProviderService.ConfirmSignUp',
                    }
                });
            return {
                success: true,
                message: 'User verified successfully.',
                data: response.data,
            };
        } catch (error) {
            const errorData = error.response?.data;
            return {
                success: false,
                message: errorData?.message || errorData?.__type || error.message || 'Verification failed',
            };
        }
    }
    async resendVerificationCode(username) {
        try {
            const secretHash = getSecretHash(username, client_secret, client_id);
            const payload = {
                SecretHash: secretHash,
                ClientId: client_id,
                Username: username,
            };
            const response = await axios.post(cognitoUrl,
                JSON.stringify(payload),
                {
                    headers: {
                        'X-Amz-Target': 'AWSCognitoIdentityProviderService.ResendConfirmationCode',
                        'Content-Type': 'application/x-amz-json-1.1',
                    }
                });
            return {
                success: true,
                message: 'Verification code resent successfully.',
                data: response.data,
            };
        } catch (error) {
            const errorData = error.response?.data || {};
            return {
                success: false,
                message: errorData.message || error.message || 'Failed to resend verification code',
            };
        }
    }
    async logout(accessToken) {
        try {
            const payload = { AccessToken: accessToken };
            await axios.post(cognitoUrl,
                JSON.stringify(payload),
                {
                    headers: {
                        'X-Amz-Target': 'AWSCognitoIdentityProviderService.GlobalSignOut',
                        'Content-Type': 'application/x-amz-json-1.1'
                    }
                });
            return { message: 'Successfully logged out from AWS Cognito.' };
        } catch (error) {
            throw new Error(error.message || 'Error logging out from Cognito.');
        }
    }
    async deleteUser(username) {
        try {
            const client = this.getCognitoClient();
            const command = new AdminDeleteUserCommand({
                UserPoolId: poolId,
                Username: username,
            });
            await client.send(command);
            return { success: true, message: `User "${username}" deleted successfully.` };
        } catch (error) {
            console.error("Cognito deleteUser error:", error);
            return {
                success: false,
                message: error.message || "Failed to delete user."
            };
        }
    }
    async resetPassword(username, newPassword) {
        try {
            const client = this.getCognitoClient();
            const command = new AdminSetUserPasswordCommand({
                UserPoolId: poolId,
                Username: username,
                Password: newPassword,
                Permanent: true
            });
            const response = await client.send(command);
            return {
                success: true,
                message: "Password reset successfully.",
                data: response
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Failed to reset user password."
            };
        }
    }
    async getUserFromAccessToken(accessToken) {
        try {
            const client = this.getCognitoClient();
            const command = new GetUserCommand({ AccessToken: accessToken });
            const response = await client.send(command);
            return {
                success: true,
                statusCode: 200,
                userInfo: { username: response.Username }
            };
        } catch (error) {
            if (error.name === "NotAuthorizedException" && error.message.includes("Access Token has expired")) {
                return {
                    success: false,
                    statusCode: 401,
                    message: "Access token has expired."
                };
            }
            return {
                success: false,
                statusCode: 500,
                message: "Failed to retrieve user from access token."
            };
        }
    }
    async verifyCurrentPassword(username, currentPassword) {
        try {
            const secretHash = getSecretHash(username, client_secret, client_id);
            const payload = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: client_id,
                AuthParameters: {
                    USERNAME: username,
                    PASSWORD: currentPassword,
                    SECRET_HASH: secretHash
                }
            };
            const response = await axios.post(cognitoUrl,
                JSON.stringify(payload),
                {
                    headers: {
                        'Content-Type': 'application/x-amz-json-1.1',
                        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
                    }
                });
            return {
                success: true,
                message: 'Password is valid.',
                tokens: response.data.AuthenticationResult,
                code: 200
            };
        } catch (error) {
            const errMsg = error?.response?.data?.message || error?.message;
            const code = errMsg === 'Incorrect username or password.' ? 404 : 500;
            return {
                success: false,
                code,
                message: errMsg || 'Invalid password or failed to verify.'
            };
        }
    }

    async changePassword(accessToken, oldPassword, newPassword) {
        try {
            const client = this.getCognitoClient();
            const command = new ChangePasswordCommand({
                AccessToken: accessToken,
                PreviousPassword: oldPassword,
                ProposedPassword: newPassword,
            });
            await client.send(command);
            return {
                success: true,
                message: "Password changed successfully.",
                statusCode: 200
            };
        } catch (error) {
            const errMsg = error.name === "NotAuthorizedException"
                ? "Current password is incorrect."
                : error.message || "Password change failed.";
            return {
                success: false,
                statusCode: error.$metadata?.httpStatusCode || 500,
                message: errMsg,
            };
        }
    }

    async refreshAccessToken(refreshToken, username) {
        try {
            const secretHash = getSecretHash(username, client_secret, client_id);
            const payload = {
                AuthFlow: 'REFRESH_TOKEN_AUTH',
                ClientId: client_id,
                AuthParameters: {
                    REFRESH_TOKEN: refreshToken,
                    SECRET_HASH: secretHash
                }
            };
            const response = await axios.post(cognitoUrl, JSON.stringify(payload), {
                headers: {
                    'Content-Type': 'application/x-amz-json-1.1',
                    'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
                }
            });
            const result = response.data.AuthenticationResult;
            return {
                success: true,
                IdToken: result.IdToken,
                statusCode: 200,
                AccessToken: result.AccessToken
            };
        } catch (error) {
            const errMsg = error?.response?.data?.message || error.message || "Failed to refresh token";
            let statusCode = 500;
            if (errMsg.includes("Refresh Token has expired") || errMsg.includes("NotAuthorizedException")) statusCode = 401;
            else if (errMsg.includes("InvalidParameterException")) statusCode = 400;
            return {
                success: false,
                statusCode,
                message: errMsg
            };
        }
    }

    async adminCreateAccount(email, password, fullName, address = "USA") {
        try {
            const username = generateUsername(fullName);
            const client = this.getCognitoClient();
            const createUserCommand = new AdminCreateUserCommand({
                UserPoolId: poolId,
                Username: username,
                MessageAction: "SUPPRESS",
                UserAttributes: [
                    { Name: "email", Value: email },
                    { Name: "name", Value: fullName },
                    { Name: "address", Value: address },
                    { Name: "email_verified", Value: "true" }
                ],
            });
            const response = await client.send(createUserCommand);
            const sub = response?.User?.Attributes?.find(attr => attr.Name === "sub")?.Value;
            const setPasswordCommand = new AdminSetUserPasswordCommand({
                UserPoolId: poolId,
                Username: username,
                Password: password,
                Permanent: true,
            });
            await client.send(setPasswordCommand);
            return {
                success: true,
                username,
                sub,
            };
        } catch (error) {
            console.error("Cognito signup failed:", error);
            return {
                success: false,
                error: error.message || "Signup error",
            };
        }
    }
}

module.exports = new CognitoService();