const cron = require('node-cron');
const BulkAction = require('../models/bulkAction.model');
const dotenv = require('dotenv');
dotenv.config();


cron.schedule(process.env.CLEANUP_CRON_SCHEDULE, async () => {
  const cutoff = new Date(Date.now() - Number(process.env.DATA_RETENTION_DAYS) * 24 * 60 * 60 * 1000);
  await BulkAction.deleteMany({
    status: { $in: ['completed', 'failed'] },
    updatedAt: { $lt: cutoff },
  });
  console.log('Old bulk actions cleaned up');
});