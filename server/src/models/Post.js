const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema({
  userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:         { type: String, required: [true,'Title is required'], trim: true, maxlength: 200 },
  caption:       { type: String, default: '', maxlength: 2200 },
  platform:      { type: String, enum: ['YouTube','Instagram','Twitter','LinkedIn','TikTok'], default: 'YouTube' },
  status:        { type: String, enum: ['idea','draft','review','scheduled','published'], default: 'idea', index: true },
  scheduledDate: { type: Date },
  publishedDate: { type: Date },
  thumbnail:     { type: String, default: '' },
  thumbnailPublicId: { type: String, default: '' },
  tags:          [{ type: String, trim: true }],
  notes:         { type: String, default: '' },
  metrics: {
    views:    { type: Number, default: 0, min: 0 },
    likes:    { type: Number, default: 0, min: 0 },
    comments: { type: Number, default: 0, min: 0 },
    shares:   { type: Number, default: 0, min: 0 },
    saves:    { type: Number, default: 0, min: 0 },
  },
  aiGenerated:   { type: Boolean, default: false },
  linkedDealId:  { type: Schema.Types.ObjectId, ref: 'Deal' },
}, { timestamps: true });

PostSchema.index({ userId: 1, status: 1 });
PostSchema.index({ userId: 1, platform: 1 });
PostSchema.index({ userId: 1, scheduledDate: 1 });

module.exports = mongoose.model('Post', PostSchema);
