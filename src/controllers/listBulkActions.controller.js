const bulkActionService = require('../services/getAllBulkActions.service');
const { logger } = require('../utils/logger');

exports.listBulkActions = async (req, res) => {
  try {
    const result = await bulkActionService.getAllBulkActions();
    res.json(result);
  } catch (err) {
    logger.error('Error fetching bulk actions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
