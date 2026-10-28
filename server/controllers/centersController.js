const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAudit } = require('../services/auditService');

const REVIEWABLE_ROLES = ['DOCTOR', 'HOSPITAL', 'PHARMACY', 'SUPPLIER', 'BLOOD_BANK', 'PROCUREMENT_CENTER'];

const getCenters = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const filter = { role: { $in: REVIEWABLE_ROLES }, isActive: true };

  if (req.user.role !== 'ADMIN') filter.verificationStatus = 'APPROVED';
  if (search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { organization: { $regex: escaped, $options: 'i' } },
      { 'address.city': { $regex: escaped, $options: 'i' } },
      { 'address.state': { $regex: escaped, $options: 'i' } },
    ];
  }

  const projection = req.user.role === 'ADMIN'
    ? 'name email role organization phone address providerDetails verificationStatus createdAt lastLogin'
    : 'name email role organization phone address verificationStatus createdAt';
  const centers = await User.find(filter)
    .select(projection)
    .sort({ verificationStatus: 1, organization: 1, name: 1 })
    .lean();

  res.json({ success: true, data: centers });
});

const updateVerification = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw ApiError.badRequest('Verification status must be APPROVED or REJECTED');
  }

  const center = await User.findOneAndUpdate(
    { _id: req.params.id, role: { $in: REVIEWABLE_ROLES } },
    { verificationStatus: status },
    { new: true, runValidators: true }
  ).select('name email role organization verificationStatus');

  if (!center) throw ApiError.notFound('Center not found');

  logAudit({
    action: `CENTER_${status}`,
    performedBy: req.user._id,
    targetModel: 'User',
    targetId: center._id,
    details: { role: center.role, organization: center.organization },
    req,
  });

  res.json({ success: true, data: center });
});

module.exports = { getCenters, updateVerification };
