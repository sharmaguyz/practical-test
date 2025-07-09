const express = require('express');
const router = express.Router();
const authController = require('.././controllers/instructor/authController');
const multer = require("multer");
const upload = multer();
const commonController = require('../controllers/commonController');
const { dynamicUserValidation, validate, passwordChangeFromProfile } = require('../validators/user/userValidator');
const CourseValidator = require('../validators/instructor/courseValidator');
const { userCheckAuth } = require('../middlewares/userMiddleware');
const profileController = require('.././controllers/instructor/profileController');
const courseController = require('.././controllers/instructor/courseController');
const workspaceController = require('../controllers/admin/workspaceController');

router.post('/register',dynamicUserValidation(),validate,authController.signup);
router.post('/upload-s3',upload.single('file'),commonController.uploadFileToS3);
router.post('/change-password',userCheckAuth,passwordChangeFromProfile(),validate,authController.changePassword);
router.get('/get-profile',userCheckAuth,profileController.myProfile);
router.post('/change-password',userCheckAuth,passwordChangeFromProfile(),validate,authController.changePassword);

router.get('/topic-teach',userCheckAuth,courseController.topicTeach);

router.get('/courses',userCheckAuth,courseController.courseList);
router.post('/courses/save-course',userCheckAuth,CourseValidator.saveCourseValidation(),CourseValidator.validate,courseController.saveCourse);
router.get('/courses/edit-course/:id',userCheckAuth,courseController.editCourse);
router.put('/courses/update-course',userCheckAuth,CourseValidator.saveCourseValidation(),CourseValidator.validate,courseController.updateCourse);
router.delete('/courses/delete-course/:id',userCheckAuth,courseController.deleteCourse);

router.get('/course-workspace/:courseId',userCheckAuth,courseController.courseWorkspaceDetails);
router.get('/workspace/:workspaceId/status', userCheckAuth, workspaceController.getWorkspaceStatus);
router.get('/operating-system-image', userCheckAuth, workspaceController.getWorkspacePreviousImages);

router.get('/purchased-courses',userCheckAuth,courseController.myPurchasedCourses);
router.get('/course-invoice/:orderId/:courseId',userCheckAuth,courseController.invoiceDetail);
router.get('/course-details/:id',userCheckAuth,courseController.courseDetails);

module.exports = router;