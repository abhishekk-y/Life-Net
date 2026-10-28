const mongoose = require('mongoose');

const supplyOrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierListing', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  statusHistory: [{ status: String, changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, changedAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

supplyOrderSchema.index({ buyer: 1, createdAt: -1 });
supplyOrderSchema.index({ supplier: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('SupplyOrder', supplyOrderSchema);
