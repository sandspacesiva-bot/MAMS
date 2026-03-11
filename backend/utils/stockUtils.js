const mongoose   = require('mongoose');
const Purchase   = require('../models/Purchase');
const Transfer   = require('../models/Transfer');
const Assignment = require('../models/Assignment');

/**
 * Calculate actual available stock of a specific asset at a specific base.
 * Equals: Purchases + Transfers In - Transfers Out - Assigned - Expended
 */
exports.getAvailableStock = async (baseId, assetId) => {
  const base  = new mongoose.Types.ObjectId(baseId);
  const asset = new mongoose.Types.ObjectId(assetId);

  const [purchased, transferIn, transferOut, assigned, expended] = await Promise.all([
    Purchase.aggregate([
      { $match: { baseId: base, assetId: asset } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]),
    Transfer.aggregate([
      { $match: { toBaseId: base, assetId: asset } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]),
    Transfer.aggregate([
      { $match: { fromBaseId: base, assetId: asset } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]),
    Assignment.aggregate([
      { $match: { baseId: base, assetId: asset, type: 'assigned' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]),
    Assignment.aggregate([
      { $match: { baseId: base, assetId: asset, type: 'expended' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]),
  ]);

  const p  = purchased[0]?.total   || 0;
  const ti = transferIn[0]?.total  || 0;
  const to = transferOut[0]?.total || 0;
  const a  = assigned[0]?.total    || 0;
  const e  = expended[0]?.total    || 0;

  return p + ti - to - a - e;
};
