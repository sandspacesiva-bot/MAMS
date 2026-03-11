const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  assetId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  fromBaseId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true },
  toBaseId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true },
  quantity:     { type: Number, required: true, min: 1 },
  transferDate: { type: Date, default: Date.now },
  initiatedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:       { type: String, enum: ['pending', 'completed'], default: 'completed' },
  notes:        { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transfer', transferSchema);
