const BloodUnit = require('../models/BloodUnit');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAudit } = require('../services/auditService');
const { findBloodMatches } = require('../services/matchingService');

const normalizeDateOnlyExpiry = (value) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0) {
    date.setUTCHours(23, 59, 59, 999);
  }
  return date;
};

/**
 * @desc    Get all blood units with filtering
 * @route   GET /api/blood
 * @access  Protected
 */
const getBloodUnits = asyncHandler(async (req, res) => {
  const { bloodGroup, component, status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (component) filter.component = component;
  if (status) filter.status = status;
  if (req.user.role === 'BLOOD_BANK') filter.bloodBank = req.user._id;
  if (req.user.role === 'PATIENT') {
    filter.status = 'AVAILABLE';
    filter.expiryDate = { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) };
  }

  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;
  const total = await BloodUnit.countDocuments(filter);

  let query = BloodUnit.find(filter)
    .populate('bloodBank', 'name organization')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit);
  if (['BLOOD_BANK', 'ADMIN'].includes(req.user.role)) query = query.populate('addedBy', 'name');
  if (req.user.role === 'PATIENT') query = query.select('bloodGroup component quantity units status expiryDate location bloodBank updatedAt');
  if (req.user.role === 'HOSPITAL') query = query.select('-donorId -notes');
  const units = await query.lean({ virtuals: true });

  res.json({
    success: true,
    data: units,
    pagination: {
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
    },
  });
});

/**
 * @desc    Get single blood unit
 * @route   GET /api/blood/:id
 * @access  Protected
 */
const getBloodUnit = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === 'BLOOD_BANK') filter.bloodBank = req.user._id;
  if (req.user.role === 'PATIENT') {
    filter.status = 'AVAILABLE';
    filter.expiryDate = { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) };
  }
  let query = BloodUnit.findOne(filter).populate('bloodBank', 'name organization address');
  if (req.user.role === 'PATIENT') query = query.select('bloodGroup component quantity units status expiryDate location bloodBank updatedAt');
  else if (['BLOOD_BANK', 'ADMIN'].includes(req.user.role)) query = query.populate('addedBy', 'name');
  if (req.user.role === 'HOSPITAL') query = query.select('-donorId -notes');
  query = query.lean({ virtuals: true });
  const unit = await query;

  if (!unit) throw ApiError.notFound('Blood unit not found');

  res.json({ success: true, data: unit });
});

/**
 * @desc    Add new blood unit
 * @route   POST /api/blood
 * @access  BLOOD_BANK, ADMIN
 */
const createBloodUnit = asyncHandler(async (req, res) => {
  req.body.addedBy = req.user._id;
  req.body.bloodBank = req.body.bloodBank || req.user._id;
  req.body.expiryDate = normalizeDateOnlyExpiry(req.body.expiryDate);
  const utcToday = new Date();
  utcToday.setUTCHours(0, 0, 0, 0);
  if (req.body.expiryDate < utcToday) req.body.status = 'EXPIRED';

  const unit = await BloodUnit.create(req.body);

  logAudit({
    action: 'BLOOD_CREATED',
    performedBy: req.user._id,
    targetModel: 'BloodUnit',
    targetId: unit._id,
    details: { bloodGroup: unit.bloodGroup, component: unit.component },
    req,
  });

  // Real-time event
  const io = req.app.get('io');
  if (io) {
    const update = {
      message: `New ${unit.bloodGroup} ${unit.component} stock listed`,
      resourceId: unit._id,
      bloodGroup: unit.bloodGroup,
      component: unit.component,
      units: unit.units,
      expiryDate: unit.expiryDate,
      location: { city: unit.location?.city, state: unit.location?.state },
      timestamp: new Date().toISOString(),
    };
    io.to('role:ADMIN').emit('blood:new', update);
    io.to('role:HOSPITAL').emit('blood:new', update);
  }

  res.status(201).json({ success: true, data: unit });
});

/**
 * @desc    Update blood unit
 * @route   PUT /api/blood/:id
 * @access  BLOOD_BANK, ADMIN
 */
const updateBloodUnit = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'ADMIN') filter.bloodBank = req.user._id;
  const unit = await BloodUnit.findOne(filter);
  if (!unit) throw ApiError.notFound('Blood unit not found');
  if (unit.status === 'RESERVED' || unit.status === 'USED') throw ApiError.conflict('Reserved or consumed stock cannot be edited.');
  if (req.body.expiryDate) req.body.expiryDate = normalizeDateOnlyExpiry(req.body.expiryDate);
  const utcToday = new Date(new Date().setUTCHours(0, 0, 0, 0));
  if (req.body.status === 'AVAILABLE' && normalizeDateOnlyExpiry(req.body.expiryDate || unit.expiryDate) < utcToday) throw ApiError.badRequest('Expired stock cannot be marked available.');
  if (req.body.status === 'EXPIRED' && normalizeDateOnlyExpiry(req.body.expiryDate || unit.expiryDate) >= utcToday) throw ApiError.badRequest('Stock that has not passed its recorded expiry date cannot be marked expired.');

  const updated = await BloodUnit.findOneAndUpdate(filter, req.body, {
    new: true,
    runValidators: true,
  });

  logAudit({
    action: 'BLOOD_UPDATED',
    performedBy: req.user._id,
    targetModel: 'BloodUnit',
    targetId: updated._id,
    details: req.body,
    req,
  });

  res.json({ success: true, data: updated });
});

