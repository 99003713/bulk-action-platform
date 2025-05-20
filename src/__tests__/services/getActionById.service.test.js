// __tests__/services/getActionById.service.test.js

const { getActionById } = require('../../services/getActionById.service');
const BulkAction = require('../../models/bulkAction.model');

jest.mock('../../models/bulkAction.model');

describe('getActionById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return bulk action when found', async () => {
    const fakeId = 'abc123';
    const fakeResult = { _id: fakeId, actionType: 'email' };

    BulkAction.findById.mockResolvedValue(fakeResult);

    const result = await getActionById(fakeId);

    expect(BulkAction.findById).toHaveBeenCalledWith(fakeId);
    expect(result).toBe(fakeResult);
  });

  it('should throw error when findById fails', async () => {
    BulkAction.findById.mockRejectedValue(new Error('DB error'));

    await expect(getActionById('abc123')).rejects.toThrow('Error fetching bulk action by ID: DB error');
  });
});