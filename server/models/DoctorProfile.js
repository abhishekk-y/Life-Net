const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialty: { type: String, required: true, trim: true, maxlength: 120 },
  qualification: { type: String, required: true, trim: true, maxlength: 160 },
  experienceYears: { type: Number, min: 0, max: 70, default: 0 },
  consultationFee: { type: Number, min: 0, max: 100000, default: 0 },
  bio: { type: String, trim: true, maxlength: 1200, default: '' },
  languages: [{ type: String, trim: true, maxlength: 40 }],
  address: {
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
  },
  acceptingAppointments: { type: Boolean, default: true },
  availabilityRevision: { type: Number, default: 0, select: false },
}, { timestamps: true });

doctorProfileSchema.index({ specialty: 1, 'address.city': 1 });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
