import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SFNClient } from '@aws-sdk/client-sfn';
import { SQSClient } from '@aws-sdk/client-sqs';

const region = process.env['AWS_REGION'] ?? 'us-east-1';
const endpoint = process.env['AWS_ENDPOINT_URL'];

const clientConfig = endpoint ? { region, endpoint } : { region };

export function getDynamoDocumentClient(): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(new DynamoDBClient(clientConfig), {
    marshallOptions: { removeUndefinedValues: true },
  });
}

export function getSfnClient(): SFNClient {
  return new SFNClient(clientConfig);
}

export function getSqsClient(): SQSClient {
  return new SQSClient(clientConfig);
}
