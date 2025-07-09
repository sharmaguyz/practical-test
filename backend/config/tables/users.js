module.exports = {
    tableName: `${process.env.DYNAMODB_TABLE_PREFIX}users`,
    schema: {
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'email', AttributeType: 'S' },
            { AttributeName: 'isApproved', AttributeType : 'S'},
            { AttributeName: 'role', AttributeType : 'S'}
        ],
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'EmailIndex',
                KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' }
            },
            {
                IndexName: 'StatusIndex',
                KeySchema: [{ AttributeName: 'isApproved', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'KEYS_ONLY' }
            },
            {
                IndexName: 'RoleIndex',
                KeySchema: [{ AttributeName: 'role', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' }
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    },
    expectedAttributes: {
        phoneNumber: { type: "S", description: "Phone number of user" },
        createdAt: { type : "S", description : "User created at"},
        updatedtAt: { type : "S", description : "User updated at"},
    },
    indexes: {
        byEmail: {
            type: 'gsi',
            indexName: 'EmailIndex'
        },
        byStatus: {
            type: 'gsi',
            indexName: 'StatusIndex'
        }
    },
    fieldConfigurations: {
        password: {
            storage: 'hashed',     // Always stored hashed
            algorithm: 'bcrypt',  // Using bcrypt algorithm
            costFactor: 12        // bcrypt cost factor
        },
        sensitiveFields: ['password', 'resetPasswordToken']  // Fields never returned in queries
    },
    validationRules: {
        password: {
            minLength: 12,
            requireSpecialChar: true,
            requireNumber: true,
            requireMixedCase: true
        }
    },
    statuses: {
        ACTIVE: 'active',
        SUSPENDED: 'suspended',
        PENDING: 'pending'
    },
    passwordPolicy: {
        historyCount: 5,          // Remember last 5 passwords
        expirationDays: 365,       // Password expires after 90 days
        maxAttempts: 6,           // Max failed attempts before lockout
        lockoutDuration: 30       // Minutes to lock account after max attempts
    }
};