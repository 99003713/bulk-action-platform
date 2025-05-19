const { getChannel } = require('../config/rabbitmq');
const { logger } = require('../utils/logger');

exports.enqueueBulkAction = async (bulkActionId) => {
  try {
    const channel = getChannel();
    if (!channel) throw new Error('RabbitMQ channel not initialized');
    channel.sendToQueue('bulk_action_queue', Buffer.from(bulkActionId), {
      persistent: true,
    });
  }
  catch (error) {
    logger.error('Error enqueueing bulk action:', error);
    throw error;
  }
};