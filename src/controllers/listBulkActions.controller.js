const bulkActionService = require('../services/getAllBulkActions.service');
const { logger } = require('../utils/logger');

exports.listBulkActions = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await bulkActionService.getAllBulkActions({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status
    });
    res.json(result);
  } catch (err) {
    logger.error('Error fetching bulk actions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
