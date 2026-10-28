const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const User = require('../models/User');

// Track connected users: Map<userId, Set<socketId>>
const connectedUsers = new Map();

/**
 * Initialize Socket.io event handlers.
 * @param {import('socket.io').Server} io - Socket.io server instance
 */
const initSocket = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('role isActive verificationStatus');
      if (!user || !user.isActive || (user.role !== 'ADMIN' && user.verificationStatus !== 'APPROVED') || user.role !== decoded.role) {
        return next(new Error('Account is not authorized for live updates'));
      }
      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    logger.info(`Socket connected: ${socket.id} (User: ${userId})`);

    // Join user-specific room for targeted notifications
    socket.join(userId);

    // Track online user
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socket.id);

    // Broadcast updated online count
    io.emit('users:online', { count: connectedUsers.size });

    // Join role-based room for role broadcasts
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`);
    }

    // --- Disconnect ---
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id} (User: ${userId})`);

      if (connectedUsers.has(userId)) {
        connectedUsers.get(userId).delete(socket.id);
        if (connectedUsers.get(userId).size === 0) {
          connectedUsers.delete(userId);
        }
      }

      io.emit('users:online', { count: connectedUsers.size });
    });
  });
};

module.exports = { initSocket, connectedUsers };
