const Deal = require('../models/Deal');
const Notification = require('../models/Notification');
const { checkMonthlyIncomeGoal, sendAchievement } = require('../services/achievementService');

exports.getDeals = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (type) filter.dealType = type;
    const deals = await Deal.find(filter).sort({ createdAt: -1 });
    res.json({ deals });
  } catch (err) { next(err); }
};

exports.createDeal = async (req, res, next) => {
  try {
    const deal = await Deal.create({ ...req.body, userId: req.user.id, ...(req.body.isPaid ? { paidAt: new Date() } : {}) });
    await Notification.create({ userId: req.user.id, type: 'deal', title: 'New Deal Added 🤝', message: `Deal with ${deal.brandName} ($${deal.amount.toLocaleString()}) has been added`, icon: '🤝', link: '/deals' });

    if (deal.status === 'completed') {
      await sendAchievement({ userId: req.user.id, type: 'deal', title: 'Deal Completed! 💰', message: `${deal.brandName} deal completed — $${deal.amount.toLocaleString()} earned!`, icon: '💰', link: '/income' });
    }

    if (deal.isPaid) {
      await sendAchievement({ userId: req.user.id, type: 'deal', title: 'Payment Received! 💸', message: `${deal.brandName} payment received — $${deal.amount.toLocaleString()} added to your income.`, icon: '💸', link: '/income' });
      await checkMonthlyIncomeGoal(req.user.id);
    }

    res.status(201).json({ deal });
  } catch (err) { next(err); }
};

exports.getDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findOne({ _id: req.params.id, userId: req.user.id }).populate('linkedPosts', 'title platform status');
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json({ deal });
  } catch (err) { next(err); }
};

exports.updateDeal = async (req, res, next) => {
  try {
    const existing = await Deal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) return res.status(404).json({ message: 'Deal not found' });

    const deal = await Deal.findByIdAndUpdate(req.params.id, { ...req.body, ...(req.body.isPaid && !existing.isPaid ? { paidAt: new Date() } : {}) }, { new: true });

    if (req.body.status === 'completed' && existing.status !== 'completed') {
      await sendAchievement({ userId: req.user.id, type: 'deal', title: 'Deal Completed! 💰', message: `${deal.brandName} deal completed — $${deal.amount.toLocaleString()} earned!`, icon: '💰', link: '/income' });
    }

    if (req.body.isPaid && !existing.isPaid) {
      await sendAchievement({ userId: req.user.id, type: 'deal', title: 'Payment Received! 💸', message: `${deal.brandName} payment received — $${deal.amount.toLocaleString()} added to your income.`, icon: '💸', link: '/income' });
      await checkMonthlyIncomeGoal(req.user.id);
    }

    res.json({ deal });
  } catch (err) { next(err); }
};

exports.deleteDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json({ message: 'Deal deleted' });
  } catch (err) { next(err); }
};

exports.getSummary = async (req, res, next) => {
  try {
    const deals = await Deal.find({ userId: req.user.id });
    const totalEarned = deals.filter(d => d.isPaid).reduce((a, b) => a + b.amount, 0);
    const totalPending = deals.filter(d => !d.isPaid && d.status !== 'cancelled').reduce((a, b) => a + b.amount, 0);
    const totalPipeline = deals.reduce((a, b) => a + b.amount, 0);

    const byType = await Deal.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: '$dealType', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const monthlyIncome = await Deal.aggregate([
      { $match: { userId: req.user.id, isPaid: true } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ totalEarned, totalPending, totalPipeline, byType, monthlyIncome });
  } catch (err) { next(err); }
};
