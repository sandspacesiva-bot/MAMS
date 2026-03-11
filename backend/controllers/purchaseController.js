const Purchase = require('../models/Purchase');
const mongoose = require('mongoose');

exports.createPurchase = async (req, res) => {
  try {
    const { assetId, baseId, quantity, unitCost, purchaseDate, notes } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number greater than zero.' });
    }

    const effectiveBase = req.user.role === 'admin' ? baseId : req.scopedBaseId;
    if (!effectiveBase) {
      return res.status(400).json({ message: 'A military base must be specified for this transaction.' });
    }

    const purchase = await Purchase.create({
      assetId, baseId: effectiveBase, quantity, unitCost, purchaseDate, notes,
      recordedBy: req.user._id
    });
    await purchase.populate(['assetId', 'baseId', 'recordedBy']);
    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const { startDate, endDate, baseId, assetType, page = 1, limit = 20 } = req.query;
    const match = {};
    const scopedBase = req.scopedBaseId || baseId;
    if (scopedBase) match.baseId = new mongoose.Types.ObjectId(scopedBase);
    if (startDate || endDate) {
      match.purchaseDate = {};
      if (startDate) match.purchaseDate.$gte = new Date(startDate);
      if (endDate)   match.purchaseDate.$lte = new Date(endDate);
    }
    const pipeline = [
      { $match: match },
      { $lookup: { from: 'assets', localField: 'assetId', foreignField: '_id', as: 'asset' } },
      { $unwind: '$asset' },
      ...(assetType ? [{ $match: { 'asset.type': assetType } }] : []),
      { $lookup: { from: 'bases',  localField: 'baseId',  foreignField: '_id', as: 'base' } },
      { $unwind: '$base' },
      { $lookup: { from: 'users',  localField: 'recordedBy', foreignField: '_id', as: 'recorder' } },
      { $unwind: { path: '$recorder', preserveNullAndEmptyArrays: true } },
      { $sort: { purchaseDate: -1 } },
      { $skip: (page - 1) * Number(limit) },
      { $limit: Number(limit) }
    ];
    const [purchases, total] = await Promise.all([
      Purchase.aggregate(pipeline),
      Purchase.countDocuments(match)
    ]);
    res.json({ purchases, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
