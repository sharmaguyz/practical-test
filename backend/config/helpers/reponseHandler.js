
// Standard success response
exports.sendSuccess = (res, data, message = 'Success',statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
};
  
// Standard error response
exports.sendError = (res, errorDetail, statusCode = 500) => {
    const errorMessage = typeof errorDetail === 'string' 
    ? errorDetail 
    : errorDetail?.message || "Something went wrong";
    // console.error('❌ Error:', errorDetail); 
    res.status(statusCode).json({
        success: false,
        message: errorMessage,
        detail: errorDetail
    });
};
