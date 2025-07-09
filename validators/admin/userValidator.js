const { check, validationResult } = require('express-validator');
const UserModel = require('../../models/users');

const dynamicUserValidation = async (req, res, next) => {
  const role = req.body.rolename;
  const { email, userId } = req.body;

  let validations = [
    check("fullName")
      .notEmpty().withMessage("Full name is required").bail()
      .isLength({ min: 2, max: 50 }).withMessage("Full name must be between 2 and 50 characters").bail()
      .matches(/^[A-Za-z\s]+$/).withMessage("Full name must contain only letters and spaces"),
    check("email")
      .notEmpty().withMessage("Email is required").bail()
      .isEmail().withMessage("Valid email is required").bail()
      .matches(/^[a-z0-9@._-]+$/).withMessage("Email must not contain uppercase letters")
      .custom(async (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format');
        }
        const user = await UserModel.findByEmail(email);
        // Case 1: Creating a new user — userId not present
        if (!userId && user) {
          throw new Error("Email already exists");
        }

        // Case 2: Updating — userId present, but email used by someone else
        if (userId && user && user.id.toString() !== userId) {
          throw new Error("Email already exists");
        }
        return true;
      }),
    
    check("rolename").isIn(["STUDENT", "INSTRUCTOR"])
      .withMessage("Invalid role"),
    check("phoneNumber")
      .optional({ checkFalsy: true })
      .matches(/^\+?[0-9]{10,15}$/)
      .withMessage("Invalid phone number"),
  ];

  if (role === "INSTRUCTOR") {
    validations.push(
      check("jobTitle")
        .notEmpty().withMessage("Job title is required"),
      check("expectedStudents")
        .notEmpty().withMessage("Expected students is required"),
      check("topicTeach")
        .notEmpty().withMessage("Topic to teach is required")
    );
  }

  if (role === "STUDENT") {
    validations.push(
      check("country").notEmpty().withMessage("Country is required"),
      check("city").notEmpty().withMessage("City is required"),

      check("linkedin")
        .optional({ checkFalsy: true })
        .custom((value) => {
          const pattern = /^https:\/\/(www\.)?linkedin\.com\/.*$/;
          if (!pattern.test(value)) {
            throw new Error("LinkedIn must be a valid LinkedIn profile URL");
          }
          return true;
        }),

      check("portfolio")
        .optional({ checkFalsy: true })
        .custom((value) => {
          const pattern = /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/?$/;
          if (!pattern.test(value)) {
            throw new Error("GitHub/Portfolio must be a valid GitHub profile URL");
          }
          return true;
        }),

      check("highestDegree")
        .notEmpty().withMessage("Highest degree is required"),

      check("university")
        .optional({ checkFalsy: true }) // Makes the field optional
        .matches(/^[A-Za-z0-9\s,.()-]+$/) // Allows letters, numbers, spaces, and common punctuation
        .withMessage("University name must contain only letters, numbers, and basic punctuation"),

      check("graduationDate")
        .notEmpty().withMessage("Graduation date is required")
        .bail() // Stop here if empty
        .isISO8601().withMessage("Graduation date must be a valid date")
        .toDate(),

      check("certifications")
        .optional({ nullable: true })
        .isArray()
        .withMessage("Certifications must be an array"),

      check("otherCertification")
        .optional({ checkFalsy: true })
        .custom((value, { req }) => {
          const certifications = req.body.certifications || [];
          const includesOtherOption = certifications.some(cert => Number(cert) === 9);
          if (includesOtherOption && (!value || !value.trim())) {
            throw new Error("Other certification is required because 'Other' is selected.");
          }
          return true;
        }),
      check("activelySeeking")
        .isBoolean().withMessage("Actively seeking must be a boolean"),
      check("profileVisible")
        .isBoolean().withMessage("Profile visible must be a boolean"),
    );
  }

  await Promise.all(validations.map(validation => validation.run(req)));

  const result = validationResult(req);
  const errorsArray = result.array();
  if (!result.isEmpty()) {
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
  }

  next();
};

module.exports = {
  dynamicUserValidation
};
