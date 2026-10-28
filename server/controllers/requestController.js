const mongoose = require('mongoose');
const Request = require('../models/Request');
const Organ = require('../models/Organ');
const BloodUnit = require('../models/BloodUnit');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAudit } = require('../services/auditService');
const { createNotification, broadcastToRole } = require('../services/notificationService');
const { findOrganMatches, findBloodMatches } = require('../services/matchingService');

const parsePage = (value) => Math.max(1, Number.parseInt(value, 10) || 1);
const parseLimit = (value) => Math.min(100, Math.max(1, Number.parseInt(value, 10) || 20));
const historyEntry = (status, userId, note) => ({ status, changedBy: userId, changedAt: new Date(), ...(note ? { note } : {}) });

const releaseMatchedResource = async (request, session) => {
  if (!request.matchedResource?.resourceId) return;
  const Model = request.matchedResource.resourceType === 'Organ' ? Organ : BloodUnit;
  const now = new Date();
  const update = request.matchedResource.resourceType === 'Organ'
    ? { status: 'AVAILABLE' }
    : { status: 'AVAILABLE' };
  if (request.matchedResource.resourceType === 'Organ') {
    const organ = await Model.findById(request.matchedResource.resourceId).select('harvestedAt viabilityHours').session(session);
    if (!organ || new Date(organ.harvestedAt.getTime() + organ.viabilityHours * 3600000) <= now) update.status = 'EXPIRED';
  } else {
    const unit = await Model.findById(request.matchedResource.resourceId).select('expiryDate').session(session);
    const utcToday = new Date(now);
    utcToday.setUTCHours(0, 0, 0, 0);
    if (!unit || unit.expiryDate < utcToday) update.status = 'EXPIRED';
  }
  await Model.findOneAndUpdate(
    { _id: request.matchedResource.resourceId, status: 'RESERVED' },
    update,
    { session }
  );
};

const getRequests = asyncHandler(async (req, res) => {
  const { status, type, urgency } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (urgency) filter.urgency = urgency;

  if (req.user.role === 'HOSPITAL') {
    filter.hospital = req.user._id;
  } else if (req.user.role === 'BLOOD_BANK') {
    filter.type = 'BLOOD';
    filter.$or = [
      { status: { $in: ['PENDING', 'MATCHED', 'APPROVED'] } },
      { fulfilledBy: req.user._id },
    ];
  } else if (req.user.role === 'PROCUREMENT_CENTER') {
    filter.type = 'ORGAN';
    filter.$or = [
      { status: { $in: ['PENDING', 'MATCHED', 'APPROVED'] } },
      { fulfilledBy: req.user._id },
    ];
  } else if (req.user.role !== 'ADMIN') {
    filter.requestedBy = req.user._id;
  }

  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit);
  const skip = (page - 1) * limit;
  const query = Request.find(filter)
    .populate('requestedBy', 'name organization')
    .populate('hospital', 'name organization')
    .populate('fulfilledBy', 'name organization')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  if (['BLOOD_BANK', 'PROCUREMENT_CENTER'].includes(req.user.role)) {
    query.select('-notes -rejectionReason -statusHistory.note');
  }
  const [total, requests] = await Promise.all([Request.countDocuments(filter), query]);

  res.json({ success: true, data: requests, pagination: { total, page, pages: Math.ceil(total / limit) } });
});

