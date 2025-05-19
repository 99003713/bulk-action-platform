const Joi = require('joi');

const getBulkActionByIdSchema = Joi.object({
  actionId: Joi.string().hex().length(24).required()  // Assuming MongoDB ObjectId
});

exports.validateGetBulkActionById = (req, res, next) => {
  const { error } = getBulkActionByIdSchema.validate(req.params);
  if (error) {
    return res.status(400).json({ message: 'Invalid ID format', details: error.details });
  }
  next();
};