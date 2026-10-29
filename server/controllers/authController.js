const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logAudit } = require('../services/auditService');
const config = require('../config');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { sendPasswordReset, sendEmailVerification } = require('../services/emailService');

const createEmailToken = () => crypto.randomBytes(32).toString('hex');
const hashEmailToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const deliverVerificationEmail = async (user, token) => {
  const origin = config.clientOrigins[0] || 'http://localhost:5173';
  const verificationUrl = `${origin}/verify-email?token=${encodeURIComponent(token)}`;
  if (config.email.isConfigured()) {
    try {
      await sendEmailVerification({ email: user.email, name: user.name, verificationUrl });
    } catch (error) {
      logger.error(`Email verification message could not be sent: ${error.message}`);
    }
  } else if (config.nodeEnv !== 'production') {
    logger.info(`Development email verification link for ${user.email}: ${verificationUrl}`);
  }
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, organization, phone, address, providerDetails } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const emailToken = createEmailToken();
  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'PATIENT',
    verificationStatus: (role || 'PATIENT') === 'PATIENT' ? 'APPROVED' : 'PENDING',
    organization,
    phone,
    address,
    providerDetails,
    emailVerified: false,
    emailVerificationTokenHash: hashEmailToken(emailToken),
    emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // Audit log
  logAudit({
    action: 'USER_REGISTER',
    performedBy: user._id,
    targetModel: 'User',
    targetId: user._id,
    details: { role: user.role, organization, verificationStatus: user.verificationStatus },
    req,
  });

  await deliverVerificationEmail(user, emailToken);

  res.status(201).json({
    success: true,
    data: {
      user,
      verificationStatus: user.verificationStatus,
      emailVerified: user.emailVerified,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password included
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account has been deactivated');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (user.emailVerified === false) {
    throw ApiError.forbidden('Verify your email before signing in. Use the verification link we sent, or request another one.');
  }

  if (user.verificationStatus === 'PENDING') {
    throw ApiError.forbidden('Your provider registration is waiting for administrator review.');
  }
  if (user.verificationStatus === 'REJECTED') {
    throw ApiError.forbidden('This provider registration was not approved. Contact LifeNet support.');
  }

  // Generate tokens
  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  // Store refresh token & update last login
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Audit log
  logAudit({
    action: 'USER_LOGIN',
    performedBy: user._id,
    targetModel: 'User',
    targetId: user._id,
    req,
  });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public (requires valid refresh token cookie)
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw ApiError.unauthorized('No refresh token');
  }

  // Verify the refresh token
  const decoded = verifyRefreshToken(token);

  // Find user with stored refresh token
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || !user.isActive || user.emailVerified === false || (user.role !== 'ADMIN' && user.verificationStatus !== 'APPROVED') || user.refreshToken !== token) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  // Generate new access token
  const accessToken = generateAccessToken({ id: user._id, role: user.role });

  res.json({
    success: true,
    data: { accessToken },
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Protected
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      await User.findOneAndUpdate({ _id: decoded.id, refreshToken: token }, { refreshToken: null });
    } catch {
      // Expired and malformed cookies are still cleared below.
    }
  }

  if (req.user) {
    logAudit({
      action: 'USER_LOGOUT',
      performedBy: req.user._id,
      targetModel: 'User',
      targetId: req.user._id,
      req,
    });
  }

  // Clear cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password +refreshToken');
  if (!user || !user.isActive) throw ApiError.unauthorized('Your account is unavailable.');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw ApiError.badRequest('Your current password is incorrect.');
  }

  user.password = req.body.newPassword;
  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  logAudit({ action: 'USER_PASSWORD_CHANGED', performedBy: user._id, targetModel: 'User', targetId: user._id, req });
  res.json({ success: true, data: { accessToken } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    name: req.body.name,
    phone: req.body.phone,
    ...(req.body.address ? { address: req.body.address } : {}),
  }, { new: true, runValidators: true });
  if (!user || !user.isActive) throw ApiError.notFound('Account not found.');
  logAudit({ action: 'USER_PROFILE_UPDATED', performedBy: user._id, targetModel: 'User', targetId: user._id, req });
  res.json({ success: true, data: user });
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const genericMessage = 'If an active account exists for that email, password reset instructions will be sent shortly.';
  const user = await User.findOne({ email: req.body.email, isActive: true });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    const origin = config.clientOrigins[0] || 'http://localhost:5173';
    const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
    if (config.email.isConfigured()) {
      try {
        await sendPasswordReset({ email: user.email, name: user.name, resetUrl });
      } catch (error) {
        logger.error(`Password reset email could not be sent: ${error.message}`);
      }
    } else if (config.nodeEnv !== 'production') {
      logger.info(`Development password reset link for ${user.email}: ${resetUrl}`);
    }
  }
  res.json({ success: true, message: genericMessage });
});

const resetPassword = asyncHandler(async (req, res) => {
  const tokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const password = await bcrypt.hash(req.body.newPassword, 12);
  const user = await User.findOneAndUpdate(
    { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: new Date() }, isActive: true },
    { $set: { password, passwordResetTokenHash: null, passwordResetExpiresAt: null, refreshToken: null } },
    { new: true, runValidators: true }
  );
  if (!user) throw ApiError.badRequest('This reset link is invalid or expired. Request a new one.');
  logAudit({ action: 'USER_PASSWORD_RESET', performedBy: user._id, targetModel: 'User', targetId: user._id, req });
  res.json({ success: true, message: 'Your password has been reset. Sign in with your new password.' });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const tokenHash = hashEmailToken(req.body.token);
  const user = await User.findOneAndUpdate(
    { emailVerificationTokenHash: tokenHash, emailVerificationExpiresAt: { $gt: new Date() }, emailVerified: false },
    { $set: { emailVerified: true, emailVerificationTokenHash: null, emailVerificationExpiresAt: null } },
    { new: true }
  );
  if (!user) throw ApiError.badRequest('This verification link is invalid, expired, or already used. Request another link.');
  logAudit({ action: 'USER_EMAIL_VERIFIED', performedBy: user._id, targetModel: 'User', targetId: user._id, req });
  res.json({ success: true, message: 'Email verified. You can now sign in.' });
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email, isActive: true });
  if (user && user.emailVerified === false) {
    const token = createEmailToken();
    user.emailVerificationTokenHash = hashEmailToken(token);
    user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    await deliverVerificationEmail(user, token);
  }
  res.json({ success: true, message: 'If the account needs email verification, instructions will be sent shortly.' });
});

module.exports = { register, login, refreshAccessToken, logout, getMe, changePassword, updateProfile, requestPasswordReset, resetPassword, verifyEmail, resendEmailVerification };
