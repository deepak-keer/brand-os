// analyticsRoutes.js
const express = require('express');
const analyticsRouter = express.Router();
const c = require('../controllers/allControllers');
const { protect } = require('../middleware/authMiddleware');

analyticsRouter.use(protect);
analyticsRouter.get('/stats', c.getOverallStats);
analyticsRouter.get('/', c.getAnalytics);
analyticsRouter.post('/', c.createOrUpdateAnalytics);

module.exports = analyticsRouter;
