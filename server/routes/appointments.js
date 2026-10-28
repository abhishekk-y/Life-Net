const express = require('express');
const router = express.Router();
const { getAppointments, bookAppointment, updateAppointment } = require('../controllers/doctorsController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { appointmentBookingSchema, appointmentUpdateSchema } = require('../utils/validators');

router.use(protect);
router.get('/', getAppointments);
router.post('/', authorize('PATIENT'), validate(appointmentBookingSchema), bookAppointment);
router.patch('/:id', authorize('PATIENT', 'DOCTOR', 'ADMIN'), validate(appointmentUpdateSchema), updateAppointment);

module.exports = router;
