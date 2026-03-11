const Transfer = require('../models/Transfer');
const { getAvailableStock } = require('../utils/stockUtils');
const mongoose = require('mongoose');

exports.createTransfer = async (req, res) => {
  try {
    const { assetId, fromBaseId, toBaseId, quantity, transferDate, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number greater than zero.' });
    }

    if (fromBaseId === toBaseId)
      return res.status(400).json({ message: 'Cannot transfer to the same base' });

    // ✅ Stock validation: check if source base has enough of this asset
    const available = await getAvailableStock(fromBaseId, assetId);

    if (available < quantity) {
      return res.status(400).json({
        message: `Insufficient stock at source base. Available: ${available}, Requested: ${quantity}`
      });
    }

    const transfer = await Transfer.create({
      assetId, fromBaseId, toBaseId, quantity,
      transferDate: transferDate || Date.now(),
      notes,
      initiatedBy: req.user._id
    });

    await transfer.populate(['assetId', 'fromBaseId', 'toBaseId', 'initiatedBy']);
    res.status(201).json(transfer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const { startDate, endDate, baseId, page = 1, limit = 20 } = req.query;
    const scopedBase = req.scopedBaseId || baseId;
    const match = {};
    if (scopedBase) {
      const oid = new mongoose.Types.ObjectId(scopedBase);
      match.$or = [{ fromBaseId: oid }, { toBaseId: oid }];
    }
    if (startDate || endDate) {
      match.transferDate = {};
      if (startDate) match.transferDate.$gte = new Date(startDate);
      if (endDate)   match.transferDate.$lte = new Date(endDate);
    }
    const transfers = await Transfer.find(match)
      .populate('assetId fromBaseId toBaseId initiatedBy')
      .sort({ transferDate: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Transfer.countDocuments(match);
    res.json({ transfers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
