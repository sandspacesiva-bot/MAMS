const router = require('express').Router();
const { createPurchase, getPurchases } = require('../controllers/purchaseController');
const { protect, authorize, scopeBase } = require('../middleware/authMiddleware');
const { auditLog } = require('../middleware/loggerMiddleware');

router.get('/',  protect, scopeBase, getPurchases);
router.post('/', protect, authorize('admin','base_commander','logistics_officer'), scopeBase,
  auditLog('CREATE_PURCHASE','Purchase'), createPurchase);

module.exports = router;
