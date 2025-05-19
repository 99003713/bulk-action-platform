// src/queues/bulkQueue.js
const { Queue } = require('bull');
const { logger } = require('../utils/logger');

const bulkQueue = new Queue('bulk-actions', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

bulkQueue.process(async (job) => {
  try {
    // Example: Process bulk action
    logger.info(`Processing bulk action ${job.id}`);
    // Call the business logic for processing bulk action
    // (e.g., call some service to update contacts or records)
  } catch (err) {
    logger.error(`Error processing job ${job.id}: ${err.message}`);
    throw err;
  }
});

module.exports = bulkQueue;