const createRequest = asyncHandler(async (req, res) => {
  const request = await Request.create({
    ...req.body,
    requestedBy: req.user._id,
    hospital: req.user._id,
    statusHistory: [historyEntry('PENDING', req.user._id)],
  });

  logAudit({
    action: 'REQUEST_CREATED',
    performedBy: req.user._id,
    targetModel: 'Request',
    targetId: request._id,
    details: { type: request.type, urgency: request.urgency },
    req,
  });

  const io = req.app.get('io');
  const targetRole = request.type === 'ORGAN' ? 'PROCUREMENT_CENTER' : 'BLOOD_BANK';
  const resourceLabel = request.type === 'ORGAN'
    ? request.resourceDetails.organType
    : `${request.resourceDetails.bloodGroup} blood`;

  await broadcastToRole(io, {
    role: targetRole,
    type: 'APPROVAL_NEEDED',
    title: `New ${request.urgency.toLowerCase()} request`,
    message: `${req.user.organization || req.user.name} requested ${resourceLabel}.`,
    link: '/requests',
    excludeUserId: req.user._id,
  });

  if (request.urgency === 'EMERGENCY') {
    await broadcastToRole(io, {
      role: 'ADMIN',
      type: 'APPROVAL_NEEDED',
      title: 'Emergency request needs review',
      message: `${req.user.organization || req.user.name} requested ${resourceLabel}.`,
      link: '/requests',
      excludeUserId: req.user._id,
    });
    const alert = {
      requestId: request._id,
      type: request.type,
      urgency: request.urgency,
      resource: resourceLabel,
      timestamp: new Date().toISOString(),
    };
    io?.to('role:ADMIN').emit('emergency', alert);
    io?.to(`role:${targetRole}`).emit('emergency', alert);
  }

  res.status(201).json({ success: true, data: request });
});

const matchRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw ApiError.notFound('Request not found');
  if (req.user.role === 'HOSPITAL' && !request.hospital.equals(req.user._id)) {
    throw ApiError.forbidden('You can only review inventory for your own hospital requests.');
  }
  if (req.user.role === 'BLOOD_BANK' && request.type !== 'BLOOD') throw ApiError.forbidden('Blood banks can only review blood requests.');
  if (req.user.role === 'PROCUREMENT_CENTER' && request.type !== 'ORGAN') throw ApiError.forbidden('Procurement centers can only review organ requests.');
  if (!['PENDING', 'MATCHED'].includes(request.status)) {
    throw ApiError.badRequest('Inventory can only be reviewed for pending or matched requests.');
  }
  if (request.status === 'MATCHED') {
    return res.json({ success: true, data: { candidates: [], alreadyMatched: true } });
  }

  const location = req.user.address?.city
    ? { city: req.user.address.city, state: req.user.address.state }
    : undefined;
  const candidates = request.type === 'ORGAN'
    ? await findOrganMatches({
      organType: request.resourceDetails.organType,
      bloodGroup: request.resourceDetails.bloodGroup,
      location,
    })
    : await findBloodMatches({
      bloodGroup: request.resourceDetails.bloodGroup,
      component: request.resourceDetails.component,
      quantity: request.resourceDetails.quantity || 1,
      location,
    });

  const providerRole = request.type === 'ORGAN' ? 'PROCUREMENT_CENTER' : 'BLOOD_BANK';
  const ownerField = request.type === 'ORGAN' ? 'procurementCenter' : 'bloodBank';
  const scopedCandidates = ['BLOOD_BANK', 'PROCUREMENT_CENTER'].includes(req.user.role)
    ? candidates.filter((item) => item[ownerField]?._id?.toString() === req.user._id.toString())
    : candidates;

  const sanitized = scopedCandidates.map((item) => ({
    _id: item._id,
    type: request.type,
    resource: request.type === 'ORGAN' ? item.organType : item.component,
    bloodGroup: item.bloodGroup,
    units: request.type === 'BLOOD' ? item.units : undefined,
    location: item.location,
    expiresAt: request.type === 'ORGAN'
      ? new Date(new Date(item.harvestedAt).getTime() + item.viabilityHours * 3600000)
      : item.expiryDate,
    hoursRemaining: request.type === 'ORGAN' ? item.hoursRemaining : undefined,
    daysUntilExpiry: request.type === 'BLOOD' ? item.daysUntilExpiry : undefined,
    center: item[ownerField] ? {
      name: item[ownerField].name,
      organization: item[ownerField].organization,
    } : undefined,
  }));

  res.json({ success: true, data: { candidates: sanitized, providerRole } });
});

