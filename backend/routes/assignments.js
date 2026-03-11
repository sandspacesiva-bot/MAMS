const router = require('express').Router();
const { createAssignment, getAssignments } = require('../controllers/assignmentController');
const { protect, authorize, scopeBase } = require('../middleware/authMiddleware');
const { auditLog } = require('../middleware/loggerMiddleware');

router.get('/',  protect, scopeBase, getAssignments);
router.post('/', protect, authorize('admin','base_commander'), scopeBase,
  auditLog('CREATE_ASSIGNMENT','Assignment'), createAssignment);

module.exports = router;
