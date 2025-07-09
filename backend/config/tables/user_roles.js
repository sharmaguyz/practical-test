module.exports = {
  tableName: `${process.env.DYNAMODB_TABLE_PREFIX}user_roles`,
  schema: {
    AttributeDefinitions: [
      { AttributeName: 'roleId', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'roleId', KeyType: 'HASH' }
    ],
    
    BillingMode: 'PAY_PER_REQUEST'
  }
}