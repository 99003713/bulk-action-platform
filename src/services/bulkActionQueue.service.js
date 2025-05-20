const { getChannel } = require('../utils/rabbitmq');
const { logger } = require('../utils/logger');
const dotenv = require('dotenv');
dotenv.config();

exports.enqueueBulkAction = async (bulkActionId) => {
  try {
    const channel = getChannel();
    if (!channel) throw new Error('RabbitMQ channel not initialized');
    channel.sendToQueue(process.env.RABBITMQ_QUEUE_NAME, Buffer.from(bulkActionId), {
      persistent: true,
    });
  }
  catch (error) {
    logger.error('Error enqueueing bulk action:', error);
    throw error;
  }
};