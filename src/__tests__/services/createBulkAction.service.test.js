const { createBulkActionService } = require('../../services/createBulkAction.service');
const BulkAction = require('../../models/bulkAction.model');
const { publishToQueue } = require('../../utils/rabbitmq');
const { logger } = require('../../utils/logger');

jest.mock('../../models/bulkAction.model');
jest.mock('../../utils/rabbitmq');
jest.mock('../../utils/logger');

describe('createBulkActionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create and return bulk action immediately pushed to queue', async () => {
    const mockSave = jest.fn();
    const fakeId = 'bulk123';
    const fakeDate = new Date(Date.now() - 1000); // past date

    const mockBulkAction = {
      _id: fakeId,
      save: mockSave,
      status: 'pending',
    };

    BulkAction.mockImplementation(() => mockBulkAction);

    const data = {
      entityType: 'user',
      actionType: 'email',
      accountId: 'acc123',
      payload: { message: 'hello' },
      targetUsers: ['u1', 'u2'],
      scheduledAt: fakeDate.toISOString(),
    };

    const result = await createBulkActionService(data);

    expect(logger.info).toHaveBeenCalledWith('Inside createBulkActionService', data);
    expect(mockSave).toHaveBeenCalledTimes(2); // once for creation, once for status update
    expect(publishToQueue).toHaveBeenCalledWith(
      process.env.RABBITMQ_QUEUE_NAME,
      { bulkActionId: fakeId }
    );
    expect(result).toEqual(mockBulkAction);
  });

  it('should skip queue if scheduledAt is in the future', async () => {
    const mockSave = jest.fn();
    const fakeId = 'bulk123';
    const futureDate = new Date(Date.now() + 60 * 1000); // future

    const mockBulkAction = {
      _id: fakeId,
      save: mockSave,
      status: 'pending',
    };

    BulkAction.mockImplementation(() => mockBulkAction);

    const data = {
      entityType: 'user',
      actionType: 'sms',
      accountId: 'acc456',
      payload: { message: 'future' },
      targetUsers: ['u3'],
      scheduledAt: futureDate.toISOString(),
    };

    const result = await createBulkActionService(data);

    expect(publishToQueue).not.toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalledTimes(1); // only initial save
    expect(result).toEqual(mockBulkAction);
  });

  it('should throw error and log on failure', async () => {
    BulkAction.mockImplementation(() => {
      throw new Error('DB error');
    });

    const data = {
      entityType: 'user',
      actionType: 'fail',
      accountId: 'acc789',
      payload: {},
      targetUsers: ['uX'],
    };

    await expect(createBulkActionService(data)).rejects.toThrow('Error creating bulk action');
    expect(logger.error).toHaveBeenCalledWith(
      'Error creating bulk action',
      expect.any(Error)
    );
  });
});