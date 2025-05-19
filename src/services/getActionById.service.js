const BulkAction = require('../models/bulkAction.model');

exports.getActionById = async (actionId) => {
  return await BulkAction.findById(actionId);
};
