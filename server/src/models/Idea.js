const mongoose = require('mongoose');
const { Schema } = mongoose;

const IdeaSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:       { type: String, required: [true,'Title is required'], trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 1000 },
  platform:    { type: String, default: 'YouTube' },
  column:      { type: String, enum: ['backlog','in-progress','ready'], default: 'backlog', index: true },
  order:       { type: Number, default: 0 },
  tags:        [{ type: String, trim: true }],
  aiSuggested: { type: Boolean, default: false },
  priority:    { type: String, enum: ['low','medium','high'], default: 'medium' },
  estimatedTime: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Idea', IdeaSchema);
