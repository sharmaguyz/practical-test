module.exports = {
    tableName: `${process.env.DYNAMODB_TABLE_PREFIX}courses`,
    schema: {
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'instructorId', AttributeType: 'S' },
            { AttributeName: 'updatedAt', AttributeType: 'S' },
        ],
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'CourseDataIndex',
                KeySchema: [
                    { AttributeName: 'instructorId', KeyType: 'HASH' },
                    { AttributeName: 'updatedAt', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' }
            },
        ],
        BillingMode: 'PAY_PER_REQUEST'
    },
    expectedAttributes: {
        courseName: { type: "S", description: "Instructor added course" },
        price: { type: "S", description: "Instructor added price" },
        courseCategory: { type: "S", description: "Instructor added courseCategory" },
        courseDuration: { type: "S", description: "Instructor added courseDuration" },
        operatingSystem: { type: "S", description: "Instructor added operatingSystem" },
        courseImage: { type: "S", description: "Instructor added courseImage" },
        description: { type: "S", description: "Instructor added description" },
        status: {
            type: "S",
            description: "Instructor added status",
            enum: ['active', 'inactive'],
        },
        isApproved: {
            type: "S",
            description: "Approval status",
            enum: ['pending', 'completed', 'rejected'],
            default: 'pending'
        },
        published: {
            type: "S",
            description: "Published status",
            enum: ['','pending', 'completed', 'rejected'],
            default: ''
        },
        reason: { type: "S", description: "Instructor added reason" },
        operatingSystemImage: { type: "S", description: "Instructor workspace image" },
        start_date: { type: "S", description: "Course start date" },
        end_date: { type: "S", description: "Course end date" },
    },
    indexes: {
        byInstructorID: {
            type: 'gsi',
            indexName: 'CourseDataIndex'
        }
    }
};
