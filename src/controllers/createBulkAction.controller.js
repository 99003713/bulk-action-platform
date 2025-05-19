const { createBulkActionService } = require('../services/createBulkAction.service');
const { logger } = require('../utils/logger');

exports.createBulkActionController = async(req, res) => {
  try {
    logger.info('Inside createBulkActionController');
    const bulkAction = await createBulkActionService(req.body);
    res.status(201).json({ bulkAction });
  } catch (err) {
    logger.error('Error creating bulk action', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}