const userService = require('../../services/user');
const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');
module.exports = {
    addToCart : async(req,res) => {
        try {
            const userId = req.user.id;
            const { quantity, courseId} = req.body;
            const alreadyExist = await userService.courseExistInCart(userId,courseId);
            if(alreadyExist.message == 'Already exist') return sendSuccess(res,{ message: "The course is already added in your cart." },'SUCCESS',409);
            const result = await userService.addToCart(userId,quantity,courseId);
            if(result.code == 201) return sendSuccess(res,{ result: result.item, message: "Course is added to cart successfully."},'SUCCESS',201);
            throw new Error("Error whhile adding to cart");
        } catch (error) {
            return sendError(res, {
                message: 'Something went wrong! Please try after some time',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            }, 500);
        }
    },
    myCart : async(req,res) => {
        try {
            const userId = req.user.id;
            const myCart = await userService.myCart(userId);
            if (req.query.courseId) {
                const courseId = req.query.courseId.toString();
                myCart.items = myCart.items.filter(item => item.courseId === courseId);
            }
            const { student, userMetaData } = await userService.myProfile(userId);
            const dataSend = {
                fullName: student.fullName,
                email: student.email,
                phoneNumber: student.phoneNumber,
                city: userMetaData.city,
                
            }
            if(myCart.code == 200) return sendSuccess(res,{ items: myCart.items,data: dataSend, billingAddress: myCart.billingAddress },'SUCCESS',200);
            throw new Error("Error while getting my cart");
        } catch (error) {
            return sendError(res, {
                message: 'Something went wrong! Please try after some time',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            }, 500);
        }
    },
    deleteCartItem : async(req,res) => {
        try {
            const { cartId } = req.params;
            const userId = req.user.id;
            const result = await userService.deleteCartItem(cartId,userId);
            if(result.code == 200) return sendSuccess(res, { message: 'Cart item deleted successfully.' },'SUCCESS',200);
            throw new Error("Error while deleting cart item.")
        } catch (error) {
            return sendError(res, {
                message: 'Something went wrong! Please try after some time',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            }, 500);
        }
    }
}