const { getBulkActionStatus } = require('../../controllers/getBulkActionStatus.controller');
const bulkActionService = require('../../services/getActionById.service');
const { logger } = require('../../utils/logger');

jest.mock('../../services/getActionById.service');
jest.mock('../../utils/logger');

describe('getBulkActionStatus controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { actionId: 'abc123' } };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it('should return bulk action status', async () => {
    const fakeResult = { id: 'abc123', status: 'in-progress' };
    bulkActionService.getActionById.mockResolvedValue(fakeResult);

    await getBulkActionStatus(req, res);

    expect(logger.info).toHaveBeenCalledWith('Fetching bulk action status for ID:', 'abc123');
    expect(bulkActionService.getActionById).toHaveBeenCalledWith('abc123');
    expect(logger.info).toHaveBeenCalledWith('Bulk action status:', fakeResult);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  it('should handle service error and return 500', async () => {
    const error = new Error('DB error');
    bulkActionService.getActionById.mockRejectedValue(error);

    await getBulkActionStatus(req, res);

    expect(logger.error).toHaveBeenCalledWith('Error getting bulk action status:', error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});