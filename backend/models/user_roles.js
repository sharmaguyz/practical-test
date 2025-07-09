const dynamoDBService = require('../services/dynamodb');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('bson');

class UserRoles {
    constructor() {
        this.tableName = dynamoDBService.tables.user_roles.tableName;
        this.tableSchema = dynamoDBService.tables.user_roles.schema;
        this.checkAndCreateTable(); // Check and create table if needed
    }
    async checkAndCreateTable() {
        try {
            // Check if the table exists
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('user_roles', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
                await UserRoles.create();
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }
    static async create() {
        const Data = [
            {
                roleId: new ObjectId().toString(),
                name: 'STUDENT'
            },
            {
                roleId: new ObjectId().toString(),
                name: 'INSTRUCTOR'
            },
            {
                roleId: new ObjectId().toString(),
                name: 'EMPLOYER'
            }
        ];

        try {
            await dynamoDBService.dynamoDB
                .describeTable({ TableName: dynamoDBService.tables.user_roles.tableName })
                .promise();
            await Promise.all(
                Data.map((item) =>
                    dynamoDBService.putItem('user_roles', item, 'attribute_not_exists(roleId)')
                )
            );
            console.log('Roles created successfully');
        } catch (error) {
            console.error('Error creating user roles:', error);
        }
    }
    static async getRoleId(rolename){
        const params = {
            TableName: dynamoDBService.tables.user_roles.tableName,
            FilterExpression: "#n = :rolename",
            ExpressionAttributeNames: {
                "#n": "name"
            },
            ExpressionAttributeValues: {
                ":rolename": rolename
            }
        };
        try {
            const result = await dynamoDBService.docClient.scan(params).promise();
            return result.Items?.[0];
        } catch (error) {
            throw error;
        }
    }
    static async getRoleName(roleId){
        const params = {
            TableName: dynamoDBService.tables.user_roles.tableName,
            FilterExpression: "#n = :roleId",
            ExpressionAttributeNames: {
                "#n": "roleId"
            },
            ExpressionAttributeValues: {
                ":roleId": roleId
            }
        };
        try {
            const result = await dynamoDBService.docClient.scan(params).promise();
            return result.Items?.[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserRoles;