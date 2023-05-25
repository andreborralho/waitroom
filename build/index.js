"use strict";
const http = require('http');
const { Configuration, OpenAIApi } = require('openai');
const { Client } = require('pg');
const SAMPLE_TEXT = "uh huh. Hey, mike, you should connect. Yeah, back at you. Yeah, I'm a big fan. I actually just want to try this out because I'm a huge fan and uh, I wanted to say hi, but a few months, yeah, exactly. Uh, two months in joining a venture capital firm, Peterson Ventures here in Salt Lake. And, and you're, you're thinking of the elections people, What's that? Yeah. Great group of people. Yeah, definitely. Anyway, you're thinking on inflections just that's, I'm thinking about it all the time when we talk to entrepreneur. So anyway, I'm a big fan. Um, I actually want to talk to you a little bit about, we're always thinking about our, we're kind of paranoid are we seeing the best deals and best companies, especially in our backyard here in Utah. Um, and what I've heard about floodgate as you guys are really, really good first. You're very scrappy. And um, you know, get, get the most out of a little resources and you're very good at community. And I think that's something that we could be doing a lot better, especially kind of our own neck. It was here in Salt";
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});
client.connect();
async function requestTitle(text) {
    try {
        const response = await openai
            .createCompletion({
            model: "text-davinci-003",
            prompt: "write a short pragmatic title for this text:\n\"´" + text,
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        console.log(response.data);
        //return response.data.choices[0].message.content;
        return response.data;
    }
    catch (error) {
        // if (error instanceof openai.errors.APIError) {
        //   // Handle API error here, e.g. retry or log
        //   console.log(`OpenAI API returned an API Error: ${error}`);
        // } else if (error instanceof openai.errors.APIConnectionError) {
        //   // Handle connection error here
        //   console.log(`Failed to connect to OpenAI API: ${error}`);
        // } else if (error instanceof openai.errors.RateLimitError) {
        //   // Handle rate limit error (we recommend using exponential backoff)
        //   console.log(`OpenAI API request exceeded rate limit: ${error}`);
        // } else {
        console.log('Unexpected error', error);
        //}
    }
}
// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
// };
requestTitle(SAMPLE_TEXT).then((data) => {
    console.log(data);
});
const server = http.createServer((req, res) => {
    if (req.url === '/summary-title') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(requestTitle(SAMPLE_TEXT));
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
