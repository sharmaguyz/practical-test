module.exports = {
    tableName: `${process.env.DYNAMODB_TABLE_PREFIX}user_workspace`,

    schema: {
        TableName: `${process.env.DYNAMODB_TABLE_PREFIX}user_workspace`,
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'user_id', AttributeType: 'S' },
            { AttributeName: 'course_id', AttributeType: 'S' },
            { AttributeName: 'workspace_id', AttributeType: 'S' }
        ],
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
        ],
        BillingMode: 'PAY_PER_REQUEST',
        GlobalSecondaryIndexes: [
            {
                IndexName: 'user_id-index',
                KeySchema: [
                    { AttributeName: 'user_id', KeyType: 'HASH' }
                ],
                Projection: {
                    ProjectionType: 'ALL'
                }
            },
            {
                IndexName: 'course_id-index',
                KeySchema: [
                    { AttributeName: 'course_id', KeyType: 'HASH' }
                ],
                Projection: {
                    ProjectionType: 'ALL'
                }
            },
            {
                IndexName: 'workspace_id-index',
                KeySchema: [
                    { AttributeName: 'workspace_id', KeyType: 'HASH' }
                ],
                Projection: {
                    ProjectionType: 'ALL'
                }
            }
        ]
    },

    expectedAttributes: {
        id: { type: "S", description: "Primary key" },
        user_id: { type: "S", description: "Workspace user id" },
        course_id: { type: "S", description: "Workspace course id" },
        workspace_id: { type: "S", description: "Workspace id" },
        image_id: { type: "S", description: "image id" },
        image_state: { type: "S", description: "image state" },
        directory_id: { type: "S", description: "Workspace directory id" },
        user_name: { type: "S", description: "Workspace user name" },
        user_password: { type: "S", description: "Workspace user password" },
        operating_system: { type: "S", description: "Workspace operating system" },
        created_at: { type: "S", description: "Create time" },
        updated_at: { type: "S", description: "Update time" }
    }
};
