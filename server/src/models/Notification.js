const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  userId:  { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:    { type: String, enum: ['deal','post','goal','ai','system'], default: 'system' },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false, index: true },
  link:    { type: String, default: '' },
  icon:    { type: String, default: 'logo' },
  achievementKey: { type: String, default: '', index: true },
}, { timestamps: true });

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, achievementKey: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
