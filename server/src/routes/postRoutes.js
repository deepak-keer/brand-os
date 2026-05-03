const express = require('express');
const router = express.Router();
const p = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { uploadThumbnail } = require('../middleware/uploadMiddleware');

router.use(protect);
router.get('/calendar', p.getCalendar);
router.get('/', p.getPosts);
router.post('/', uploadThumbnail, p.createPost);
router.get('/:id', p.getPost);
router.put('/:id', uploadThumbnail, p.updatePost);
router.delete('/:id', p.deletePost);
router.patch('/:id/status', p.updateStatus);

module.exports = router;
