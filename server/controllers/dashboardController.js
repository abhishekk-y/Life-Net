const User = require('../models/User');
const Organ = require('../models/Organ');
const BloodUnit = require('../models/BloodUnit');
const Request = require('../models/Request');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Protected
 */
const getStats = asyncHandler(async (req, res) => {
  const utcToday = new Date();
  utcToday.setUTCHours(0, 0, 0, 0);
  let requestFilter = {};
  if (req.user.role === 'HOSPITAL') requestFilter = { hospital: req.user._id };
  else if (req.user.role === 'BLOOD_BANK') requestFilter = { type: 'BLOOD' };
  else if (req.user.role === 'PROCUREMENT_CENTER') requestFilter = { type: 'ORGAN' };
  else if (req.user.role !== 'ADMIN') requestFilter = { requestedBy: req.user._id };

  const [
    totalOrgans,
    availableOrgans,
    bloodStats,
    totalRequests,
    activeRequests,
    completedRequests,
    emergencyRequests,
    totalUsers,
  ] = await Promise.all([
    Organ.countDocuments(),
    Organ.countDocuments({
      status: 'AVAILABLE',
      $expr: {
        $gt: [
          { $add: ['$harvestedAt', { $multiply: ['$viabilityHours', 3600000] }] },
          new Date(),
        ],
      },
    }),
    BloodUnit.aggregate([
      {
        $group: {
          _id: null,
          totalUnits: { $sum: { $ifNull: ['$units', 1] } },
          availableUnits: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$status', 'AVAILABLE'] }, { $gte: ['$expiryDate', utcToday] }] }, { $ifNull: ['$units', 1] }, 0],
            },
          },
        },
      },
    ]),
    Request.countDocuments(requestFilter),
    Request.countDocuments({ ...requestFilter, status: { $in: ['PENDING', 'MATCHED', 'APPROVED', 'IN_TRANSIT'] } }),
    Request.countDocuments({ ...requestFilter, status: 'COMPLETED' }),
    Request.countDocuments({ ...requestFilter, urgency: 'EMERGENCY', status: { $nin: ['REJECTED', 'CANCELLED'] } }),
    req.user.role === 'ADMIN' ? User.countDocuments({ isActive: true }) : Promise.resolve(null),
  ]);

  const successRate = totalRequests > 0
    ? Math.round((completedRequests / totalRequests) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      organs: { total: totalOrgans, available: availableOrgans },
      blood: { total: bloodStats[0]?.totalUnits || 0, available: bloodStats[0]?.availableUnits || 0 },
      requests: {
        total: totalRequests,
        active: activeRequests,
        completed: completedRequests,
        emergency: emergencyRequests,
        successRate,
      },
      users: { total: totalUsers },
    },
  });
});

/**
 * @desc    Get recent activity logs
 * @route   GET /api/dashboard/activity
 * @access  Protected
 */
const getActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const filter = req.user.role === 'ADMIN' ? {} : { performedBy: req.user._id };

  const logs = await AuditLog.find(filter)
    .populate('performedBy', 'name role organization')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({ success: true, data: logs });
});

/**
 * @desc    Get analytics data for charts
 * @route   GET /api/dashboard/analytics
 * @access  ADMIN
 */
const getAnalytics = asyncHandler(async (req, res) => {
  // Requests over the last 30 days (grouped by day)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const requestsTrend = await Request.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Blood group distribution
  const utcToday = new Date();
  utcToday.setUTCHours(0, 0, 0, 0);
  const bloodDistribution = await BloodUnit.aggregate([
    { $match: { status: 'AVAILABLE', expiryDate: { $gte: utcToday } } },
    {
      $group: {
        _id: '$bloodGroup',
        count: { $sum: { $ifNull: ['$units', 1] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Organ type distribution
  const organDistribution = await Organ.aggregate([
    {
      $group: {
        _id: '$organType',
        total: { $sum: 1 },
        available: {
          $sum: {
            $cond: [{ $and: [
              { $eq: ['$status', 'AVAILABLE'] },
              { $gt: [{ $add: ['$harvestedAt', { $multiply: ['$viabilityHours', 3600000] }] }, new Date()] },
            ] }, 1, 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Request urgency breakdown
  const urgencyBreakdown = await Request.aggregate([
    {
      $group: {
        _id: '$urgency',
        count: { $sum: 1 },
      },
    },
  ]);

  // Requests by status
  const statusBreakdown = await Request.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      requestsTrend,
      bloodDistribution,
      organDistribution,
      urgencyBreakdown,
      statusBreakdown,
    },
  });
});

/**
 * @desc    Get user's notifications
 * @route   GET /api/dashboard/notifications
 * @access  Protected
 */
const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipient: req.user._id }),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    },
  });
});

/**
 * @desc    Mark notifications as read
 * @route   PUT /api/dashboard/notifications/read
 * @access  Protected
 */
const markNotificationsRead = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (ids !== undefined && (!Array.isArray(ids) || ids.length > 100 || ids.some((id) => typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)))) {
    throw ApiError.badRequest('Notification IDs must be a list of at most 100 valid IDs.');
  }

  const filter = { recipient: req.user._id, isRead: false };
  if (ids && ids.length > 0) {
    filter._id = { $in: ids };
  }

  await Notification.updateMany(filter, { isRead: true, readAt: new Date() });

  res.json({ success: true, message: 'Notifications marked as read' });
});

module.exports = { getStats, getActivity, getAnalytics, getNotifications, markNotificationsRead };
