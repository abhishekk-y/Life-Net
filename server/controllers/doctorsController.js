const mongoose = require('mongoose');
const DoctorProfile = require('../models/DoctorProfile');
const AppointmentSlot = require('../models/AppointmentSlot');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

const getDoctors = asyncHandler(async (req, res) => {
  const { search = '', specialty = '', city = '' } = req.query;
  const query = { acceptingAppointments: true };
  if (specialty.trim()) query.specialty = { $regex: specialty.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (city.trim()) query['address.city'] = { $regex: city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [{ specialty: { $regex: escaped, $options: 'i' } }, { qualification: { $regex: escaped, $options: 'i' } }];
  }
  const profiles = await DoctorProfile.find(query)
    .populate({ path: 'doctor', match: { role: 'DOCTOR', verificationStatus: 'APPROVED', isActive: true }, select: 'name organization address' })
    .sort({ specialty: 1, updatedAt: -1 }).limit(100).lean();
  res.json({ success: true, data: profiles.filter((profile) => profile.doctor) });
});

const upsertProfile = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.user._id);
  if (req.body.specialty !== doctor.providerDetails?.specialty || req.body.qualification !== doctor.providerDetails?.qualification) {
    throw ApiError.badRequest('Specialty and qualification must match the details reviewed by LifeNet. Contact an administrator to update them.');
  }
  const profile = await DoctorProfile.findOneAndUpdate(
    { doctor: doctor._id },
    { ...req.body, doctor: doctor._id },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: profile });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({ doctor: req.user._id });
  res.json({ success: true, data: profile });
});

const createSlot = asyncHandler(async (req, res) => {
  const startAt = new Date(req.body.startAt);
  const endAt = new Date(req.body.endAt);
  if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime())) throw ApiError.badRequest('Enter valid appointment start and end times.');
  const duration = (endAt - startAt) / 60000;
  if (startAt <= new Date() || startAt > new Date(Date.now() + 365 * 86400000) || duration < 15 || duration > 120) {
    throw ApiError.badRequest('Slots must be 15–120 minutes and start within the next 12 months.');
  }
  const session = await mongoose.startSession();
  let slot;
  try {
    await session.withTransaction(async () => {
      // Serialize availability edits through the profile document so concurrent
      // requests cannot both pass the overlap check for the same doctor.
      const profile = await DoctorProfile.findOneAndUpdate(
        { doctor: req.user._id, acceptingAppointments: true },
        { $inc: { availabilityRevision: 1 } },
        { new: true, session }
      );
      if (!profile) throw ApiError.badRequest('Publish a doctor profile and enable appointments before adding availability.');
      const overlap = await AppointmentSlot.exists({
        doctor: req.user._id,
        status: { $ne: 'CLOSED' },
        startAt: { $lt: endAt },
        endAt: { $gt: startAt },
      }).session(session);
      if (overlap) throw ApiError.conflict('This slot overlaps an existing slot.');
      [slot] = await AppointmentSlot.create([{ doctor: req.user._id, startAt, endAt }], { session });
    });
  } finally {
    await session.endSession();
  }
  res.status(201).json({ success: true, data: slot });
});

const getSlots = asyncHandler(async (req, res) => {
  const doctorId = req.params.doctorId;
  const profile = await DoctorProfile.findOne({ doctor: doctorId, acceptingAppointments: true });
  if (!profile) throw ApiError.notFound('Doctor profile not found.');
  const slots = await AppointmentSlot.find({ doctor: doctorId, status: 'AVAILABLE', startAt: { $gt: new Date() } }).sort({ startAt: 1 }).limit(60).lean();
  res.json({ success: true, data: slots });
});

const getMySlots = asyncHandler(async (req, res) => {
  const slots = await AppointmentSlot.find({ doctor: req.user._id, startAt: { $gt: new Date() } }).sort({ startAt: 1 }).limit(100).lean();
  res.json({ success: true, data: slots });
});

const closeSlot = asyncHandler(async (req, res) => {
  const slot = await AppointmentSlot.findOneAndUpdate(
    { _id: req.params.slotId, doctor: req.user._id, status: 'AVAILABLE', startAt: { $gt: new Date() } },
    { status: 'CLOSED' }, { new: true }
  );
  if (!slot) throw ApiError.conflict('This slot is booked, has passed, or is no longer available.');
  res.json({ success: true, data: slot });
});

