const BulkAction = require('../models/bulkAction.model');
const { logger } = require('../utils/logger');
const dotenv = require('dotenv');
dotenv.config();

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10) || 10;
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 1000;

// Simulated batch update function
const updateContactsInBatch = async (userIds, payload) => {
  logger.info(`Batch updating ${userIds.length} users`, { payload });
  // Simulate DB update or external API call
  await new Promise(resolve => setTimeout(resolve, 200));
};

exports.consumeBulkAction = async (msg, channel) => {
  let bulkActionId = null;

  try {
    const parsed = JSON.parse(msg.content.toString());
    bulkActionId = parsed.bulkActionId;

    logger.info('Received message from RabbitMQ', { bulkActionId });

    const action = await BulkAction.findById(bulkActionId);
    if (!action || action.status !== 'in-progress') {
      logger.warn(`Invalid or already processed BulkAction ID: ${bulkActionId}`);
      return channel.ack(msg);
    }

    const pendingTargets = action.targetUsers.filter(t => t.status === 'pending');
    const processedUserIds = new Set();
    let index = 0;

    while (index < pendingTargets.length) {
      const batch = [];

      // Create batch of unique userIds
      while (batch.length < BATCH_SIZE && index < pendingTargets.length) {
        const target = pendingTargets[index];
        const userIdStr = String(target.userId);

        if (processedUserIds.has(userIdStr)) {
          target.status = 'skipped';
          target.error = 'Duplicate userId detected in batch';
          logger.warn(`Skipped duplicate user: ${userIdStr}`);
        } else {
          processedUserIds.add(userIdStr);
          batch.push(target);
        }
        index++;
      }

      try {
        await updateContactsInBatch(batch.map(t => t.userId), action.payload);
        for (const target of batch) {
          target.status = 'success';
          target.error = '';
        }
      } catch (err) {
        for (const target of batch) {
          target.status = 'failed';
          target.error = err.message || 'Batch update failed';
        }
        logger.error('Batch update failed', err);
      }

      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_WINDOW_MS));
    }

    // Finalize action status
    const hasFailures = action.targetUsers.some(t => t.status === 'failed');
    const hasPending = action.targetUsers.some(t => t.status === 'pending');

    if (hasFailures) {
      action.status = 'failed';
    } else if (!hasPending) {
      action.status = 'completed';
    }

    await action.save();
    logger.info(`Finished processing BulkAction ID: ${bulkActionId}`);

  } catch (err) {
    logger.error(`Error processing BulkAction ID: ${bulkActionId}`, err);
  }
};