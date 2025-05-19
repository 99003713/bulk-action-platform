const cron = require('node-cron');
const { processBulkActions } = require('../workers/bulkWorker');

// Run every 1 minute
cron.schedule('* * * * *', async () => {
  console.log('Cron: Running bulk action processor');
  await processBulkActions();
});
