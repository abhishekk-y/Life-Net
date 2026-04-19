const mongoose = require('mongoose');

const REQUEST_TYPES = ['ORGAN', 'BLOOD'];
const REQUEST_STATUS = ['PENDING', 'MATCHED', 'APPROVED', 'IN_TRANSIT', 'COMPLETED', 'REJECTED', 'CANCELLED'];
const URGENCY_LEVELS = ['ROUTINE', 'URGENT', 'EMERGENCY'];

const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: REQUEST_TYPES,
      required: true,
    },
    status: {
      type: String,
      enum: REQUEST_STATUS,
      default: 'PENDING',
    },
    urgency: {
      type: String,
      enum: URGENCY_LEVELS,
      default: 'ROUTINE',
    },
    // What is needed
    resourceDetails: {
      bloodGroup: String,
      organType: String,
      component: String, // For blood requests
      quantity: Number,
    },
    // Patient info (anonymized)
    patientAge: Number,
    patientGender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    // Who is requesting
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The hospital making the request
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Matched resource (organ or blood unit)
    matchedResource: {
      resourceType: { type: String, enum: ['Organ', 'BloodUnit'] },
      resourceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'matchedResource.resourceType' },
    },
    // Fulfilling center
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Workflow timestamps
    matchedAt: Date,
    approvedAt: Date,
    transferStartedAt: Date,
    completedAt: Date,
    rejectedAt: Date,
    // Rejection reason
    rejectionReason: String,
    // Notes
    notes: String,
    // Status history for audit trail
    statusHistory: [
      {
        status: { type: String, enum: REQUEST_STATUS },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

requestSchema.index({ status: 1, type: 1, urgency: 1 });
requestSchema.index({ requestedBy: 1 });
requestSchema.index({ hospital: 1 });

// Auto-add to status history on status change
requestSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model('Request', requestSchema);
module.exports.REQUEST_TYPES = REQUEST_TYPES;
module.exports.REQUEST_STATUS = REQUEST_STATUS;
module.exports.URGENCY_LEVELS = URGENCY_LEVELS;
