const Organ = require('../models/Organ');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAudit } = require('../services/auditService');
const { findOrganMatches } = require('../services/matchingService');
const { getOrganTiming } = require('../utils/resourceTime');

/**
 * @desc    Get all organs with filtering
 * @route   GET /api/organs
 * @access  Protected
 */
const getOrgans = asyncHandler(async (req, res) => {
  const { organType, bloodGroup, status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (organType) filter.organType = organType;
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (status) filter.status = status;
  if (req.user.role === 'PROCUREMENT_CENTER') filter.procurementCenter = req.user._id;

  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;
  const total = await Organ.countDocuments(filter);

  let query = Organ.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit);
  if (req.user.role === 'HOSPITAL') query = query.select('-notes');
  const organs = await query
    .populate('procurementCenter', 'name organization')
    .populate('addedBy', 'name')
    .lean({ virtuals: true });
  const now = Date.now();
  const timedOrgans = organs.map((organ) => ({ ...organ, ...getOrganTiming(organ, now) }));

  res.json({
    success: true,
    data: timedOrgans,
    pagination: {
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
    },
  });
});

/**
 * @desc    Get single organ
 * @route   GET /api/organs/:id
 * @access  Protected
 */
const getOrgan = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === 'PROCUREMENT_CENTER') filter.procurementCenter = req.user._id;
  let query = Organ.findOne(filter);
  if (req.user.role === 'HOSPITAL') query = query.select('-notes');
  const organ = await query
    .populate('procurementCenter', 'name organization address')
    .populate('addedBy', 'name')
    .lean({ virtuals: true });

  if (!organ) throw ApiError.notFound('Organ not found');

  res.json({ success: true, data: { ...organ, ...getOrganTiming(organ) } });
});

/**
 * @desc    Add new organ
 * @route   POST /api/organs
 * @access  PROCUREMENT_CENTER, ADMIN
 */
const createOrgan = asyncHandler(async (req, res) => {
  req.body.addedBy = req.user._id;
  req.body.procurementCenter = req.body.procurementCenter || req.user._id;

  const organ = await Organ.create(req.body);

  // Audit
  logAudit({
    action: 'ORGAN_CREATED',
    performedBy: req.user._id,
    targetModel: 'Organ',
    targetId: organ._id,
    details: { organType: organ.organType, bloodGroup: organ.bloodGroup },
    req,
  });

  // Emit real-time event for new organ availability
  const io = req.app.get('io');
  if (io) {
    const update = {
      message: `New ${organ.organType} (${organ.bloodGroup}) listed`,
      resourceId: organ._id,
      organType: organ.organType,
      bloodGroup: organ.bloodGroup,
      location: { city: organ.location?.city, state: organ.location?.state },
      timestamp: new Date().toISOString(),
    };
    io.to('role:ADMIN').emit('organ:new', update);
    io.to('role:HOSPITAL').emit('organ:new', update);
    io.to('role:PROCUREMENT_CENTER').emit('organ:new', update);
  }

  res.status(201).json({ success: true, data: organ });
});

/**
 * @desc    Update organ
 * @route   PUT /api/organs/:id
 * @access  PROCUREMENT_CENTER, ADMIN
 */
const updateOrgan = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'ADMIN') filter.procurementCenter = req.user._id;
  const organ = await Organ.findOne(filter);
  if (!organ) throw ApiError.notFound('Organ not found');
  if (organ.status === 'RESERVED' || organ.status === 'MATCHED') {
    throw ApiError.conflict('Reserved organ records can only be changed through their request workflow.');
  }
  if (req.body.status === 'EXPIRED' && organ.isViable) {
    throw ApiError.badRequest('The reported viability window has not elapsed.');
  }

  const updated = await Organ.findOneAndUpdate(filter, req.body, {
    new: true,
    runValidators: true,
  });

  logAudit({
    action: 'ORGAN_UPDATED',
    performedBy: req.user._id,
    targetModel: 'Organ',
    targetId: updated._id,
    details: req.body,
    req,
  });

  res.json({ success: true, data: updated });
});

/**
 * @desc    Delete organ
 * @route   DELETE /api/organs/:id
 * @access  ADMIN
 */
const deleteOrgan = asyncHandler(async (req, res) => {
  const organ = await Organ.findById(req.params.id);
  if (!organ) throw ApiError.notFound('Organ not found');

  await organ.deleteOne();

  logAudit({
    action: 'ORGAN_DELETED',
    performedBy: req.user._id,
    targetModel: 'Organ',
    targetId: organ._id,
    req,
  });

  res.json({ success: true, message: 'Organ removed' });
});

/**
 * @desc    Smart match organs for a patient
 * @route   POST /api/organs/match
 * @access  HOSPITAL, ADMIN
 */
const matchOrgans = asyncHandler(async (req, res) => {
  const { organType, bloodGroup, location } = req.body;

  if (!organType || !bloodGroup) {
    throw ApiError.badRequest('organType and bloodGroup are required');
  }

  const matches = await findOrganMatches({
    organType,
    bloodGroup,
    location,
  });

  res.json({
    success: true,
    data: matches.map((organ) => ({
      _id: organ._id,
      organType: organ.organType,
      bloodGroup: organ.bloodGroup,
      location: { city: organ.location?.city, state: organ.location?.state },
      hoursRemaining: organ.hoursRemaining,
      center: organ.procurementCenter ? { name: organ.procurementCenter.name, organization: organ.procurementCenter.organization } : undefined,
    })),
    total: matches.length,
  });
});

module.exports = { getOrgans, getOrgan, createOrgan, updateOrgan, deleteOrgan, matchOrgans };
