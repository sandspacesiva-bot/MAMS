const Assignment = require('../models/Assignment');
const { getAvailableStock } = require('../utils/stockUtils');

exports.createAssignment = async (req, res) => {
  try {
    const { assetId, baseId, personnelName, personnelId, quantity, type, date, notes } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number greater than zero.' });
    }

    const effectiveBase = req.user.role === 'admin' ? baseId : req.scopedBaseId;
    if (!effectiveBase) {
      return res.status(400).json({ message: 'A military base must be specified for this assignment.' });
    }

    // ✅ Stock validation before assigning or expending an asset
    const available = await getAvailableStock(effectiveBase, assetId);

    if (available < quantity) {
      return res.status(400).json({
        message: `Insufficient stock at base. Available: ${available}, Requested: ${quantity}`
      });
    }

    const assignment = await Assignment.create({
      assetId, baseId: effectiveBase, personnelName, personnelId,
      quantity, type, date, notes, assignedBy: req.user._id
    });
    
    await assignment.populate(['assetId', 'baseId', 'assignedBy']);
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const { startDate, endDate, baseId, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    const scopedBase = req.scopedBaseId || baseId;
    if (scopedBase) filter.baseId = scopedBase;
    if (type)       filter.type   = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }
    const assignments = await Assignment.find(filter)
      .populate('assetId baseId assignedBy')
      .sort({ date: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Assignment.countDocuments(filter);
    res.json({ assignments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
