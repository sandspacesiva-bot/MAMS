const router = require('express').Router();
const Base = require('../models/Base');
const Asset = require('../models/Asset');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/',        protect, async (req, res) => {
  const bases = await Base.find().populate('commanderId', 'name email');
  res.json(bases);
});
router.get('/assets',  protect, async (req, res) => {
  const assets = await Asset.find();
  res.json(assets);
});

// Security Fix: Only Administrators should be able to create new Bases and Asset types!
router.post('/',       protect, authorize('admin'), async (req, res) => {
  try {
    const base = await Base.create(req.body);
    res.status(201).json(base);
  } catch(e) { res.status(500).json({ message: e.message }); }
});
router.post('/assets', protect, authorize('admin'), async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json(asset);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
