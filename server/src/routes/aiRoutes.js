const express = require('express');
const router = express.Router();
const c = require('../controllers/allControllers');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { message: 'Too many AI requests. Slow down!' } });

router.use(protect);
router.post('/caption', aiLimiter, c.generateCaption);
router.post('/ideas', aiLimiter, c.generateIdeas);
router.post('/hashtags', aiLimiter, c.generateHashtags);
router.post('/bio', aiLimiter, c.generateBio);

module.exports = router;
