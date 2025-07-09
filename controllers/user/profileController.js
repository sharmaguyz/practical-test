const userService = require('../../services/user');
const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');
module.exports = {
    myProfile : async (req,res) => {
        try {
            const userId = req.user.id;
            if(!userId) return sendError(res,{ message: "Student not found" },404);
            const student = await userService.myProfile(userId);
            if(student.success && student.code == 200) return sendSuccess(res,{ message: "Profile get successfully",student: student.student,studentMetaData: student.userMetaData},'SUCCESS',200);
            else if(!student.success && student.code == 404) return sendError(res,{ message: "Student not found" },404);
        } catch (error) {
            return sendError(res,{ message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined },500);
        }
    }
}