const express = require('express');
const router = express.Router();
const {
  getRequests, createRequest, matchRequest, assignResource, approveRequest,
  transferRequest, completeRequest, rejectRequest, cancelRequest,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { requestSchema, assignResourceSchema } = require('../utils/validators');

router.use(protect); // All request routes require authentication

router.route('/')
  .get(getRequests)
  .post(authorize('HOSPITAL', 'ADMIN'), validate(requestSchema), createRequest);

router.post('/:id/match', authorize('ADMIN', 'HOSPITAL', 'BLOOD_BANK', 'PROCUREMENT_CENTER'), matchRequest);
router.post('/:id/assign', authorize('ADMIN', 'BLOOD_BANK', 'PROCUREMENT_CENTER'), validate(assignResourceSchema), assignResource);
router.put('/:id/approve', authorize('ADMIN'), approveRequest);
router.put('/:id/transfer', authorize('ADMIN', 'PROCUREMENT_CENTER', 'BLOOD_BANK'), transferRequest);
router.put('/:id/complete', authorize('ADMIN', 'HOSPITAL'), completeRequest);
router.put('/:id/reject', authorize('ADMIN'), rejectRequest);
router.put('/:id/cancel', authorize('ADMIN', 'HOSPITAL'), cancelRequest);

module.exports = router;
