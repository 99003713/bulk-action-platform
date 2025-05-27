const mongoose = require('mongoose');
const { getBulkActionStats } = require('../../services/getActionStats.service');
const BulkAction = require('../../models/bulkAction.model');
const BulkActionTarget = require('../../models/bulkActionTarget.model');
const { logger } = require('../../utils/logger');

jest.mock('../../models/bulkAction.model');
jest.mock('../../models/bulkActionTarget.model');
jest.mock('../../utils/logger');

describe('getBulkActionStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct stats when targets exist', async () => {
    const fakeActionId = new mongoose.Types.ObjectId().toString();
    const fakeBulkAction = { _id: fakeActionId };

    const fakeTargets = [
      { status: 'success' },
      { status: 'failed' },
      { status: 'skipped' },
      { status: 'pending' },
      { status: 'unknown' }, // treated as pending
    ];

    BulkAction.findById.mockResolvedValue(fakeBulkAction);
    BulkActionTarget.find.mockResolvedValue(fakeTargets);

    const result = await getBulkActionStats(fakeActionId);

    expect(BulkAction.findById).toHaveBeenCalledWith(fakeActionId);
    expect(BulkActionTarget.find).toHaveBeenCalledWith({ bulkActionId: fakeActionId });

    expect(result).toEqual({
      actionId: fakeActionId,
      totalUsers: 5,
      successCount: 1,
      failedCount: 1,
      skippedCount: 1,
      pendingCount: 2,
    });
  });

  it('should return zero stats if bulkAction not found', async () => {
    const fakeActionId = new mongoose.Types.ObjectId().toString();

    BulkAction.findById.mockResolvedValue(null);

    const result = await getBulkActionStats(fakeActionId);

    expect(BulkAction.findById).toHaveBeenCalledWith(fakeActionId);
    expect(result).toEqual({
      actionId: fakeActionId,
      totalUsers: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      pendingCount: 0,
    });
    expect(BulkActionTarget.find).not.toHaveBeenCalled();
  });

  it('should throw error if findById throws', async () => {
    const fakeActionId = new mongoose.Types.ObjectId().toString();
    BulkAction.findById.mockRejectedValue(new Error('DB error'));

    await expect(getBulkActionStats(fakeActionId)).rejects.toThrow('Error fetching bulk action stats: DB error');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching bulk action stats: DB error')
    );
  });

  it('should throw error if BulkActionTarget.find throws', async () => {
    const fakeActionId = new mongoose.Types.ObjectId().toString();
    const fakeBulkAction = { _id: fakeActionId };

    BulkAction.findById.mockResolvedValue(fakeBulkAction);
    BulkActionTarget.find.mockRejectedValue(new Error('Target query failed'));

    await expect(getBulkActionStats(fakeActionId)).rejects.toThrow('Error fetching bulk action stats: Target query failed');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching bulk action stats: Target query failed')
    );
  });
});