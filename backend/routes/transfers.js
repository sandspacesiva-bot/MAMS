const router = require('express').Router();
const { createTransfer, getTransfers } = require('../controllers/transferController');
const { protect, authorize, scopeBase } = require('../middleware/authMiddleware');
const { auditLog } = require('../middleware/loggerMiddleware');

router.get('/',  protect, scopeBase, getTransfers);
router.post('/', protect, authorize('admin','base_commander','logistics_officer'), scopeBase,
  auditLog('CREATE_TRANSFER','Transfer'), createTransfer);

module.exports = router;
