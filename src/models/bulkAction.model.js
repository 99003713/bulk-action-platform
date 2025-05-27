const mongoose = require('mongoose');

const bulkActionSchema = new mongoose.Schema({
  entityType: { type: String, enum: ['Contact'], required: true },
  actionType: { type: String, enum: ['update'], required: true },
  accountId: { type: String, required: true },
  payload: { type: Object, required: true },
  scheduledAt: { type: Date },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('BulkAction', bulkActionSchema);