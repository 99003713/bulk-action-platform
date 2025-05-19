const amqp = require('amqplib');

let channel;

const connectToRabbitMQ = async () => {
  const connection = await amqp.connect('amqp://localhost');
  channel = await connection.createChannel();
  await channel.assertQueue('bulk_action_queue', { durable: true });
  return channel;
};

async function publishToQueue(queueName, data) {
    if (!channel) {
      await connectToRabbitMQ();
    }
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  }

module.exports = {
  connectToRabbitMQ,
  getChannel: () => channel,
  publishToQueue
};