module.exports = {
    tableName: `${process.env.DYNAMODB_TABLE_PREFIX}token_blacklists`,
    schema: {
        AttributeDefinitions: [
            { AttributeName: 'tokenId', AttributeType: 'S' },
            { AttributeName: 'expiresAt', AttributeType: 'S' }
        ],
        KeySchema: [
            { AttributeName: 'tokenId', KeyType: 'HASH' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'ExpirationIndex',
                KeySchema: [{ AttributeName: 'expiresAt', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'KEYS_ONLY' }
            }
        ],
        BillingMode: 'PAY_PER_REQUEST',
        // TimeToLiveSpecification: {
        //     AttributeName: 'expiresAt',
        //     Enabled: true
        // }
    },
    indexes: {
        byExpiration: {
            type: 'gsi',
            indexName: 'ExpirationIndex'
        }
    }
};