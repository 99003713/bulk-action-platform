const BulkAction = require('../models/bulkAction.model');
const BulkActionTarget = require('../models/bulkActionTarget.model');
const { logger } = require('../utils/logger');
const { publishToQueue } = require('../utils/rabbitmq');
const dotenv = require('dotenv');
dotenv.config();

exports.createBulkActionService = async (data) => {
  try {
    logger.info('Inside createBulkActionService', data);

    const { entityType, actionType, accountId, payload, targetUsers, scheduledAt } = data;

    // Step 1: Create the BulkAction (without targetUsers)
    const bulkAction = new BulkAction({
      entityType,
      actionType,
      accountId,
      payload,
      scheduledAt,
      status: (!scheduledAt || new Date(scheduledAt) <= new Date()) ? 'in-progress' : 'pending'
    });

    await bulkAction.save();

    // Step 2: Create BulkActionTarget records
    const bulkTargets = targetUsers.map(userId => ({
      bulkActionId: bulkAction._id,
      userId,
      status: 'pending',
      error: ''
    }));

    await BulkActionTarget.insertMany(bulkTargets, { ordered: false });

    // Step 3: Publish to queue if immediate
    if (!scheduledAt || new Date(scheduledAt) <= new Date()) {
      logger.info('ScheduledAt is not in the future, pushing to queue immediately');

      await publishToQueue(process.env.RABBITMQ_QUEUE_NAME, {
        bulkActionId: bulkAction._id.toString()
      });
    } else {
      logger.info('ScheduledAt is in the future, skipping immediate queue push');
    }

    return bulkAction;
  } catch (err) {
    logger.error('Error creating bulk action', err);
    throw new Error('Error creating bulk action');
  }
};