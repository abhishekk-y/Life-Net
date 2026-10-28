const test = require('node:test');
const assert = require('node:assert/strict');
const {
  registerSchema,
  changePasswordSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  emailVerificationSchema,
  resendEmailVerificationSchema,
} = require('../utils/validators');
const User = require('../models/User');

test('patient registration normalizes email and enforces the password floor', () => {
  const parsed = registerSchema.safeParse({ name: 'Sam Patient', email: 'SAM@example.com', password: 'patient-password-1', role: 'PATIENT' });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.email, 'sam@example.com');
  assert.equal(registerSchema.safeParse({ name: 'Sam Patient', email: 'sam@example.com', password: 'short', role: 'PATIENT' }).success, false);
});

test('provider registration requires organization and a reviewable registration identifier', () => {
  const valid = {
    name: 'Dr Example', email: 'doctor@example.com', password: 'a-long-safe-password', role: 'DOCTOR', organization: 'Example Clinic',
    providerDetails: { specialty: 'Family medicine', qualification: 'MBBS', registrationNumber: 'REG-123' },
  };
  assert.equal(registerSchema.safeParse(valid).success, true);
  assert.equal(registerSchema.safeParse({ ...valid, providerDetails: { specialty: 'Family medicine', qualification: 'MBBS' } }).success, false);
});

test('password changes require a distinct password with at least 12 characters', () => {
  assert.equal(changePasswordSchema.safeParse({ currentPassword: 'old-password', newPassword: 'new-password-123' }).success, true);
  assert.equal(changePasswordSchema.safeParse({ currentPassword: 'same-password', newPassword: 'same-password' }).success, false);
  assert.equal(changePasswordSchema.safeParse({ currentPassword: 'old-password', newPassword: 'too-short' }).success, false);
});

test('password reset requests normalize the email and reset tokens require sufficient entropy length', () => {
  const email = passwordResetRequestSchema.parse({ email: 'USER@EXAMPLE.COM' });
  assert.equal(email.email, 'user@example.com');
  assert.equal(passwordResetSchema.safeParse({ token: 'a'.repeat(64), newPassword: 'new-password-123' }).success, true);
  assert.equal(passwordResetSchema.safeParse({ token: 'short', newPassword: 'new-password-123' }).success, false);
});

test('email verification accepts opaque tokens and normalizes resend addresses', () => {
  assert.equal(emailVerificationSchema.safeParse({ token: 'b'.repeat(64) }).success, true);
  assert.equal(emailVerificationSchema.safeParse({ token: 'short' }).success, false);
  assert.equal(resendEmailVerificationSchema.parse({ email: 'USER@EXAMPLE.COM' }).email, 'user@example.com');
});

test('serialized user responses never include password, refresh, or email-token secrets', () => {
  const user = new User({
    name: 'Example User',
    email: 'user@example.com',
    password: 'password-hash',
    refreshToken: 'refresh-secret',
    passwordResetTokenHash: 'reset-hash',
    passwordResetExpiresAt: new Date(),
    emailVerificationTokenHash: 'verification-hash',
    emailVerificationExpiresAt: new Date(),
  });
  const serialized = user.toJSON();
  for (const key of ['password', 'refreshToken', 'passwordResetTokenHash', 'passwordResetExpiresAt', 'emailVerificationTokenHash', 'emailVerificationExpiresAt']) {
    assert.equal(Object.hasOwn(serialized, key), false, `${key} should not be serialized`);
  }
});
