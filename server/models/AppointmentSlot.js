const mongoose = require('mongoose');

const appointmentSlotSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  status: { type: String, enum: ['AVAILABLE', 'BOOKED', 'CLOSED'], default: 'AVAILABLE' },
}, { timestamps: true });

appointmentSlotSchema.index({ doctor: 1, startAt: 1 }, { unique: true });
appointmentSlotSchema.index({ doctor: 1, status: 1, startAt: 1 });

module.exports = mongoose.model('AppointmentSlot', appointmentSlotSchema);
