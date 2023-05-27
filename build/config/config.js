"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueUrl = exports.queueName = exports.sqs = exports.openai = exports.databaseUrl = void 0;
exports.databaseUrl = 'mongodb://localhost:27017/waitroom';
const openai_1 = require("openai");
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
exports.openai = new openai_1.OpenAIApi(configuration);
//import SQS from 'aws-sdk/clients/sqs';
const aws_sdk_1 = require("aws-sdk");
exports.sqs = new aws_sdk_1.SQS({
    region: 'us-east-1',
    endpoint: 'http://localhost:4566'
});
exports.queueName = 'summaries';
exports.queueUrl = 'http://localhost:4566/000000000000/summaries';