/**
 * @desc    Delete blood unit
 * @route   DELETE /api/blood/:id
 * @access  ADMIN
 */
const deleteBloodUnit = asyncHandler(async (req, res) => {
  const unit = await BloodUnit.findById(req.params.id);
  if (!unit) throw ApiError.notFound('Blood unit not found');

  await unit.deleteOne();

  logAudit({
    action: 'BLOOD_DELETED',
    performedBy: req.user._id,
    targetModel: 'BloodUnit',
    targetId: unit._id,
    req,
  });

  res.json({ success: true, message: 'Blood unit removed' });
});

/**
 * @desc    Smart match blood units
 * @route   POST /api/blood/match
 * @access  HOSPITAL, ADMIN
 */
const matchBlood = asyncHandler(async (req, res) => {
  const { bloodGroup, component, quantity, location } = req.body;

  if (!bloodGroup) {
    throw ApiError.badRequest('bloodGroup is required');
  }

  const matches = await findBloodMatches({ bloodGroup, component, quantity, location });

  res.json({
    success: true,
    data: matches.map((unit) => ({
      _id: unit._id,
      bloodGroup: unit.bloodGroup,
      component: unit.component,
      units: unit.units,
      location: unit.location,
      expiryDate: unit.expiryDate,
      daysUntilExpiry: unit.daysUntilExpiry,
      center: unit.bloodBank ? { name: unit.bloodBank.name, organization: unit.bloodBank.organization } : undefined,
    })),
    total: matches.length,
  });
});

/**
 * @desc    Get blood inventory summary (grouped by blood group)
 * @route   GET /api/blood/summary
 * @access  Protected
 */
const getBloodSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const utcToday = new Date(now);
  utcToday.setUTCHours(0, 0, 0, 0);
  const staleBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const match = req.user.role === 'BLOOD_BANK' ? { $match: { bloodBank: req.user._id } } : { $match: {} };
  const breakdown = await BloodUnit.aggregate([
    match,
    { $addFields: { _units: { $ifNull: ['$units', 1] } } },
    {
      $group: {
        _id: { bloodGroup: '$bloodGroup', component: '$component' },
        listingCount: { $sum: 1 },
        totalUnits: { $sum: '$_units' },
        availableUnits: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'AVAILABLE'] }, { $gte: ['$expiryDate', utcToday] }] }, '$_units', 0] } },
        reservedUnits: { $sum: { $cond: [{ $eq: ['$status', 'RESERVED'] }, '$_units', 0] } },
        usedUnits: { $sum: { $cond: [{ $eq: ['$status', 'USED'] }, '$_units', 0] } },
        expiredUnits: { $sum: { $cond: [{ $or: [{ $eq: ['$status', 'EXPIRED'] }, { $lt: ['$expiryDate', utcToday] }] }, '$_units', 0] } },
        expiringSoonUnits: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'AVAILABLE'] }, { $gte: ['$expiryDate', utcToday] }, { $lte: ['$expiryDate', new Date(utcToday.getTime() + 7 * 24 * 60 * 60 * 1000)] }] }, '$_units', 0] } },
        staleUnits: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'AVAILABLE'] }, { $gte: ['$expiryDate', utcToday] }, { $lt: ['$updatedAt', staleBefore] }] }, '$_units', 0] } },
        totalVolumeMl: { $sum: { $multiply: ['$quantity', '$_units'] } },
        lastUpdated: { $max: '$updatedAt' },
      },
    },
    { $sort: { '_id.bloodGroup': 1, '_id.component': 1 } },
  ]);

  const totals = breakdown.reduce((sum, group) => ({
    listingCount: sum.listingCount + group.listingCount,
    totalUnits: sum.totalUnits + group.totalUnits,
    availableUnits: sum.availableUnits + group.availableUnits,
    reservedUnits: sum.reservedUnits + group.reservedUnits,
    usedUnits: sum.usedUnits + group.usedUnits,
    expiredUnits: sum.expiredUnits + group.expiredUnits,
    expiringSoonUnits: sum.expiringSoonUnits + group.expiringSoonUnits,
    staleUnits: sum.staleUnits + group.staleUnits,
    totalVolumeMl: sum.totalVolumeMl + group.totalVolumeMl,
  }), {
    listingCount: 0,
    totalUnits: 0,
    availableUnits: 0,
    reservedUnits: 0,
    usedUnits: 0,
    expiredUnits: 0,
    expiringSoonUnits: 0,
    staleUnits: 0,
    totalVolumeMl: 0,
  });

  res.json({ success: true, data: { generatedAt: now, freshnessThresholdHours: 24, totals, breakdown } });
});

module.exports = {
  getBloodUnits, getBloodUnit, createBloodUnit, updateBloodUnit,
  deleteBloodUnit, matchBlood, getBloodSummary,
};
