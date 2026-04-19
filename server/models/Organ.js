const mongoose = require('mongoose');

const ORGAN_TYPES = [
  'HEART', 'LIVER', 'KIDNEY', 'LUNG', 'PANCREAS',
  'INTESTINE', 'CORNEA', 'BONE_MARROW', 'SKIN', 'OTHER',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ORGAN_STATUS = ['AVAILABLE', 'RESERVED', 'MATCHED', 'TRANSPLANTED', 'EXPIRED'];

const organSchema = new mongoose.Schema(
  {
    organType: {
      type: String,
      enum: ORGAN_TYPES,
      required: [true, 'Organ type is required'],
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: [true, 'Blood group is required'],
    },
    status: {
      type: String,
      enum: ORGAN_STATUS,
      default: 'AVAILABLE',
    },
    donorAge: {
      type: Number,
      min: 0,
      max: 120,
    },
    donorGender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    // Harvested timestamp for viability tracking
    harvestedAt: {
      type: Date,
      default: Date.now,
    },
    // Max viable hours after harvest (organ-specific)
    viabilityHours: {
      type: Number,
      required: true,
    },
    // Source center
    procurementCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      city: String,
      state: String,
      country: { type: String, default: 'India' },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
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

organSchema.index({ organType: 1, bloodGroup: 1, status: 1 });
organSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual: check if organ is still viable
organSchema.virtual('isViable').get(function () {
  if (!this.harvestedAt || !this.viabilityHours) return false;
  const expiryTime = new Date(this.harvestedAt.getTime() + this.viabilityHours * 3600000);
  return new Date() < expiryTime;
});

// Virtual: hours remaining
organSchema.virtual('hoursRemaining').get(function () {
  if (!this.harvestedAt || !this.viabilityHours) return 0;
  const expiryTime = new Date(this.harvestedAt.getTime() + this.viabilityHours * 3600000);
  const remaining = (expiryTime - new Date()) / 3600000;
  return Math.max(0, Math.round(remaining * 10) / 10);
});

organSchema.set('toJSON', { virtuals: true });
organSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Organ', organSchema);
module.exports.ORGAN_TYPES = ORGAN_TYPES;
module.exports.BLOOD_GROUPS = BLOOD_GROUPS;
module.exports.ORGAN_STATUS = ORGAN_STATUS;
