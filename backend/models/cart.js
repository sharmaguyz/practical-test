const dynamoDBService = require('../services/dynamodb');
const { ObjectId } = require('bson');

class Cart{
    constructor() {
        this.tableName = dynamoDBService.tables.cart.tableName;
        this.tableSchema = dynamoDBService.tables.cart.schema;
        this.checkAndCreateTable();
    }
    async checkAndCreateTable() {
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('cart', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }
    static async findByUserId(userId) {
        const params = {
            TableName: dynamoDBService.tables.cart.tableName,
            IndexName: dynamoDBService.tables.cart.indexes.byUserId.indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            // Limit: 1
        };
        const result = await dynamoDBService.docClient.query(params).promise();
        return result.Items;
    }
    static async findByCartId(cartId) {
        const params = {
            TableName: dynamoDBService.tables.cart.tableName,
            IndexName: dynamoDBService.tables.cart.indexes.byCartId.indexName,
            KeyConditionExpression: 'cartId = :cartId',
            ExpressionAttributeValues: {
                ':cartId': cartId
            },
            Limit: 1
        };
        const result = await dynamoDBService.docClient.query(params).promise();
        return result.Items[0];
    }
    static async findByCourseId(userId, courseId){
       const params = {
            TableName: dynamoDBService.tables.cart.tableName,
            IndexName: dynamoDBService.tables.cart.indexes.byCourseId.indexName,
            KeyConditionExpression: 'courseId = :courseId',
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':courseId': courseId,
                ':userId': userId
            },
            Limit: 1
        };
        const result = await dynamoDBService.docClient.query(params).promise();
        return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    }
    static async create(userId,quantity,courseId,price,name,image){
        const id = new ObjectId().toString();
        const cartItem = {
            cartId: id,
            quantity: quantity,
            userId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            courseId: courseId,
            price: price,
            courseName: name,
            courseImage: image
        }
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: dynamoDBService.tables.cart.tableName }).promise();
            await dynamoDBService.putItem('cart', cartItem, 'attribute_not_exists(id)');
            return { cartItem };
        } catch (error) {
            console.error('Error while adding in cart --- :', error);
            throw error;
        }
    }
    static async deleteItem(cartID,userId){
        try {
            const params = {
                TableName: dynamoDBService.tables.cart.tableName,
                Key: {
                    userId: String(userId),  
                    cartId: String(cartID)   
                }
            };
            const result = await dynamoDBService.docClient.delete(params).promise();
            return result;
        } catch (error) {
            console.error("Error deleting cart item:", error);
            throw new Error("Could not delete the cart item.");
        }
    }
    static async deleteByCourses(courseIds, userId) {
        try {
            const params = {
                TableName: dynamoDBService.tables.cart.tableName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            };
            const result = await dynamoDBService.docClient.query(params).promise();
            const itemsToDelete = result.Items.filter(item => courseIds.includes(item.courseId));
            if (!itemsToDelete.length) return;
            const batches = [];
            while (itemsToDelete.length) {
                const batch = itemsToDelete.splice(0, 25);
                const deleteRequests = batch.map(item => ({
                    DeleteRequest: {
                        Key: {
                            userId: item.userId,
                            cartId: item.cartId
                        }
                    }
                }));
                batches.push(deleteRequests);
            }
            for (const batch of batches) {
                const deleteParams = {
                    RequestItems: {
                        [dynamoDBService.tables.cart.tableName]: batch
                    }
                };
                await dynamoDBService.docClient.batchWrite(deleteParams).promise();
            }
            return batches;
        } catch (error) {
            console.error('Error deleting cart items by courses:', error);
            throw error;
        }
    }

}
module.exports = Cart;