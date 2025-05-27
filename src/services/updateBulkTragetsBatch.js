const BulkActionTarget = require('../models/bulkActionTarget.model');
const { logger } = require('../utils/logger');

const updateBulkTragetsBatch = async (targets, payload) => {
  try {
    logger.info('Starting updateBulkTragetsBatch', { targetsCount: targets.length, payload });
    if (!targets || targets.length === 0) {
      logger.warn('No targets provided for batch update');
      return;
    }
    const userIds = targets.map(t => t.userId.toString());

    logger.info(`Batch updating ${userIds.length} users`, { payload });

    // Mark all target users as success
    const bulkTargetOps = targets.map(t => ({
      updateOne: {
        filter: { _id: t._id },
        update: {
          $set: {
            status: 'success',
            error: '',
          }
        }
      }
    }));

    await BulkActionTarget.bulkWrite(bulkTargetOps);

    logger.info(`Marked ${targets.length} targets as success`);

  } catch (err) {
    logger.error('Error in updateBulkTragetsBatch', err);
    throw err; // Let worker handle retry logic
  }
};

module.exports = { updateBulkTragetsBatch };