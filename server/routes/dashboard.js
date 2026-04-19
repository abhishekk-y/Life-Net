const express = require('express');
const router = express.Router();
const {
  getStats, getActivity, getAnalytics, getNotifications, markNotificationsRead,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All dashboard routes require authentication

router.get('/stats', getStats);
router.get('/activity', getActivity);
router.get('/analytics', authorize('ADMIN'), getAnalytics);
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsRead);

module.exports = router;
