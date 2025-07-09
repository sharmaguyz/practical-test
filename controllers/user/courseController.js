const userService = require('../../services/user');
const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');
const CourseModel = require('../../models/course');
const CommonHelper = require('../../config/helpers/common');
module.exports = {
    courseList: async (req, res) => {
        try {
            const { page = 1, searchText = '', sortOrder = 'desc' } = req.query;
            const courses = await userService.courseList(page, searchText, sortOrder);
            if (courses.success) {
                return sendSuccess(res, {
                    message: "Course List fetched successfully.",
                    courses: courses.courses,
                    pagination: courses.pagination
                }, 'SUCCESS', 200);
            }
            return sendError(res, {
                message: courses.message || 'Error while fetching courses'
            }, courses.code || 500);
        } catch (error) {
            return sendError(res, {
                message: 'Something went wrong! Please try after some time',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            }, 500);
        }
    },
    courseDetail : async (req,res) => {
        try {
            const { id } = req.params;
            const detail = await userService.courseDetail(id);
            detail.detail.createdAt = CommonHelper.purchasedAt(detail.detail.createdAt);
            let alreadyPurchased = false;
            if(req.query.userId){
                const myPurchased = await userService.myPurchasedCourses(req.query.userId);
                if (myPurchased?.success && Array.isArray(myPurchased.courses)) {
                    alreadyPurchased = myPurchased.courses.some(course => course.courseId === id);
                }
            }
            const { count } = await userService.studentPurchasedCoursesCount(id);
            if(detail.success && detail.code == 200) return sendSuccess(res, { detail: detail.detail, alreadyPurchased: alreadyPurchased, studentCount: count },'SUCCESS',200);
            throw new Error("Error While retrieving course detail");
        } catch (error) {
            return sendError(res, {
                message: 'Something went wrong! Please try after some time',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            }, 500);
        }
    },
    myPurchasedCourses: async(req,res) => {
        try {
            const userId = req.user.id;
            const { code, courses } = await userService.myPurchasedCourses(userId);
            if(code == 200) return sendSuccess(res,{ courses: courses, message: "My courses get successfully." },'SUCCESS',200);
            throw new Error("Error while retrieving courses.");
        } catch (error) {
            return sendError(res, {
                message: 'Something went wrong! Please try after some time',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            }, 500);
        }
    },
    courseSuggestions: async (req,res) => {
        try {
            const { searchText } = req.query;
            const { code, suggestions,message } =  await userService.courseSuggestions(searchText);
            if(code == 200) return sendSuccess(res, { suggestions: suggestions },'SUCCESS',200);
            throw new Error(message);
        } catch (error) {
            return sendError(res, {
                message: 'Something went wrong! Please try after some time',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            }, 500);
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
    }

}