const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const adminModel = require('../../models/admin');
const tokenBlacklistModel = require('../../models/token_blacklist');
const sendMail = require('../../config/helpers/emailHelper');


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await adminModel.findByEmail(email);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials. Please verify your email and password.' });
        }
        const fullAdmin = await adminModel.findById(admin.adminId);
        const isMatch = await bcrypt.compare(password, fullAdmin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials. Please verify your email and password.' });
        }
        const token = jwt.sign(
            { adminId: admin.adminId, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(200).json({ token, adminId: admin.adminId, email: admin.email, role:fullAdmin.role });
    } catch (error) {
        let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
        res.status(500).json({ message: 'Login failed', error: errorMessage });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await adminModel.findByEmail(email);
        if (!admin) {
            return res.status(200).json({ message: 'If this email exists, a reset link has been sent' });
        }
        const fullAdmin = await adminModel.findById(admin.adminId);
        const resetToken = crypto.randomBytes(20).toString('hex');
        await adminModel.updateResetToken(fullAdmin.adminId, resetToken);
        const resetUrl = `${process.env.FRONTEND_URL}/admin/reset-password/${resetToken}`;
        await sendMail({
            to: email,
            subject: 'Password Reset Request',
            template: 'password-reset',
            templateData: {
                userName: `${admin.name}`,
                resetUrl: resetUrl
            }
        });
        res.status(200).json({ message: 'If this email exists, a reset link has been sent' });
    } catch (error) {
        let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
        res.status(500).json({ message: 'Password reset failed', error: errorMessage });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        const admin = await adminModel.findByEmail(email);
        if (!admin) {
            return res.status(400).json({ message: 'Invalid token or email' });
        }
        const fullAdmin = await adminModel.findById(admin.adminId);
        if (fullAdmin.resetPasswordToken !== token || new Date(fullAdmin.resetPasswordExpires) < new Date()) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }
        await adminModel.updatePassword(fullAdmin.adminId, newPassword);
        res.status(200).json({ message: 'Your password has been updated successfully' });
    } catch (error) {
        let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
        res.status(500).json({ message: 'Password reset failed', error: errorMessage });
    }
};

exports.logout = async (req, res) => {
    try {
        const token = getTokenFromRequest(req);
        if (token) {
            await tokenBlacklistModel.addToken(token);
        }
        res.clearCookie('admin_token');
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
};
exports.checkToken = async (req,res) => {
    try {
        const { token } = req.query;
        const admin = await adminModel.findByToken(token);
        if (!admin) {
            return res.status(400).json({ message: 'Invalid token or email' });
        }
        if (admin.resetPasswordToken !== token || new Date(admin.resetPasswordExpires) < new Date()) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }
        return res.status(200).json({ message:"Link is active", email: admin.email });
    } catch (error) {
        let errorMessage = process.env.NODE_ENV === 'development' ? error.message : undefined;
        res.status(500).json({ error: errorMessage });
    }
}
function getTokenFromRequest(req) {
    return req.headers['x-access-token'] || req.headers?.authorization?.split(' ')[1];
}