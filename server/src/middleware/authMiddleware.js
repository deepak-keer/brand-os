const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized — no token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    if (!req.user.isActive) return res.status(403).json({ message: 'Account deactivated' });
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    res.status(401).json({ message: 'Invalid token' });
  }
};
