const BulkAction = require('../models/bulkAction.model');
const { logger } = require('../utils/logger');

exports.createBulkActionService = async (data) => {
  try {
    logger.info('Inside createBulkActionService', data);
    // Map targetUsers to include initial status 'pending' and empty error
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
    });

    await bulkAction.save();
    return bulkAction;
  }
  catch (err) {
    logger.error('Error creating bulk action', err);
    throw new Error('Error creating bulk action');
  }
}