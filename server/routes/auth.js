const express = require('express');
const router = express.Router();
const { register, login, refreshAccessToken, logout, getMe, changePassword, updateProfile, requestPasswordReset, resetPassword, verifyEmail, resendEmailVerification } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, changePasswordSchema, profileUpdateSchema, passwordResetRequestSchema, passwordResetSchema, emailVerificationSchema, resendEmailVerificationSchema } = require('../utils/validators');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/password/reset-request', validate(passwordResetRequestSchema), requestPasswordReset);
router.post('/password/reset', validate(passwordResetSchema), resetPassword);
router.post('/email/verify', validate(emailVerificationSchema), verifyEmail);
router.post('/email/resend-verification', validate(resendEmailVerificationSchema), resendEmailVerification);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/password', protect, validate(changePasswordSchema), changePassword);
router.put('/profile', protect, validate(profileUpdateSchema), updateProfile);

module.exports = router;
