const { getChannel } = require('../config/rabbitmq');

exports.enqueueBulkAction = async (bulkActionId) => {
  const channel = getChannel();
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  channel.sendToQueue('bulk_action_queue', Buffer.from(bulkActionId), {
    persistent: true,
  });
};