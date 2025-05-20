const { getBulkActionStats } = require('../../controllers/getBulkActionStats.controller');
const statsService = require('../../services/getActionStats.service');
const { logger } = require('../../utils/logger');

jest.mock('../../services/getActionStats.service');
jest.mock('../../utils/logger');

describe('getBulkActionStats controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        actionId: '123',
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  it('should call getBulkActionStats service and return json result', async () => {
    const fakeResult = { total: 10, success: 8, failed: 2 };
    statsService.getBulkActionStats.mockResolvedValue(fakeResult);

    await getBulkActionStats(req, res);

    expect(statsService.getBulkActionStats).toHaveBeenCalledWith('123');
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  it('should log error and return 500 on service failure', async () => {
    const error = new Error('Service failure');
    statsService.getBulkActionStats.mockRejectedValue(error);

    await getBulkActionStats(req, res);

    expect(logger.error).toHaveBeenCalledWith('Error getting bulk action stats:', error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
