module.exports = {
  tableName: `${process.env.DYNAMODB_TABLE_PREFIX}order_items`,
  schema: {
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'orderId', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'OrderIndex',
        KeySchema: [{ AttributeName: 'orderId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },

  expectedAttributes: {
    orderId: { type: 'S', description: 'Reference to orders.id' },
    courseId: { type: 'S', description: 'Course purchased' },
    quantity: { type: 'N', description: 'Quantity purchased' },
    price: { type: 'N', description: 'Price per unit' },
    subTotal: { type: 'N', description: 'price * quantity (before discount/tax)' },
    total: { type: 'N', description: 'Final amount for this item' },
    createdAt: { type: 'S', description: 'Created timestamp' },
    updatedAt: { type: 'S', description: 'Updated timestamp' }
  },

  indexes: {
    byOrder: {
      type: 'gsi',
      indexName: 'OrderIndex'
    }
  }
};
