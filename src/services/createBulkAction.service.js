const BulkAction = require('../models/bulkAction.model');
const { logger } = require('../utils/logger');
const { publishToQueue } = require('../config/rabbitmq');

exports.createBulkActionService = async (data) => {
  try {
    logger.info('Inside createBulkActionService', data);

    const targetUsers = data.targetUsers.map(userId => ({
      userId,
      status: 'pending',
      error: '',
    }));

    const bulkAction = new BulkAction({
      entityType: data.entityType,
      actionType: data.actionType,
      accountId: data.accountId,
      payload: data.payload,
      targetUsers,
      scheduledAt: data.scheduledAt,
      status: 'pending'
    });

    await bulkAction.save();

    const now = new Date();
    if (!data.scheduledAt || new Date(data.scheduledAt) <= now) {
      logger.info('ScheduledAt is not in the future, pushing to queue immediately');

      // Mark it as in-progress before queueing
      bulkAction.status = 'in-progress';
      await bulkAction.save();

      await publishToQueue('bulk_action_queue', {
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
