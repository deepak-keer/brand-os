// ═══════════════════════════════════════════════════════════
// IDEA CONTROLLER
// ═══════════════════════════════════════════════════════════
const Idea = require('../models/Idea');
const Analytics = require('../models/Analytics');
const Deal = require('../models/Deal');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const { groq, modelName } = require('../config/groq');

exports.getIdeas = async (req, res, next) => {
  try {
    const ideas = await Idea.find({ userId: req.user.id }).sort({ column: 1, order: 1, createdAt: -1 });
    res.json({ ideas });
  } catch (err) { next(err); }
};

exports.createIdea = async (req, res, next) => {
  try {
    const { title, description, platform, column, tags, aiSuggested, priority, estimatedTime } = req.body;
    const count = await Idea.countDocuments({ userId: req.user.id, column: column || 'backlog' });
    const idea = await Idea.create({ userId: req.user.id, title, description, platform, column, tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (tags || []), aiSuggested, priority, estimatedTime, order: count });
    res.status(201).json({ idea });
  } catch (err) { next(err); }
};

exports.updateIdea = async (req, res, next) => {
  try {
    if (req.body.tags && typeof req.body.tags === 'string') req.body.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
    const idea = await Idea.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true });
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    res.json({ idea });
  } catch (err) { next(err); }
};

exports.deleteIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    res.json({ message: 'Idea deleted' });
  } catch (err) { next(err); }
};

