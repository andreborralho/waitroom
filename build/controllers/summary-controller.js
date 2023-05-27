"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSummaryRequest = void 0;
const summary_service_1 = require("../services/summary-service");
function handleSummaryRequest(req, res) {
    let requestBody = '';
    req.on('data', (chunk) => {
        requestBody += chunk.toString();
    });
    req.on('end', async () => {
        const requestJson = JSON.parse(requestBody);
        const response = await (0, summary_service_1.getSummaryTitle)(requestJson.text);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write(response);
        res.end();
    });
}
exports.handleSummaryRequest = handleSummaryRequest;
