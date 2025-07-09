const dynamoDBService = require('../services/dynamodb');

class WorkAauthorization {
    constructor() {
        this.tableName = dynamoDBService.tables.work_authorizations.tableName;
        this.tableSchema = dynamoDBService.tables.work_authorizations.schema;
        this.checkAndCreateTable(); // Check and create table if needed
    }
    async checkAndCreateTable() {
        try {
            // Check if the table exists
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
            console.log(`✅ Table "${this.tableName}" already exists.`);
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                console.log(`⚠️ Table "${this.tableName}" not found. Creating...`);
                
                // Create the table
                await dynamoDBService._createTable('work_authorizations', this.tableSchema);
                console.log(`✅ Table "${this.tableName}" created successfully.`);

                // Wait for the table to become active
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
                console.log(`✅ Table "${this.tableName}" is now active.`);
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }

    async seedWorkAauthorizationData(seedData = []) {  
        if (!seedData.length) {
            console.log('⚠️ No data provided for work authorizations seeding.');
            return;
        }
        const params = {
            RequestItems: {
                [this.tableName]: seedData.map(item => ({
                    PutRequest: {
                        Item: item
                    }
                }))
            }
        };
    
        try {
            await dynamoDBService.docClient.batchWrite(params).promise();
            console.log(`✅ Seeded ${seedData.length} work authorizations.`);
        } catch (err) {
            console.error('❌ Failed to seed work authorizations:', err);
        }
    }
    

    async truncateTable() {
        try {
            const itemsToDelete = [];
            let ExclusiveStartKey;
            do {
                const scanParams = {
                    TableName: this.tableName,
                    ExclusiveStartKey,
                };
                const result = await dynamoDBService.docClient.scan(scanParams).promise();
                result.Items.forEach((item) => {
                    itemsToDelete.push({
                        DeleteRequest: {
                            Key: { id: item.id },
                        },
                    });
                });
                ExclusiveStartKey = result.LastEvaluatedKey;
            } while (ExclusiveStartKey);
    
            if (itemsToDelete.length === 0) {
                console.log(`ℹ️ No items to delete in table "${this.tableName}"`);
                return;
            }
    
            // Split into chunks of 25 (DynamoDB batchWrite limit)
            const chunkSize = 25;
            for (let i = 0; i < itemsToDelete.length; i += chunkSize) {
                const batch = itemsToDelete.slice(i, i + chunkSize);
                const deleteParams = {
                    RequestItems: {
                        [this.tableName]: batch,
                    },
                };
                await dynamoDBService.docClient.batchWrite(deleteParams).promise();
            }
    
            console.log(`🗑️ Truncated table "${this.tableName}" (${itemsToDelete.length} items deleted).`);
        } catch (error) {
            console.error(`❌ Error truncating table "${this.tableName}":`, error);
        }
    }    
    

    static async findAll() {
        const params = {
            TableName: dynamoDBService.tables.work_authorizations.tableName,
        };
    
        try {
            const result = await dynamoDBService.docClient.scan(params).promise();
            const sortedItems = result.Items.sort((a, b) => a.id - b.id);
            return sortedItems;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = WorkAauthorization;