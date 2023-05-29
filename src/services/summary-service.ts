import { openai, queueUrl, sqs } from '../config/config';
import { findSummaryByText, saveSummaryWithText } from '../repositories/summary-repository';

export async function getSummaryTitle(text: string): Promise<string | undefined> {
  const foundSummary = await findSummaryByText(text);
  if (foundSummary) {
    return 'Summary already exists';
  }
  await enqueueSummaryJob(text);
  return 'Queueing job';
}

export async function requestSummaryTitle(text: string) {
  return openai.createCompletion({
    model: "text-davinci-003",
    prompt: "write a short, one sentence, title for this text: \"´" + text,
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
}

async function enqueueSummaryJob(text: string): Promise<void> {
  const summaryId = await saveSummaryWithText(text);
  const params = {
    MessageBody: summaryId,
    QueueUrl: queueUrl,
  };
  try {
    await sqs.sendMessage(params).promise();
    console.log('Job added to the queue');
  } catch (error) {
    console.error('Error adding job to the queue:', error);
  }
}

