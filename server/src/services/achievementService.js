const Deal = require('../models/Deal');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../config/email');

const monthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
};

const appUrl = (link = '') => {
  const baseUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
  return `${baseUrl}${link || ''}`;
};

const sendAchievement = async ({ userId, type = 'goal', title, message, icon = 'logo', link = '/dashboard', achievementKey = '' }) => {
  if (achievementKey) {
    const existing = await Notification.findOne({ userId, achievementKey });
    if (existing) return null;
  }

  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    icon,
    link,
    achievementKey,
  });

  try {
    const user = await User.findById(userId);
    if (user?.email) {
      const template = emailTemplates.achievement({
        name: user.name || 'Creator',
        title,
        message,
        url: appUrl(link),
      });
      await sendEmail({ to: user.email, ...template });
    }
  } catch (err) {
    console.warn('Achievement email failed:', err.message);
  }

  return notification;
};

const checkMonthlyPostGoal = async (userId) => {
  const user = await User.findById(userId);
  const goal = user?.monthlyGoals?.posts || 0;
  if (!goal) return;

  const { start, end } = monthRange();
  const count = await Post.countDocuments({
    userId,
    status: 'published',
    publishedDate: { $gte: start, $lt: end },
  });

  if (count >= goal) {
    await sendAchievement({
      userId,
      type: 'goal',
      title: 'Monthly post goal reached',
      message: `You published ${count} posts this month and reached your goal of ${goal}.`,
      icon: 'logo',
      link: '/dashboard',
      achievementKey: `monthly-post-goal:${monthKey()}`,
    });
  }
};

const checkMonthlyIncomeGoal = async (userId) => {
  const user = await User.findById(userId);
  const goal = user?.monthlyGoals?.income || 0;
  if (!goal) return;

  const { start, end } = monthRange();
  const deals = await Deal.find({
    userId,
    isPaid: true,
    paidAt: { $gte: start, $lt: end },
  });
  const total = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);

  if (total >= goal) {
    await sendAchievement({
      userId,
      type: 'goal',
      title: 'Monthly income goal reached',
      message: `You earned $${total.toLocaleString()} this month and reached your goal of $${goal.toLocaleString()}.`,
      icon: 'logo',
      link: '/income',
      achievementKey: `monthly-income-goal:${monthKey()}`,
    });
  }
};

module.exports = {
  checkMonthlyIncomeGoal,
  checkMonthlyPostGoal,
  sendAchievement,
};