const assignResource = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) throw ApiError.notFound('Request not found');
  if (request.status !== 'PENDING') throw ApiError.badRequest('Only pending requests can be assigned inventory.');

  const resourceType = request.type === 'ORGAN' ? 'Organ' : 'BloodUnit';
  const ownerField = request.type === 'ORGAN' ? 'procurementCenter' : 'bloodBank';
  const providerRole = request.type === 'ORGAN' ? 'PROCUREMENT_CENTER' : 'BLOOD_BANK';
  if (req.user.role !== 'ADMIN' && req.user.role !== providerRole) {
    throw ApiError.forbidden(`Only an administrator or the relevant ${providerRole.toLowerCase().replace('_', ' ')} can assign inventory.`);
  }

  const Model = request.type === 'ORGAN' ? Organ : BloodUnit;
  const filter = {
    _id: req.body.resourceId,
    status: 'AVAILABLE',
    bloodGroup: request.resourceDetails.bloodGroup,
    [ownerField]: req.user.role === 'ADMIN' ? { $exists: true } : req.user._id,
  };
  if (request.type === 'ORGAN') {
    filter.organType = request.resourceDetails.organType;
    filter.$expr = {
      $gt: [
        { $add: ['$harvestedAt', { $multiply: ['$viabilityHours', 3600000] }] },
        new Date(),
      ],
    };
  } else {
    filter.expiryDate = { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) };
    filter.units = { $gte: request.resourceDetails.quantity || 1 };
    if (request.resourceDetails.component) filter.component = request.resourceDetails.component;
  }

  const session = await mongoose.startSession();
  let reserved;
  let assigned;
  try {
    await session.withTransaction(async () => {
      reserved = await Model.findOneAndUpdate(filter, { status: 'RESERVED' }, { new: true, session });
      if (!reserved) throw ApiError.conflict('That inventory is no longer available or does not meet the request details. Refresh the candidates and try again.');
      assigned = await Request.findOneAndUpdate(
        { _id: request._id, status: 'PENDING', matching: { $ne: true } },
        {
          status: 'MATCHED',
          matching: false,
          matchedAt: new Date(),
          fulfilledBy: reserved[ownerField],
          matchedResource: { resourceType, resourceId: reserved._id },
          $push: { statusHistory: historyEntry('MATCHED', req.user._id) },
        },
        { new: true, session }
      );
      if (!assigned) throw ApiError.conflict('This request has already changed. Refresh and try again.');
    });
  } finally {
    await session.endSession();
  }

  logAudit({
    action: 'REQUEST_MATCHED',
    performedBy: req.user._id,
    targetModel: 'Request',
    targetId: assigned._id,
    details: { resourceType, resourceId: reserved._id },
    req,
  });
  await createNotification(req.app.get('io'), {
    recipient: assigned.requestedBy,
    type: 'REQUEST_UPDATE',
    title: 'A center assigned potential inventory',
    message: 'The assigned center must confirm availability and suitability.',
    link: '/requests',
  });
  res.json({ success: true, data: assigned });
});

const approveRequest = asyncHandler(async (req, res) => {
  const request = await Request.findOneAndUpdate(
    { _id: req.params.id, status: 'MATCHED', 'matchedResource.resourceId': { $exists: true } },
    {
      status: 'APPROVED',
      approvedAt: new Date(),
      $push: { statusHistory: historyEntry('APPROVED', req.user._id) },
    },
    { new: true }
  );
  if (!request) {
    const existing = await Request.findById(req.params.id);
    if (!existing) throw ApiError.notFound('Request not found');
    throw ApiError.badRequest('A request must have a reserved resource match before approval.');
  }

  logAudit({ action: 'REQUEST_APPROVED', performedBy: req.user._id, targetModel: 'Request', targetId: request._id, req });
  await createNotification(req.app.get('io'), {
    recipient: request.requestedBy,
    type: 'REQUEST_UPDATE',
    title: 'Request approved',
    message: 'The matched resource is approved for transfer coordination.',
    link: '/requests',
  });
  res.json({ success: true, data: request });
});

