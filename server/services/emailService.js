const nodemailer = require('nodemailer');
const config = require('../config');

const sendPasswordReset = async ({ email, name, resetUrl }) => {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    ...(config.email.user ? { auth: { user: config.email.user, pass: config.email.password } } : {}),
  });
  return transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: 'Reset your LifeNet password',
    text: `Hello ${name},\n\nUse this secure link to reset your LifeNet password. It expires in 30 minutes and can only be used once.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Hello ${escapeHtml(name)},</p><p>Use this secure link to reset your LifeNet password. It expires in 30 minutes and can only be used once.</p><p><a href="${escapeHtml(resetUrl)}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });
};

const sendEmailVerification = async ({ email, name, verificationUrl }) => {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    ...(config.email.user ? { auth: { user: config.email.user, pass: config.email.password } } : {}),
  });
  return transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: 'Verify your LifeNet email',
    text: `Hello ${name},\n\nVerify your email to finish creating your LifeNet account. This link expires in 24 hours and can only be used once.\n\n${verificationUrl}\n`,
    html: `<p>Hello ${escapeHtml(name)},</p><p>Verify your email to finish creating your LifeNet account. This link expires in 24 hours and can only be used once.</p><p><a href="${escapeHtml(verificationUrl)}">Verify email</a></p>`,
  });
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

module.exports = { sendPasswordReset, sendEmailVerification };
