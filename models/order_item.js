const dynamoDBService = require('../services/dynamodb');
const { ObjectId } = require('bson');
class OrderItem{
    constructor(){
        this.tableName = dynamoDBService.tables.order_items.tableName;
        this.tableSchema = dynamoDBService.tables.order_items.schema;
        this.checkAndCreateTable();
    }
    async checkAndCreateTable() {
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('order_items', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }
}
module.exports = OrderItem;