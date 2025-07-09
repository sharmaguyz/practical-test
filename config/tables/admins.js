module.exports = {
    tableName: `${process.env.DYNAMODB_TABLE_PREFIX}admins`,
    schema: {
        AttributeDefinitions: [
            { AttributeName: 'adminId', AttributeType: 'S' },  // Primary key
            { AttributeName: 'name', AttributeType: 'S' },
            { AttributeName: 'email', AttributeType: 'S' },
            { AttributeName: 'status', AttributeType: 'S' }
        ],
        KeySchema: [
            { AttributeName: 'adminId', KeyType: 'HASH' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'EmailIndex',
                KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
                Projection: {
                    ProjectionType: 'INCLUDE',
                    NonKeyAttributes: ['status', 'name', 'createdAt']
                }
            },
            {
                IndexName: 'NameIndex',
                KeySchema: [{ AttributeName: 'name', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'KEYS_ONLY' }
            },
            {
                IndexName: 'StatusIndex',
                KeySchema: [{ AttributeName: 'status', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'KEYS_ONLY' }
            }
        ],
        BillingMode: 'PAY_PER_REQUEST'
    },
    indexes: {
        byEmail: {
            type: 'gsi',
            indexName: 'EmailIndex',
            projection: 'include'  // Only returns non-sensitive fields
        },
        byName: {  // New index reference
            type: 'gsi',
            indexName: 'NameIndex'
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
    defaultAdmin: {
        email: process.env.DEFAULT_ADMIN_EMAIL,
        temporaryPassword: process.env.DEFAULT_ADMIN_TEMP_PASSWORD,
        name: 'System Administrator',
        role: 'SUPERADMIN',
        status: 'active',
        forcePasswordChange: true
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