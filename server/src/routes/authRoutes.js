const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', protect, auth.logout);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password/:token', auth.resetPassword);
router.get('/me', protect, auth.getMe);
router.put('/me', protect, auth.updateMe);
router.put('/change-password', protect, auth.changePassword);

module.exports = router;
