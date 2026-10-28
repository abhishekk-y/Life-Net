const mongoose = require('mongoose');

const pharmacyOrderSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacyListing', required: true },
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  paymentMethod: { type: String, enum: ['PAY_AT_PHARMACY'], default: 'PAY_AT_PHARMACY' },
  statusHistory: [{ status: String, changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, changedAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

pharmacyOrderSchema.index({ patient: 1, createdAt: -1 });
pharmacyOrderSchema.index({ pharmacy: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('PharmacyOrder', pharmacyOrderSchema);
