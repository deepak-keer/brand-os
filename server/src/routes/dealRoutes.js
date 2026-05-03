const express = require('express');
const router = express.Router();
const c = require('../controllers/dealController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/summary', c.getSummary);
router.get('/', c.getDeals);
router.post('/', c.createDeal);
router.get('/:id', c.getDeal);
router.put('/:id', c.updateDeal);
router.delete('/:id', c.deleteDeal);

module.exports = router;
