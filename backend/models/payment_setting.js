const dynamoDBService = require('../services/dynamodb');
const { ObjectId } = require('bson');

class PaymentSetting{
    constructor(){
        this.tableName = dynamoDBService.tables.payment_settings.tableName;
        this.tableSchema = dynamoDBService.tables.payment_settings.schema;
        this.checkAndCreateTable();
    }
    async checkAndCreateTable() {
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('payment_settings', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }
    static async findByPlatform(platform){
        try {
            const params = {
                TableName: dynamoDBService.tables.payment_settings.tableName,
                IndexName: dynamoDBService.tables.payment_settings.indexes.byPlatform.indexName,
                KeyConditionExpression: 'platform = :platform',
                ExpressionAttributeValues: {
                    ':platform': platform
                },
                Limit:1
            };
            const result = await dynamoDBService.docClient.query(params).promise();
            return result.Items?.[0] || null
        } catch (error) {
            console.log(error);
        }
    }
    static async saveOrUpdateCombined(data) {
        const timestamp = new Date().toISOString();
        const results = [];
        try {
            const stripePlatform = 'stripe';
            const existingStripe = await this.findByPlatform(stripePlatform);
            if (existingStripe?.id) {
                await dynamoDBService.docClient.update({
                    TableName: dynamoDBService.tables.payment_settings.tableName,
                    Key: { id: existingStripe.id },
                    UpdateExpression: `
                        SET 
                            stripeMode = :mode,
                            secretKey = :secretKey,
                            webhookSecret = :webhookSecret,
                            updatedAt = :updatedAt
                    `,
                    ExpressionAttributeValues: {
                        ':mode': data.stripeMode,
                        ':secretKey': data.stripe_secret,
                        ':webhookSecret': data.stripe_webhook_secret,
                        ':updatedAt': timestamp
                    }
                }).promise();
                results.push({ platform: 'stripe', status: 'updated' });
            } else {
                const id = `ps_${Date.now()}`;
                const newStripeItem = {
                    id: id,
                    platform: stripePlatform,
                    stripeMode: data.stripeMode,
                    secretKey: data.stripe_secret,
                    webhookSecret: data.stripe_webhook_secret,
                    createdAt: timestamp,
                    updatedAt: timestamp
                };
                await dynamoDBService.docClient.put({
                    TableName: dynamoDBService.tables.payment_settings.tableName,
                    Item: newStripeItem
                }).promise();
                results.push({ platform: 'stripe', status: 'created' });
            }
        } catch (error) {
            results.push({ platform: 'stripe', status: 'error', error: error.message });
        }
        try {
            const paypalPlatform = 'paypal';
            const existingPaypal = await this.findByPlatform(paypalPlatform);
            if (existingPaypal?.id) {
                await dynamoDBService.docClient.update({
                    TableName: dynamoDBService.tables.payment_settings.tableName,
                    Key: { id: existingPaypal.id },
                    UpdateExpression: `
                        SET 
                            paypalMode = :mode,
                            clientId = :clientId,
                            secretKey = :secretKey,
                            updatedAt = :updatedAt
                    `,
                    ExpressionAttributeValues: {
                        ':mode': data.paypalmode,
                        ':clientId': data.pay_pal_client_id,
                        ':secretKey': data.pay_pal_secret,
                        ':updatedAt': timestamp
                    }
                }).promise();
                results.push({ platform: 'paypal', status: 'updated' });
            } else {
                const id = `ps_${Date.now()}`;
                const newPaypalItem = {
                    id: id,
                    platform: paypalPlatform,
                    paypalMode: data.paypalmode,
                    clientId: data.pay_pal_client_id,
                    secretKey: data.pay_pal_secret,
                    createdAt: timestamp,
                    updatedAt: timestamp
                };
                await dynamoDBService.docClient.put({
                    TableName: dynamoDBService.tables.payment_settings.tableName,
                    Item: newPaypalItem
                }).promise();
                results.push({ platform: 'paypal', status: 'created' });
            }
        } catch (error) {
            results.push({ platform: 'paypal', status: 'error', error: error.message });
        }
        return { success: true, results };
    }


}
module.exports = PaymentSetting;