// __tests__/services/getAllBulkActions.service.test.js

const { getAllBulkActions } = require('../../services/getAllBulkActions.service');
const BulkAction = require('../../models/bulkAction.model');

jest.mock('../../models/bulkAction.model');

describe('getAllBulkActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return sorted list of bulk actions', async () => {
    const fakeActions = [
      { _id: '1', createdAt: new Date('2024-01-01') },
      { _id: '2', createdAt: new Date('2024-02-01') },
    ];

    BulkAction.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeActions),
    });

    const result = await getAllBulkActions();

    expect(BulkAction.find).toHaveBeenCalled();
    expect(result).toEqual(fakeActions);
  });

  it('should throw an error if find fails', async () => {
    BulkAction.find.mockImplementation(() => ({
      sort: jest.fn().mockRejectedValue(new Error('DB error')),
    }));

    await expect(getAllBulkActions()).rejects.toThrow('Error fetching bulk actions: DB error');
  });
});