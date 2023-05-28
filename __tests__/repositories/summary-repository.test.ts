import { findSummaryById, findSummaryByText } from '../../src/repositories/summary-repository';
import { MongoClient } from 'mongodb';
import { databaseUrl } from '../../src/config/config';

jest.mock('mongodb');

describe('findSummaryById', () => {
  const mockSummary = { _id: '123', title: 'Test summary', text: 'Long text....' };
  const mockCollection = { findOne: jest.fn().mockResolvedValueOnce(mockSummary) };
  const mockDbo = { collection: jest.fn().mockReturnValueOnce(mockCollection) };
  const mockConnect = jest.fn().mockResolvedValueOnce({ db: jest.fn().mockReturnValueOnce(mockDbo), close: jest.fn() });
  (MongoClient.connect as jest.Mock).mockImplementationOnce(mockConnect);

  it('should return the summary document with the given ID', async () => {
    const summary = await findSummaryById('123');

    expect(summary).toEqual(mockSummary);
    expect(mockConnect).toHaveBeenCalledWith(databaseUrl);
    expect(mockDbo.collection).toHaveBeenCalledWith('summaries');
    expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
  });
});

describe('findSummaryByText', () => {
  const mockSummary = { _id: '123', title: 'Test summary', text: 'Long text....' };
  const mockCollection = { findOne: jest.fn().mockResolvedValueOnce(mockSummary) };
  const mockDbo = { collection: jest.fn().mockReturnValueOnce(mockCollection) };
  const mockConnect = jest.fn().mockResolvedValueOnce({ db: jest.fn().mockReturnValueOnce(mockDbo), close: jest.fn() });
  (MongoClient.connect as jest.Mock).mockImplementationOnce(mockConnect);

  it('should return the summary document with the given text', async () => {
    const summary = await findSummaryByText('Long text....');

    expect(summary).toEqual(mockSummary);
    expect(mockConnect).toHaveBeenCalledWith(databaseUrl);
    expect(mockDbo.collection).toHaveBeenCalledWith('summaries');
    expect(mockCollection.findOne).toHaveBeenCalledWith({ text: mockSummary.text });
  });
});
