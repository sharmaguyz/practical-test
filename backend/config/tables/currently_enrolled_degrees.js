module.exports = {
  tableName: `${process.env.DYNAMODB_TABLE_PREFIX}currently_enrolled_degrees`,
  schema: {
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  // Optional: Document expected non-key attributes (DynamoDB won't validate these)
  expectedAttributes: {
    name: { type: "S", description: "Name of the degree" },
  }
};  