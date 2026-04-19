const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Log an audit event — fire-and-forget (never blocks the request).
 */
const logAudit = async ({ action, performedBy, targetModel, targetId, details, req }) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetModel,
      targetId,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get?.('User-Agent'),
    });
  } catch (err) {
    // Audit logging should never crash the app
    logger.error(`Audit log failed: ${err.message}`);
  }
};

module.exports = { logAudit };
