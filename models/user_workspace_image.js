const dynamoDBService = require('../services/dynamodb');
const DIRECTORY_ID = process.env.WORKSPACE_DIRECTORY_ID;
const { ObjectId } = require('bson');
const tableName = dynamoDBService.tables.workspace_previous_images.tableName;

class UserWorkspaceImage {
    constructor() {
        this.tableName = tableName;
        this.tableSchema = dynamoDBService.tables.workspace_previous_images.schema;
        this.checkAndCreateTable();
    }

    async checkAndCreateTable() {
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('workspace_previous_images', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
            } else {
                console.error("Error checking/creating table:", error);
            }
        }
    }

    static async create(insertData) {
        const { user_id, workspace_id, image_id, operating_system } = insertData;
        const timestamp = new Date().toISOString();
        const id = new ObjectId().toString();

        const data = {
            id,
            user_id,
            workspace_id,
            image_id,
            directory_id: DIRECTORY_ID,
            workspace_operating_system: operating_system,
            created_at: timestamp,
            updated_at: timestamp
        };

        const params = {
            TableName: tableName,
            Item: data,
            ConditionExpression: 'attribute_not_exists(id)'
        };

        try {
            await dynamoDBService.docClient.put(params).promise();
            return data;
        } catch (error) {
            console.error(`Error creating user workspace image for user_id ${user_id}, workspace_id ${workspace_id}:`, error);
            throw new Error('Failed to insert user workspace data');
        }
    }

    static async findById(id) {
        const params = {
            TableName: tableName,
            Key: { id }
        };

        try {
            const result = await dynamoDBService.docClient.get(params).promise();
            return result.Item || null;
        } catch (error) {
            console.error(`Error retrieving workspace image by id ${id}:`, error);
            throw new Error('Failed to retrieve workspace image');
        }
    }


    static async findByUserId(userId) {
        const params = {
            TableName: tableName,
            IndexName: 'UserCreatedAtIndex',
            KeyConditionExpression: 'user_id = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        };

        try {
            const result = await dynamoDBService.docClient.query(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error(`Error querying user_id ${userId}:`, error);
            throw new Error('Failed to retrieve user workspace data');
        }
    }

    static async findByUserIdAndOS(userId, workspaceOperatingSystem) {
        const params = {
            TableName: tableName,
            IndexName: 'UserOSIndex',
            KeyConditionExpression: 'user_id = :userId AND workspace_operating_system = :os',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':os': workspaceOperatingSystem
            }
        };

        try {
            const result = await dynamoDBService.docClient.query(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error(`Error querying by user_id ${userId} and OS ${workspaceOperatingSystem}:`, error);
            throw new Error('Failed to retrieve workspace images by OS');
        }
    }
    
    static async delete(id) {
        const params = {
            TableName: tableName,
            Key: { id },
            ConditionExpression: 'attribute_exists(id)'
        };

        try {
            await dynamoDBService.docClient.delete(params).promise();
            return { id, message: 'Workspace image deleted successfully' };
        } catch (error) {
            console.error(`Error deleting workspace for id ${id}:`, error);
            throw new Error('Failed to delete user workspace data');
        }
    }

}
module.exports = UserWorkspaceImage;