exports.moveIdea = async (req, res, next) => {
  try {
    const { column, order } = req.body;
    const idea = await Idea.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { column, order }, { new: true });
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    res.json({ idea });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════
// ANALYTICS CONTROLLER
// ═══════════════════════════════════════════════════════════
exports.getAnalytics = async (req, res, next) => {
  try {
    const analytics = await Analytics.find({ userId: req.user.id }).sort({ date: -1 });
    const topPosts = await Post.find({ userId: req.user.id, status: 'published' }).sort({ 'metrics.views': -1 }).limit(5);
    res.json({ analytics, topPosts });
  } catch (err) { next(err); }
};

exports.createOrUpdateAnalytics = async (req, res, next) => {
  try {
    const { platform, followers, totalViews, totalLikes, totalComments, totalShares, engagementRate, revenue, followersGrowth } = req.body;
    const date = new Date(); date.setHours(0,0,0,0);
    const entry = await Analytics.findOneAndUpdate(
      { userId: req.user.id, platform, date },
      { followers, totalViews, totalLikes, totalComments, totalShares, engagementRate, revenue, followersGrowth },
      { upsert: true, new: true }
    );
    res.json({ analytics: entry });
  } catch (err) { next(err); }
};

exports.getOverallStats = async (req, res, next) => {
  try {
    const PLATFORMS = ['YouTube','Instagram','Twitter','LinkedIn','TikTok'];
    const summary = [];
    for (const platform of PLATFORMS) {
      const latest = await Analytics.findOne({ userId: req.user.id, platform }).sort({ date: -1 });
      if (latest) summary.push(latest);
    }
    const totalFollowers = summary.reduce((a, b) => a + b.followers, 0);
    const totalViews = summary.reduce((a, b) => a + b.totalViews, 0);
    const avgER = summary.length ? (summary.reduce((a, b) => a + b.engagementRate, 0) / summary.length).toFixed(1) : 0;

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthlyAnalytics = await Analytics.aggregate([
      { $match: { userId: req.user._id, date: { $gte: yearStart, $lt: nextYearStart } } },
      { $group: { _id: { month: { $month: '$date' } }, views: { $sum: '$totalViews' }, followers: { $sum: '$followers' }, likes: { $sum: '$totalLikes' } } },
      { $sort: { '_id.month': 1 } },
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyViews = MONTHS.map((month, index) => {
      const row = monthlyAnalytics.find(item => item._id.month === index + 1);
      return {
        month,
        views: row?.views || 0,
        followers: row?.followers || 0,
        likes: row?.likes || 0,
      };
    });

    const currentMonthPosts = await Post.countDocuments({
      userId: req.user.id,
      status: 'published',
      publishedDate: { $gte: monthStart, $lt: nextMonthStart },
    });

    const currentMonthIncomeRows = await Deal.aggregate([
      { $match: { userId: req.user._id, isPaid: true, paidAt: { $gte: monthStart, $lt: nextMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      summary,
      totalFollowers,
      totalViews,
      avgER,
      monthlyViews,
      monthlyGoals: {
        posts: req.user.monthlyGoals?.posts || 0,
        income: req.user.monthlyGoals?.income || 0,
        currentPosts: currentMonthPosts,
        currentIncome: currentMonthIncomeRows[0]?.total || 0,
      },
    });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════
// NOTIFICATION CONTROLLER
// ═══════════════════════════════════════════════════════════
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (err) { next(err); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Notification deleted' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════
// AI CONTROLLER
// ═══════════════════════════════════════════════════════════
const runAI = async (prompt) => {
  if (!groq) throw new Error('AI not configured. Add GROQ_API_KEY to server/.env.');
  const completion = await groq.chat.completions.create({
    model: modelName,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return (completion.choices?.[0]?.message?.content || '').trim();
};

const parseAIJson = (text) => JSON.parse(text.replace(/```json|```/g,'').trim());

const handleAIError = (res, err) => {
  console.error(`Groq AI generation failed (${modelName}):`, err.message);
  const message = err.message || 'Unknown Groq API error';
  const lowerMessage = message.toLowerCase();
  const status = err.status || (lowerMessage.includes('too many requests') || lowerMessage.includes('quota') || lowerMessage.includes('rate limit') ? 429 : 500);

  if (status === 429) {
    return res.status(status).json({ message: 'Groq rate limit or quota exceeded for this API key. Check billing/quota or try again later.' });
  }

  res.status(status).json({ message: `AI generation failed: ${message}` });
};

exports.generateCaption = async (req, res, next) => {
  try {
    const { title, platform, tone } = req.body;
    if (!title || !platform) return res.status(400).json({ message: 'Title and platform are required' });
    const text = await runAI(`Write a ${platform} caption for a post titled: "${title}"\nTone: ${tone || 'engaging and authentic'}\nInclude relevant hashtags at the end.\nReturn ONLY the caption text.`);
    res.json({ caption: text });
  } catch (err) { handleAIError(res, err); }
};

exports.generateIdeas = async (req, res, next) => {
  try {
    const { niche, platform, count = 5, style } = req.body;
    if (!niche || !platform) return res.status(400).json({ message: 'Niche and platform are required' });
    const text = await runAI(`Generate ${count} ${style || 'engaging'} content ideas for a ${niche} creator on ${platform}.\nReturn ONLY valid JSON array with no markdown:\n[{"title":"string","description":"string","format":"string"}]`);
    const ideas = parseAIJson(text);
    res.json({ ideas });
  } catch (err) { handleAIError(res, err); }
};

exports.generateHashtags = async (req, res, next) => {
  try {
    const { topic, platform, count = 20 } = req.body;
    if (!topic) return res.status(400).json({ message: 'Topic is required' });
    const text = await runAI(`Generate ${count} trending hashtags for a ${platform || 'social media'} post about: "${topic}"\nReturn ONLY a JSON array of strings: ["#tag1","#tag2",...]`);
    const hashtags = parseAIJson(text);
    res.json({ hashtags });
  } catch (err) { handleAIError(res, err); }
};

exports.generateBio = async (req, res, next) => {
  try {
    const { name, niche, platforms, style } = req.body;
    const text = await runAI(`Write a compelling ${style || 'professional'} social media bio for ${name}, a ${niche} creator on ${(platforms||[]).join(', ')}.\nReturn ONLY 3 different bio options as JSON: [{"platform":"general","bio":"..."},{"platform":"short","bio":"..."},{"platform":"long","bio":"..."}]`);
    const bios = parseAIJson(text);
    res.json({ bios });
  } catch (err) { handleAIError(res, err); }
};

// ═══════════════════════════════════════════════════════════
// UPLOAD CONTROLLER
// ═══════════════════════════════════════════════════════════
const cloudinary = require('../config/cloudinary');

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (user.avatar && user.avatar.includes('cloudinary')) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      try { await cloudinary.uploader.destroy(`brand-os/avatars/${publicId}`); } catch(_) {}
    }
    await User.findByIdAndUpdate(req.user.id, { avatar: req.file.path });
    res.json({ avatarUrl: req.file.path });
  } catch (err) { next(err); }
};
