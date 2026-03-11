const Purchase   = require('../models/Purchase');
const Transfer   = require('../models/Transfer');
const Assignment = require('../models/Assignment');
const mongoose   = require('mongoose');

exports.getMetrics = async (req, res) => {
  try {
    const { startDate, endDate, baseId, assetType } = req.query;
    const scopedBase = req.scopedBaseId || baseId;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate)   dateFilter.$lte = new Date(endDate);

    const assetTypeFilter = assetType ? [{ $match: { 'asset.type': assetType } }] : [];

    const buildPipeline = (matchObj, extraFilters = []) => [
      { $match: matchObj },
      { $lookup: { from: 'assets', localField: 'assetId', foreignField: '_id', as: 'asset' } },
      { $unwind: '$asset' },
      ...assetTypeFilter,
      ...extraFilters,
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ];

    // Build purchase match
    const purchaseMatch = {};
    if (scopedBase) purchaseMatch.baseId = new mongoose.Types.ObjectId(scopedBase);
    if (Object.keys(dateFilter).length) purchaseMatch.purchaseDate = dateFilter;

    // Transfers IN to this base
    const transferInMatch = {};
    if (scopedBase) transferInMatch.toBaseId = new mongoose.Types.ObjectId(scopedBase);
    if (Object.keys(dateFilter).length) transferInMatch.transferDate = dateFilter;

    // Transfers OUT from this base
    const transferOutMatch = {};
    if (scopedBase) transferOutMatch.fromBaseId = new mongoose.Types.ObjectId(scopedBase);
    if (Object.keys(dateFilter).length) transferOutMatch.transferDate = dateFilter;

    // Assignments
    const assignMatch = {};
    if (scopedBase) assignMatch.baseId = new mongoose.Types.ObjectId(scopedBase);
    if (Object.keys(dateFilter).length) assignMatch.date = dateFilter;

    const [purchases, transferIn, transferOut, assigned, expended] = await Promise.all([
      Purchase.aggregate(buildPipeline(purchaseMatch)),
      Transfer.aggregate(buildPipeline(transferInMatch)),
      Transfer.aggregate(buildPipeline(transferOutMatch)),
      Assignment.aggregate(buildPipeline(assignMatch, [{ $match: { type: 'assigned' } }])),
      Assignment.aggregate(buildPipeline(assignMatch, [{ $match: { type: 'expended' } }]))
    ]);

    const p  = purchases[0]?.total   || 0;
    const ti = transferIn[0]?.total  || 0;
    const to = transferOut[0]?.total || 0;
    const a  = assigned[0]?.total    || 0;
    const e  = expended[0]?.total    || 0;

    // Calculate Opening Balance if startDate is provided
    let openingBalance = 0;
    if (startDate) {
      const historyDateFilter = { $lt: new Date(startDate) };

      // Historical Purchases
      const histPurchaseMatch = {};
      if (scopedBase) histPurchaseMatch.baseId = new mongoose.Types.ObjectId(scopedBase);
      histPurchaseMatch.purchaseDate = historyDateFilter;

      // Historical Transfers IN
      const histTransferInMatch = {};
      if (scopedBase) histTransferInMatch.toBaseId = new mongoose.Types.ObjectId(scopedBase);
      histTransferInMatch.transferDate = historyDateFilter;

      // Historical Transfers OUT
      const histTransferOutMatch = {};
      if (scopedBase) histTransferOutMatch.fromBaseId = new mongoose.Types.ObjectId(scopedBase);
      histTransferOutMatch.transferDate = historyDateFilter;

      // Historical Assignments
      const histAssignMatch = {};
      if (scopedBase) histAssignMatch.baseId = new mongoose.Types.ObjectId(scopedBase);
      histAssignMatch.date = historyDateFilter;

      const [histPurchases, histTransferIn, histTransferOut, histAssigned, histExpended] = await Promise.all([
        Purchase.aggregate(buildPipeline(histPurchaseMatch)),
        Transfer.aggregate(buildPipeline(histTransferInMatch)),
        Transfer.aggregate(buildPipeline(histTransferOutMatch)),
        Assignment.aggregate(buildPipeline(histAssignMatch, [{ $match: { type: 'assigned' } }])),
        Assignment.aggregate(buildPipeline(histAssignMatch, [{ $match: { type: 'expended' } }]))
      ]);

      const hp  = histPurchases[0]?.total   || 0;
      const hti = histTransferIn[0]?.total  || 0;
      const hto = histTransferOut[0]?.total || 0;
      const ha  = histAssigned[0]?.total    || 0;
      const he  = histExpended[0]?.total    || 0;

      openingBalance = hp + hti - hto - ha - he;
    }

    const netMovement    = p + ti - to;
    const closingBalance = openingBalance + netMovement - a - e;

    res.json({
      openingBalance,
      closingBalance,
      netMovement,
      breakdown: { purchases: p, transferIn: ti, transferOut: to },
      assigned: a,
      expended: e
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
