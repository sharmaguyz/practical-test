const SettingModel = require('../../models/payment_setting');
const { sendSuccess, sendError } = require('../../config/helpers/reponseHandler');
module.exports = {
    create: async(req,res) => {
        try {
            const response = await SettingModel.saveOrUpdateCombined(req.body);
            if(response.success) return sendSuccess(res,{ message:"Setting created successfully." },'SUCCESS',201);
            throw new Error(response.error);
        } catch (error) {
            return sendError(res, { message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined }, 500);
        }
    },
    getPaymentSetting: async(req,res) => {
        try {
            const stripeSetting = await SettingModel.findByPlatform("stripe");
            const paypalSetting = await SettingModel.findByPlatform("paypal");
            const payload = {
                stripeMode: stripeSetting?.stripeMode || "",
                stripe_secret: stripeSetting?.secretKey || "",
                stripe_webhook_secret: stripeSetting?.webhookSecret || "",
                paypalmode: paypalSetting?.paypalMode || "",
                pay_pal_client_id: paypalSetting?.clientId || "",
                pay_pal_secret: paypalSetting?.secretKey || ""
            };
            return sendSuccess(res,{ message:"Setting retrieved successfully.", data: payload },'SUCCESS',200);
        } catch (error) {
            return sendError(res, { message: 'Something went wrong! Please try after some time', error: process.env.NODE_ENV === 'development' ? error.message : undefined }, 500);
        }
    }
}