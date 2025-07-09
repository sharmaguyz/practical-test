module.exports = {
    tableName: `${process.env.DYNAMODB_TABLE_PREFIX}cart`,
    schema: {
        AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'cartId', AttributeType: 'S' },
            { AttributeName: 'courseId', AttributeType: 'S' },
        ],
        KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },  // Partition key
            { AttributeName: 'cartId', KeyType: 'RANGE' }  // Sort key
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'UserIndex',
                KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' }
            },
            {
                IndexName: 'CartIndex',
                KeySchema: [{ AttributeName: 'cartId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' }
            },
            {
                IndexName: 'CourseIndex',
                KeySchema: [{ AttributeName: 'courseId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' }
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    },
    expectedAttributes: {
        userId: { type: "S", description: "User ID owning this cart" },
        cartId: { type: "S", description: "Unique ID for each cart entry (could be productId or UUID)" },
        courseId: { type: "S", description: "Product ID of the item in cart" },
        quantity: { type: "N", description: "Quantity of the product" },
        createdAt: { type: "S", description: "Timestamp when item added" },
        updatedAt: { type: "S", description: "Timestamp when item last updated" }
    },
    indexes: {
        byUserId : {
            type: 'gsi',
            indexName: 'UserIndex'
        },
        byCartId : {
            type: 'gsi',
            indexName: 'CartIndex'
        },
        byCourseId : {
            type: 'gsi',
            indexName : 'CourseIndex'
        }
    },
    validationRules: {
        quantity: {
            min: 1,
            max: 100
        }
    },
    notes: {
        structure: 'Each user can have multiple cart items. Each item is a separate entry with userId + cartId as PK.',
        recommendedAccessPattern: 'Query using userId to retrieve all cart items for a user.'
    }
};
