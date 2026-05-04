const Post = require('../models/Post');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const { checkMonthlyPostGoal, sendAchievement } = require('../services/achievementService');

exports.getPosts = async (req, res, next) => {
  try {
    const { status, platform, search, page = 1, limit = 50 } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (platform) filter.platform = platform;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.json({ posts, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) { next(err); }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, caption, platform, status, scheduledDate, tags, notes, aiGenerated, linkedDealId } = req.body;
    const thumbnail = req.file ? req.file.path : '';
    const thumbnailPublicId = req.file ? req.file.filename : '';

    const post = await Post.create({
      userId: req.user.id, title, caption, platform, status, scheduledDate,
      ...(status === 'published' ? { publishedDate: new Date() } : {}),
      tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags,
      notes, aiGenerated, linkedDealId, thumbnail, thumbnailPublicId
    });

    // Notify on schedule
    if (status === 'scheduled' && scheduledDate) {
      await Notification.create({ userId: req.user.id, type: 'post', title: 'Post scheduled', message: `"${title}" has been scheduled for ${new Date(scheduledDate).toLocaleDateString()}`, icon: 'calendarCheck', link: '/posts' });
    }

    if (status === 'published') {
      await sendAchievement({ userId: req.user.id, type: 'post', title: 'Post published', message: `"${title}" is now live on ${platform}`, icon: 'badgeCheck', link: '/posts' });
      await checkMonthlyPostGoal(req.user.id);
    }

    res.status(201).json({ post });
  } catch (err) { next(err); }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (err) { next(err); }
};

exports.updatePost = async (req, res, next) => {
  try {
    const existing = await Post.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) return res.status(404).json({ message: 'Post not found' });

    const { title, caption, platform, status, scheduledDate, publishedDate, tags, notes, metrics, linkedDealId } = req.body;
    let thumbnail = existing.thumbnail;
    let thumbnailPublicId = existing.thumbnailPublicId;

    if (req.file) {
      if (existing.thumbnailPublicId) {
        try { await cloudinary.uploader.destroy(existing.thumbnailPublicId); } catch (_) {}
      }
      thumbnail = req.file.path;
      thumbnailPublicId = req.file.filename;
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, caption, platform, status, scheduledDate, publishedDate: status === 'published' && !publishedDate ? new Date() : publishedDate, tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags, notes, metrics, linkedDealId, thumbnail, thumbnailPublicId },
      { new: true, runValidators: true }
    );

    // Notify on publish
    if (status === 'published' && existing.status !== 'published') {
      await sendAchievement({ userId: req.user.id, type: 'post', title: 'Post published', message: `"${title}" is now live on ${platform}`, icon: 'badgeCheck', link: '/posts' });
      await checkMonthlyPostGoal(req.user.id);
    }

    res.json({ post });
  } catch (err) { next(err); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, userId: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.thumbnailPublicId) {
      try { await cloudinary.uploader.destroy(post.thumbnailPublicId); } catch (_) {}
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const existing = await Post.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) return res.status(404).json({ message: 'Post not found' });

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status, ...(status === 'published' ? { publishedDate: new Date() } : {}) },
      { new: true }
    );

    if (status === 'published' && existing.status !== 'published') {
      await sendAchievement({ userId: req.user.id, type: 'post', title: 'Post published', message: `"${post.title}" is now live on ${post.platform}`, icon: 'badgeCheck', link: '/posts' });
      await checkMonthlyPostGoal(req.user.id);
    }

    res.json({ post });
  } catch (err) { next(err); }
};

exports.getCalendar = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
    const posts = await Post.find({ userId: req.user.id, scheduledDate: { $gte: start, $lte: end } }).sort({ scheduledDate: 1 });
    res.json({ posts });
  } catch (err) { next(err); }
};
