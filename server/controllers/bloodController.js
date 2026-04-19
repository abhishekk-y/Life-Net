const BloodUnit = require('../models/BloodUnit');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAudit } = require('../services/auditService');
const { findBloodMatches } = require('../services/matchingService');

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

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await BloodUnit.countDocuments(filter);

  const units = await BloodUnit.find(filter)
    .populate('bloodBank', 'name organization')
    .populate('addedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean({ virtuals: true });

  res.json({
    success: true,
    data: units,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get single blood unit
 * @route   GET /api/blood/:id
 * @access  Protected
 */
const getBloodUnit = asyncHandler(async (req, res) => {
  const unit = await BloodUnit.findById(req.params.id)
    .populate('bloodBank', 'name organization address')
    .populate('addedBy', 'name')
    .lean({ virtuals: true });

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
    io.emit('blood:new', {
      message: `New ${unit.bloodGroup} ${unit.component} unit added`,
      unit,
    });
  }

  res.status(201).json({ success: true, data: unit });
});

/**
 * @desc    Update blood unit
 * @route   PUT /api/blood/:id
 * @access  BLOOD_BANK, ADMIN
 */
const updateBloodUnit = asyncHandler(async (req, res) => {
  let unit = await BloodUnit.findById(req.params.id);
  if (!unit) throw ApiError.notFound('Blood unit not found');

  unit = await BloodUnit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  logAudit({
    action: 'BLOOD_UPDATED',
    performedBy: req.user._id,
    targetModel: 'BloodUnit',
    targetId: unit._id,
    details: req.body,
    req,
  });

  res.json({ success: true, data: unit });
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
    data: matches,
    total: matches.length,
  });
});

/**
 * @desc    Get blood inventory summary (grouped by blood group)
 * @route   GET /api/blood/summary
 * @access  Protected
 */
const getBloodSummary = asyncHandler(async (req, res) => {
  const summary = await BloodUnit.aggregate([
    { $match: { status: 'AVAILABLE', expiryDate: { $gt: new Date() } } },
    {
      $group: {
        _id: { bloodGroup: '$bloodGroup', component: '$component' },
        totalUnits: { $sum: '$units' },
        totalQuantityMl: { $sum: '$quantity' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.bloodGroup': 1 } },
  ]);

  res.json({ success: true, data: summary });
});

module.exports = {
  getBloodUnits, getBloodUnit, createBloodUnit, updateBloodUnit,
  deleteBloodUnit, matchBlood, getBloodSummary,
};
