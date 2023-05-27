import { MongoClient } from 'mongodb';
import { databaseUrl } from '../config/config';
import { Summary } from '../models/summary';

export async function saveToDatabase(title: string, text: string) {
  const connection = await MongoClient.connect(databaseUrl);

  try {
    const dbo = connection.db('waitroom');
    const summaryDocument: Summary = { title: title, text: text };
    await dbo.collection('summaries').insertOne(summaryDocument);
  } finally {
    connection.close();
  }
}

export async function findTextInDatabase(text: string): Promise<Summary | null> {
  const connection = await MongoClient.connect(databaseUrl);

  try {
    const dbo = connection.db('waitroom');
    const summaryDocument = await dbo.collection('summaries').findOne({ text: text }) as Summary | null;;
    return summaryDocument;
  } finally {
    connection.close();
  }
}
