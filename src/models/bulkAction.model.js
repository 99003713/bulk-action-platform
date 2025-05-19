const mongoose = require('mongoose');

const targetUserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed', 'skipped'], default: 'pending' },
  error: { type: String },
}, { _id: false });


const bulkActionSchema = new mongoose.Schema({
  entityType: { type: String, enum: ['Contact'], required: true },
  actionType: { type: String, enum: ['update'], required: true },
  accountId: { type: String, required: true },
  payload: { type: Object, required: true },
  targetUsers: [targetUserSchema],
  scheduledAt: { type: Date },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('BulkAction', bulkActionSchema);