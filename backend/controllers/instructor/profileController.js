const instructorService = require('../../services/instructor');
const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');
module.exports = {
    myProfile : async (req,res) => {
        try {
            const userId = req.user.id;
            if(!userId) return sendError(res,{ message: "Instructor not found" },404);
            const instructor = await instructorService.myProfile(userId);
            if(instructor.success && instructor.code == 200) return sendSuccess(res,{ message: "Profile get successfully",instructor: instructor.instructor,instructorMetaData: instructor.instructorMetaData},'SUCCESS',200);
            else if(!instructor.success && instructor.code == 404) return sendError(res,{ message: "Instructor not found" },404);
        } catch (error) {
            return sendError(res,{ message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined },500);
        }
    }
}