const express = require('express');
const router = express.Router();
const c = require('../controllers/allControllers');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

router.use(protect);
router.post('/avatar', uploadAvatar, c.uploadAvatar);

module.exports = router;
