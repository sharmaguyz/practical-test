const instructorService = require('../../services/instructor');
const workspaceService = require('../../services/workspaceService');
const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');
const WorkspacesModel = require('../../models/user_workspace');
var moment = require('moment-timezone');
const CourseModel = require('../../models/course');
const CommonHelper = require('../../config/helpers/common');
module.exports = {
    topicTeach: async (req, res) => {
        try {
            const instructorId = req.user.id;
            const courses = await instructorService.topicTeach(instructorId);
            if (courses.success) return sendSuccess(res, { message: "Topic teach get successfully", courses: courses.response }, 'SUCCESS', 200);
        } catch (error) {
            return sendError(res, { message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined }, 500);
        }
    },
    courseList: async (req, res) => {
        try {
            const instructorId = req.user.id;
            const { limit = 10, page = 1, search = '' } = req.query;
            const courseList = await instructorService.courseList(instructorId, limit, page, search);
            if (courseList?.response?.courses) {
                const updatedCourses = courseList.response.courses.map((course) => {
                    course.createdAt = moment(course.createdAt).format('MMM DD, YYYY');
                    return course;
                });

                const sortedCourses = updatedCourses.sort((a, b) => {
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                });
                
                courseList.response.courses = sortedCourses;
            }

            if (courseList.response) return sendSuccess(res, { message: 'Courselist fetched successfully', courses: courseList.response }, 'SUCCESS', 200);
        } catch (error) {
            return sendError(res, { message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined }, 500);
        }
    },
    saveCourse: async (req, res) => {
        try {
            const instructorId = req.user.id;
            const body = req.body;
            const createdCourse = await instructorService.saveCourse({
                ...body,
                instructorId: instructorId,
            });
            if (createdCourse.success) return sendSuccess(res, { message: "Course created successfully", createdCourse: createdCourse.response }, 'SUCCESS', 201);
            throw new Error("Error while adding course");
        } catch (error) {
            return sendError(res, { message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined }, 500);
        }
    },
    editCourse: async (req, res) => {
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
    courseWorkspaceDetails: async (req, res) => {
        try {
            const { courseId } = req.params;
            if (!courseId) {
                return sendError(res, { message: 'Course ID is required' }, 400);
            }
            const workspaces = await WorkspacesModel.findByCourseId(courseId);
            if (!workspaces || workspaces.length === 0) {
                return sendError(res, { message: 'No workspaces found for this course.' }, 404);
            }
            return sendSuccess(res, { workspaces }, 'Workspaces fetched successfully.', 200);
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
    myPurchasedCourses: async(req,res) => {
        try {
            const instructorId = req.user.id;
            const { limit = 10, page = 1, search = '' } = req.query;
            const response = await CourseModel.listPurchasedCourses(limit,page,search,instructorId);
            if(response.success){
                return sendSuccess(res, { courses: response.purchases, pagination: response.pagination },'SUCCESS',200);
            }
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