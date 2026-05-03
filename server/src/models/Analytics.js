const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnalyticsSchema = new Schema({
  userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  platform:       { type: String, required: true },
  date:           { type: Date, required: true },
  followers:      { type: Number, default: 0, min: 0 },
  followersGrowth:{ type: Number, default: 0 },
  totalViews:     { type: Number, default: 0, min: 0 },
  totalLikes:     { type: Number, default: 0, min: 0 },
  totalComments:  { type: Number, default: 0, min: 0 },
  totalShares:    { type: Number, default: 0, min: 0 },
  engagementRate: { type: Number, default: 0, min: 0 },
  revenue:        { type: Number, default: 0, min: 0 },
}, { timestamps: true });

AnalyticsSchema.index({ userId: 1, platform: 1, date: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
