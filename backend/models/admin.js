const dynamoDBService = require('../services/dynamodb');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('bson');
class Admin {
    constructor() {
        this.tableName = dynamoDBService.tables.admins.tableName;
        this.tableSchema = dynamoDBService.tables.admins.schema;
        this.checkAndCreateTable(); // Check and create table if needed
    }
    async checkAndCreateTable() {
        try {
            // Check if the table exists
            await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                await dynamoDBService._createTable('admins', this.tableSchema);
                await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
                await Admin.initializeDefaultAdmin();
            } else {
                console.error("❌ Error checking/creating table:", error);
            }
        }
    }
    static async findById(adminId) {
        const params = {
            TableName: dynamoDBService.tables.admins.tableName,
            Key: {
                adminId: adminId
            }
        };

        try {
            const result = await dynamoDBService.docClient.get(params).promise();
            return result.Item;
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        const params = {
            TableName: dynamoDBService.tables.admins.tableName,
            IndexName: dynamoDBService.tables.admins.indexes.byEmail.indexName,
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            },
            Limit: 1
        };

        const result = await dynamoDBService.docClient.query(params).promise();
        return result.Items[0];
    }

    static async getAllActiveAdmins() {
        const params = {
            TableName: dynamoDBService.tables.admins.tableName,
            ProjectionExpression: '#name, email',
            FilterExpression: '#status = :active',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':active': 'active'
            }
        };

        try {
            const result = await dynamoDBService.docClient.scan(params).promise();
            return result.Items;
        } catch (error) {
            console.error(`Error scanning admins:`, error);
            throw new Error('Failed to retrieve active admins');
        }
    }



    static async findByToken(token) {
        const params = {
            TableName: "app_admins",
            FilterExpression: "resetPasswordToken = :token",
            ExpressionAttributeValues: { ":token": token },
        };

        const result = await dynamoDBService.docClient.scan(params).promise();
        return result.Items[0];
    }

    static async updateResetToken(adminId, token) {
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        const params = {
            TableName: dynamoDBService.tables.admins.tableName,
            Key: {
                adminId: adminId
            },
            UpdateExpression: 'SET resetPasswordToken = :token, resetPasswordExpires = :expires',
            ExpressionAttributeValues: {
                ':token': token,
                ':expires': expires.toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamoDBService.docClient.update(params).promise();
        return result.Attributes;
    }

    static async updatePassword(adminId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const params = {
            TableName: dynamoDBService.tables.admins.tableName,
            Key: {
                adminId: adminId
            },
            UpdateExpression: 'SET password = :password, resetPasswordToken = :token, resetPasswordExpires = :expires',
            ExpressionAttributeValues: {
                ':password': hashedPassword,
                ':token': null,
                ':expires': null
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamoDBService.docClient.update(params).promise();
        return result.Attributes;
    }

    static async getAdmins() {

    }

    static async create(adminData) {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        const adminId = new ObjectId().toString();
        const adminItem = {
            adminId: adminId, // Using email as the ID
            email: adminData.email,
            password: hashedPassword,
            name: adminData.name,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: adminData.role || 'SUPERADMIN',
            status: adminData.status
        };

        try {
            await dynamoDBService.dynamoDB.describeTable({ TableName: dynamoDBService.tables.admins.tableName }).promise();
            await dynamoDBService.putItem('admins', adminItem, 'attribute_not_exists(adminId)');
            return adminItem;
        } catch (error) {
            console.error('Error creating admin --- :', error);
            if (error.code === 'ConditionalCheckFailedException') {
                throw new Error('Admin with this email already exists');
            }
            throw error;
        }
    }

    // Optional: Initialize default admin if table is empty
    static async initializeDefaultAdmin() {
        const { defaultAdmin } = dynamoDBService.tables.admins;
        // console.log("dynamoDBService.tables==>",dynamoDBService.tables);
        if (!defaultAdmin || !defaultAdmin.email) return;

        try {
            const existingAdmin = await this.findByEmail(defaultAdmin.email);
            if (!existingAdmin) {
                await this.create({
                    email: defaultAdmin.email,
                    password: defaultAdmin.temporaryPassword,
                    name: defaultAdmin.name,
                    role: 'SUPERADMIN',
                    status: defaultAdmin.status
                });
                console.log('Default admin user created');
            }
        } catch (error) {
            console.error('Error initializing default admin:', error);
        }
    }
}

// Initialize default admin when module loads
if (process.env.INIT_DEFAULT_ADMIN === 'true') {
    Admin.initializeDefaultAdmin().catch(console.error);
}

module.exports = Admin;