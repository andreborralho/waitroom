"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSummaryQueue = void 0;
const http_1 = require("http");
const summary_controller_1 = require("./controllers/summary-controller");
const config_1 = require("./config/config");
const summary_service_1 = require("./services/summary-service");
const summary_repository_1 = require("./repositories/summary-repository");
const bottleneck_1 = __importDefault(require("bottleneck"));
const server = (0, http_1.createServer)(async (req, res) => {
    createSummaryQueue();
    handleSummaryQueue();
    if (req.method === 'POST' && req.url === '/summary-title') {
        (0, summary_controller_1.handleSummaryRequest)(req, res);
    }
    else if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
async function createSummaryQueue() {
    const createQueueParams = {
        QueueName: config_1.queueName,
    };
    const createQueueResponse = await config_1.sqs.createQueue(createQueueParams).promise();
    return createQueueResponse.QueueUrl;
}
async function handleSummaryQueue() {
    const receiveMessageParams = {
        QueueUrl: config_1.queueUrl,
        MaxNumberOfMessages: 10,
    };
    const { Messages } = await config_1.sqs.receiveMessage(receiveMessageParams).promise();
    if (!Messages) {
        return;
    }
    const limiter = new bottleneck_1.default({ maxConcurrent: 5, minTime: 1000 });
    const promises = Messages.map((message) => limiter.schedule(async () => {
        var _a, _b;
        const text = message.Body;
        if (!text) {
            throw new Error('No text passed in message body');
        }
        try {
            const result = await (0, summary_service_1.requestSummaryTitle)(text);
            const title = (_b = (_a = result.data.choices[0]) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.replace(/\.\s*$/, '');
            if (title) {
                await (0, summary_repository_1.saveToDatabase)(title, text);
            }
            else {
                throw new Error('No title found in response data');
            }
        }
        catch (error) {
            return handleOpenAIError(error);
        }
        deleteMessage(message);
    }));
    await Promise.all(promises);
}
exports.handleSummaryQueue = handleSummaryQueue;
async function handleOpenAIError(error) {
    const { status, statusText } = error.response;
    if (status === 401) {
        console.error('Unauthorized:', statusText);
        return statusText;
    }
    else if (status === 429) {
        console.error('Rate limit exceeded:', statusText);
        return statusText;
    }
}
async function deleteMessage(message) {
    const deleteMessageParams = {
        QueueUrl: config_1.queueUrl,
        ReceiptHandle: message.ReceiptHandle,
    };
    await config_1.sqs.deleteMessage(deleteMessageParams).promise();
}
// - integration tests
// - fix the kubernetes deploy
// - queued, complete, error -> request ID
// - 5 requests per second
