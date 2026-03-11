const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  assetId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  baseId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true },
  quantity:     { type: Number, required: true, min: 1 },
  unitCost:     { type: Number, default: 0 },
  purchaseDate: { type: Date, required: true, default: Date.now },
  recordedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes:        { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
