const mongoose = require('mongoose');

const pharmacyListingSchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineName: { type: String, required: true, trim: true, maxlength: 160 },
  activeIngredient: { type: String, required: true, trim: true, maxlength: 160 },
  strength: { type: String, required: true, trim: true, maxlength: 80 },
  dosageForm: { type: String, required: true, trim: true, maxlength: 80 },
  packSize: { type: String, required: true, trim: true, maxlength: 80 },
  manufacturer: { type: String, trim: true, maxlength: 120, default: '' },
  price: { type: Number, required: true, min: 0, max: 10000000 },
  stockQuantity: { type: Number, required: true, min: 0, max: 100000 },
  expiresAt: { type: Date },
  updatedStockAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
}, { timestamps: true });

pharmacyListingSchema.index({ pharmacy: 1, active: 1, medicineName: 1 });
pharmacyListingSchema.index({ activeIngredient: 1, strength: 1, dosageForm: 1, packSize: 1 });

module.exports = mongoose.model('PharmacyListing', pharmacyListingSchema);
