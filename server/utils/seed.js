const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organ = require('../models/Organ');
const BloodUnit = require('../models/BloodUnit');
const Request = require('../models/Request');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

/**
 * Seed the database with sample data for development/demo.
 * Run: node utils/seed.js
 */
const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Organ.deleteMany({}),
      BloodUnit.deleteMany({}),
      Request.deleteMany({}),
    ]);

    logger.info('Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@lifenet.com',
        password: 'admin',
        role: 'ADMIN',
        organization: 'LifeNet Central',
        phone: '+91-9876543210',
        address: { city: 'New Delhi', state: 'Delhi', country: 'India' },
      },
      {
        name: 'City Hospital',
        email: 'hospital@lifenet.com',
        password: 'hospital123',
        role: 'HOSPITAL',
        organization: 'City General Hospital',
        phone: '+91-9876543211',
        address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      },
      {
        name: 'Red Cross Blood Bank',
        email: 'bloodbank@lifenet.com',
        password: 'bloodbank123',
        role: 'BLOOD_BANK',
        organization: 'Red Cross Blood Bank',
        phone: '+91-9876543212',
        address: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
      },
      {
        name: 'National Organ Center',
        email: 'procurement@lifenet.com',
        password: 'procurement123',
        role: 'PROCUREMENT_CENTER',
        organization: 'National Organ Procurement Center',
        phone: '+91-9876543213',
        address: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      },
      {
        name: 'Apollo Hospital',
        email: 'apollo@lifenet.com',
        password: 'apollo123',
        role: 'HOSPITAL',
        organization: 'Apollo Hospitals',
        phone: '+91-9876543214',
        address: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
      },
    ]);

    logger.info(`Created ${users.length} users`);

    const procurement = users.find((u) => u.role === 'PROCUREMENT_CENTER');
    const bloodBank = users.find((u) => u.role === 'BLOOD_BANK');
    const hospital = users.find((u) => u.role === 'HOSPITAL');

    // Create organs
    const organs = await Organ.create([
      {
        organType: 'KIDNEY', bloodGroup: 'O+', status: 'AVAILABLE',
        donorAge: 28, donorGender: 'MALE', viabilityHours: 36,
        procurementCenter: procurement._id, addedBy: procurement._id,
        location: { city: 'Chennai', state: 'Tamil Nadu' },
      },
      {
        organType: 'LIVER', bloodGroup: 'A+', status: 'AVAILABLE',
        donorAge: 35, donorGender: 'FEMALE', viabilityHours: 12,
        procurementCenter: procurement._id, addedBy: procurement._id,
        location: { city: 'Chennai', state: 'Tamil Nadu' },
      },
      {
        organType: 'HEART', bloodGroup: 'B+', status: 'AVAILABLE',
        donorAge: 22, donorGender: 'MALE', viabilityHours: 6,
        procurementCenter: procurement._id, addedBy: procurement._id,
        location: { city: 'Delhi', state: 'Delhi' },
      },
      {
        organType: 'CORNEA', bloodGroup: 'AB+', status: 'AVAILABLE',
        donorAge: 45, donorGender: 'FEMALE', viabilityHours: 168,
        procurementCenter: procurement._id, addedBy: procurement._id,
        location: { city: 'Mumbai', state: 'Maharashtra' },
      },
      {
        organType: 'KIDNEY', bloodGroup: 'A-', status: 'AVAILABLE',
        donorAge: 30, donorGender: 'MALE', viabilityHours: 36,
        procurementCenter: procurement._id, addedBy: procurement._id,
        location: { city: 'Bangalore', state: 'Karnataka' },
      },
      {
        organType: 'LUNG', bloodGroup: 'O-', status: 'AVAILABLE',
        donorAge: 25, donorGender: 'FEMALE', viabilityHours: 8,
        procurementCenter: procurement._id, addedBy: procurement._id,
        location: { city: 'Hyderabad', state: 'Telangana' },
      },
    ]);

    logger.info(`Created ${organs.length} organs`);

    // Create blood units
    const now = new Date();
    const bloodUnits = await BloodUnit.create([
      {
        bloodGroup: 'O+', component: 'WHOLE_BLOOD', quantity: 450, units: 3,
        storageTemp: 4, donorId: 'D-001', bloodBank: bloodBank._id, addedBy: bloodBank._id,
        collectedAt: now, expiryDate: new Date(now.getTime() + 35 * 86400000),
        location: { city: 'Bangalore', state: 'Karnataka' },
      },
      {
        bloodGroup: 'A+', component: 'PACKED_RBC', quantity: 300, units: 5,
        storageTemp: 3, donorId: 'D-002', bloodBank: bloodBank._id, addedBy: bloodBank._id,
        collectedAt: now, expiryDate: new Date(now.getTime() + 42 * 86400000),
        location: { city: 'Bangalore', state: 'Karnataka' },
      },
      {
        bloodGroup: 'B+', component: 'PLATELETS', quantity: 200, units: 2,
        storageTemp: 22, donorId: 'D-003', bloodBank: bloodBank._id, addedBy: bloodBank._id,
        collectedAt: now, expiryDate: new Date(now.getTime() + 5 * 86400000),
        location: { city: 'Bangalore', state: 'Karnataka' },
      },
      {
        bloodGroup: 'AB-', component: 'PLASMA', quantity: 250, units: 4,
        storageTemp: -20, donorId: 'D-004', bloodBank: bloodBank._id, addedBy: bloodBank._id,
        collectedAt: now, expiryDate: new Date(now.getTime() + 365 * 86400000),
        location: { city: 'Bangalore', state: 'Karnataka' },
      },
      {
        bloodGroup: 'O-', component: 'WHOLE_BLOOD', quantity: 450, units: 2,
        storageTemp: 5, donorId: 'D-005', bloodBank: bloodBank._id, addedBy: bloodBank._id,
        collectedAt: now, expiryDate: new Date(now.getTime() + 28 * 86400000),
        location: { city: 'Mumbai', state: 'Maharashtra' },
      },
      {
        bloodGroup: 'A-', component: 'PACKED_RBC', quantity: 300, units: 1,
        storageTemp: 4, donorId: 'D-006', bloodBank: bloodBank._id, addedBy: bloodBank._id,
        collectedAt: now, expiryDate: new Date(now.getTime() + 14 * 86400000),
        location: { city: 'Chennai', state: 'Tamil Nadu' },
      },
      {
        bloodGroup: 'B-', component: 'WHOLE_BLOOD', quantity: 450, units: 3,
        storageTemp: 4, donorId: 'D-007', bloodBank: bloodBank._id, addedBy: bloodBank._id,
        collectedAt: now, expiryDate: new Date(now.getTime() + 30 * 86400000),
        location: { city: 'Delhi', state: 'Delhi' },
      },
      {
        bloodGroup: 'AB+', component: 'PLATELETS', quantity: 150, units: 2,
        storageTemp: 21, donorId: 'D-008', bloodBank: bloodBank._id, addedBy: bloodBank._id,
        collectedAt: now, expiryDate: new Date(now.getTime() + 3 * 86400000),
        location: { city: 'Hyderabad', state: 'Telangana' },
      },
    ]);

    logger.info(`Created ${bloodUnits.length} blood units`);

    // Create sample requests
    const requests = await Request.create([
      {
        type: 'BLOOD', status: 'PENDING', urgency: 'EMERGENCY',
        resourceDetails: { bloodGroup: 'O-', component: 'WHOLE_BLOOD', quantity: 450 },
        patientAge: 45, patientGender: 'MALE',
        requestedBy: hospital._id, hospital: hospital._id,
      },
      {
        type: 'ORGAN', status: 'PENDING', urgency: 'URGENT',
        resourceDetails: { bloodGroup: 'A+', organType: 'KIDNEY' },
        patientAge: 52, patientGender: 'FEMALE',
        requestedBy: hospital._id, hospital: hospital._id,
      },
      {
        type: 'BLOOD', status: 'COMPLETED', urgency: 'ROUTINE',
        resourceDetails: { bloodGroup: 'B+', component: 'PACKED_RBC', quantity: 300 },
        patientAge: 30, patientGender: 'MALE',
        requestedBy: hospital._id, hospital: hospital._id,
        completedAt: new Date(now.getTime() - 2 * 86400000),
      },
    ]);

    logger.info(`Created ${requests.length} requests`);

    logger.info('✅ Database seeded successfully!');
    logger.info('');
    logger.info('📝 Login Credentials:');
    logger.info('───────────────────────────────');
    logger.info('Admin:       admin@lifenet.com / admin');
    logger.info('Hospital:    hospital@lifenet.com / hospital123');
    logger.info('Blood Bank:  bloodbank@lifenet.com / bloodbank123');
    logger.info('Procurement: procurement@lifenet.com / procurement123');
    logger.info('───────────────────────────────');

    process.exit(0);
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
