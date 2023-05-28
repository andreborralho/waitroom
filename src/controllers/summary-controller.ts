import { IncomingMessage, ServerResponse } from "http";
import { getSummaryTitle, requestSummaryTitle } from "../services/summary-service";
import { updateSummaryWithFailedStatus, updateSummaryWithTitle } from "../repositories/summary-repository";

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

export async function handleOpenAISummary(summaryId: string, text: string): Promise<void> {
  try {
    const result = await requestSummaryTitle(text);
    const title = result.data.choices[0]?.text?.replace(/\.\s*$/, '');
    if (!title) { throw new Error('No title found in response data'); }
    await updateSummaryWithTitle(summaryId, title);
  } catch (error: any) {
    return handleOpenAIError(summaryId, error);
  }
}

async function handleOpenAIError(summaryId: string, error: any) {
  if (!error?.response) {
    console.error('Unexpected data encountered:', error);
    updateSummaryWithFailedStatus(summaryId);
    throw error;
  }
  else {
    const { status, statusText } = error.response;
    if (status === 401) {
      console.error('Unauthorized:', statusText);
    }
    else if (status === 429) {
      console.error('Rate limit exceeded:', statusText);
    }
    updateSummaryWithFailedStatus(summaryId);
    return statusText;
  }
}