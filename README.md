# waitroom
Technical assignment

How to run the project:

1 - Install and run localstack:
https://docs.localstack.cloud/getting-started/

2 - Install all the npm packages:
npm i

3 - Start the local server:
npm run start:dev


How to request a summary title:

1 - Send a POST request to /summary-title with the text to summarize in the request body as "text" 
Example: curl -X POST -H "Content-Type: application/json" -d '{"text":"Please summarize this text into a nice title"}' http://localhost:3000/summary-title
