const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const dynamoClient = new DynamoDBClient({});

module.exports = dynamoClient
