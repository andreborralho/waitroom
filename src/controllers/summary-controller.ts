import { IncomingMessage, ServerResponse } from "http";
import { getSummaryTitle, requestSummaryTitle } from "../services/summary-service";
import { saveToDatabase } from '../repositories/summary-repository';

export function handleSummaryRequest(req: IncomingMessage, res: ServerResponse) {
  let requestBody = '';
  req.on('data', (chunk) => {
    requestBody += chunk.toString();
  });
  req.on('end', async () => {
    const requestJson = JSON.parse(requestBody);
    const response: string | undefined = await getSummaryTitle(requestJson.text);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(response);
    res.end();
  });
}

export async function handleOpenAISummary(text: string): Promise<void> {
  try {
    const result = await requestSummaryTitle(text);
    const title = result.data.choices[0]?.text?.replace(/\.\s*$/, '');
    if (!title) { throw new Error('No title found in response data'); }

    await saveToDatabase(title, text);
  } catch (error: any) {
    return handleOpenAIError(error);
  }
}

async function handleOpenAIError(error: any) {
  const { status, statusText } = error.response;
  if (status === 401) {
    console.error('Unauthorized:', statusText);
  }
  else if (status === 429) {
    console.error('Rate limit exceeded:', statusText);
  }
  return statusText;
}