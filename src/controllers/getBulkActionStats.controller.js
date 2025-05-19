const { getBulkActionStats } = require('../services/getActionStats.service');
const { logger } = require('../utils/logger');

exports.getBulkActionStats = async (req, res) => {
  try {
    const { actionId } = req.params;
    const result = await getBulkActionStats(actionId);
    res.json(result);
  } catch (err) {
    logger.error('Error getting bulk action stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
