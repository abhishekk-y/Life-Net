const nodemailer = require('nodemailer');
const config = require('../config');

async function sendMail(message) {
  if (config.email.provider === 'brevo') {
    const senderMatch = String(config.email.from).match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
    const sender = senderMatch
      ? { email: senderMatch[2].trim(), ...(senderMatch[1].trim() ? { name: senderMatch[1].trim() } : {}) }
      : { email: config.email.from.trim() };
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': config.email.apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ sender, to: [{ email: message.to }], subject: message.subject, textContent: message.text, htmlContent: message.html }),
    });
    if (!response.ok) {
      const responseBody = await response.text();
      let providerMessage = '';
      try {
        const details = JSON.parse(responseBody);
        providerMessage = details.message || details.code || '';
      } catch {
        // Keep provider responses bounded and avoid logging request headers or credentials.
        providerMessage = responseBody.slice(0, 300);
      }
      throw new Error(`Brevo email request failed (${response.status})${providerMessage ? `: ${providerMessage}` : ''}`);
    }
    return response.json().catch(() => ({}));
  }
  const transporter = nodemailer.createTransport({ host: config.email.host, port: config.email.port, secure: config.email.secure, ...(config.email.user ? { auth: { user: config.email.user, pass: config.email.password } } : {}) });
  return transporter.sendMail(message);
}

const sendPasswordReset = async ({ email, name, resetUrl }) => {
  return sendMail({
    from: config.email.from,
    to: email,
    subject: 'Reset your LifeNet password',
    text: `Hello ${name},\n\nUse this secure link to reset your LifeNet password. It expires in 30 minutes and can only be used once.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Hello ${escapeHtml(name)},</p><p>Use this secure link to reset your LifeNet password. It expires in 30 minutes and can only be used once.</p><p><a href="${escapeHtml(resetUrl)}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });
};

const sendEmailVerification = async ({ email, name, verificationUrl }) => {
  return sendMail({
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
