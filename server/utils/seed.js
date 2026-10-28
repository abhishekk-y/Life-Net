require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Organ = require('../models/Organ');
const BloodUnit = require('../models/BloodUnit');
const Request = require('../models/Request');
const DoctorProfile = require('../models/DoctorProfile');
const AppointmentSlot = require('../models/AppointmentSlot');
const PharmacyListing = require('../models/PharmacyListing');
const SupplierListing = require('../models/SupplierListing');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const demoUsers = [
  {
    name: 'Demo Patient Account',
    email: 'patient@demo.lifenet.test',
    password: 'local-patient-demo',
    role: 'PATIENT',
    address: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  },
  {
    name: 'Demo Doctor Account',
    email: 'doctor@demo.lifenet.test',
    password: 'local-doctor-demo',
    role: 'DOCTOR',
    organization: 'Demo Community Clinic',
    address: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
    providerDetails: { specialty: 'General Practice', qualification: 'Demo qualification', registrationNumber: 'DEMO-DOCTOR-001' },
  },
  {
    name: 'Demo Pharmacy Account',
    email: 'pharmacy@demo.lifenet.test',
    password: 'local-pharmacy-demo',
    role: 'PHARMACY',
    organization: 'Demo Neighborhood Pharmacy',
    address: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
    providerDetails: { registrationNumber: 'DEMO-PHARMACY-001' },
  },
  {
    name: 'Demo Supplier Account',
    email: 'supplier@demo.lifenet.test',
    password: 'local-supplier-demo',
    role: 'SUPPLIER',
    organization: 'Demo Medical Supplies',
    address: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
    providerDetails: { registrationNumber: 'DEMO-SUPPLIER-001' },
  },
  {
    name: 'LifeNet Demo Administrator',
    email: 'admin@demo.lifenet.test',
    password: 'local-admin-demo',
    role: 'ADMIN',
    organization: 'LifeNet Demo Operations',
  },
  {
    name: 'Demo Hospital Coordinator',
    email: 'hospital@demo.lifenet.test',
    password: 'local-hospital-demo',
    role: 'HOSPITAL',
    organization: 'Northstar Community Hospital',
    address: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  },
  {
    name: 'Demo Blood Bank Coordinator',
    email: 'bloodbank@demo.lifenet.test',
    password: 'local-bloodbank-demo',
    role: 'BLOOD_BANK',
    organization: 'Riverbend Blood Centre',
    address: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  },
  {
    name: 'Demo Procurement Coordinator',
    email: 'procurement@demo.lifenet.test',
    password: 'local-procurement-demo',
    role: 'PROCUREMENT_CENTER',
    organization: 'Central Transplant Coordination Centre',
    address: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  },
];

const findOrCreateUser = async (attributes) => {
  const existing = await User.findOne({ email: attributes.email });
  if (existing) return existing;
  return User.create({ ...attributes, verificationStatus: 'APPROVED' });
};

const seedData = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo seeding is disabled in production.');
  }

  await connectDB();
  const users = {};
  for (const attributes of demoUsers) users[attributes.role] = await findOrCreateUser(attributes);

  await DoctorProfile.findOneAndUpdate(
    { doctor: users.DOCTOR._id },
    { $setOnInsert: {
      doctor: users.DOCTOR._id,
      specialty: 'General Practice',
      qualification: 'Demo qualification',
      experienceYears: 1,
      consultationFee: 0,
      bio: 'Synthetic local demo profile. This is not a real clinic listing.',
      languages: ['English'],
      address: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      acceptingAppointments: true,
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const existingDemoSlot = await AppointmentSlot.exists({ doctor: users.DOCTOR._id, status: 'AVAILABLE', startAt: { $gt: new Date() } });
  if (!existingDemoSlot) {
    const startAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    startAt.setMinutes(0, 0, 0);
    await AppointmentSlot.create({ doctor: users.DOCTOR._id, startAt, endAt: new Date(startAt.getTime() + 30 * 60000) });
  }

  await PharmacyListing.findOneAndUpdate(
    { pharmacy: users.PHARMACY._id, medicineName: 'Synthetic demo medicine' },
    { $setOnInsert: {
      pharmacy: users.PHARMACY._id,
      medicineName: 'Synthetic demo medicine',
      activeIngredient: 'Demo active ingredient',
      strength: 'Demo strength',
      dosageForm: 'Tablet',
      packSize: '10 tablets',
      manufacturer: 'Synthetic local demo',
      price: 49.5,
      stockQuantity: 20,
      active: true,
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await SupplierListing.findOneAndUpdate(
    { supplier: users.SUPPLIER._id, productName: 'Synthetic demo examination gloves' },
    { $setOnInsert: {
      supplier: users.SUPPLIER._id,
      productName: 'Synthetic demo examination gloves',
      category: 'Demo consumables',
      description: 'Synthetic local demo listing. Not a real supplier offer.',
      unit: 'box',
      unitPrice: 120,
      stockQuantity: 40,
      leadTimeDays: 2,
      active: true,
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const demoOrganNote = 'Synthetic local demo record. Confirm all data before operational use.';
  const existingOrgan = await Organ.findOne({ notes: demoOrganNote });
  if (!existingOrgan) {
    await Organ.create({
      organType: 'KIDNEY',
      bloodGroup: 'O+',
      status: 'AVAILABLE',
      viabilityHours: 24,
      harvestedAt: new Date(),
      procurementCenter: users.PROCUREMENT_CENTER._id,
      addedBy: users.PROCUREMENT_CENTER._id,
      location: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      notes: demoOrganNote,
    });
  }

  const demoBloodNote = 'Synthetic local demo record. Confirm current stock and suitability.';
  const existingBlood = await BloodUnit.findOne({ notes: demoBloodNote });
  if (!existingBlood) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 10);
    await BloodUnit.create({
      bloodGroup: 'O+',
      component: 'PACKED_RBC',
      quantity: 450,
      units: 2,
      collectedAt: new Date(),
      storageTemp: 4,
      expiryDate,
      bloodBank: users.BLOOD_BANK._id,
      addedBy: users.BLOOD_BANK._id,
      location: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      notes: demoBloodNote,
    });
  }

  const existingRequest = await Request.findOne({ notes: 'Synthetic local demo request.' });
  if (!existingRequest) {
    await Request.create({
      type: 'BLOOD',
      status: 'PENDING',
      urgency: 'ROUTINE',
      resourceDetails: { bloodGroup: 'O+', component: 'PACKED_RBC', quantity: 1 },
      requestedBy: users.HOSPITAL._id,
      hospital: users.HOSPITAL._id,
      notes: 'Synthetic local demo request.',
      statusHistory: [{ status: 'PENDING', changedBy: users.HOSPITAL._id }],
    });
  }

  logger.info('Local demo records are ready. Existing data was left unchanged.');
  logger.info('Demo accounts: admin, patient, doctor, hospital, pharmacy, supplier, bloodbank, procurement @demo.lifenet.test.');
  logger.info('Use the corresponding local-* password printed in the repository README. Never use these accounts in production.');
};

seedData()
  .catch((error) => {
    logger.error(`Demo seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
