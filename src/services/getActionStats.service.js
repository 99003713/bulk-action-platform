const BulkAction = require('../models/bulkAction.model');
const BulkActionTarget = require('../models/bulkActionTarget.model');
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

exports.getBulkActionStats = async (actionId) => {
  try {
    logger.info(`Fetching stats for bulk action ID: ${actionId}`);
    const bulkAction = await BulkAction.findById(actionId);
    if (!bulkAction) {
      logger.warn(`No bulk action found for ID: ${actionId}`);
      return {
        actionId,
        totalUsers: 0,
        successCount: 0,
        failedCount: 0,
        skippedCount: 0,
        pendingCount: 0,
      };
    }

    // Fetch all targets referencing this bulkAction
    const targets = await BulkActionTarget.find({ bulkActionId: actionId });

    const stats = {
      actionId: bulkAction._id,
      totalUsers: targets.length,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      pendingCount: 0,
    };

    for (const target of targets) {
      switch (target.status) {
        case 'success':
          stats.successCount++;
          break;
        case 'failed':
          stats.failedCount++;
          break;
        case 'skipped':
          stats.skippedCount++;
          break;
        case 'pending':
        default:
          stats.pendingCount++;
          break;
      }
    }

    return stats;
  }
  catch (error) {
    logger.error(`Error fetching bulk action stats: ${error.message}`);
    throw new Error(`Error fetching bulk action stats: ${error.message}`);
  }
};