const mongoose = require('mongoose');
const { Schema } = mongoose;

const DealSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  brandName:    { type: String, required: [true,'Brand name is required'], trim: true },
  contactName:  { type: String, default: '', trim: true },
  contactEmail: { type: String, default: '', lowercase: true, trim: true },
  dealType:     { type: String, enum: ['sponsored','affiliate','product','ambassador','consulting'], default: 'sponsored' },
  status:       { type: String, enum: ['outreach','negotiating','confirmed','completed','cancelled'], default: 'outreach', index: true },
  amount:       { type: Number, default: 0, min: 0 },
  currency:     { type: String, default: 'USD' },
  deliverables: [{ type: String }],
  deadline:     { type: Date },
  contractSigned: { type: Boolean, default: false },
  notes:        { type: String, default: '' },
  isPaid:       { type: Boolean, default: false },
  paidAt:       { type: Date },
  linkedPosts:  [{ type: Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });

DealSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Deal', DealSchema);
