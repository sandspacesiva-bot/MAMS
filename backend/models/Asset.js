const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  type:        { type: String, enum: ['vehicle', 'weapon', 'ammunition', 'equipment'], required: true },
  description: { type: String },
  unit:        { type: String, default: 'unit' }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
