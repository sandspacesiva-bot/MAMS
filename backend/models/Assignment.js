const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  assetId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  baseId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true },
  personnelName: { type: String, required: true },
  personnelId:   { type: String },
  quantity:      { type: Number, required: true, min: 1 },
  type:          { type: String, enum: ['assigned', 'expended'], required: true },
  date:          { type: Date, default: Date.now },
  assignedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes:         { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
