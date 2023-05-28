
import { handleOpenAISummary } from "./../../src/controllers/summary-controller";
import { updateSummaryWithFailedStatus, updateSummaryWithTitle } from "../../src/repositories/summary-repository";
import { requestSummaryTitle } from "../../src/services/summary-service";

jest.mock('../../src/services/summary-service', () => ({
  requestSummaryTitle: jest.fn(),
}));
jest.mock('../../src/repositories/summary-repository', () => ({
  updateSummaryWithTitle: jest.fn(),
  updateSummaryWithFailedStatus: jest.fn(),
}));

describe('handleOpenAISummary()', () => {
  const summaryId = '12345abc';
  const text = 'This is a test summary.';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should update the summary with the retrieved title', async () => {
    const title = 'Test Summary';
    const result = { data: { choices: [{ text: title }] } };
    (requestSummaryTitle as jest.Mock).mockResolvedValueOnce(result);
    await handleOpenAISummary(summaryId, text);
    expect(requestSummaryTitle).toHaveBeenCalledWith(text);
    expect(updateSummaryWithTitle).toHaveBeenCalledWith(summaryId, title);
  });

  it('should throw an error if the response data has no title', async () => {
    const result = { data: { choices: [] } };
    (requestSummaryTitle as jest.Mock).mockResolvedValueOnce(result);
    await expect(() => handleOpenAISummary(summaryId, text)).rejects.toThrow(new Error('No title found in response data'));
    expect(requestSummaryTitle).toHaveBeenCalledWith(text);
    expect(updateSummaryWithFailedStatus).toHaveBeenCalledWith(summaryId);
    expect(updateSummaryWithTitle).not.toHaveBeenCalled();
  });

  it('should handle 401 error thrown by requestSummaryTitle()', async () => {
    const error = {
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };
    (requestSummaryTitle as jest.Mock).mockRejectedValueOnce(error);
    const requestSummaryTitleResult = await handleOpenAISummary(summaryId, text);
    expect(requestSummaryTitle).toHaveBeenCalledWith(text);
    expect(updateSummaryWithFailedStatus).toHaveBeenCalledWith(summaryId);
    expect(updateSummaryWithTitle).not.toHaveBeenCalled();
    expect(requestSummaryTitleResult).toBe('Unauthorized');
    //expect(handleOpenAIError).toHaveBeenCalledWith(summaryId, error);
  });

  it('should handle 401 error thrown by requestSummaryTitle()', async () => {
    const error = {
      response: {
        status: 429,
        statusText: 'Rate limit exceeded',
      },
    };
    (requestSummaryTitle as jest.Mock).mockRejectedValueOnce(error);
    const requestSummaryTitleResult = await handleOpenAISummary(summaryId, text);
    expect(requestSummaryTitle).toHaveBeenCalledWith(text);
    expect(updateSummaryWithFailedStatus).toHaveBeenCalledWith(summaryId);
    expect(updateSummaryWithTitle).not.toHaveBeenCalled();
    expect(requestSummaryTitleResult).toBe('Rate limit exceeded');
    //expect(handleOpenAIError).toHaveBeenCalledWith(summaryId, error);
  });
});
