const BulkAction = require('../models/bulkAction.model');
const mongoose = require('mongoose');

exports.getBulkActionStats = async (actionId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(actionId)) {
      throw new Error('Invalid action ID');
    }

    const bulkAction = await BulkAction.findById(actionId);

    if (!bulkAction) {
      throw new Error('BulkAction not found');
    }

    const stats = {
      actionId: bulkAction._id,
      totalUsers: bulkAction.targetUsers.length,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      pendingCount: 0,
    };

    for (const user of bulkAction.targetUsers) {
      switch (user.status) {
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
    throw new Error(`Error fetching bulk action stats: ${error.message}`);
  }
};
