const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
  username:     { type: String, required: [true, 'Username is required'], unique: true, lowercase: true, trim: true },
  email:        { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password:     { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  avatar:       { type: String, default: '' },
  niche:        { type: String, default: '', trim: true },
  bio:          { type: String, default: '', maxlength: 500 },
  platforms:    [{ type: String, enum: ['YouTube','Instagram','Twitter','LinkedIn','TikTok'] }],
  website:      { type: String, default: '' },
  plan:         { type: String, enum: ['free','pro','team'], default: 'free' },
  monthlyGoals: {
    posts:         { type: Number, default: 20 },
    income:        { type: Number, default: 5000 },
    currentPosts:  { type: Number, default: 0 },
    currentIncome: { type: Number, default: 0 },
  },
  onboardingDone: { type: Boolean, default: false },
  passwordResetToken:   { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  refreshTokens: [{ type: String, select: false }],
  lastLogin:    { type: Date },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
