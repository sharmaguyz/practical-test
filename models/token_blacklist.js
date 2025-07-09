const dynamoDBService = require('../services/dynamodb');
const jwt = require('jsonwebtoken');

class TokenBlacklist {
    constructor() {
            this.tableName = dynamoDBService.tables.token_blacklists.tableName;
            this.tableSchema = dynamoDBService.tables.token_blacklists.schema;
            this.checkAndCreateTable(); // Check and create table if needed
        }
        async checkAndCreateTable() {
            try {
                await dynamoDBService.dynamoDB.describeTable({ TableName: this.tableName }).promise();
            } catch (error) {
                if (error.code === 'ResourceNotFoundException') {
                    await dynamoDBService._createTable('token_blacklists', this.tableSchema);
                    await dynamoDBService.dynamoDB.waitFor('tableExists', { TableName: this.tableName }).promise();
                } else {
                    console.error("❌ Error checking/creating table:", error);
                }
            }
        }
    static async addToken(token) {
        try {
            const decoded = jwt.decode(token);
            const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 3600000); // 1 hour default
            
            const params = {
                TableName: dynamoDBService.tables.token_blacklists.tableName,
                Item: {
                    tokenId: token,
                    expiresAt: expiresAt.toISOString(),
                    createdAt: new Date().toISOString()
                }
            };

            await dynamoDBService.docClient.put(params).promise();
            return true;
        } catch (error) {
            console.error('Error adding token to blacklist:', error);
            throw new Error('Failed to blacklist token');
        }
    }

    static async isTokenBlacklisted(token) {
        const params = {
            TableName: dynamoDBService.tables.token_blacklists.tableName,
            Key: {
                tokenId: token
            }
        };

        try {
            const result = await dynamoDBService.docClient.get(params).promise();
            return !!result.Item;
        } catch (error) {
            console.error('Error checking token blacklist:', error);
            throw new Error('Failed to check token status');
        }
    }

    static async cleanupExpiredTokens() {
        try {
            const now = new Date().toISOString();
            const params = {
                TableName: dynamoDBService.tables.token_blacklists.tableName,
                FilterExpression: 'expiresAt <= :now',
                ExpressionAttributeValues: {
                    ':now': now
                }
            };
    
            let lastEvaluatedKey = null;
    
            do {
                if (lastEvaluatedKey) {
                    params.ExclusiveStartKey = lastEvaluatedKey;
                }
    
                const result = await dynamoDBService.docClient.scan(params).promise();
                lastEvaluatedKey = result.LastEvaluatedKey;
    
                if (result.Items.length > 0) {
                    const deleteRequests = result.Items.map(item => ({
                        DeleteRequest: {
                            Key: { tokenId: item.tokenId }
                        }
                    }));
    
                    for (let i = 0; i < deleteRequests.length; i += 25) {
                        const batch = deleteRequests.slice(i, i + 25);
                        const batchParams = {
                            RequestItems: {
                                [dynamoDBService.tables.token_blacklists.tableName]: batch
                            }
                        };
                        await dynamoDBService.docClient.batchWrite(batchParams).promise();
                    }
                }
            } while (lastEvaluatedKey);
        } catch (error) {
            console.error('Error cleaning up expired tokens:', error);
        }
    }
    
}

setInterval(() => TokenBlacklist.cleanupExpiredTokens(), 3600000); // Every hour
module.exports = TokenBlacklist;