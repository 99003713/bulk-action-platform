const bulkActionService = require('../services/getActionById.service');
const { logger } = require('../utils/logger');

exports.getBulkActionStatus = async (req, res) => {
  try {
    const { actionId } = req.params;
    logger.info('Fetching bulk action status for ID:', actionId);
    const result = await bulkActionService.getActionById(actionId);
    logger.info('Bulk action status:', result);
    res.json(result);
  } catch (err) {
    logger.error('Error getting bulk action status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
