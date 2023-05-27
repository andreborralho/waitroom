export const databaseUrl = 'mongodb://localhost:27017/waitroom';

import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);

import { SQS } from 'aws-sdk';

export const sqs = new SQS({
  region: 'us-east-1',
  endpoint: 'http://127.0.0.1:4566',
  s3ForcePathStyle: true
});
export const queueName = 'summaries';

export const queueUrl = 'http://127.0.0.1:4566/000000000000/summaries';
