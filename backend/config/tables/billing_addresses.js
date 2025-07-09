module.exports = {
  tableName: `${process.env.DYNAMODB_TABLE_PREFIX}billing_addresses`,
  schema: {
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIndex',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },

  expectedAttributes: {
    userId: { type: 'S', description: 'Reference to the user' },
    fullName: { type: 'S', description: 'Full name of the person on the billing address' },
    address: { type: 'S', description: 'Street address' },
    email: { type: 'S', description: 'Email of the person on billing address' },
    zipCode: { type: 'S', description: 'Zip Code of the person on billing address' },
    city: { type: 'S', description: 'City name' },
    zipCode: { type: 'S', description: 'ZIP or postal code' },
    phoneNumber: { type: 'S', description: 'Billing phone number' },
    createdAt: { type: 'S', description: 'Created at timestamp' },
    updatedAt: { type: 'S', description: 'Updated at timestamp' },
  },
  indexes: {
    byUserID: {
      type: 'gsi',
      indexName: 'UserIndex'
    }
  }
};
