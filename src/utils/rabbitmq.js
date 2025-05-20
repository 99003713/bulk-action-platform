const amqp = require('amqplib');
const dotenv = require('dotenv');
const { logger } = require('./logger'); 
dotenv.config();

let channel;


const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(process.env.RABBITMQ_QUEUE_NAME, { durable: true });
    logger.info('Connected to RabbitMQ');
    return channel;
  }
  catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    throw error;
  }
};



async function publishToQueue(queueName, data) {
  try {
    if (!channel) {
      await connectToRabbitMQ();
    }
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  }
  catch (error) {
    console.error('Error publishing to queue:', error);
    throw error;
  }
}

module.exports = {
  connectToRabbitMQ,
  getChannel: () => channel,
  publishToQueue
};