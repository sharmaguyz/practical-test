const dynamoDBService = require('../services/dynamodb');
const bcrypt = require('bcryptjs');

class UserMetaData {
    constructor() {
        this.tableName = dynamoDBService.tables.users_meta_data.tableName;
        this.tableSchema = dynamoDBService.tables.users_meta_data.schema;
        this.checkAndCreateTable();
    }
    async checkAndCreateTable() {
        try {
            // Check if the table exists
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('users_meta_data', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }
    static async findByUserId(userId) {
        const params = {
            TableName: dynamoDBService.tables.users_meta_data.tableName,
            IndexName: dynamoDBService.tables.users_meta_data.indexes.byUserID.indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            Limit: 1
        };
        const result = await dynamoDBService.docClient.query(params).promise();
        return result.Items[0];
    }
    static async delete(userId) {
        const queryParams = {
            TableName: dynamoDBService.tables.users_meta_data.tableName,
            IndexName: dynamoDBService.tables.users_meta_data.indexes.byUserID.indexName,
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
            TableName: dynamoDBService.tables.users_meta_data.tableName,
            Key: {
                id: item.id
            }
        };
        return await dynamoDBService.docClient.delete(deleteParams).promise();
    }
    static async update(userId, body) {
        try {
            const queryParams = {
                TableName: dynamoDBService.tables.users_meta_data.tableName,
                IndexName: dynamoDBService.tables.users_meta_data.indexes.byUserID.indexName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                },
                Limit: 1
            };
            const metaData = await dynamoDBService.docClient.query(queryParams).promise();
            const item = metaData.Items[0];
            if (!item) {
                throw new Error(`User metadata not found for userId: ${userId}`);
            }
            const updatedAt = new Date().toISOString();
            const { country,state,city,linkedin,portfolio,highestDegree,currentlyEnrolled,university,graduationDate,yearsOfExperience,certifications,otherCertification,securityClearance,workAuthorization,workType,activelySeeking,profileVisible,technicalSkills} = body;
            const params = {
                TableName: dynamoDBService.tables.users_meta_data.tableName,
                Key: {
                    id: item.id
                },
                UpdateExpression: `SET 
                    country = :country,
                    #state = :state,
                    city = :city,
                    linkedin = :linkedin,
                    portfolio = :portfolio,
                    highestDegree = :highestDegree,
                    currentlyEnrolled = :currentlyEnrolled,
                    university = :university,
                    graduationDate = :graduationDate,
                    yearsOfExperience = :yearsOfExperience,
                    certifications = :certifications,
                    otherCertification = :otherCertification,
                    securityClearance = :securityClearance,
                    workAuthorization = :workAuthorization,
                    workType = :workType,
                    activelySeeking = :activelySeeking,
                    profileVisible = :profileVisible,
                    technicalSkills = :technicalSkills,
                    updatedAt = :updatedAt`,
                ExpressionAttributeNames: {
                    '#state': 'state'
                },
                ExpressionAttributeValues: {
                    ':country': country,
                    ':state': state,
                    ':city': city,
                    ':linkedin': linkedin,
                    ':portfolio': portfolio,
                    ':highestDegree': highestDegree,
                    ':currentlyEnrolled': currentlyEnrolled,
                    ':university': university,
                    ':graduationDate': graduationDate.toISOString(),
                    ':yearsOfExperience': yearsOfExperience,
                    ':certifications': certifications,
                    ':otherCertification': otherCertification,
                    ':securityClearance': securityClearance,
                    ':workAuthorization': workAuthorization,
                    ':workType': workType,
                    ':activelySeeking': activelySeeking,
                    ':profileVisible': profileVisible,
                    ':technicalSkills': technicalSkills,
                    ':updatedAt' :updatedAt
                },
                ReturnValues: 'ALL_NEW'
            };            
            const result = await dynamoDBService.docClient.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Could not update the users meta data.");
        }
    }
}
module.exports = UserMetaData;