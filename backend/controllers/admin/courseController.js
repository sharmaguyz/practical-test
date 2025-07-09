const CourseModel = require('../../models/course');
const UserModel = require('../../models/users');
const WorkspacesModel = require('../../models/user_workspace');
const instructorService = require('../../services/instructor');
const workspaceService = require('../../services/workspaceService');
const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');
const sendMail = require('../../config/helpers/emailHelper');
const CommonHelper = require('../../config/helpers/common');
const WORKSPACES_ID = require('../../config/enums/workspaces');
var moment = require('moment-timezone');
async function createWorkspace(instructor, courseId, course) {
    let insertData, userName;
    userName = CommonHelper.generateUsername(instructor.cognitoUserName, course.courseName, course.operatingSystem);
    const password = workspaceService.generateTempPassword();
    await workspaceService.verifyUserExists(userName, instructor.fullName, password);
    const workspaceBundle = await workspaceService.cloneWorkspace(WORKSPACES_ID[course.operatingSystem], userName);
    if (workspaceBundle) {
        insertData = {
            user_id: instructor.id,
            course_id: courseId,
            workspace_id: workspaceBundle.WorkspaceId,
            bundle_id: workspaceBundle.BundleId,
            state: workspaceBundle.State,
            user_name: workspaceBundle.UserName,
            operating_system: course.operatingSystem.toLowerCase(),
            password: password
        };
    }

    return insertData;
}

