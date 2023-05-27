"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestSummaryTitle = exports.getSummaryTitle = void 0;
const config_1 = require("../config/config");
const summary_repository_1 = require("../repositories/summary-repository");
async function getSummaryTitle(text) {
    const foundSummary = await (0, summary_repository_1.findTextInDatabase)(text);
    if (foundSummary) {
        return 'Summary already exists';
    }
    await enqueueSummaryJob(text);
}
exports.getSummaryTitle = getSummaryTitle;
async function requestSummaryTitle(text) {
    return config_1.openai.createCompletion({
        model: "text-davinci-003",
        prompt: "write a short, one sentence, title for this text: \"´" + text,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
}
exports.requestSummaryTitle = requestSummaryTitle;
async function enqueueSummaryJob(text) {
    const params = {
        MessageBody: text,
        QueueUrl: config_1.queueUrl,
    };
    try {
        await config_1.sqs.sendMessage(params).promise();
        console.log('Job added to the queue');
    }
    catch (error) {
        console.error('Error adding job to the queue:', error);
    }
}
