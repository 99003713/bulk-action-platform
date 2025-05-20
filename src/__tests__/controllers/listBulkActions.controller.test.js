const { listBulkActions } = require('../../controllers/listBulkActions.controller');
const bulkActionService = require('../../services/getAllBulkActions.service');
const { logger } = require('../../utils/logger');

jest.mock('../../services/getAllBulkActions.service');
jest.mock('../../utils/logger');

describe('listBulkActions controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it('should return all bulk actions', async () => {
    const fakeResult = [{ id: '1' }, { id: '2' }];
    bulkActionService.getAllBulkActions.mockResolvedValue(fakeResult);

    await listBulkActions(req, res);

    expect(bulkActionService.getAllBulkActions).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  it('should handle error and return 500', async () => {
    const error = new Error('Service failed');
    bulkActionService.getAllBulkActions.mockRejectedValue(error);

    await listBulkActions(req, res);

    expect(logger.error).toHaveBeenCalledWith('Error fetching bulk actions:', error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
