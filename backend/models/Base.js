const mongoose = require('mongoose');

const baseSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  location:    { type: String },
  commanderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Base', baseSchema);
