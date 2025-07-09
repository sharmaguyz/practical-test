module.exports = {
    tableName: `${process.env.DYNAMODB_TABLE_PREFIX}workspace_previous_images`,
    schema: {
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'user_id', AttributeType: 'S' },
            { AttributeName: 'workspace_operating_system', AttributeType: 'S' },
            { AttributeName: 'created_at', AttributeType: 'S' },
            { AttributeName: 'updated_at', AttributeType: 'S' },
        ],
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'UserOSIndex',
                KeySchema: [
                    { AttributeName: 'user_id', KeyType: 'HASH' },
                    { AttributeName: 'workspace_operating_system', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' }
            },
            {
                IndexName: 'UserCreatedAtIndex',
                KeySchema: [
                    { AttributeName: 'user_id', KeyType: 'HASH' },
                    { AttributeName: 'created_at', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' }
            },
            {
                IndexName: 'UserUpdatedAtIndex',
                KeySchema: [
                    { AttributeName: 'user_id', KeyType: 'HASH' },
                    { AttributeName: 'updated_at', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' }
            },
        ],
        BillingMode: 'PAY_PER_REQUEST'
    },
    expectedAttributes: {
        id: { type: 'S', description: 'Unique ID for the workspace record' },
        user_id: { type: 'S', description: 'User who owns this workspace' },
        workspace_id: { type: 'S', description: 'Actual AWS workspace ID or reference' },
        image_id: { type: 'S', description: 'AMI or image used for this workspace' },
        workspace_operating_system: { type: 'S', description: 'OS of the workspace' },
        created_at: { type: 'S', description: 'ISO 8601 or timestamp when created' },
        updated_at: { type: 'S', description: 'ISO 8601 or timestamp when updated' }
    },
    indexes: {
        byUserCreatedAt: {
            type: 'gsi',
            indexName: 'UserCreatedAtIndex'
        },
        byUserUpdatedAt: {
            type: 'gsi',
            indexName: 'UserUpdatedAtIndex'
        }
    }
};
