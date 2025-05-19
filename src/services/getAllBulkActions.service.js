const BulkAction = require('../models/bulkAction.model');

exports.getAllBulkActions = async () => {
  try {
    return await BulkAction.find().sort({ createdAt: -1 });
  } catch (error) {
    throw new Error('Error fetching bulk actions: ' + error.message);
  }
};
