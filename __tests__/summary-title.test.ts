import { requestTitle } from "./../src/index";
import { Configuration } from "openai";

const { OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: "12345",
});
const openai = new OpenAIApi(configuration);

jest.mock('openai', () => ({
    openai: {
        createCompletion: jest.fn(),
    },
}));

const mockSuccessResponse = {
    data: {
        choices: [{ text: 'Mock Title' }],
    },
};

const mock401Error = {
    status: 401,
    statusText: 'Unauthorized'
};

const mock429Error = {
    status: 429,
    statusText: 'Rate limit exceeded'
};


describe('requestTitle', () => {
    const text = 'This is a sample text.';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should generate a title from the given text', async () => {
        const createCompletionMock = jest.fn();
        (OpenAIApi.createCompletion as jest.Mock<any, any>) = createCompletionMock;

        createCompletionMock.mockResolvedValue(mockSuccessResponse);

        //(OpenAIApi.createCompletion as jest.Mock).mockResolvedValue(mockSuccessResponse);

        const text = 'This is a sample text.';
        const title = await requestTitle(text);

        expect(title).toBe('Mock Title');

        // check that openai.createCompletion was called with the correct parameters
        expect(OpenAIApi.createCompletion).toHaveBeenCalledWith({
            model: 'text-davinci-003',
            prompt: `write a short pragmatic title for this text:\n"${text}"`,
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
    });

    xit('should handle a 401 error', async () => {
        (OpenAIApi.createCompletion as jest.Mock).mockRejectedValueOnce(mock401Error);

        const response = await requestTitle(text);
        expect(response).toEqual(mock401Error.statusText);

        // check that console.error was called with the correct message
        //expect(console.stat).toHaveBeenCalledWith('Unauthorized:', 'Unauthorized');
    });

    xit('should handle a 429 error', async () => {
        (OpenAIApi.createCompletion as jest.Mock).mockRejectedValue(mock429Error);

        const title2 = await requestTitle(text);

        // check that the function returned null
        expect(title2).toBeNull();

        // check that console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            'Rate limit exceeded:',
            'Rate limit exceeded'
        );
    });
});