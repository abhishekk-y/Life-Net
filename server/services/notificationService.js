const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Create a notification and emit via Socket.io if the user is online.
 * @param {Object} io - Socket.io server instance
 * @param {Object} data - { recipient, type, title, message, link }
 */
const createNotification = async (io, { recipient, type, title, message, link }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      link,
    });

    // Emit to the specific user's room (they join a room named after their user ID)
    if (io) {
      io.to(recipient.toString()).emit('notification', notification);
    }

    return notification;
  } catch (err) {
    logger.error(`Notification creation failed: ${err.message}`);
    return null;
  }
};

/**
 * Broadcast notification to all users with a specific role.
 */
const broadcastToRole = async (io, { role, type, title, message, link, excludeUserId }) => {
  const User = require('../models/User');

  try {
    const users = await User.find({ role, isActive: true }).select('_id');

    const notifications = await Promise.all(
      users
        .filter((u) => !excludeUserId || u._id.toString() !== excludeUserId.toString())
        .map((u) =>
          createNotification(io, {
            recipient: u._id,
            type,
            title,
            message,
            link,
          })
        )
    );

    return notifications.filter(Boolean);
  } catch (err) {
    logger.error(`Broadcast to role ${role} failed: ${err.message}`);
    return [];
  }
};

module.exports = { createNotification, broadcastToRole };
