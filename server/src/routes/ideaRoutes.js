const express = require('express');
const router = express.Router();
const c = require('../controllers/allControllers');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', c.getIdeas);
router.post('/', c.createIdea);
router.put('/:id', c.updateIdea);
router.delete('/:id', c.deleteIdea);
router.patch('/:id/move', c.moveIdea);

module.exports = router;
