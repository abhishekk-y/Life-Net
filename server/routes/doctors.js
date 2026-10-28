const express = require('express');
const router = express.Router();
const {
  getDoctors, upsertProfile, getMyProfile, createSlot, getSlots, getMySlots, closeSlot,
} = require('../controllers/doctorsController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { doctorProfileSchema, appointmentSlotSchema } = require('../utils/validators');

router.use(protect);
router.get('/', getDoctors);
router.get('/profile/me', authorize('DOCTOR'), getMyProfile);
router.put('/profile', authorize('DOCTOR'), validate(doctorProfileSchema), upsertProfile);
router.get('/slots/me', authorize('DOCTOR'), getMySlots);
router.post('/slots', authorize('DOCTOR'), validate(appointmentSlotSchema), createSlot);
router.delete('/slots/:slotId', authorize('DOCTOR'), closeSlot);
router.get('/:doctorId/slots', getSlots);

module.exports = router;
