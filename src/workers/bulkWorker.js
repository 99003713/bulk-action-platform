const BulkAction = require('../models/bulkAction.model');
const { logger } = require('../utils/logger');
const _ = require('lodash'); // for chunking

const BATCH_SIZE = 10;

exports.processBulkActions = async () => {
  try {
    const now = new Date();

    const pendingActions = await BulkAction.find({
      status: 'pending',
      $or: [
        { scheduledAt: { $exists: false } },
        { scheduledAt: { $lte: now } },
      ]
    });

    for (const action of pendingActions) {
      logger.info(`Processing BulkAction ID: ${action._id}`);
      action.status = 'in-progress';
      await action.save();

      const processedUserIds = new Set();

      // Filter out already processed users (status not 'pending')
      const pendingTargets = action.targetUsers.filter(t => t.status === 'pending');

      // Process users in batches
      const batches = _.chunk(pendingTargets, BATCH_SIZE);

      for (const batch of batches) {
        await Promise.all(batch.map(async (target) => {
          const userIdStr = String(target.userId);
          if (processedUserIds.has(userIdStr)) {
            target.status = 'skipped';
            target.error = 'Duplicate userId detected in bulk action';
            logger.warn(`Skipped duplicate user: ${userIdStr}`);
            return;
          }

          processedUserIds.add(userIdStr);

          try {
            // Simulate actual user update
            logger.info(`Updating user: ${userIdStr} with payload`, action.payload);

            target.status = 'success';
          } catch (err) {
            target.status = 'failed';
            target.error = err.message;
            logger.error(`Failed to update user: ${userIdStr}`, err);
          }
        }));

        // Optional delay between batches for rate limiting
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms
      }

      // Final status update
      const hasFailures = action.targetUsers.some(t => t.status === 'failed');
      const hasPending = action.targetUsers.some(t => t.status === 'pending');

      if (hasFailures) {
        action.status = 'failed';
      } else if (!hasPending) {
        action.status = 'completed';
      }

      await action.save();
      logger.info(`Finished processing BulkAction ID: ${action._id}`);
    }

  } catch (err) {
    logger.error('Error processing bulk actions', err);
  }
};
