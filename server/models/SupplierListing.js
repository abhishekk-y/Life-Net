const mongoose = require('mongoose');

const supplierListingSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true, trim: true, maxlength: 160 },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 1200, default: '' },
  unit: { type: String, required: true, trim: true, maxlength: 80 },
  unitPrice: { type: Number, required: true, min: 0, max: 100000000 },
  stockQuantity: { type: Number, required: true, min: 0, max: 10000000 },
  leadTimeDays: { type: Number, required: true, min: 0, max: 365 },
  active: { type: Boolean, default: true },
  updatedStockAt: { type: Date, default: Date.now },
}, { timestamps: true });

supplierListingSchema.index({ supplier: 1, active: 1, productName: 1 });
supplierListingSchema.index({ category: 1, productName: 1 });

module.exports = mongoose.model('SupplierListing', supplierListingSchema);
