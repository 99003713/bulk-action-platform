const { createBulkActionController } = require('../../controllers/createBulkAction.controller');
const { createBulkActionService } = require('../../services/createBulkAction.service');

jest.mock('../../services/createBulkAction.service');

describe('createBulkActionController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { some: 'data' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should call service and respond with 201', async () => {
    const fakeBulkAction = { id: '1' };
    createBulkActionService.mockResolvedValue(fakeBulkAction);

    await createBulkActionController(req, res);

    expect(createBulkActionService).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ bulkAction: fakeBulkAction });
  });

  it('should respond with 500 on error', async () => {
    createBulkActionService.mockRejectedValue(new Error('fail'));

    await createBulkActionController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});
