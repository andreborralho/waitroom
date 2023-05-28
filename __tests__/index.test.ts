import * as http from 'http';
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { createSummaryQueue, server } from '../src/index';

// jest.mock('http', () => ({
//   createServer: jest.fn(() => ({ listen: jest.fn() })),
// }));

// describe('createServer', () => {

//   it('should create server on port 3000', () => {
//     //const fakeServer = server.startServer();
//     expect(http.createServer).toBeCalled();
//   });
// });

// describe('createSummaryQueue', () => {
//   afterEach(() => {
//     AWSMock.restore('SQS');
//   });

//   test('should create a summary queue', async () => {
//     // Mock the SQS createQueue method
//     const mockCreateQueueParams = {
//       QueueName: 'summaries'
//     };
//     AWSMock.setSDKInstance(AWS);
//     AWSMock.mock('SQS', 'createQueue', (params: any, callback: Function) => {
//       expect(params).toEqual(mockCreateQueueParams);
//       callback(null, {});
//     });

//     await createSummaryQueue();

//     // Assert the mocks
//     expect(SQS.createQueue).toHaveBeenCalled();
//   });
// });