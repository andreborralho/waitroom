import { getSummaryTitle } from "../../src/services/summary-service";

describe('getSummaryTitle', () => {
  // Mock the dependencies or functions used in the getSummaryTitle function
  const findTextInDatabase = jest.fn();
  const requestSummaryTitle = jest.fn();
  const saveToDatabase = jest.fn();

  beforeEach(() => {
    // Reset the mock function calls and behavior before each test
    findTextInDatabase.mockReset();
    requestSummaryTitle.mockReset();
    saveToDatabase.mockReset();
  });

  test('should return the title from the database if found', async () => {
    const mockTitle = 'Mock Title';
    findTextInDatabase.mockResolvedValue({ title: mockTitle });

    const result = await getSummaryTitle('some text');

    expect(findTextInDatabase).toHaveBeenCalledWith('some text');
    expect(result).toBe(mockTitle);
    expect(requestSummaryTitle).not.toHaveBeenCalled();
    expect(saveToDatabase).not.toHaveBeenCalled();
  });

  test('should return the generated title and save to the database if not found in the database', async () => {
    const mockGeneratedTitle = 'Generated Title';
    requestSummaryTitle.mockResolvedValue({ data: { choices: [{ text: mockGeneratedTitle }] } });

    const result = await getSummaryTitle('some text');

    expect(findTextInDatabase).toHaveBeenCalledWith('some text');
    expect(requestSummaryTitle).toHaveBeenCalledWith('some text');
    expect(saveToDatabase).toHaveBeenCalledWith(mockGeneratedTitle, 'some text');
    expect(result).toBe(mockGeneratedTitle);
  });

  test('should handle errors and return appropriate response', async () => {
    const mockError = new Error('Error message');
    const mockErrorResponse = {
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    requestSummaryTitle.mockRejectedValue(mockError);

    // Unauthorized error test
    let result = await getSummaryTitle('some text');
    expect(result).toBe('Unauthorized');

    // Rate limit exceeded error test
    requestSummaryTitle.mockRejectedValue(mockErrorResponse);
    result = await getSummaryTitle('some text');
    expect(result).toBe('Rate limit exceeded');

    expect(findTextInDatabase).toHaveBeenCalledWith('some text');
    expect(requestSummaryTitle).toHaveBeenCalledWith('some text');
    expect(saveToDatabase).not.toHaveBeenCalled();
  });
});
