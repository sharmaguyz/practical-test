const dynamoDBService = require('../services/dynamodb');
const DIRECTORY_ID = process.env.WORKSPACE_DIRECTORY_ID;
const { ObjectId } = require('bson');
const tableName = dynamoDBService.tables.user_workspace.tableName;

class UserWorkspace {
    constructor() {
        this.tableName = tableName;
        this.tableSchema = dynamoDBService.tables.user_workspace.schema;
        this.checkAndCreateTable();
    }

    async checkAndCreateTable() {
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('user_workspace', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
            } else {
                console.error("Error checking/creating table:", error);
            }
        }
    }

    static async create(insertData) {
        const { user_id, workspace_id, course_id, bundle_id, state, user_name, operating_system, password } = insertData;
        const timestamp = new Date().toISOString();
        const id = new ObjectId().toString();

        const data = {
            id,
            user_id,
            workspace_id,
            course_id,
            bundle_id,
            directory_id: DIRECTORY_ID,
            state,
            user_name,
            operating_system,
            user_password: password,
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
            console.error(`Error creating user workspace for user_id ${user_id}, workspace_id ${workspace_id}:`, error);
            throw new Error('Failed to insert user workspace data');
        }
    }

    static async updateStateById(id, state) {
        const timestamp = new Date().toISOString();

        const params = {
            TableName: tableName,
            Key: { id },
            UpdateExpression: 'SET #state = :state, #updated_at = :updated_at',
            ExpressionAttributeNames: {
                '#state': 'state',
                '#updated_at': 'updated_at'
            },
            ExpressionAttributeValues: {
                ':state': state,
                ':updated_at': timestamp
            },
            ConditionExpression: 'attribute_exists(id)',
            ReturnValues: 'ALL_NEW'
        };

        try {
            const result = await dynamoDBService.docClient.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error(`Error updating state for id ${id}:`, error);
            throw new Error('Failed to update user workspace state');
        }
    }

    static async findById(id) {
        const params = {
            TableName: tableName,
            Key: { id: id }
        };

        try {
            const result = await dynamoDBService.docClient.get(params).promise();
            return result.Item;
        } catch (error) {
            throw error;
        }
    }

    static async findByWorkspaceId(workspaceId) {
        const params = {
            TableName: tableName,
            IndexName: 'workspace_id-index',
            FilterExpression: "workspace_id = :workspaceId",
            ExpressionAttributeValues: { ":workspaceId": workspaceId },
        };

        const result = await dynamoDBService.docClient.scan(params).promise();
        return result.Items[0];
    }

    static async findByUserId(userId) {
        const params = {
            TableName: tableName,
            IndexName: 'user_id-index',
            KeyConditionExpression: 'user_id = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };

        try {
            const result = await dynamoDBService.docClient.query(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error(`Error querying user_id ${userId}:`, error);
            throw new Error('Failed to retrieve user workspace data');
        }
    }

    static async findByCourseId(courseId) {
        const params = {
            TableName: tableName,
            IndexName: 'course_id-index',
            KeyConditionExpression: 'course_id = :courseId',
            ExpressionAttributeValues: {
                ':courseId': courseId
            }
        };

        try {
            const result = await dynamoDBService.docClient.query(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error(`Error querying course_id ${courseId}:`, error);
            throw new Error('Failed to retrieve user workspace data');
        }
    }

    static async updateImageIdAndStateById(id, imageId, imageState) {
        const timestamp = new Date().toISOString();

        const params = {
            TableName: tableName,
            Key: { id },
            UpdateExpression: 'SET #image_id = :imageId, #image_state = :imageState, #updated_at = :updated_at',
            ExpressionAttributeNames: {
                '#image_id': 'image_id',
                '#image_state': 'image_state',
                '#updated_at': 'updated_at'
            },
            ExpressionAttributeValues: {
                ':imageId': imageId,
                ':imageState': imageState,
                ':updated_at': timestamp
            },
            ConditionExpression: 'attribute_exists(id)',
            ReturnValues: 'ALL_NEW'
        };

        try {
            const result = await dynamoDBService.docClient.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error(`Error updating image_id and state for id ${id}:`, error);
            throw new Error('Failed to update user workspace image data');
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
            return { id, message: 'Workspace deleted successfully' };
        } catch (error) {
            console.error(`Error deleting workspace for id ${id}:`, error);
            throw new Error('Failed to delete user workspace data');
        }
    }

}
module.exports = UserWorkspace;