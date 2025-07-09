module.exports = {
    dynamoDB: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        endpoint: process.env.IS_OFFLINE ? process.env.DYNAMODB_ENDPOINT : undefined
    }
};