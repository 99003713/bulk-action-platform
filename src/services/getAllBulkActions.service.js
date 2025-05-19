const BulkAction = require('../models/bulkAction.model');

exports.getAllBulkActions = async () => {
  return await BulkAction.find().sort({ createdAt: -1 });
};
