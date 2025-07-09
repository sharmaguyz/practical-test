const express = require('express');
const router = express.Router();

const {
    loginValidationRules,
    forgotPasswordValidationRules,
    resetPasswordValidationRules,
    validate
} = require('../validators/admin/authValidator');
const courseValidator = require('../validators/admin/courseValidator');
const { checkLoggedIn, checkPermission } = require('../middlewares/authAdminMiddleware');
const { dynamicUserValidation } = require('../validators/admin/userValidator');

const authController = require('../controllers/admin/authController');
const profileController = require('../controllers/admin/profileController');
const userController = require('../controllers/admin/userController');
const courseController = require('../controllers/admin/courseController');
const workspaceController = require('../controllers/admin/workspaceController');
const settingController = require('../controllers/admin/settingController')

router.post('/signup', profileController.createAdmin);
router.post('/signin', loginValidationRules(), validate, authController.login);
router.post('/forgot-password', forgotPasswordValidationRules(), validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidationRules(), validate, authController.resetPassword);
router.get('/check-resetpassword-token', authController.checkToken);

// Protected routes
router.get('/me', checkLoggedIn, profileController.getProfile);
router.post('/logout', checkLoggedIn, authController.logout);

router.get('/get-users', checkLoggedIn, userController.getListing);
router.get('/get-user-metadata', checkLoggedIn, userController.getMetaData);
router.delete('/delete-user', checkLoggedIn, userController.deleteUser);
router.put('/status-change', checkLoggedIn, userController.statusChange);
router.post('/store-user', checkLoggedIn, dynamicUserValidation, userController.storeUser);
router.put('/update-user', checkLoggedIn, dynamicUserValidation, userController.updateUser);
router.get('/edit-user', checkLoggedIn, userController.getEditUser);
router.get('/courses',checkLoggedIn,courseController.list);
router.get('/course-workspace/:courseId',checkLoggedIn,courseController.courseWorkspaceDetails);
router.put('/course-approval',checkLoggedIn,courseController.courseApproval);
router.put('/course-publise',checkLoggedIn,courseController.coursePublise);
router.get('/course/:id',checkLoggedIn,courseController.viewCourseDetails);
router.put('/courses/update-course',checkLoggedIn,courseValidator.saveCourseValidation(),courseValidator.validate,courseController.updateCourse);
router.delete('/courses/:id',checkLoggedIn,courseController.deleteCourse);
router.get('/purchased-courses',checkLoggedIn,courseController.purchasedCourses);
router.get('/course-invoice/:orderId/:courseId',checkLoggedIn,courseController.invoiceDetail);
router.get('/course-details/:id',checkLoggedIn,courseController.courseDetails);

router.get('/workspace/:workspaceId/status', checkLoggedIn, workspaceController.getWorkspaceStatus);
router.get('/workspace-image/:imageId/status', checkLoggedIn, workspaceController.getWorkspaceImageStatus);

router.post('/create-setting',checkLoggedIn,settingController.create);
router.get('/payment-settings',checkLoggedIn,settingController.getPaymentSetting);

module.exports = router;