const mongoose = require('mongoose');
const PharmacyListing = require('../models/PharmacyListing');
const PharmacyOrder = require('../models/PharmacyOrder');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
const compareKey = (item) => [item.activeIngredient, item.strength, item.dosageForm, item.packSize].map(normalize).join('|');

const getListings = asyncHandler(async (req, res) => {
  const { search = '', city = '' } = req.query;
  const filter = { active: true, stockQuantity: { $gt: 0 }, $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }] };
  if (search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$and = [{ $or: [
      { medicineName: { $regex: escaped, $options: 'i' } },
      { activeIngredient: { $regex: escaped, $options: 'i' } },
    ] }];
  }
  if (city.trim()) {
    const escapedCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pharmacies = await User.find({ role: 'PHARMACY', verificationStatus: 'APPROVED', isActive: true, 'address.city': { $regex: escapedCity, $options: 'i' } }).select('_id').lean();
    filter.pharmacy = { $in: pharmacies.map((pharmacy) => pharmacy._id) };
  }
  const rows = await PharmacyListing.find(filter).populate({
    path: 'pharmacy',
    match: { role: 'PHARMACY', verificationStatus: 'APPROVED', isActive: true },
    select: 'name organization phone address',
  }).sort({ medicineName: 1, price: 1 }).limit(200).lean();
  const data = rows.filter((row) => row.pharmacy)
    .map((row) => ({ ...row, comparisonKey: compareKey(row) }));
  res.json({ success: true, data });
});

const getMyListings = asyncHandler(async (req, res) => {
  const data = await PharmacyListing.find({ pharmacy: req.user._id }).sort({ updatedAt: -1 }).limit(200).lean();
  res.json({ success: true, data });
});

const createListing = asyncHandler(async (req, res) => {
  const listing = await PharmacyListing.create({ ...req.body, pharmacy: req.user._id });
  logAudit({ action: 'PHARMACY_LISTING_CREATED', performedBy: req.user._id, targetModel: 'PharmacyListing', targetId: listing._id, req });
  res.status(201).json({ success: true, data: listing });
});

const updateListing = asyncHandler(async (req, res) => {
  const listing = await PharmacyListing.findOneAndUpdate(
    { _id: req.params.id, pharmacy: req.user._id },
    { ...req.body, updatedStockAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!listing) throw ApiError.notFound('Listing not found in your pharmacy inventory.');
  logAudit({ action: 'PHARMACY_LISTING_UPDATED', performedBy: req.user._id, targetModel: 'PharmacyListing', targetId: listing._id, req });
  res.json({ success: true, data: listing });
});

const createOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const listing = await PharmacyListing.findOneAndUpdate(
        { _id: req.body.listingId, active: true, stockQuantity: { $gte: req.body.quantity }, $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
        { $inc: { stockQuantity: -req.body.quantity }, $set: { updatedStockAt: new Date() } }, { new: true, session }
      );
      if (!listing) throw ApiError.conflict('This pharmacy no longer has that quantity in stock. Refresh the results and try again.');
      [order] = await PharmacyOrder.create([{
        patient: req.user._id,
        pharmacy: listing.pharmacy,
        listing: listing._id,
        medicineName: listing.medicineName,
        quantity: req.body.quantity,
        unitPrice: listing.price,
        statusHistory: [{ status: 'PENDING', changedBy: req.user._id }],
      }], { session });
    });
  } finally {
    await session.endSession();
  }
  await createNotification(req.app.get('io'), {
    recipient: listing.pharmacy,
    type: 'PHARMACY_ORDER',
    title: 'New medicine pickup request',
    message: 'Review the requested quantity and confirm availability.',
    link: '/pharmacy-orders',
  });
  logAudit({ action: 'PHARMACY_ORDER_CREATED', performedBy: req.user._id, targetModel: 'PharmacyOrder', targetId: order._id, req });
  res.status(201).json({ success: true, data: order });
});

const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'ADMIN' ? {} : req.user.role === 'PHARMACY' ? { pharmacy: req.user._id } : { patient: req.user._id };
  const data = await PharmacyOrder.find(filter)
    .populate('patient', 'name phone')
    .populate('pharmacy', 'name organization address phone')
    .populate('listing', 'medicineName activeIngredient strength dosageForm packSize')
    .sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data });
});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await PharmacyOrder.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found.');
  const { action } = req.body;
  const isPharmacy = req.user.role === 'PHARMACY' && order.pharmacy.equals(req.user._id);
  const isPatient = req.user.role === 'PATIENT' && order.patient.equals(req.user._id);
  const isAdmin = req.user.role === 'ADMIN';
  const transitions = {
    CONFIRMED: ['PENDING'], READY: ['CONFIRMED'], COMPLETED: ['READY'],
    CANCELLED: isPatient ? ['PENDING'] : ['PENDING', 'CONFIRMED'],
  };
  if ((action === 'CANCELLED' && !(isPatient || isPharmacy || isAdmin)) || (action !== 'CANCELLED' && !(isPharmacy || isAdmin))) {
    throw ApiError.forbidden('You cannot update this pharmacy order.');
  }
  const session = await mongoose.startSession();
  let updated;
  try {
    await session.withTransaction(async () => {
      updated = await PharmacyOrder.findOneAndUpdate(
        { _id: order._id, status: { $in: transitions[action] || [] } },
        { status: action, $push: { statusHistory: { status: action, changedBy: req.user._id, changedAt: new Date() } } },
        { new: true, session }
      );
      if (!updated) throw ApiError.conflict('This order has already changed or cannot move to that status.');
      if (action === 'CANCELLED') {
        const listing = await PharmacyListing.findByIdAndUpdate(
          updated.listing,
          { $inc: { stockQuantity: updated.quantity }, $set: { updatedStockAt: new Date() } },
          { new: true, session }
        );
        if (!listing) throw ApiError.conflict('The pharmacy listing no longer exists; cancellation was not applied. Contact an administrator.');
      }
    });
  } finally {
    await session.endSession();
  }
  const recipient = isPharmacy ? updated.patient : updated.pharmacy;
  await createNotification(req.app.get('io'), {
    recipient,
    type: 'PHARMACY_ORDER',
    title: `Pickup order ${action.toLowerCase()}`,
    message: `The pickup order is now ${action.toLowerCase()}. Payment, if applicable, is made directly at the pharmacy.`,
    link: '/pharmacy-orders',
  });
  logAudit({ action: `PHARMACY_ORDER_${action}`, performedBy: req.user._id, targetModel: 'PharmacyOrder', targetId: updated._id, req });
  res.json({ success: true, data: updated });
});

module.exports = { getListings, getMyListings, createListing, updateListing, createOrder, getOrders, updateOrder };
