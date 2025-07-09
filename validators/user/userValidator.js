const { body, check } = require('express-validator');
const UserModel = require('../../models/users');
const { validationResult } = require('express-validator');

const dynamicUserValidation = () => {
  return [
    check("email")
      .notEmpty().withMessage("Email is required").bail()
      .isEmail().withMessage("Valid email is required").bail()
      .matches(/^[a-z0-9@._-]+$/).withMessage("Email must not contain uppercase letters")
      .custom(async (email, { req }) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format');
        }
        const user = await UserModel.findByEmail(email);
        const userId = req.body.userId;

        if (!userId && user) throw new Error("Email already exists");
        if (userId && user && user.id.toString() !== userId) throw new Error("Email already exists");
        return true;
      }),

    check("fullName")
      .notEmpty().withMessage("Full name is required").bail()
      .isLength({ min: 2, max: 50 }).withMessage("Full name must be between 2 and 50 characters").bail()
      .matches(/^[A-Za-z\s]+$/).withMessage("Full name must contain only letters and spaces"),

    check("rolename")
      .isIn(["STUDENT", "INSTRUCTOR"])
      .withMessage("Invalid role"),

    check("phoneNumber")
      .optional({ checkFalsy: true })
      .matches(/^\+?[0-9]{10,15}$/)
      .withMessage("Invalid phone number"),

    // INSTRUCTOR fields (conditionally validated in middleware)
    check("jobTitle")
      .if((value, { req }) => req.body.rolename === "INSTRUCTOR")
      .notEmpty().withMessage("Job title is required"),

    check("expectedStudents")
      .if((value, { req }) => req.body.rolename === "INSTRUCTOR")
      .notEmpty().withMessage("Expected students is required"),

    check("topicTeach")
      .if((value, { req }) => req.body.rolename === "INSTRUCTOR")
      .notEmpty().withMessage("Topic to teach is required"),

    // STUDENT fields

    // Check 'password' field for STUDENT role with min 8 and max 16 characters
    check('password')
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters'),

    // Check 'confirmPassword' field for STUDENT role
    check('confirmPassword')
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .notEmpty().withMessage('Confirm Password is required').bail()
      .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),

    check("country")
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .notEmpty().withMessage("Country is required"),

    check("city")
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .notEmpty().withMessage("City is required"),

    check("linkedin")
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .optional({ checkFalsy: true })
      .custom((value) => {
        const pattern = /^https:\/\/(www\.)?linkedin\.com\/.*$/;
        if (!pattern.test(value)) {
          throw new Error("LinkedIn must be a valid LinkedIn profile URL");
        }
        return true;
    }),

    check("portfolio")
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .optional({ checkFalsy: true })
      .custom((value) => {
        const pattern = /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/?$/;
        if (!pattern.test(value)) {
          throw new Error("GitHub/Portfolio must be a valid GitHub profile URL");
        }
        return true;
      }),
      // .isURL({ require_protocol: true, validate_host: false }).withMessage("Portfolio must be a valid URL"),

    check("highestDegree")
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .notEmpty().withMessage("Highest degree is required"),

    check("university")
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .optional({ checkFalsy: true })
      .matches(/^[A-Za-z0-9\s,.()-]+$/)
      .withMessage("University name must contain only letters, numbers, and basic punctuation"),

    check("graduationDate")
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .notEmpty().withMessage("Graduation date is required")
      .bail()
      .isISO8601().withMessage("Graduation date must be a valid date")
      .toDate(),

    check("certifications")
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .optional({ nullable: true })
      .isArray().withMessage("Certifications must be an array"),

    check("otherCertification")
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .optional({ checkFalsy: true })
      .custom((value, { req }) => {
        const certifications = req.body.certifications || [];
        const includesOther = certifications.some(cert => Number(cert) === 9);
        if (includesOther && (!value || !value.trim())) {
          throw new Error("Other certification is required because 'Other' is selected.");
        }
        return true;
      }),

    check("activelySeeking")
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .isBoolean().withMessage("Actively seeking must be a boolean"),

    check("profileVisible")
      .if((value, { req }) => req.body.rolename === "STUDENT")
      .isBoolean().withMessage("Profile visible must be a boolean"),
  ];
}
const loginValidationRules = () => {
    return [
        check('email')
            .notEmpty().withMessage('Email is required').bail()
            .isEmail().withMessage('Invalid email format').bail()
            .custom(async (email) => {
                const user = await UserModel.findByEmail(email);
                if (!user) {
                    throw new Error('Please enter correct registered email.');
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
          .custom(async (email) => {
            const user = await UserModel.findByEmail(email);
            if (!user) {
                throw new Error('The email address you entered is not registered. Please verify the email and try again.');
            }
        }),
  ];
};
const verificationCodeValidation = () => {
  return [
    check('code')
      .notEmpty()
      .withMessage('Verification code is required').bail()
      .isLength({ min: 6, max: 6 })
      .withMessage('Verification code must be 6 digits').bail()
      .isNumeric()
      .withMessage('Verification code must be numeric'),
  ];
};
const resetPasswordValidationRules = () => {
  return [
      check('token')
          .notEmpty().withMessage('Token is required'),

          check('newPassword')
          .notEmpty().withMessage('New Password is required').bail()
          .isLength({ min: 8 }).withMessage('Password must be at least 8 characters').bail()
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
          .withMessage('Password must contain uppercase, lowercase, number and special character').bail()
          .custom((value, { req }) => {
              if (value === req.body.currentPassword) {
                  throw new Error('New password must be different from current password');
              }
              return true;
          }),
          check('reset_password')
          .notEmpty().withMessage('Confirm Password is required').bail()
          .custom((value, { req }) => {
              if (value !== req.body.newPassword) {
                  throw new Error('New password and confirm password must be same');
              }
              return true;
          })

  ];
};
const passwordChangeFromProfile = () => {
  return [
    check('oldPassword')
    .notEmpty().withMessage('Old Password is required').bail(),
    check('newPassword')
    .notEmpty().withMessage('New Password is required').bail()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters').bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
    .withMessage('Password must contain uppercase, lowercase, number and special character')
    .custom((value, { req }) => {
        if (value === req.body.oldPassword) {
            throw new Error('New password must be different from current password');
        }
        return true;
    }),
    check('confirmPassword')
    .notEmpty().withMessage('Confirm Password is required').bail()
    .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('New password and confirm password must be same');
        }
        return true;
    })
  ]
}
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
    dynamicUserValidation,
    loginValidationRules,
    validate,
    forgotPasswordValidationRules,
    verificationCodeValidation,
    resetPasswordValidationRules,
    passwordChangeFromProfile
}