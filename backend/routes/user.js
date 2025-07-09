const express = require('express');
const router = express.Router();
const authController = require('.././controllers/user/authController');
const profileController = require('.././controllers/user/profileController');
const courseController = require('.././controllers/user/courseController');
const cartController = require('.././controllers/user/cartController');
const {
    dynamicUserValidation,
    loginValidationRules,
    validate,
    forgotPasswordValidationRules,
    verificationCodeValidation,
    resetPasswordValidationRules,
    passwordChangeFromProfile
} = require('../validators/user/userValidator');
const { userCheckAuth } = require('../middlewares/userMiddleware');
const UnauthorizedController = require('../controllers/user/UnauthorizedController');

router.get('/get-highest-degree-obtianed-data', UnauthorizedController.getHighestDegreeObtinaedData);
router.get('/get-currently-enrolled-degree-data', UnauthorizedController.getcurrentlyEnrolledDegreeData);
router.get('/get-certification-data', UnauthorizedController.getCertificationData);
router.get('/get-preferred-work-type-data', UnauthorizedController.getPreferredWorkTypeData);
router.get('/get-security-clearance-level-data', UnauthorizedController.getSecurityClearanceLevelData);
router.get('/get-technical-skill-data', UnauthorizedController.getTechnicalSkillData);
router.get('/get-work-authorization-data', UnauthorizedController.workAuthorizationData);

router.post('/register', dynamicUserValidation(), validate, authController.signup);
router.post('/signin',loginValidationRules(),validate,authController.login);
router.post('/forgot-password', forgotPasswordValidationRules(), validate, authController.forgotPassword);
router.post('/verify-code', verificationCodeValidation(), validate, authController.verifyCode);
router.post('/resend-code',authController.resendCode);

router.get('/check-resetpassword-token', authController.checkToken);
router.post('/reset-password',resetPasswordValidationRules(),validate,authController.resetPassword);
router.post('/change-password',userCheckAuth,passwordChangeFromProfile(),validate,authController.changePassword);
router.post('/get-new-token',userCheckAuth,authController.refreshAccessToken);

router.get('/get-profile',userCheckAuth,profileController.myProfile);

router.get('/courses',courseController.courseList);
router.get('/courses/suggestions',courseController.courseSuggestions);
router.get('/course-detail/:id',courseController.courseDetail);
router.post('/add-to-cart',userCheckAuth,cartController.addToCart);
router.get('/my-cart',userCheckAuth,cartController.myCart);
router.delete('/delete-cart-item/:cartId',userCheckAuth,cartController.deleteCartItem);

router.get('/my-courses',userCheckAuth,courseController.myPurchasedCourses);
router.get('/course-invoice/:orderId/:courseId',userCheckAuth,courseController.invoiceDetail);

router.post('/logout', userCheckAuth,authController.logout);
module.exports = router;