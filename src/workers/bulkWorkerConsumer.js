const BulkAction = require('../models/bulkAction.model');
const BulkActionTarget = require('../models/bulkActionTarget.model');
const { logger } = require('../utils/logger');
const dotenv = require('dotenv');
const { updateBulkTragetsBatch } = require('../services/updateBulkTragetsBatch');

dotenv.config();

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10) || 10;
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 1000;
const MAX_RETRIES = 3;

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

    // Get all pending/eligible targets from BulkActionTarget collection
    const allTargets = await BulkActionTarget.find({
      bulkActionId,
      $or: [
        { status: 'pending' },
        { status: 'retrying', retryCount: { $lt: MAX_RETRIES } }
      ]
    });

    const processedUserIds = new Set();
    let index = 0;

    while (index < allTargets.length) {
      const batch = [];

      while (batch.length < BATCH_SIZE && index < allTargets.length) {
        const target = allTargets[index];
        const userIdStr = String(target.userId);

        if (processedUserIds.has(userIdStr)) {
          await BulkActionTarget.findByIdAndUpdate(target._id, {
            status: 'skipped',
            error: 'Duplicate userId detected in batch',
          });
          logger.warn(`Skipped duplicate user: ${userIdStr}`);
        } else {
          processedUserIds.add(userIdStr);
          batch.push(target);
        }

        index++;
      }

      try {
        await updateBulkTragetsBatch(batch, action.payload);
      } catch (err) {
        logger.error('Batch failed, retrying individually');

        // Retry each target in the failed batch individually
        for (const target of batch) {
          const retryCount = target.retryCount || 0;

          if (retryCount + 1 >= MAX_RETRIES) {
            await BulkActionTarget.findByIdAndUpdate(target._id, {
              status: 'failed',
              error: `Max retries reached: ${err.message}`,
              retryCount: retryCount + 1
            });
          } else {
            await BulkActionTarget.findByIdAndUpdate(target._id, {
              status: 'retrying',
              error: `Retry ${retryCount + 1}: ${err.message}`,
              retryCount: retryCount + 1
            });
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_WINDOW_MS));
    }

    // Finalize bulkAction status
    const remaining = await BulkActionTarget.countDocuments({
      bulkActionId,
      $or: [{ status: 'pending' }, { status: 'retrying' }]
    });

    const failed = await BulkActionTarget.countDocuments({
      bulkActionId,
      status: 'failed'
    });

    if (remaining === 0 && failed === 0) {
      action.status = 'completed';
    } else if (failed > 0) {
      action.status = 'failed';
    }

    await action.save();
    logger.info(`Finished processing BulkAction ID: ${bulkActionId}`);
    channel.ack(msg);

  } catch (err) {
    logger.error(`Error processing BulkAction ID: ${bulkActionId}`, err);
    channel.nack(msg, false, false); // Discard the message
  }
};