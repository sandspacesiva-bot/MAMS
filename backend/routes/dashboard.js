const router = require('express').Router();
const { getMetrics } = require('../controllers/dashboardController');
const { protect, scopeBase } = require('../middleware/authMiddleware');

router.get('/metrics', protect, scopeBase, getMetrics);

module.exports = router;
