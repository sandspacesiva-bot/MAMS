const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:    { type: String, required: true },
  entity:    { type: String },
  entityId:  { type: mongoose.Schema.Types.ObjectId },
  details:   { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditSchema);
