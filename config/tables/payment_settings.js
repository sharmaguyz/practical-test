module.exports = {
  tableName: `${process.env.DYNAMODB_TABLE_PREFIX}payment_settings`,
  schema: {
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'platform', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'PlatformIndex',
        KeySchema: [
          { AttributeName: 'platform', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },

  expectedAttributes: {
    id: { type: 'S', description: 'Unique setting identifier (uuid)' },
    platform: { type: 'S', description: 'stripe | paypal' },
    stripeMode: { type: 'S', description: 'sandbox | live' },
    paypalMode: { type: 'S', description: 'sandbox | live' },
    secretKey: { type: 'S', description: 'Stripe secret key or PayPal secret' },
    clientId: { type: 'S', description: 'PayPal Client ID or Stripe Publishable Key (optional)' },
    webhookSecret: { type: 'S', description: 'Stripe or PayPal webhook secret' },
    createdAt: { type: 'S', description: 'Creation timestamp' },
    updatedAt: { type: 'S', description: 'Last updated timestamp' }
  },

  indexes: {
    byPlatform: {
      type: 'gsi',
      indexName: 'PlatformIndex'
    }
  }
};
