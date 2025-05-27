const { getActionById } = require('../../services/getActionById.service');
const BulkAction = require('../../models/bulkAction.model');
const BulkActionTarget = require('../../models/bulkActionTarget.model');
const { logger } = require('../../utils/logger');

jest.mock('../../models/bulkAction.model');
jest.mock('../../models/bulkActionTarget.model');
jest.mock('../../utils/logger');

describe('getActionById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return bulk action and targets when found', async () => {
    const fakeId = 'abc123';
    const mockBulkAction = { _id: fakeId, actionType: 'email' };
    const mockTargets = [
      { userId: 'u1', status: 'pending' },
      { userId: 'u2', status: 'done' }
    ];

    BulkAction.findById.mockResolvedValue(mockBulkAction);
    BulkActionTarget.find.mockResolvedValue(mockTargets);

    const result = await getActionById(fakeId);

    expect(BulkAction.findById).toHaveBeenCalledWith(fakeId);
    expect(BulkActionTarget.find).toHaveBeenCalledWith({ bulkActionId: fakeId });
    expect(logger.info).toHaveBeenCalledWith(`Found ${mockTargets.length} targets for bulk action ID: ${fakeId}`);
    expect(result).toEqual({ bulkAction: mockBulkAction, targets: mockTargets });
  });

  it('should return empty bulkAction and targets if action not found', async () => {
    BulkAction.findById.mockResolvedValue(null);

    const result = await getActionById('nonexistentId');

    expect(result).toEqual({ bulkAction: {}, targets: [] });
    expect(BulkAction.findById).toHaveBeenCalledWith('nonexistentId');
    expect(BulkActionTarget.find).not.toHaveBeenCalled();
  });

  it('should throw error when findById throws', async () => {
    BulkAction.findById.mockRejectedValue(new Error('DB error'));

    await expect(getActionById('abc123')).rejects.toThrow('Error fetching bulk action by ID: DB error');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching bulk action by ID: DB error')
    );
  });

  it('should throw error when BulkActionTarget.find throws', async () => {
    const mockBulkAction = { _id: 'abc123', actionType: 'sms' };
    BulkAction.findById.mockResolvedValue(mockBulkAction);
    BulkActionTarget.find.mockRejectedValue(new Error('Target fetch failed'));

    await expect(getActionById('abc123')).rejects.toThrow('Error fetching bulk action by ID: Target fetch failed');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching bulk action by ID: Target fetch failed')
    );
  });
});