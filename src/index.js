// index.js - Entry point for the Express App
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const routes = require('./routes');
const { logger } = require('./utils/logger');
require('./cron/bulkActionCron'); // Import cron job

const { connectToRabbitMQ } = require('./utils/rabbitmq');
const { consumeBulkAction } = require('./workers/bulkWorkerConsumer');

dotenv.config();

const app = express();
app.use(express.json());

app.use(routes); // Route prefix for all APIs

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('MongoDB connected');
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  })
  .catch(err => logger.error('MongoDB connection error:', err));



// RabbitMQ consumer setup
// This should be in a separate worker file in a real-world scenario
// but for simplicity, it's included here.
// Ensure RabbitMQ connection is established before consuming messages  
(async () => {
  const channel = await connectToRabbitMQ();
  channel.consume(process.env.RABBITMQ_QUEUE_NAME, async (msg) => {
    await consumeBulkAction(msg, channel);
  });
})();