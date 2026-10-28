const mongoose = require('mongoose');
const config = require('../config');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  config.validate();
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Set BOOTSTRAP_ADMIN_EMAIL to the administrator email.');
  if (!password || password.length < 16) throw new Error('Set BOOTSTRAP_ADMIN_PASSWORD to a unique password of at least 16 characters.');

  await connectDB();
  const existingAdmin = await User.exists({ role: 'ADMIN', isActive: true });
  if (existingAdmin) throw new Error('An active administrator already exists. Bootstrap only creates the first active administrator.');
  if (await User.exists({ email })) throw new Error('That email is already registered. Use a different administrator email.');

  const admin = await User.create({
    name: process.env.BOOTSTRAP_ADMIN_NAME?.trim() || 'LifeNet Administrator',
    email,
    password,
    role: 'ADMIN',
    verificationStatus: 'APPROVED',
    organization: 'LifeNet Operations',
  });
  process.stdout.write(`Administrator account created for ${admin.email}. Remove the bootstrap environment values now.\n`);
};

run()
  .catch((error) => {
    process.stderr.write(`Administrator bootstrap failed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => { await mongoose.disconnect(); });
