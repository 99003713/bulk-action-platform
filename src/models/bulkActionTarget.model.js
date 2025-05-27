const mongoose = require('mongoose');

const bulkActionTargetSchema = new mongoose.Schema({
  bulkActionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BulkAction', required: true },
  userId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed', 'skipped'], default: 'pending' },
  error: { type: String },
}, { timestamps: true });

bulkActionTargetSchema.index({ bulkActionId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('BulkActionTarget', bulkActionTargetSchema);