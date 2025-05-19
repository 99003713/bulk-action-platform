const BulkAction = require('../models/bulkAction.model');

exports.cleanupOldActions = async () => {
    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);
  
    const result = await BulkAction.deleteMany({
      createdAt: { $lt: THIRTY_DAYS_AGO },
      status: { $in: ['completed', 'failed'] },
    });
  
    return result;
  };