const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'base_commander', 'logistics_officer'],
    default: 'logistics_officer'
  },
  assignedBase: { type: mongoose.Schema.Types.ObjectId, ref: 'Base', default: null }
}, { timestamps: true });

userSchema.methods.matchPassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);
