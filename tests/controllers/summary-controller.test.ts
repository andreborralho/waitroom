import { getSummaryTitle } from "../../src/services/summary-service";
import { handleSummaryRequest } from "../../src/controllers/summary-controller";

jest.mock('../services/summary-service');

describe('handleSummaryRequest', () => {
  const mockRequest = {
    on: jest.fn(),
  } as any;

  const mockResponse = {
    writeHead: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getSummaryTitle with the correct argument', async () => {
    const text = 'This is a sample text that will be summarized.';
    const json = JSON.stringify({ text });
    const expectedResponse = 'Here is the summary.';

    const mockEndCallback = jest.fn();
    getSummaryTitle.mockResolvedValue(expectedResponse);

    await handleSummaryRequest(mockRequest, mockResponse);

    mockRequest.on.mock.calls[0][1](json);
    mockRequest.on.mock.calls[1][1]();

    await new Promise((resolve) => setImmediate(resolve));

    expect(getSummaryTitle).toHaveBeenCalledWith(text);
    expect(mockResponse.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'text/plain' });
    expect(mockResponse.write).toHaveBeenCalledWith(expectedResponse);
    expect(mockResponse.end).toHaveBeenCalled();
  });
});
