const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail, emailTemplates } = require('../config/email');

const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

const getRequestMeta = (req) => ({
  ip: String(req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || '')
    .split(',')[0]
    .trim(),
  device: req.headers['user-agent'] || 'Unknown device',
  time: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
});

const sendSecurityEmail = async ({ user, templateName, req }) => {
  try {
    const template = emailTemplates[templateName]({
      name: user.name || 'Creator',
      ...getRequestMeta(req),
    });
    await sendEmail({ to: user.email, ...template });
  } catch (err) {
    console.warn('Security email failed:', err.message);
  }
};

const makeUsername = (value, fallback) => {
  const base = String(value || fallback || 'creator')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return base || 'creator';
};

const getUniqueUsername = async (value, email) => {
  const fallback = String(email || '').split('@')[0];
  const base = makeUsername(value, fallback);

  if (!(await User.findOne({ username: base }))) return base;
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
};

exports.register = async (req, res, next) => {
  try {
    const { password, niche } = req.body;
    const name = String(req.body.name || req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });

    const username = await getUniqueUsername(req.body.username || name, email);
    const user = await User.create({ name, username, email, password, niche });
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    user.refreshTokens = [refreshToken];
    user.lastLogin = new Date();
    await user.save();

    // Welcome notification
    await Notification.create({ userId: user._id, type: 'system', title: 'Welcome to Brand OS', message: 'Your creator hub is ready. Start by adding your first content idea!', icon: 'logo', link: '/ideas' });

    // Welcome email (fire-and-log so SMTP issues never block registration)
    const tmpl = emailTemplates.welcome(name);
    sendEmail({ to: email, ...tmpl }).catch(err => {
      console.warn('Welcome email failed:', err.message);
    });

    res.status(201).json({ accessToken, refreshToken, user });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    user.lastLogin = new Date();
    await user.save();

    sendSecurityEmail({ user, templateName: 'loginAlert', req });

    res.json({ accessToken, refreshToken, user: user.toJSON() });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    let decoded;
    try { decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); }
    catch { return res.status(401).json({ message: 'Invalid or expired refresh token' }); }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !(user.refreshTokens || []).includes(refreshToken)) {
      return res.status(401).json({ message: 'Refresh token revoked' });
    }

    const newAccessToken = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const user = await User.findById(req.user.id).select('+refreshTokens');
      if (user) {
        user.refreshTokens = (user.refreshTokens || []).filter(t => t !== refreshToken);
        await user.save();
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    try {
      const tmpl = emailTemplates.resetPassword(user.name, resetUrl);
      await sendEmail({ to: user.email, ...tmpl });
    } catch {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } }).select('+passwordResetToken +passwordResetExpires');
    if (!user) return res.status(400).json({ message: 'Token is invalid or has expired' });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    await Notification.create({ userId: user._id, type: 'system', title: 'Password changed', message: 'Your account password was reset successfully.', icon: 'logo', link: '/settings' });
    sendSecurityEmail({ user, templateName: 'passwordChanged', req });

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (err) { next(err); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, niche, bio, platforms, monthlyGoals, avatar, website, onboardingDone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, niche, bio, platforms, monthlyGoals, avatar, website, onboardingDone },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword))) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    await Notification.create({ userId: user._id, type: 'system', title: 'Password changed', message: 'Your account password was changed successfully.', icon: 'logo', link: '/settings' });
    sendSecurityEmail({ user, templateName: 'passwordChanged', req });

    res.json({ message: 'Password changed successfully' });
  } catch (err) { next(err); }
};
