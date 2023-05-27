"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTextInDatabase = exports.saveToDatabase = void 0;
const mongodb_1 = require("mongodb");
const config_1 = require("../config/config");
async function saveToDatabase(title, text) {
    const connection = await mongodb_1.MongoClient.connect(config_1.databaseUrl);
    try {
        const dbo = connection.db('waitroom');
        const summaryDocument = { title: title, text: text };
        await dbo.collection('summaries').insertOne(summaryDocument);
    }
    finally {
        connection.close();
    }
}
exports.saveToDatabase = saveToDatabase;
async function findTextInDatabase(text) {
    const connection = await mongodb_1.MongoClient.connect(config_1.databaseUrl);
    try {
        const dbo = connection.db('waitroom');
        const summaryDocument = await dbo.collection('summaries').findOne({ text: text });
        ;
        return summaryDocument;
    }
    finally {
        connection.close();
    }
}
exports.findTextInDatabase = findTextInDatabase;