const getAppointments = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'ADMIN' ? {} : req.user.role === 'DOCTOR' ? { doctor: req.user._id } : { patient: req.user._id };
  const appointments = await Appointment.find(filter)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name organization address phone')
    .populate('slot', 'startAt endAt')
    .sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: appointments });
});

const bookAppointment = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({ doctor: req.body.doctorId, acceptingAppointments: true });
  if (!profile) throw ApiError.notFound('Doctor profile not found.');
  const session = await mongoose.startSession();
  let appointment;
  try {
    await session.withTransaction(async () => {
      const slot = await AppointmentSlot.findOneAndUpdate(
        { _id: req.body.slotId, doctor: req.body.doctorId, status: 'AVAILABLE', startAt: { $gt: new Date() } },
        { status: 'BOOKED' }, { new: true, session }
      );
      if (!slot) throw ApiError.conflict('This appointment time was just taken. Choose another time.');
      [appointment] = await Appointment.create([{
        patient: req.user._id,
        doctor: req.body.doctorId,
        slot: slot._id,
        mode: 'IN_PERSON',
        statusHistory: [{ status: 'PENDING', changedBy: req.user._id }],
      }], { session });
    });
  } catch (error) {
    if (error.code === 11000) throw ApiError.conflict('This appointment time was just taken. Choose another time.');
    throw error;
  } finally {
    await session.endSession();
  }
  logAudit({ action: 'APPOINTMENT_REQUESTED', performedBy: req.user._id, targetModel: 'Appointment', targetId: appointment._id, req });
  await createNotification(req.app.get('io'), {
    recipient: req.body.doctorId,
    type: 'APPOINTMENT_UPDATE',
    title: 'New appointment request',
    message: 'A patient requested an in-person appointment. Review the request in your appointments.',
    link: '/appointments',
  });
  res.status(201).json({ success: true, data: appointment });
});

const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw ApiError.notFound('Appointment not found.');
  const action = req.body.action;
  const isDoctor = req.user.role === 'DOCTOR' && appointment.doctor.equals(req.user._id);
  const isPatient = req.user.role === 'PATIENT' && appointment.patient.equals(req.user._id);
  const isAdmin = req.user.role === 'ADMIN';
  let allowed = false;
  if (['CONFIRMED', 'REJECTED', 'COMPLETED'].includes(action)) allowed = isDoctor || isAdmin;
  if (action === 'CANCELLED') allowed = isPatient || isDoctor || isAdmin;
  if (!allowed) throw ApiError.forbidden('You cannot update this appointment.');
  const transitions = {
    CONFIRMED: ['PENDING'],
    REJECTED: ['PENDING'],
    COMPLETED: ['CONFIRMED'],
    CANCELLED: ['PENDING', 'CONFIRMED'],
  };
  const session = await mongoose.startSession();
  let updated;
  try {
    await session.withTransaction(async () => {
      updated = await Appointment.findOneAndUpdate(
        { _id: appointment._id, status: { $in: transitions[action] || [] } },
        { status: action, $push: { statusHistory: { status: action, changedBy: req.user._id, changedAt: new Date() } } },
        { new: true, session }
      );
      if (!updated) throw ApiError.conflict('This appointment has already changed. Refresh and try again.');
      if (['REJECTED', 'CANCELLED'].includes(action)) {
        const slot = await AppointmentSlot.findOneAndUpdate(
          { _id: updated.slot, status: 'BOOKED', endAt: { $gt: new Date() } },
          { status: 'AVAILABLE' }, { new: true, session }
        );
        // Past slots do not need to be reopened, but a future booked appointment
        // must always have a matching slot that can be released atomically.
        if (!slot) {
          const existingSlot = await AppointmentSlot.findById(updated.slot).session(session);
          if (existingSlot?.endAt > new Date()) throw ApiError.conflict('The appointment slot changed. Refresh and try again.');
        }
      }
    });
  } finally {
    await session.endSession();
  }
  const recipient = isDoctor ? updated.patient : updated.doctor;
  await createNotification(req.app.get('io'), {
    recipient,
    type: 'APPOINTMENT_UPDATE',
    title: `Appointment ${action.toLowerCase()}`,
    message: `The appointment status is now ${action.toLowerCase()}.`,
    link: '/appointments',
  });
  logAudit({ action: `APPOINTMENT_${action}`, performedBy: req.user._id, targetModel: 'Appointment', targetId: updated._id, req });
  res.json({ success: true, data: updated });
});

module.exports = { getDoctors, upsertProfile, getMyProfile, createSlot, getSlots, getMySlots, closeSlot, getAppointments, bookAppointment, updateAppointment };
