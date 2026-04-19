const express = require('express');
const router = express.Router();
const {
  getRequests, createRequest, approveRequest,
  transferRequest, completeRequest, rejectRequest,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { requestSchema } = require('../utils/validators');

router.use(protect); // All request routes require authentication

router.route('/')
  .get(getRequests)
  .post(authorize('HOSPITAL', 'ADMIN'), validate(requestSchema), createRequest);

router.put('/:id/approve', authorize('ADMIN'), approveRequest);
router.put('/:id/transfer', authorize('ADMIN', 'PROCUREMENT_CENTER', 'BLOOD_BANK'), transferRequest);
router.put('/:id/complete', authorize('ADMIN', 'HOSPITAL'), completeRequest);
router.put('/:id/reject', authorize('ADMIN'), rejectRequest);

module.exports = router;
