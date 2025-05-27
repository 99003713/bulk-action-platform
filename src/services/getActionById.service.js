const BulkAction = require('../models/bulkAction.model');
const BulkActionTarget = require('../models/bulkActionTarget.model');
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

exports.getActionById = async (actionId) => {
  try {
    logger.info(`Fetching bulk action by ID: ${actionId}`);
    const bulkAction = await BulkAction.findById(actionId);
    if (!bulkAction) {
      // If no bulk action is found, return empty objects
      return { bulkAction: {}, targets: [] };
    }

    // Find all BulkActionTarget documents referencing this bulkActionId
    const targets = await BulkActionTarget.find({ bulkActionId: actionId });

    logger.info(`Found ${targets.length} targets for bulk action ID: ${actionId}`);
    return { bulkAction, targets };
  } catch (error) {
    logger.error(`Error fetching bulk action by ID: ${error.message}`);
    throw new Error('Error fetching bulk action by ID: ' + error.message);
  }
}
