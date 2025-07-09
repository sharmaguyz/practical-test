const { check } = require('express-validator');
const { validationResult } = require('express-validator');

const saveCourseValidation = (req, res) => {
    return [
        check('courseName')
            .notEmpty().withMessage('Course name is required').bail()
            .isLength({ min: 3, max: 100 }).withMessage('Course name must be between 3 and 100 characters').bail()
            .matches(/^[\w\s\-&,]+$/).withMessage('Course name must not contain special characters'),

        check('price')
            .notEmpty().withMessage('Price is required')
            .bail()
            .custom((value) => {
                const num = Number(value);
                if (isNaN(num)) {
                    throw new Error("Price must be a number");
                }
                if (!Number.isInteger(num)) {
                    throw new Error("Price must be a whole number");
                }
                if (num <= 0) {
                    throw new Error("Price must be greater than zero");
                }
                return true;
            }),

        check('courseCategory')
            .notEmpty().withMessage('Course category is required'),
        check('courseDuration')
            .notEmpty().withMessage('Course duration is required'),
        check('operatingSystem')
            .notEmpty().withMessage('Please select an operating system'),
        check('courseImage')
            .notEmpty().withMessage('Course image is required')
            .bail()
            .isURL().withMessage('Course image must be a valid URL'),
        check('start_date')
            .notEmpty().withMessage('Please choose start date'),
        check('end_date')
            .notEmpty().withMessage('Please choose end date')
            .bail()
            .custom((value, { req }) => {
                const startDate = new Date(req.body.start_date);
                const endDate = new Date(value);
                if (endDate <= startDate) {
                    throw new Error('End date must be after start date');
                }
                return true;
            }),
        check('operatingSystemImage')
            .notEmpty().withMessage('Please select Operating System Image'),
        check('description')
            .notEmpty().withMessage('Course description is required')
            .bail()
            .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters')
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
    validate,
    saveCourseValidation
}