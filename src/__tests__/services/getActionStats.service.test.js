const mongoose = require('mongoose');
const { getBulkActionStats } = require('../../services/getActionStats.service');
const BulkAction = require('../../models/bulkAction.model');

jest.mock('../../models/bulkAction.model');

describe('getBulkActionStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return stats for valid bulkAction', async () => {
    const fakeActionId = new mongoose.Types.ObjectId().toString();
    const fakeBulkAction = {
      _id: fakeActionId,
      targetUsers: [
        { userId: '1', status: 'success' },
        { userId: '2', status: 'failed' },
        { userId: '3', status: 'skipped' },
        { userId: '4', status: 'pending' },
        { userId: '5', status: 'unknown' },
      ]
    };

    BulkAction.findById.mockResolvedValue(fakeBulkAction);

    const result = await getBulkActionStats(fakeActionId);

    expect(BulkAction.findById).toHaveBeenCalledWith(fakeActionId);
    expect(result).toEqual({
      actionId: fakeActionId,
      totalUsers: 5,
      successCount: 1,
      failedCount: 1,
      skippedCount: 1,
      pendingCount: 2,
    });
  });

  it('should throw error for invalid action ID', async () => {
    const invalidId = '123-invalid';
    await expect(getBulkActionStats(invalidId)).rejects.toThrow('Invalid action ID');
  });

  it('should throw error if bulkAction not found', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    BulkAction.findById.mockResolvedValue(null);
    await expect(getBulkActionStats(validId)).rejects.toThrow('BulkAction not found');
  });

  it('should throw error if findById throws', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    BulkAction.findById.mockRejectedValue(new Error('DB failure'));
    await expect(getBulkActionStats(validId)).rejects.toThrow('Error fetching bulk action stats: DB failure');
  });
});