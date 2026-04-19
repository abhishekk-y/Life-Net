const mongoose = require('mongoose');

const AUDIT_ACTIONS = [
  'USER_REGISTER', 'USER_LOGIN', 'USER_LOGOUT',
  'ORGAN_CREATED', 'ORGAN_UPDATED', 'ORGAN_DELETED',
  'BLOOD_CREATED', 'BLOOD_UPDATED', 'BLOOD_DELETED',
  'REQUEST_CREATED', 'REQUEST_MATCHED', 'REQUEST_APPROVED',
  'REQUEST_REJECTED', 'REQUEST_TRANSFERRED', 'REQUEST_COMPLETED',
  'EMERGENCY_BROADCAST', 'SETTINGS_CHANGED', 'USER_DEACTIVATED',
];

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: AUDIT_ACTIONS,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetModel: {
      type: String,
      enum: ['User', 'Organ', 'BloodUnit', 'Request', 'Emergency'],
    },
    targetId: mongoose.Schema.Types.ObjectId,
    details: mongoose.Schema.Types.Mixed, // Flexible JSON for action-specific data
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
module.exports.AUDIT_ACTIONS = AUDIT_ACTIONS;
