const dynamoDBService = require('../services/dynamodb');
const { ObjectId } = require('bson');
class BillingAddress {
    constructor() {
        this.tableName = dynamoDBService.tables.billing_addresses.tableName;
        this.tableSchema = dynamoDBService.tables.billing_addresses.schema;
        this.checkAndCreateTable();
    }
    async checkAndCreateTable() {
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('billing_addresses', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }
    static async findByUserId(userId) {
        const params = {
            TableName: dynamoDBService.tables.billing_addresses.tableName,
            IndexName: dynamoDBService.tables.billing_addresses.indexes.byUserID.indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            // Limit: 1
        };
        const result = await dynamoDBService.docClient.query(params).promise();
        if (!result.Items || result.Items.length === 0) return null;
        const sorted = result.Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return sorted[0];
    }
    static async create(data){
        const id = new ObjectId().toString();
        const insertItem = {
            id: id,
            userId: data.userId,
            fullName: data.fullName,
            address: data.address,
            city: data.city,
            zipCode: data.zip_code,
            email: data.email,
            phoneNumber: data.phoneNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: dynamoDBService.tables.billing_addresses.tableName}).promise();
            await dynamoDBService.putItem('billing_addresses', insertItem, 'attribute_not_exists(id)');
            return { item: insertItem };
        } catch (error) {
            console.error('Error creating billingaddress --- :', error);
            throw error;
        }
    }
}
module.exports = BillingAddress;