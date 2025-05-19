const Joi = require('joi');
const { logger } = require('../utils/logger');

const getBulkActionByIdSchema = Joi.object({
  actionId: Joi.string().hex().length(24).required()  // Assuming MongoDB ObjectId
});

exports.validateGetBulkActionById = (req, res, next) => {
  try {
    const { error } = getBulkActionByIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ message: 'Invalid ID format', details: error.details });
    }
    next();
  } catch (err) {
    logger.error('Unexpected error during validation:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};