const transferRequest = asyncHandler(async (req, res) => {
  const current = await Request.findById(req.params.id);
  if (!current) throw ApiError.notFound('Request not found');
  if (current.status !== 'APPROVED') throw ApiError.badRequest('A request must be approved before transfer.');
  if (!current.matchedResource?.resourceId) throw ApiError.badRequest('This request has no reserved resource.');

  const requiredRole = current.type === 'ORGAN' ? 'PROCUREMENT_CENTER' : 'BLOOD_BANK';
  if (req.user.role !== 'ADMIN' && req.user.role !== requiredRole) {
    throw ApiError.forbidden(`Only the assigned ${requiredRole.toLowerCase().replace('_', ' ')} can start this transfer.`);
  }
  if (req.user.role !== 'ADMIN' && !current.fulfilledBy.equals(req.user._id)) {
    throw ApiError.forbidden('This resource is assigned to another center.');
  }

  const request = await Request.findOneAndUpdate(
    { _id: current._id, status: 'APPROVED' },
    {
      status: 'IN_TRANSIT',
      transferStartedAt: new Date(),
      $push: { statusHistory: historyEntry('IN_TRANSIT', req.user._id) },
    },
    { new: true }
  );
  if (!request) throw ApiError.conflict('This request has already changed. Refresh and try again.');

  logAudit({ action: 'REQUEST_TRANSFERRED', performedBy: req.user._id, targetModel: 'Request', targetId: request._id, req });
  await createNotification(req.app.get('io'), {
    recipient: request.requestedBy,
    type: 'REQUEST_UPDATE',
    title: 'Transfer started',
    message: 'The assigned center has marked the resource in transit.',
    link: '/requests',
  });
  res.json({ success: true, data: request });
});

const completeRequest = asyncHandler(async (req, res) => {
  const current = await Request.findById(req.params.id);
  if (!current) throw ApiError.notFound('Request not found');
  if (req.user.role === 'HOSPITAL' && !current.hospital.equals(req.user._id)) {
    throw ApiError.forbidden('You can only complete a request from your own hospital.');
  }
  if (current.status !== 'IN_TRANSIT') throw ApiError.badRequest('A request must be in transit before it can be completed.');
  if (!current.matchedResource?.resourceId) throw ApiError.badRequest('This request has no reserved resource.');

  const Model = current.matchedResource.resourceType === 'Organ' ? Organ : BloodUnit;
  const session = await mongoose.startSession();
  let request;
  try {
    await session.withTransaction(async () => {
      const activeRequest = await Request.findOne({ _id: current._id, status: 'IN_TRANSIT' }).session(session);
      if (!activeRequest) throw ApiError.conflict('This request has already changed. Refresh and confirm its status.');
      if (!activeRequest.matchedResource?.resourceId) throw ApiError.conflict('The request no longer has a reserved resource.');

      const quantity = activeRequest.resourceDetails.quantity || 1;
      const resourceFilter = { _id: activeRequest.matchedResource.resourceId, status: 'RESERVED' };
      const resourceUpdate = activeRequest.type === 'ORGAN'
        ? { status: 'TRANSPLANTED' }
        : { $inc: { units: -quantity }, $set: { status: 'USED' } };
      if (activeRequest.type === 'BLOOD') {
        resourceFilter.units = { $gte: quantity };
        const remaining = await BloodUnit.findById(resourceFilter._id).select('units expiryDate').session(session);
        if (!remaining || remaining.units < quantity) {
          throw ApiError.conflict('The reserved blood quantity changed. Confirm the stock with the assigned center.');
        }
        if (remaining.units > quantity) {
          const utcToday = new Date(new Date().setUTCHours(0, 0, 0, 0));
          resourceUpdate.$set.status = remaining.expiryDate >= utcToday ? 'AVAILABLE' : 'EXPIRED';
        }
      }
      const resource = await Model.findOneAndUpdate(resourceFilter, resourceUpdate, { new: true, session });
      if (!resource) throw ApiError.conflict('The reserved inventory changed. Confirm its status with the assigned center.');

      request = await Request.findOneAndUpdate(
        { _id: activeRequest._id, status: 'IN_TRANSIT' },
        {
          status: 'COMPLETED',
          completedAt: new Date(),
          $push: { statusHistory: historyEntry('COMPLETED', req.user._id) },
        },
        { new: true, session }
      );
      if (!request) throw ApiError.conflict('This request has already changed. Refresh and confirm its status.');
    });
  } finally {
    await session.endSession();
  }

  logAudit({ action: 'REQUEST_COMPLETED', performedBy: req.user._id, targetModel: 'Request', targetId: request._id, req });
  await createNotification(req.app.get('io'), {
    recipient: request.requestedBy,
    type: 'REQUEST_UPDATE',
    title: 'Request completed',
    message: 'The receiving center has recorded the request as completed.',
    link: '/requests',
  });
  res.json({ success: true, data: request });
});

