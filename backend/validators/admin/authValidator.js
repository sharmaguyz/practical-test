const { body, check,validationResult } = require('express-validator');
const AdminModel = require('../../models/admin');
// const { validationResult } = require('express-validator');

const loginValidationRules = () => {
    return [
        check('email')
            .notEmpty().withMessage('Email is required').bail()
            .isEmail().withMessage('Invalid email format').bail()
            .normalizeEmail()
            .custom(async (email) => {
                const admin = await AdminModel.findByEmail(email);
                if (!admin) {
                    throw new Error('Email not found');
                }
                if (admin.status !== 'active') {
                    throw new Error('Account is not active');
                }
            }),

        check('password').notEmpty().withMessage('Password is required')
    ];
};

const forgotPasswordValidationRules = () => {
    return [
        check('email')
            .notEmpty().withMessage('Email is required').bail()
            .isEmail().withMessage('Invalid email format').bail()
            .normalizeEmail()
    ];
};

const resetPasswordValidationRules = () => {
    return [
        check('token')
            .notEmpty().withMessage('Token is required'),

        check('newPassword')
            .notEmpty().withMessage('New Password is required').bail()
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters').bail()
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .withMessage('Password must contain uppercase, lowercase, number and special character')
            .custom((value, { req }) => {
                if (value === req.body.currentPassword) {
                    throw new Error('New password must be different from current password');
                }
                return true;
            }),
            check('reset_password')
            .notEmpty().withMessage('Reset Password is required').bail()
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('New password and confirm password must be same');
                }
                return true;
            })

    ];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    return res.status(422).json({
        success: false,
        errors: extractedErrors,
    });
};

module.exports = {
    loginValidationRules,
    forgotPasswordValidationRules,
    resetPasswordValidationRules,
    validate
};