const dotenv = require('dotenv');
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const trustProxyValue = process.env.TRUST_PROXY;
const trustProxy = trustProxyValue === undefined
  ? false
  : trustProxyValue.toLowerCase() === 'false'
    ? false
    : trustProxyValue.toLowerCase() === 'true'
    ? 1
    : /^\d+$/.test(trustProxyValue)
      ? Number(trustProxyValue)
      : trustProxyValue;

const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv,
  trustProxy,
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || (nodeEnv === 'development' ? 'mongodb://localhost:27017/lifenet' : ''),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || (nodeEnv === 'development' ? 'dev_access_secret' : ''),
    refreshSecret: process.env.JWT_REFRESH_SECRET || (nodeEnv === 'development' ? 'dev_refresh_secret' : ''),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  clientOrigins: (process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || (nodeEnv === 'development' ? 'http://localhost:5173,http://localhost:5000' : ''))
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean),
  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    apiKey: process.env.BREVO_API_KEY || '',
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || '',
  },
};

config.email.isConfigured = () => config.email.provider === 'brevo'
  ? Boolean(config.email.apiKey && config.email.from)
  : Boolean(config.email.host && config.email.from);

config.validate = () => {
  if (config.nodeEnv !== 'production') return;

  const missing = [];
  if (!config.mongoUri) missing.push('MONGO_URI');
  if (config.jwt.accessSecret.length < 32) missing.push('JWT_ACCESS_SECRET (at least 32 characters)');
  if (config.jwt.refreshSecret.length < 32) missing.push('JWT_REFRESH_SECRET (at least 32 characters)');
  if (/replace-with|change-me|example|dev_access_secret/i.test(config.jwt.accessSecret)) missing.push('JWT_ACCESS_SECRET (replace the example value)');
  if (/replace-with|change-me|example|dev_refresh_secret/i.test(config.jwt.refreshSecret)) missing.push('JWT_REFRESH_SECRET (replace the example value)');
  if (config.jwt.accessSecret && config.jwt.accessSecret === config.jwt.refreshSecret) {
    missing.push('different access and refresh secrets');
  }
  if (config.email.provider === 'brevo' && !config.email.apiKey) missing.push('BREVO_API_KEY');
  if (config.email.provider !== 'brevo' && !config.email.host) missing.push('SMTP_HOST');
  if (!config.email.from) missing.push('SMTP_FROM');

  if (missing.length) {
    throw new Error(`Production configuration is incomplete: ${missing.join(', ')}`);
  }
};

module.exports = config;

