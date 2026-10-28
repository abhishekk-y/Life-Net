const express = require('express');
const router = express.Router();
const {
  getListings, getMyListings, createListing, updateListing, createOrder, getOrders, updateOrder,
} = require('../controllers/pharmaciesController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { pharmacyListingSchema, pharmacyOrderSchema, pharmacyOrderUpdateSchema } = require('../utils/validators');

router.use(protect);
router.get('/listings', getListings);
router.get('/listings/mine', authorize('PHARMACY'), getMyListings);
router.post('/listings', authorize('PHARMACY'), validate(pharmacyListingSchema), createListing);
router.put('/listings/:id', authorize('PHARMACY'), validate(pharmacyListingSchema), updateListing);
router.get('/orders', getOrders);
router.post('/orders', authorize('PATIENT'), validate(pharmacyOrderSchema), createOrder);
router.patch('/orders/:id', authorize('PATIENT', 'PHARMACY', 'ADMIN'), validate(pharmacyOrderUpdateSchema), updateOrder);

module.exports = router;