module.exports = {
    list: async (req, res) => {
        try {
            const { limit = 10, page = 1, search = '' } = req.query;
            const courseList = await CourseModel.list(null, limit, page, search);
            if (courseList?.courses) {
                const updatedCourses = await Promise.all(
                    courseList.courses.map(async (course) => {
                        const IsWorkspaceExists = await WorkspacesModel.findByCourseId(course.id);
                        const instructor = await UserModel.findById(course.instructorId);
                        course.workspaceStatus = (IsWorkspaceExists && IsWorkspaceExists.length > 0)
                            ? 'Active'
                            : 'Inactive';
                        course.instructorName = instructor ? instructor.fullName : 'N/A';
                        course.createdAt = moment(course.createdAt).format('MMM DD, YYYY');
                        return course;
                    })
                );

                const sortedCourses = updatedCourses.sort((a, b) => {
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                });

                courseList.courses = sortedCourses;
            }

            if (courseList.success) return sendSuccess(res, { message: 'Courselist fetched successfully', courses: courseList }, 'SUCCESS', 200);
        } catch (error) {
            return sendError(res, { message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined }, 500);
        }
    },
    courseApproval: async (req, res) => {
        try {
            const { courseId, status, reason } = req.body;
            let isSendMail = false;
            let subject = 'Course Approved!';
            let template = 'course-approved';

            if (!courseId || !status) {
                return sendError(res, { message: 'Course ID and status are required' }, 400);
            }

            const course = await CourseModel.findById(courseId);
            if (!course) {
                return sendError(res, { message: 'Course not found.' }, 404);
            }
            const instructor = await UserModel.findById(course.instructorId);
            if (!instructor || !instructor.email) {
                return sendError(res, { message: 'Instructor not found or has no email' }, 404);
            }

            const updateResult = await CourseModel.updateStatus(courseId, status, reason);
            if (!updateResult) {
                return sendError(res, { message: 'Failed to update course status' }, 400);
            }

            if (status === 'completed') {
                isSendMail = true;
                const IsWorkspaceExists = await WorkspacesModel.findByCourseId(courseId);
                if (IsWorkspaceExists && IsWorkspaceExists.length > 0) {
                    // return sendError(res, { message: 'Workspaces already exist for this course' }, 400);
                } else {
                    const insertData = await createWorkspace(instructor, courseId, course);
                    if (insertData) {
                        await WorkspacesModel.create(insertData)
                    }

                    sendMail({
                        to: instructor.email,
                        subject: `Workspace for ${course.courseName}`,
                        template: 'workspace-invite-user',
                        templateData: {
                            name: instructor.fullName || 'Instructor',
                            courseName: course.courseName,
                            userName: insertData.user_name || '',
                            password: insertData.password || '',
                            registrationCode: process.env.WORKSPACE_REGISTRATION_CODE
                        },
                    });
                }
            }

            if (status === 'rejected') {
                isSendMail = true;
                subject = 'Course Rejected';
                template = 'course-rejected';
            }

            if (isSendMail) {
                sendMail({
                    to: instructor.email,
                    subject: subject,
                    template: template,
                    templateData: {
                        userName: instructor.fullName || 'Instructor',
                        courseName: course.courseName,
                        reason: reason || 'Your course has been approved.',
                    },
                });
            }

            return sendSuccess(
                res,
                { message: `Course status updated to "${status}" and instructor notified.` },
                'SUCCESS',
                200
            );
        } catch (error) {
            console.error('Error in courseApproval:', error);
            return sendError(res,
                {
                    message: 'Something went wrong. Please try again later.',
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                },
                500
            );
        }
    },
    coursePublise: async (req, res) => {
        try {
            const { courseId, status, reason } = req.body;

            if (!courseId || !status) {
                return sendError(res, { message: 'Course ID and status are required' }, 400);
            }

            const course = await CourseModel.findById(courseId);

            if (!course) {
                return sendError(res, { message: 'Course not found.' }, 404);
            }

            let imageId = course.operatingSystemImage, state;
            const instructor = await UserModel.findById(course.instructorId);
            if (!instructor || !instructor.email) {
                return sendError(res, { message: 'Instructor not found or has no email' }, 404);
            }

            let subject = `Your Course ${course.courseName} Has Been Published!`;
            let template = 'course-approved-published';

            if (status === 'completed' && course.published !== 'completed' && course.operatingSystemImage === 'new') {
                const IsWorkspaceExists = await WorkspacesModel.findByCourseId(courseId);
                if (IsWorkspaceExists && IsWorkspaceExists.length > 0) {
                    const imageName = CommonHelper.generateUsername(instructor.cognitoUserName, course.courseName, course.operatingSystem);
                    [imageId, state] = await workspaceService.createWorkspaceImage(IsWorkspaceExists[0].workspace_id, imageName, `${course.courseName} - ${course.operatingSystem}`);
                    await WorkspacesModel.updateImageIdAndStateById(IsWorkspaceExists[0].id, imageId, state);
                }
            }

            const updateResult = await CourseModel.updatePublication(courseId, status, reason, imageId);
            if (!updateResult) {
                return sendError(res, { message: 'Failed to update course status' }, 400);
            }

            if (status === 'rejected') {
                subject = `Your Course ${course.courseName} Has Been Rejected`;
                template = 'course-published-rejected';
            }

            sendMail({
                to: instructor.email,
                subject: subject,
                template: template,
                templateData: {
                    userName: instructor.fullName || 'Instructor',
                    courseName: course.courseName,
                    reason: reason || 'Your course has been approved and published.',
                },
            });
            return sendSuccess(res, { message: `Course status updated to "${status}" and instructor notified.` }, 'SUCCESS', 200);
        } catch (error) {
            console.error('Error in courseApproval:', error);
            return sendError(res,
                {
                    message: 'Something went wrong. Please try again later.',
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                },
                500
            );
        }
    },
    courseWorkspaceDetails: async (req, res) => {
        try {
            const { courseId } = req.params;
            if (!courseId) {
                return sendError(res, { message: 'Course ID is required' }, 400);
            }
            const workspaces = await WorkspacesModel.findByCourseId(courseId);
            if (!workspaces || workspaces.length === 0) {
                return sendError(res, { message: 'No workspaces found for this course' }, 404);
            }
            return sendSuccess(res, { workspaces }, 'Workspaces fetched successfully', 200);
        } catch (error) {
            console.error('Error in courseWorkspaceDetails:', error);
            return sendError(res,
                {
                    message: 'Something went wrong. Please try again later.',
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                },
                500
            );
        }
    },
    deleteCourse: async (req, res) => {
        try {
            const { id } = req.params;
            const workspaces = await WorkspacesModel.findByCourseId(id);
            if (workspaces && workspaces.length > 0) {
                const workspaceIds = workspaces.map(ws => ws.workspace_id);
                await workspaceService.terminateWorkspaces(workspaceIds);
            }
            const response = await instructorService.deleteCourse(id);
            if (response.success) return sendSuccess(res, { message: "Course deleted successfully" }, 'SUCCESS', 200);
        } catch (error) {
            return sendError(res, { message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined }, 500);
        }
    },
    viewCourseDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const course = await instructorService.editCourse(id);
            if (course.success) return sendSuccess(res, { message: "Course data fetched successfully", course: course }, 'SUCCESS', 200);
        } catch (error) {
            return sendError(res, { message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined }, 500);
        }
    },
    updateCourse: async (req, res) => {
        try {
            const response = await instructorService.updateCourse(req.body);
            if (response.success) return sendSuccess(res, { message: "Course updated successfully" }, 'SUCCESS', 200);
        } catch (error) {
            return sendError(res, { message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined }, 500);
        }
    },
    purchasedCourses: async(req,res) => {
        try {
            const { limit = 10, page = 1, search = '' } = req.query;
            const purchasedCourses = await CourseModel.listPurchasedCourses(limit,page,search);
            if(purchasedCourses.success) return sendSuccess(res, { purchasedCourses },'SUCCESS',200);
            throw new Error(purchasedCourses.message);
        } catch (error) {
            return sendError(res, { message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined }, 500);
        }
    },
    invoiceDetail: async(req,res) => {
        try {
            const { orderId, courseId } = req.params;
            const result = await CourseModel.invoiceDetail(orderId,courseId);
            if(result.success) return sendSuccess(res, { result },'SUCCESS',200);
            throw new Error(result.message);
        } catch (error) {
            return sendError(res,
                {
                    message: 'Something went wrong. Please try again later.',
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                },
                500
            );
        }
    },
    courseDetails: async(req,res) => {
        try {
            const { id } = req.params;
            const detail = await CourseModel.courseDetail(id);
            detail.course.createdAt = CommonHelper.purchasedAt(detail.course.createdAt);
            const count = await CourseModel.studentPurchasedCoursesCount(id);
            if(detail.code == 200) return sendSuccess(res, { detail: detail.course, studentCount: count },'SUCCESS',200);
            throw new Error(detail.message);
        } catch (error) {
            return sendError(res,
                {
                    message: 'Something went wrong. Please try again later.',
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                },
                500
            );
        }
    }
}