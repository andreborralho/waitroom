import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { findSummaryByText } from '../../src/repositories/summary-repository';

// describe('findTextInDatabase', () => {
//   let connection: MongoClient;
//   let mongoServer: MongoMemoryServer;

//   beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     const uri = mongoServer.getUri();
//     connection = await MongoClient.connect(uri);
//   });

//   afterAll(async () => {
//     await connection.close();
//     await mongoServer.stop();
//   });

//   it('should find a summary with the given text', async () => {
//     const text = 'This is a sample text.';
//     const dbo = connection.db('waitroom');
//     const summaryDocument = { title: 'Mock Title', text: text };
//     await dbo.collection('summaries').insertOne(summaryDocument);

//     const summary = await findSummaryByText(text);
//     expect(summary?.title).toEqual(summaryDocument.title);
//   });

//   it('should return null if the text is not in the summaries collection', async () => {
//     const summary = await findSummaryByText('This text is not in the database.');
//     expect(summary).toBeNull();
//   });
// });
