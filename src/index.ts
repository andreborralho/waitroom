import { IncomingMessage, ServerResponse, createServer } from 'http';
import { handleOpenAISummary, handleSummaryRequest } from "./controllers/summary-controller";
import { queueName, sqs, queueUrl } from "./config/config";
import Bottleneck from 'bottleneck';
import { Message } from 'aws-sdk/clients/sqs';
import { findSummaryById } from './repositories/summary-repository';

export const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'POST' && req.url === '/summary-title') {
    handleSummaryRequest(req, res);
  }
  else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

createSummaryQueue();
setInterval(async () => {
  await handleSummaryQueue();
}, 200);


export async function createSummaryQueue() {
  const createQueueParams = {
    QueueName: queueName,
  };
  await sqs.createQueue(createQueueParams).promise();
}

export async function handleSummaryQueue(): Promise<void> {
  const receiveMessageParams = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
  };

  const { Messages } = await sqs.receiveMessage(receiveMessageParams).promise();
  if (!Messages) { return; }

  const limiter = new Bottleneck({ maxConcurrent: 5, minTime: 200 });
  const promises = Messages.map((message: Message) => limiter.schedule(async () => {
    handleMessage(message);
  }));
  await Promise.all(promises);
}

async function handleMessage(message: Message): Promise<void> {
  const summaryId = message.Body;
  if (!summaryId) { throw new Error('No summary ID passed in message body'); }
  console.log('Handling job');

  const summaryDocument = await findSummaryById(summaryId);
  if (summaryDocument) {
    handleOpenAISummary(summaryId, summaryDocument.text);
  }
  deleteMessage(message);
}

async function deleteMessage(message: Message) {
  const deleteMessageParams = {
    QueueUrl: queueUrl,
    ReceiptHandle: message.ReceiptHandle!,
  };
  await sqs.deleteMessage(deleteMessageParams).promise();
}
