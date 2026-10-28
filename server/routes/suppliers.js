const express = require('express');
const router = express.Router();
const { getListings, getMyListings, createListing, updateListing, createOrder, getOrders, updateOrder } = require('../controllers/suppliersController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { supplierListingSchema, supplyOrderSchema, supplyOrderUpdateSchema } = require('../utils/validators');

router.use(protect);
router.get('/listings', authorize('ADMIN', 'HOSPITAL', 'PHARMACY', 'BLOOD_BANK', 'PROCUREMENT_CENTER', 'SUPPLIER'), getListings);
router.get('/listings/mine', authorize('SUPPLIER'), getMyListings);
router.post('/listings', authorize('SUPPLIER'), validate(supplierListingSchema), createListing);
router.put('/listings/:id', authorize('SUPPLIER'), validate(supplierListingSchema), updateListing);
router.get('/orders', authorize('ADMIN', 'HOSPITAL', 'PHARMACY', 'BLOOD_BANK', 'PROCUREMENT_CENTER', 'SUPPLIER'), getOrders);
router.post('/orders', authorize('HOSPITAL', 'PHARMACY', 'BLOOD_BANK', 'PROCUREMENT_CENTER'), validate(supplyOrderSchema), createOrder);
router.patch('/orders/:id', authorize('ADMIN', 'HOSPITAL', 'PHARMACY', 'BLOOD_BANK', 'PROCUREMENT_CENTER', 'SUPPLIER'), validate(supplyOrderUpdateSchema), updateOrder);

module.exports = router;
