const BulkAction = require('../models/bulkAction.model');

exports.getActionById = async (actionId) => {
  try {
    return await BulkAction.findById(actionId);
  }
  catch (error) {
    throw new Error('Error fetching bulk action by ID: ' + error.message);
  }
};
