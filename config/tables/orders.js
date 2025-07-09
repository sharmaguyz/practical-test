module.exports = {
  tableName: `${process.env.DYNAMODB_TABLE_PREFIX}orders`,
  schema: {
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'paymentStatus', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIndex',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'PaymentStatusIndex',
        KeySchema: [{ AttributeName: 'paymentStatus', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'KEYS_ONLY' }
      },
      {
        IndexName: 'OrderIdIndex',
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },

  expectedAttributes: {
    userId: { type: 'S', description: 'Reference to user' },
    paymentMethod: { type: 'S', description: 'stripe | paypal' },
    paymentStatus: { type: 'S', description: 'pending | paid | failed | refunded | declined' },
    stripeSessionId: { type: 'S', description: 'Stripe Payment Intent or Checkout Session ID' },
    paypalOrderId: { type: 'S', description: 'PayPal Order ID (used as session ID)' },
    totalAmount: { type: 'N', description: 'Total order amount' },
    currency: { type: 'S', description: 'Currency code (e.g. USD)' },
    billingAddressId: { type: 'S', description: 'Reference to billing_addresses.id' },
    status : { type: 'S', description: 'pending | completed | canceled' },
    createdAt: { type: 'S', description: 'Created timestamp' },
    updatedAt: { type: 'S', description: 'Updated timestamp' }
  },

  indexes: {
    byUser: {
      type: 'gsi',
      indexName: 'UserIndex'
    },
    byPaymentStatus: {
      type: 'gsi',
      indexName: 'PaymentStatusIndex'
    },
    byOrderId: {
      type: 'gsi',
      indexName: 'OrderIdIndex'
    }
  }
};
