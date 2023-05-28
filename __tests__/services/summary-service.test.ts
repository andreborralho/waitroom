// import { sqs } from "../../src/config/config";
import { findSummaryByText, saveSummaryWithText } from "../../src/repositories/summary-repository";
import { getSummaryTitle } from "../../src/services/summary-service";

// jest.mock('../../src/config/config', () => ({
//   sqs: jest.fn().mockImplementation(() => ({
//     sendMessage: jest.fn().mockReturnThis()
//   })),
// }));

jest.mock('../../src/services/summary-service', () => ({
  findSummaryByText: jest.fn(),
  enqueueSummaryJob: jest.fn(),
}));

describe('getSummaryTitle', () => {
  const summaryText = 'Test summary';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return "Summary already exists" if the summary already exists', async () => {
    (findSummaryByText as jest.Mock).mockResolvedValueOnce({ _id: '123', title: 'Test summary' });

    const result = await getSummaryTitle(summaryText);

    expect(result).toBe('Summary already exists');
    expect(findSummaryByText).toHaveBeenCalledWith(summaryText);
    expect(saveSummaryWithText).not.toHaveBeenCalled();
  });

  it('should return "Queueing job" if the summary does not exist', async () => {
    (findSummaryByText as jest.Mock).mockResolvedValueOnce(null);
    //const mockSendMessage = (sqs as any).mock.instances[0].sendMessage;

    const result = await getSummaryTitle(summaryText);

    expect(result).toBe('Queueing job');
    expect(findSummaryByText).toHaveBeenCalledWith(summaryText);
    expect(saveSummaryWithText).toHaveBeenCalledWith(summaryText);
    // expect(mockSendMessage).toHaveBeenCalledWith({
    //   QueueUrl: process.env.SUMMARY_QUEUE_URL,
    //   MessageBody: JSON.stringify({ text: summaryText }),
    // });
  });
});
