const cron = require('node-cron');
const BulkAction = require('../models/bulkAction.model');
const { enqueueBulkAction } = require('../services/bulkActionQueue.service');

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const pendingActions = await BulkAction.find({
      status: 'pending',
      $or: [
        { scheduledAt: { $exists: false } },
        { scheduledAt: { $lte: now } },
      ],
    });

    for (const action of pendingActions) {
      // Mark in-progress to avoid re-processing in next cron run
      action.status = 'in-progress';
      await action.save();

      await enqueueBulkAction(action._id.toString());

      console.log(`Cron: Enqueued BulkAction ID: ${action._id.toString()}`);
    }
  } catch (err) {
    console.error('Cron: Error processing bulk actions', err);
  }
});
