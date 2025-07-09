const dynamoDBService = require('../services/dynamodb');
const { ObjectId } = require('bson');
class Order{
    constructor(){
        this.tableName = dynamoDBService.tables.orders.tableName;
        this.tableSchema = dynamoDBService.tables.orders.schema;
        this.checkAndCreateTable();
    }
    async checkAndCreateTable() {
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('orders', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }
    static async findByUserId(userId) {
        const params = {
            TableName: dynamoDBService.tables.orders.tableName,
            IndexName: dynamoDBService.tables.orders.indexes.byUser.indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
        };
        const result = await dynamoDBService.docClient.query(params).promise();
        return result.Items;
    }
    static async findByOrderId(orderId) {
        const params = {
            TableName: dynamoDBService.tables.orders.tableName,
            IndexName: dynamoDBService.tables.orders.indexes.byUser.indexName,
            KeyConditionExpression: 'id = :orderId',
            ExpressionAttributeValues: {
                ':id': orderId
            },
            Limit:1
        };
        const result = await dynamoDBService.docClient.query(params).promise();
        return result.Items[0];
    }
    static async create(data){
        const id = new ObjectId().toString();
        const insertItem = {
            id: id,
            userId : data.userId,
            paymentMethod: data.payment_method,
            paymentStatus: 'pending',
            totalAmount:data.totalAmount,
            currency:'$',
            billingAddressId:data.billingAddressId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        if(data.payment_method == 'stripe'){
            insertItem.stripeSessionId = data.sessionId || '';
        }else{
            insertItem.paypalOrderId = data.sessionId || '';
        }
        const orderItems = data.cart_items.map(item => ({
            id: new ObjectId().toString(),
            orderId: id,
            courseId: item.course_id,
            price: item.price,
            quantity: 1,
            subTotal: item.price,
            total: item.price,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: dynamoDBService.tables.orders.tableName}).promise();
            await dynamoDBService.putItem('orders', insertItem, 'attribute_not_exists(id)');
            await dynamoDBService.dynamoDB.describeTable({ TableName: dynamoDBService.tables.order_items.tableName }).promise();
            const putItemPromises = orderItems.map(item =>
                dynamoDBService.putItem('order_items', item, 'attribute_not_exists(id)')
            );
            await Promise.all(putItemPromises);
            return { insertItem: insertItem, orderItem: orderItems };
        } catch (error) {
            throw error;
        }
    }
    static async orderStatus(sessionId, paymentStatus, status, type) {
        try {
            let filter = '';
            if(type == 'stripe'){
                filter = 'stripeSessionId = :sessionId';
            }else{
                filter = 'paypalOrderId = :sessionId';
            }
            const getParams = {
                TableName: dynamoDBService.tables.orders.tableName,
                FilterExpression: filter,
                ExpressionAttributeValues: {
                    ':sessionId': sessionId
                }
            };
            const scanResult = await dynamoDBService.docClient.scan(getParams).promise();
            const order = scanResult.Items[0];
            if (!order) {
                throw new Error("Order not found for session ID: " + sessionId);
            }
            const params = {
                TableName: dynamoDBService.tables.orders.tableName,
                Key: {
                    id: order.id,
                },
                UpdateExpression: 'SET paymentStatus = :paymentStatus, #status = :status, updatedAt = :updatedAt',
                ExpressionAttributeNames: {
                    '#status': 'status',
                },
                ExpressionAttributeValues: {
                    ':status': status,
                    ':paymentStatus': paymentStatus,
                    ':updatedAt': new Date().toISOString(),
                },
                ReturnValues: 'ALL_NEW'
            };

            const result = await dynamoDBService.docClient.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    static async getPlacedCourses(sessionId,type) {
        try {
            let filter = '';
            if(type == 'stripe'){
                filter = 'stripeSessionId = :sid';
            }else{
                filter = 'paypalOrderId = :sid';
            }
            const orderScan = await dynamoDBService.docClient.scan({
                TableName: dynamoDBService.tables.orders.tableName,
                FilterExpression: filter,
                ExpressionAttributeValues: { ':sid': sessionId },
            }).promise();
            const order = orderScan.Items[0];
            if (!order) {
                return [];
            }
            const orderId = order.id;
            const itemParams = {
                TableName: dynamoDBService.tables.order_items.tableName,
                FilterExpression: 'orderId = :oid',
                ExpressionAttributeValues: { ':oid': orderId },
            };
            const itemsResult = await dynamoDBService.docClient.scan(itemParams).promise();
            return itemsResult.Items.map(i => i.courseId);
        } catch (err) {
            console.error('Error in getPlacedCourses:', err);
            throw err;
        }
    }
    static async findBySessionId(sessionId,type){
        try {
            let filter = '';
            if(type == 'stripe'){
                filter = 'stripeSessionId = :sid';
            }else{
                filter = 'paypalOrderId = :sid';
            }
            const orderScan = await dynamoDBService.docClient.scan({
                TableName: dynamoDBService.tables.orders.tableName,
                FilterExpression: filter,
                ExpressionAttributeValues: { ':sid': sessionId },
            }).promise();
            const order = orderScan.Items[0];
            if (!order) {
                return [];
            }
            const userId = order.userId;
            const orderId = order.id;
            return { userId, orderId };
        } catch (error) {
            console.error('Error in getPlacedCourses:', error);
            throw err;
        }
    }

}
module.exports = Order;