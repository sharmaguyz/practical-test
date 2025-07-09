const dynamoDBService = require('../services/dynamodb');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('bson');
class InstructorMetaData {
    constructor() {
        this.tableName = dynamoDBService.tables.instructors_meta_data.tableName;
        this.tableSchema = dynamoDBService.tables.instructors_meta_data.schema;
        this.checkAndCreateTable();
    }
    async checkAndCreateTable() {
        try {
            // Check if the table exists
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('instructors_meta_data', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }
    static async findByUserId(userId) {
        const params = {
            TableName: dynamoDBService.tables.instructors_meta_data.tableName,
            IndexName: dynamoDBService.tables.instructors_meta_data.indexes.byUserID.indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            Limit: 1
        };
        const result = await dynamoDBService.docClient.query(params).promise();
        return result.Items[0];
    }
    static async create(intructorData) {
        const { email, password, fullName, phoneNumber, role, profilePic, jobTitle, organization, bio, expectedStudents, topicTeach,cognitoSub,cognitoUserName,createdBy } = intructorData;
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = new ObjectId().toString();
        const userItem = {
            id: id,
            email: email,
            password: hashedPassword,
            fullName: fullName,
            phoneNumber: phoneNumber,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: role,
            isApproved: 'pending',
            cognitoSub:cognitoSub,
            cognitoUserName:cognitoUserName,
            awsApproved:'pending',
            createdBy:createdBy
        };
        const instructorMetaData = {
            id: new ObjectId().toString(),
            userId: userItem.id,
            jobTitle: jobTitle,
            organization: organization,
            bio: bio,
            expectedStudents: expectedStudents,
            topicTeach: topicTeach,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profilePic:profilePic
        };
        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: dynamoDBService.tables.users.tableName }).promise();
            await dynamoDBService.putItem('users', userItem, 'attribute_not_exists(id)');
            await dynamoDBService.dynamoDB.describeTable({ TableName: dynamoDBService.tables.instructors_meta_data.tableName }).promise();
            await dynamoDBService.putItem('instructors_meta_data', instructorMetaData, 'attribute_not_exists(id)');
            return { user: userItem, metadata: instructorMetaData };
        } catch (error) {
            console.error('Error creating instructor --- :', error);
            if (error.code === 'ConditionalCheckFailedException') {
                throw new Error('User with this email already exists');
            }
            throw error;
        }
    }
    static async delete(userId) {
        try {
            const queryParams = {
                TableName: dynamoDBService.tables.instructors_meta_data.tableName,
                IndexName: dynamoDBService.tables.instructors_meta_data.indexes.byUserID.indexName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                },
                Limit: 1
            };
            const result = await dynamoDBService.docClient.query(queryParams).promise();
            const item = result.Items[0];
            if (!item) {
                throw new Error(`Instructor metadata not found for userId: ${userId}`);
            }
            const deleteParams = {
                TableName: dynamoDBService.tables.instructors_meta_data.tableName,
                Key: {
                    id: item.id
                }
            };
            return await dynamoDBService.docClient.delete(deleteParams).promise();
        } catch (error) {
            console.error("Error deleting user:", error);
            throw new Error("Could not delete the user.");
        }

    }
    static async update(userId, body) {
        try {
            const queryParams = {
                TableName: dynamoDBService.tables.instructors_meta_data.tableName,
                IndexName: dynamoDBService.tables.instructors_meta_data.indexes.byUserID.indexName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                },
                Limit: 1
            };

            const metaData = await dynamoDBService.docClient.query(queryParams).promise();
            const item = metaData.Items[0];
            if (!item) {
                throw new Error(`Instructor metadata not found for userId: ${userId}`);
            }
            const { jobTitle, expectedStudents, topicTeach, bio,organization,profilePic } = body;
            const updatedAt = new Date().toISOString();
            const params = {
                TableName: dynamoDBService.tables.instructors_meta_data.tableName,
                Key: {
                    id: item.id
                },
                UpdateExpression: 'SET jobTitle = :jobTitle, expectedStudents = :expectedStudents, topicTeach = :topicTeach, bio = :bio, organization = :organization, profilePic = :profilePic, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':jobTitle': jobTitle,
                    ':expectedStudents': expectedStudents,
                    ':topicTeach': topicTeach,
                    ':bio': bio,
                    ':organization':organization,
                    ':profilePic':profilePic,
                    ':updatedAt':updatedAt
                },
                ReturnValues: 'ALL_NEW'
            };
            const result = await dynamoDBService.docClient.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error("Error updating instructor:", error);
            throw new Error("Could not update the instructors meta data.");
        }
    }
    static async topicTeach(userId){
        try {
            const params = {
                TableName: dynamoDBService.tables.instructors_meta_data.tableName,
                IndexName: dynamoDBService.tables.instructors_meta_data.indexes.byUserID.indexName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                },
                Limit: 1
            };
            const result = await dynamoDBService.docClient.query(params).promise();
            return result.Items[0]?.topicTeach;
        } catch (error) {
            console.error("Error getting topicteach:", error);
            throw new Error("Could not getting topicteach.");
        }
    }
}
module.exports = InstructorMetaData;