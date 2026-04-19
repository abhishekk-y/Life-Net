const mongoose = require('mongoose');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const BLOOD_COMPONENTS = ['WHOLE_BLOOD', 'PACKED_RBC', 'PLATELETS', 'PLASMA', 'CRYOPRECIPITATE'];
const BLOOD_STATUS = ['AVAILABLE', 'RESERVED', 'USED', 'EXPIRED', 'DISCARDED'];

const bloodUnitSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: [true, 'Blood group is required'],
    },
    component: {
      type: String,
      enum: BLOOD_COMPONENTS,
      default: 'WHOLE_BLOOD',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity (in ml) is required'],
      min: 1,
    },
    units: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: BLOOD_STATUS,
      default: 'AVAILABLE',
    },
    // Storage conditions
    collectedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    storageTemp: {
      type: Number, // Celsius
      required: true,
    },
    // Donor info (anonymous — no PII)
    donorId: {
      type: String,
      required: true,
    },
    // Source blood bank
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      city: String,
      state: String,
      country: { type: String, default: 'India' },
    },
    notes: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

bloodUnitSchema.index({ bloodGroup: 1, status: 1, expiryDate: 1 });
bloodUnitSchema.index({ bloodBank: 1 });

// Virtual: check if expired
bloodUnitSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

// Virtual: days until expiry
bloodUnitSchema.virtual('daysUntilExpiry').get(function () {
  const diff = this.expiryDate - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
});

// Virtual: temperature status
bloodUnitSchema.virtual('tempStatus').get(function () {
  // Whole blood/RBC: 2-6°C, Platelets: 20-24°C, Plasma: -18°C or below
  if (['WHOLE_BLOOD', 'PACKED_RBC'].includes(this.component)) {
    if (this.storageTemp >= 2 && this.storageTemp <= 6) return 'OPTIMAL';
    if (this.storageTemp >= 1 && this.storageTemp <= 8) return 'WARNING';
    return 'CRITICAL';
  }
  if (this.component === 'PLATELETS') {
    if (this.storageTemp >= 20 && this.storageTemp <= 24) return 'OPTIMAL';
    return 'CRITICAL';
  }
  if (['PLASMA', 'CRYOPRECIPITATE'].includes(this.component)) {
    if (this.storageTemp <= -18) return 'OPTIMAL';
    if (this.storageTemp <= -10) return 'WARNING';
    return 'CRITICAL';
  }
  return 'UNKNOWN';
});

bloodUnitSchema.set('toJSON', { virtuals: true });
bloodUnitSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BloodUnit', bloodUnitSchema);
module.exports.BLOOD_GROUPS = BLOOD_GROUPS;
module.exports.BLOOD_COMPONENTS = BLOOD_COMPONENTS;
module.exports.BLOOD_STATUS = BLOOD_STATUS;
