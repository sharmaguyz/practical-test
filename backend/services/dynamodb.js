const AWS = require('aws-sdk');
const tables = require('../config/tables');
const awsConfig = require('../config/aws');
class DynamoDBService {
    constructor() {
        this._configureAWS();
        this.docClient = new AWS.DynamoDB.DocumentClient({
            // endpoint: awsConfig.dynamoDB.endpoint
        });
        this.dynamoDB = new AWS.DynamoDB();
        this.tables = tables;
        this._initTableMethods();
    }

    _initTableMethods() {
        Object.keys(this.tables).forEach(tableKey => {
            if (tableKey === 'validate') return;
            this[`create${this._capitalize(tableKey)}`] = async (item) => {
                return this._createItem(tableKey, item);
            };
        });
    }

    _configureAWS() {
        AWS.config.update({
            region: awsConfig.dynamoDB.region,
            accessKeyId: awsConfig.dynamoDB.accessKeyId,
            secretAccessKey: awsConfig.dynamoDB.secretAccessKey,
            // endpoint: awsConfig.dynamoDB.endpoint
        });
    }

    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    async initializeAllTables() {
        try {
            await Promise.all(Object.entries(this.tables).map(([key, config]) => this._createTable(key, config.schema)));
            console.log('All tables initialized');
        } catch (error) {
            console.error('Initialization error:', error);
            throw error;
        }
    }

    async _createTable(tableKey, schema) {
        console.log(tableKey)
        const params = {
            TableName: this.tables[tableKey].tableName,
            ...schema
        };

        try {
            await this.dynamoDB.createTable(params).promise();
            console.log(`Created table: ${params.TableName}`);
        } catch (error) {
            if (error.code !== 'ResourceInUseException') {
                throw error;
            }
            console.log(`Table exists: ${params.TableName}`);
        }
    }

    async _createItem(tableKey, item) {
        const params = {
            TableName: this.tables[tableKey].tableName,
            Item: item
        };
        await this.docClient.put(params).promise();
        return item;
    }

    async updateItem(tableKey, params) {
        params.TableName = this.tables[tableKey].tableName;
        const result = await this.docClient.update(params).promise();
        return result.Attributes;
    }

    async putItem(tableKey, item, condition) {
        const params = {
            TableName: this.tables[tableKey].tableName,
            Item: item
        };
        if (condition) {
            params.ConditionExpression = condition;
        }
        await this.docClient.put(params).promise();
        return item;
    }

    async initializeTokenBlacklist() {
        try {
            await this._createTable('token_blacklist', this.tables.token_blacklist.schema);
            console.log('Token blacklist table ready');
        } catch (error) {
            console.error('Error initializing token blacklist:', error);
        }
    }

    async getItem(tableKey, key) {
        const params = {
            TableName: this.tables[tableKey].tableName,
            Key: key
        };
        const result = await this.docClient.get(params).promise();
        return result.Item;
    }
}

module.exports = new DynamoDBService();