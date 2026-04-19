const User = require('../models/User');
const Organ = require('../models/Organ');
const BloodUnit = require('../models/BloodUnit');
const Request = require('../models/Request');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Protected
 */
const getStats = asyncHandler(async (req, res) => {
  const [
    totalOrgans,
    availableOrgans,
    totalBloodUnits,
    availableBlood,
    totalRequests,
    pendingRequests,
    completedRequests,
    emergencyRequests,
    totalUsers,
  ] = await Promise.all([
    Organ.countDocuments(),
    Organ.countDocuments({ status: 'AVAILABLE' }),
    BloodUnit.countDocuments(),
    BloodUnit.countDocuments({ status: 'AVAILABLE', expiryDate: { $gt: new Date() } }),
    Request.countDocuments(),
    Request.countDocuments({ status: 'PENDING' }),
    Request.countDocuments({ status: 'COMPLETED' }),
    Request.countDocuments({ urgency: 'EMERGENCY' }),
    User.countDocuments({ isActive: true }),
  ]);

  const successRate = totalRequests > 0
    ? Math.round((completedRequests / totalRequests) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      organs: { total: totalOrgans, available: availableOrgans },
      blood: { total: totalBloodUnits, available: availableBlood },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
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
  const { limit = 20 } = req.query;

  const logs = await AuditLog.find()
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
  const bloodDistribution = await BloodUnit.aggregate([
    { $match: { status: 'AVAILABLE' } },
    {
      $group: {
        _id: '$bloodGroup',
        count: { $sum: '$units' },
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
        available: { $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] } },
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
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments({ recipient: req.user._id }),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
  });
});

/**
 * @desc    Mark notifications as read
 * @route   PUT /api/dashboard/notifications/read
 * @access  Protected
 */
const markNotificationsRead = asyncHandler(async (req, res) => {
  const { ids } = req.body; // Array of notification IDs, or [] for all

  const filter = { recipient: req.user._id, isRead: false };
  if (ids && ids.length > 0) {
    filter._id = { $in: ids };
  }

  await Notification.updateMany(filter, { isRead: true, readAt: new Date() });

  res.json({ success: true, message: 'Notifications marked as read' });
});

module.exports = { getStats, getActivity, getAnalytics, getNotifications, markNotificationsRead };
