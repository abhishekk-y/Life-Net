const Organ = require('../models/Organ');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAudit } = require('../services/auditService');
const { findOrganMatches } = require('../services/matchingService');

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

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Organ.countDocuments(filter);

  const organs = await Organ.find(filter)
    .populate('procurementCenter', 'name organization')
    .populate('addedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean({ virtuals: true });

  res.json({
    success: true,
    data: organs,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get single organ
 * @route   GET /api/organs/:id
 * @access  Protected
 */
const getOrgan = asyncHandler(async (req, res) => {
  const organ = await Organ.findById(req.params.id)
    .populate('procurementCenter', 'name organization address')
    .populate('addedBy', 'name')
    .lean({ virtuals: true });

  if (!organ) throw ApiError.notFound('Organ not found');

  res.json({ success: true, data: organ });
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
    io.emit('organ:new', {
      message: `New ${organ.organType} (${organ.bloodGroup}) available`,
      organ,
    });
  }

  res.status(201).json({ success: true, data: organ });
});

/**
 * @desc    Update organ
 * @route   PUT /api/organs/:id
 * @access  PROCUREMENT_CENTER, ADMIN
 */
const updateOrgan = asyncHandler(async (req, res) => {
  let organ = await Organ.findById(req.params.id);
  if (!organ) throw ApiError.notFound('Organ not found');

  organ = await Organ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  logAudit({
    action: 'ORGAN_UPDATED',
    performedBy: req.user._id,
    targetModel: 'Organ',
    targetId: organ._id,
    details: req.body,
    req,
  });

  res.json({ success: true, data: organ });
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
  const { organType, bloodGroup, patientAge, location } = req.body;

  if (!organType || !bloodGroup) {
    throw ApiError.badRequest('organType and bloodGroup are required');
  }

  const matches = await findOrganMatches({
    organType,
    bloodGroup,
    patientAge,
    location,
  });

  res.json({
    success: true,
    data: matches,
    total: matches.length,
  });
});

module.exports = { getOrgans, getOrgan, createOrgan, updateOrgan, deleteOrgan, matchOrgans };
