const Request = require('../models/Request');
const Organ = require('../models/Organ');
const BloodUnit = require('../models/BloodUnit');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAudit } = require('../services/auditService');
const { createNotification, broadcastToRole } = require('../services/notificationService');

/**
 * @desc    Get all requests (filtered by user role)
 * @route   GET /api/requests
 * @access  Protected
 */
const getRequests = asyncHandler(async (req, res) => {
  const { status, type, urgency, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (urgency) filter.urgency = urgency;

  // Non-admin users see only their own requests
  if (req.user.role !== 'ADMIN') {
    filter.$or = [
      { requestedBy: req.user._id },
      { hospital: req.user._id },
      { fulfilledBy: req.user._id },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Request.countDocuments(filter);

  const requests = await Request.find(filter)
    .populate('requestedBy', 'name organization')
    .populate('hospital', 'name organization')
    .populate('fulfilledBy', 'name organization')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: requests,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
  });
});

/**
 * @desc    Create a new request
 * @route   POST /api/requests
 * @access  HOSPITAL, ADMIN
 */
const createRequest = asyncHandler(async (req, res) => {
  req.body.requestedBy = req.user._id;
  req.body.hospital = req.body.hospital || req.user._id;

  const request = await Request.create(req.body);

  logAudit({
    action: 'REQUEST_CREATED',
    performedBy: req.user._id,
    targetModel: 'Request',
    targetId: request._id,
    details: { type: request.type, urgency: request.urgency },
    req,
  });

  // Notify relevant centers based on request type
  const io = req.app.get('io');
  const targetRole = request.type === 'ORGAN' ? 'PROCUREMENT_CENTER' : 'BLOOD_BANK';

  broadcastToRole(io, {
    role: targetRole,
    type: 'APPROVAL_NEEDED',
    title: `New ${request.urgency} ${request.type} Request`,
    message: `${req.user.organization || req.user.name} has requested ${request.resourceDetails?.organType || request.resourceDetails?.bloodGroup}`,
    link: `/requests/${request._id}`,
    excludeUserId: req.user._id,
  });

  // Emergency broadcast
  if (request.urgency === 'EMERGENCY') {
    io?.emit('emergency', {
      message: `🚨 EMERGENCY: ${request.type} needed — ${request.resourceDetails?.bloodGroup || request.resourceDetails?.organType}`,
      request,
    });
  }

  res.status(201).json({ success: true, data: request });
});

/**
 * @desc    Approve a request
 * @route   PUT /api/requests/:id/approve
 * @access  ADMIN
 */
const approveRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw ApiError.notFound('Request not found');

  if (request.status !== 'PENDING' && request.status !== 'MATCHED') {
    throw ApiError.badRequest(`Cannot approve a request with status: ${request.status}`);
  }

  request.status = 'APPROVED';
  request.approvedAt = new Date();
  request.statusHistory.push({
    status: 'APPROVED',
    changedBy: req.user._id,
    changedAt: new Date(),
    note: req.body.note,
  });
  await request.save();

  logAudit({
    action: 'REQUEST_APPROVED',
    performedBy: req.user._id,
    targetModel: 'Request',
    targetId: request._id,
    req,
  });

  // Notify the requester
  const io = req.app.get('io');
  createNotification(io, {
    recipient: request.requestedBy,
    type: 'REQUEST_UPDATE',
    title: 'Request Approved',
    message: `Your ${request.type} request has been approved`,
    link: `/requests/${request._id}`,
  });

  res.json({ success: true, data: request });
});

/**
 * @desc    Mark request as in transit
 * @route   PUT /api/requests/:id/transfer
 * @access  ADMIN, PROCUREMENT_CENTER, BLOOD_BANK
 */
const transferRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw ApiError.notFound('Request not found');

  if (request.status !== 'APPROVED') {
    throw ApiError.badRequest('Request must be approved before transfer');
  }

  request.status = 'IN_TRANSIT';
  request.transferStartedAt = new Date();
  request.fulfilledBy = req.user._id;
  request.statusHistory.push({
    status: 'IN_TRANSIT',
    changedBy: req.user._id,
    changedAt: new Date(),
  });
  await request.save();

  logAudit({
    action: 'REQUEST_TRANSFERRED',
    performedBy: req.user._id,
    targetModel: 'Request',
    targetId: request._id,
    req,
  });

  const io = req.app.get('io');
  createNotification(io, {
    recipient: request.requestedBy,
    type: 'REQUEST_UPDATE',
    title: 'Resource In Transit',
    message: `Your ${request.type} is being transported`,
    link: `/requests/${request._id}`,
  });

  res.json({ success: true, data: request });
});

/**
 * @desc    Complete a request
 * @route   PUT /api/requests/:id/complete
 * @access  ADMIN, HOSPITAL
 */
const completeRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw ApiError.notFound('Request not found');

  if (request.status !== 'IN_TRANSIT') {
    throw ApiError.badRequest('Request must be in transit to complete');
  }

  request.status = 'COMPLETED';
  request.completedAt = new Date();
  request.statusHistory.push({
    status: 'COMPLETED',
    changedBy: req.user._id,
    changedAt: new Date(),
  });
  await request.save();

  // Update the matched resource status
  if (request.matchedResource?.resourceId) {
    const Model = request.matchedResource.resourceType === 'Organ' ? Organ : BloodUnit;
    await Model.findByIdAndUpdate(request.matchedResource.resourceId, {
      status: request.type === 'ORGAN' ? 'TRANSPLANTED' : 'USED',
    });
  }

  logAudit({
    action: 'REQUEST_COMPLETED',
    performedBy: req.user._id,
    targetModel: 'Request',
    targetId: request._id,
    req,
  });

  res.json({ success: true, data: request });
});

/**
 * @desc    Reject a request
 * @route   PUT /api/requests/:id/reject
 * @access  ADMIN
 */
const rejectRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw ApiError.notFound('Request not found');

  request.status = 'REJECTED';
  request.rejectedAt = new Date();
  request.rejectionReason = req.body.reason;
  request.statusHistory.push({
    status: 'REJECTED',
    changedBy: req.user._id,
    changedAt: new Date(),
    note: req.body.reason,
  });
  await request.save();

  logAudit({
    action: 'REQUEST_REJECTED',
    performedBy: req.user._id,
    targetModel: 'Request',
    targetId: request._id,
    details: { reason: req.body.reason },
    req,
  });

  const io = req.app.get('io');
  createNotification(io, {
    recipient: request.requestedBy,
    type: 'REQUEST_UPDATE',
    title: 'Request Rejected',
    message: `Your ${request.type} request was rejected: ${req.body.reason || 'No reason provided'}`,
    link: `/requests/${request._id}`,
  });

  res.json({ success: true, data: request });
});

module.exports = {
  getRequests, createRequest, approveRequest,
  transferRequest, completeRequest, rejectRequest,
};
