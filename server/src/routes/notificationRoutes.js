const express = require('express');
const router = express.Router();
const c = require('../controllers/allControllers');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', c.getNotifications);
router.patch('/read-all', c.markAllRead);
router.patch('/:id/read', c.markRead);
router.delete('/:id', c.deleteNotification);

module.exports = router;
