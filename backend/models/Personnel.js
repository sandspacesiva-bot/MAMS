const mongoose = require('mongoose');

const personnelSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  personnelId: { type: String, required: true, unique: true },
  baseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Base', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Personnel', personnelSchema);
