import { IncomingMessage, ServerResponse } from "http";

const http = require('http');
const { Configuration, OpenAIApi } = require('openai');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/waitroom";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  //apiKey: "12345",
});
const openai = new OpenAIApi(configuration);

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'POST' && req.url === '/summary-title') {
    let requestBody = '';
    req.on('data', (chunk) => {
      requestBody += chunk.toString();
    });
    req.on('end', async () => {
      const requestJson = JSON.parse(requestBody);
      const response = await requestTitle(requestJson.text);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.write(response);
      res.end();
    });
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

export async function requestTitle(text: string) {
  const foundSummary = await findTextInDatabase(text);
  if (foundSummary) {
    return foundSummary.title;
  }
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "write a short, one sentence, title for this text: \"´" + text,
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    const title = response.data.choices[0].text.replace(/\.\s*$/, '');
    saveToDatabase(title, text);
    return title;
  } catch (error: any) {
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
}

async function saveToDatabase(title: string, text: string) {
  const db = await MongoClient.connect(url);

  try {
    const dbo = db.db('waitroom');
    const summaryDocument = { title: title, text: text };
    await dbo.collection('summaries').insertOne(summaryDocument);
  } finally {
    db.close();
  }
}

async function findTextInDatabase(text: string) {
  const db = await MongoClient.connect(url);

  try {
    const dbo = db.db('waitroom');
    const summary = await dbo.collection('summaries').findOne({ text: text });
    return summary;
  } finally {
    db.close();
  }
}

// - integration tests
// - fix the kubernetes deploy

// - organize the files
// - abstract the database integration to make it easier to change to another one

// - queued, complete, error -> request ID
// - 5 requests per second

// - sound clip as argument -> use aws Transcribe to transcribe it
// - upload to github