const rejectRequest = asyncHandler(async (req, res) => {
  const current = await Request.findById(req.params.id);
  if (!current) throw ApiError.notFound('Request not found');
  if (!['PENDING', 'MATCHED', 'APPROVED'].includes(current.status)) {
    throw ApiError.badRequest('A request cannot be declined after transfer has started.');
  }

  const reason = String(req.body?.reason || '').trim().slice(0, 500);
  const session = await mongoose.startSession();
  let request;
  try {
    await session.withTransaction(async () => {
      request = await Request.findOneAndUpdate(
        { _id: current._id, status: current.status },
        {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason: reason,
          $push: { statusHistory: historyEntry('REJECTED', req.user._id, reason) },
        },
        { new: true, session }
      );
      if (!request) throw ApiError.conflict('This request has already changed. Refresh and try again.');
      await releaseMatchedResource(current, session);
    });
  } finally {
    await session.endSession();
  }

  logAudit({ action: 'REQUEST_REJECTED', performedBy: req.user._id, targetModel: 'Request', targetId: request._id, details: { reason }, req });
  await createNotification(req.app.get('io'), {
    recipient: request.requestedBy,
    type: 'REQUEST_UPDATE',
    title: 'Request declined',
    message: reason || 'The request was declined by an administrator.',
    link: '/requests',
  });
  res.json({ success: true, data: request });
});

const cancelRequest = asyncHandler(async (req, res) => {
  const current = await Request.findById(req.params.id);
  if (!current) throw ApiError.notFound('Request not found');
  if (req.user.role !== 'ADMIN' && !current.hospital.equals(req.user._id)) {
    throw ApiError.forbidden('You can only cancel a request from your own hospital.');
  }
  if (!['PENDING', 'MATCHED'].includes(current.status)) {
    throw ApiError.badRequest('Only pending or matched requests can be cancelled.');
  }

  const session = await mongoose.startSession();
  let request;
  try {
    await session.withTransaction(async () => {
      request = await Request.findOneAndUpdate(
        { _id: current._id, status: current.status },
        {
          status: 'CANCELLED',
          $push: { statusHistory: historyEntry('CANCELLED', req.user._id) },
        },
        { new: true, session }
      );
      if (!request) throw ApiError.conflict('This request has already changed. Refresh and try again.');
      await releaseMatchedResource(current, session);
    });
  } finally {
    await session.endSession();
  }
  logAudit({ action: 'REQUEST_CANCELLED', performedBy: req.user._id, targetModel: 'Request', targetId: request._id, req });
  res.json({ success: true, data: request });
});

module.exports = {
  getRequests,
  createRequest,
  matchRequest,
  approveRequest,
  transferRequest,
  completeRequest,
  rejectRequest,
  cancelRequest,
};
