const mongoose = require('mongoose');
const SupplierListing = require('../models/SupplierListing');
const SupplyOrder = require('../models/SupplyOrder');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

const BUYER_ROLES = ['HOSPITAL', 'PHARMACY', 'BLOOD_BANK', 'PROCUREMENT_CENTER'];

const getListings = asyncHandler(async (req, res) => {
  const { search = '', category = '', city = '' } = req.query;
  const filter = { active: true, stockQuantity: { $gt: 0 } };
  if (search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ productName: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }];
  }
  if (category.trim()) filter.category = { $regex: category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (city.trim()) {
    const escapedCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const suppliers = await User.find({ role: 'SUPPLIER', verificationStatus: 'APPROVED', isActive: true, 'address.city': { $regex: escapedCity, $options: 'i' } }).select('_id').lean();
    filter.supplier = { $in: suppliers.map((supplier) => supplier._id) };
  }
  const rows = await SupplierListing.find(filter)
    .populate({ path: 'supplier', match: { role: 'SUPPLIER', verificationStatus: 'APPROVED', isActive: true }, select: 'name organization address' })
    .sort({ productName: 1, unitPrice: 1 }).limit(200).lean();
  res.json({ success: true, data: rows.filter((item) => item.supplier) });
});

const getMyListings = asyncHandler(async (req, res) => {
  const data = await SupplierListing.find({ supplier: req.user._id }).sort({ updatedAt: -1 }).limit(200).lean();
  res.json({ success: true, data });
});

const createListing = asyncHandler(async (req, res) => {
  const listing = await SupplierListing.create({ ...req.body, supplier: req.user._id });
  logAudit({ action: 'SUPPLY_LISTING_CREATED', performedBy: req.user._id, targetModel: 'SupplierListing', targetId: listing._id, req });
  res.status(201).json({ success: true, data: listing });
});

const updateListing = asyncHandler(async (req, res) => {
  const listing = await SupplierListing.findOneAndUpdate(
    { _id: req.params.id, supplier: req.user._id },
    { ...req.body, updatedStockAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!listing) throw ApiError.notFound('Supply listing not found in your catalog.');
  logAudit({ action: 'SUPPLY_LISTING_UPDATED', performedBy: req.user._id, targetModel: 'SupplierListing', targetId: listing._id, req });
  res.json({ success: true, data: listing });
});

const createOrder = asyncHandler(async (req, res) => {
  if (!BUYER_ROLES.includes(req.user.role)) throw ApiError.forbidden('Only approved care organizations can request supplies.');
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const listing = await SupplierListing.findOneAndUpdate(
        { _id: req.body.listingId, active: true, stockQuantity: { $gte: req.body.quantity } },
        { $inc: { stockQuantity: -req.body.quantity } }, { new: true, session }
      );
      if (!listing) throw ApiError.conflict('This supplier no longer has the requested quantity. Refresh listings and try again.');
      [order] = await SupplyOrder.create([{
        buyer: req.user._id, supplier: listing.supplier, listing: listing._id,
        productName: listing.productName, quantity: req.body.quantity, unit: listing.unit,
        unitPrice: listing.unitPrice, statusHistory: [{ status: 'PENDING', changedBy: req.user._id }],
      }], { session });
    });
  } finally {
    await session.endSession();
  }
  await createNotification(req.app.get('io'), { recipient: listing.supplier, type: 'SUPPLY_ORDER', title: 'New supply request', message: 'An approved organization requested stock. Review and confirm the order.', link: '/supply-orders' });
  logAudit({ action: 'SUPPLY_ORDER_CREATED', performedBy: req.user._id, targetModel: 'SupplyOrder', targetId: order._id, req });
  res.status(201).json({ success: true, data: order });
});

const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'ADMIN' ? {} : req.user.role === 'SUPPLIER' ? { supplier: req.user._id } : { buyer: req.user._id };
  const data = await SupplyOrder.find(filter)
    .populate('buyer', 'name organization phone')
    .populate('supplier', 'name organization phone address')
    .populate('listing', 'productName category unit')
    .sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data });
});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await SupplyOrder.findById(req.params.id);
  if (!order) throw ApiError.notFound('Supply order not found.');
  const isSupplier = req.user.role === 'SUPPLIER' && order.supplier.equals(req.user._id);
  const isBuyer = BUYER_ROLES.includes(req.user.role) && order.buyer.equals(req.user._id);
  const isAdmin = req.user.role === 'ADMIN';
  const { action } = req.body;
  const transitions = { CONFIRMED: ['PENDING'], READY: ['CONFIRMED'], COMPLETED: ['READY'], CANCELLED: isBuyer ? ['PENDING'] : ['PENDING', 'CONFIRMED'] };
  if ((action === 'CANCELLED' && !(isBuyer || isSupplier || isAdmin)) || (action !== 'CANCELLED' && !(isSupplier || isAdmin))) throw ApiError.forbidden('You cannot update this supply order.');
  const session = await mongoose.startSession();
  let updated;
  try {
    await session.withTransaction(async () => {
      updated = await SupplyOrder.findOneAndUpdate(
        { _id: order._id, status: { $in: transitions[action] || [] } },
        { status: action, $push: { statusHistory: { status: action, changedBy: req.user._id, changedAt: new Date() } } }, { new: true, session }
      );
      if (!updated) throw ApiError.conflict('This order has changed or cannot move to that status.');
      if (action === 'CANCELLED') {
        const listing = await SupplierListing.findByIdAndUpdate(updated.listing, { $inc: { stockQuantity: updated.quantity } }, { new: true, session });
        if (!listing) throw ApiError.conflict('The supplier listing no longer exists; cancellation was not applied. Contact an administrator.');
      }
    });
  } finally {
    await session.endSession();
  }
  const recipient = isSupplier ? updated.buyer : updated.supplier;
  await createNotification(req.app.get('io'), { recipient, type: 'SUPPLY_ORDER', title: `Supply order ${action.toLowerCase()}`, message: `The supply order is now ${action.toLowerCase()}. Delivery and payment are arranged directly between the organizations.`, link: '/supply-orders' });
  logAudit({ action: `SUPPLY_ORDER_${action}`, performedBy: req.user._id, targetModel: 'SupplyOrder', targetId: updated._id, req });
  res.json({ success: true, data: updated });
});

module.exports = { getListings, getMyListings, createListing, updateListing, createOrder, getOrders, updateOrder };
