const Joi = require('joi');
const { logger } = require('../utils/logger');

const createBulkActionSchema = Joi.object({
  entityType: Joi.string().valid('Contact').required(),
  actionType: Joi.string().valid('update').required(),
  accountId: Joi.string().required(),
  payload: Joi.object().required(),
  targetUsers: Joi.array().items(Joi.string().required()).min(1).required(),
  scheduledAt: Joi.date().optional(),
});

exports.validateCreateBulkAction = (req, res, next) => {
  const { error } = createBulkActionSchema.validate(req.body);
  if (error) {
    logger.error('Validation error:', error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}