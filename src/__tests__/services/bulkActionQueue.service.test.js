const { enqueueBulkAction } = require('../../services/bulkActionQueue.service');
const { getChannel } = require('../../utils/rabbitmq');
const { logger } = require('../../utils/logger');

jest.mock('../../utils/rabbitmq');
jest.mock('../../utils/logger');

describe('enqueueBulkAction', () => {
  const bulkActionId = 'test-id';
  const fakeChannel = { sendToQueue: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send message to queue if channel is available', async () => {
    getChannel.mockReturnValue(fakeChannel);
    process.env.RABBITMQ_QUEUE_NAME = 'bulk_queue';

    await enqueueBulkAction(bulkActionId);

    expect(fakeChannel.sendToQueue).toHaveBeenCalledWith(
      'bulk_queue',
      Buffer.from(bulkActionId),
      { persistent: true }
    );
  });

  it('should throw error if channel is not available', async () => {
    getChannel.mockReturnValue(null);

    await expect(enqueueBulkAction(bulkActionId)).rejects.toThrow('RabbitMQ channel not initialized');
    expect(logger.error).toHaveBeenCalledWith(
      'Error enqueueing bulk action:',
      expect.any(Error)
    );
  });
});
