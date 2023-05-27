import { Db, MongoClient, ObjectId } from 'mongodb';
import { databaseUrl } from '../config/config';
import { Summary } from '../models/summary';

export async function saveSummaryWithText(text: string): Promise<string> {
  return await withDatabase(async (dbo) => {
    const summaryDocument: Summary = { title: null, text: text, createdAt: new Date(), requestStatus: 'queued' };
    const savedSummaryDocument = await dbo.collection('summaries').insertOne(summaryDocument);
    return savedSummaryDocument.insertedId.toString();
  });
}

export async function updateSummaryWithTitle(summaryId: string, title: string) {
  const summaryObjectId = new ObjectId(summaryId);

  await withDatabase(async (dbo) => {
    const updates: Partial<Summary> = { title: title, requestStatus: 'complete' };
    await dbo.collection('summaries').findOneAndUpdate({ "_id": summaryObjectId }, { $set: updates });
  });
}

export async function updateSummaryWithFailedStatus(summaryId: string) {
  const summaryObjectId = new ObjectId(summaryId);
  await withDatabase(async (dbo) => {
    const updates: Partial<Summary> = { requestStatus: 'error' };
    await dbo.collection('summaries').findOneAndUpdate({ "_id": summaryObjectId }, { $set: updates });
  });
}

export async function findSummaryByText(text: string): Promise<Summary | null> {
  return await withDatabase(async (dbo) => {
    const summaryDocument = await dbo.collection('summaries').findOne({ text: text }) as Summary | null;;
    return summaryDocument;
  });
}

export async function findSummaryById(summaryId: string): Promise<Summary | null> {
  const summaryObjectId = new ObjectId(summaryId);
  return await withDatabase(async (dbo) => {
    const summaryDocument = await dbo.collection('summaries').findOne({ "_id": summaryObjectId }) as Summary | null;;
    return summaryDocument;
  });
}


async function withDatabase<T>(callback: (dbo: Db) => Promise<T>): Promise<T> {
  const connection = await MongoClient.connect(databaseUrl);

  try {
    const dbo = connection.db('waitroom');
    return await callback(dbo);
  } finally {
    connection.close();
  }
}
