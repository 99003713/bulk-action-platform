const BulkAction = require('../models/bulkAction.model');
const { logger } = require('../utils/logger');
const { RATE_LIMIT_DELAY_MS, BATCH_SIZE } = require('../config/constants');

// Simulated batch update function
const updateContactsInBatch = async (userIds, payload) => {
  logger.info(`Batch updating ${userIds.length} users`, { payload });
  // Simulate DB update or API call
  await new Promise(resolve => setTimeout(resolve, 200)); // simulate network/db delay
};

exports.consumeBulkAction = async (msg, channel) => {
  logger.info('Received message from RabbitMQ', { msg: msg.content.toString() });
  const { bulkActionId } = JSON.parse(msg.content.toString());

  try {
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

      // Create a batch of unique userIds
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
        for (const target of batch) target.status = 'success';
      } catch (err) {
        for (const target of batch) {
          target.status = 'failed';
          target.error = err.message;
        }
        logger.error('Failed to update batch', err);
      }

      await action.save();
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }

    // Update final status
    const hasFailures = action.targetUsers.some(t => t.status === 'failed');
    const hasPending = action.targetUsers.some(t => t.status === 'pending');

    if (hasFailures) {
      action.status = 'failed';
    } else if (!hasPending) {
      action.status = 'completed';
    }

    await action.save();
    logger.info(`Completed processing BulkAction ID: ${bulkActionId}`);

  } catch (err) {
    logger.error(`Error processing BulkAction ID: ${bulkActionId}`, err);
  }
};