module.exports = {
    tableName: `${process.env.DYNAMODB_TABLE_PREFIX}instructors_meta_data`,
    schema: {
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
        ],
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'MetaDataIndex',
                KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' }
            },
        ],
        BillingMode: 'PAY_PER_REQUEST' // Better for scaling than provisioned
    },
    expectedAttributes: {
        profilePic: { type: "S", description: "Instructor added profilePic" },
        jobTitle : { type: "S", description: "Instructor added jobTitle" },
        organization : { type: "S", description: "Instructor added organization" },
        bio : { type: "S", description: "Instructor added bio" },
        expectedStudents : { type: "S", description: "Instructor added expectedStudents" },
        topicTeach : { type: "S", description: "Instructor added topicTeach" },
       
    },
    indexes: {
        byUserID: {
            type: 'gsi',
            indexName: 'MetaDataIndex'
        }
    },
    BillingMode: 'PAY_PER_REQUEST'
};