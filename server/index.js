const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const config = require('./config');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./sockets');

// Route imports
const authRoutes = require('./routes/auth');
const organRoutes = require('./routes/organs');
const bloodRoutes = require('./routes/blood');
const requestRoutes = require('./routes/requests');
const dashboardRoutes = require('./routes/dashboard');
const centersRoutes = require('./routes/centers');
const doctorsRoutes = require('./routes/doctors');
const appointmentsRoutes = require('./routes/appointments');
const pharmaciesRoutes = require('./routes/pharmacies');
const suppliersRoutes = require('./routes/suppliers');

// Initialize Express
const app = express();
const server = http.createServer(app);
app.set('trust proxy', config.trustProxy);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || config.clientOrigins.includes(origin)) return callback(null, true);
    if (config.nodeEnv !== 'production' && config.clientOrigins.length === 0) return callback(null, true);
    return callback(new Error('This origin is not allowed to access the LifeNet API'));
  },
  credentials: true,
  optionsSuccessStatus: 204,
};

// Initialize Socket.io
const io = new Server(server, {
  cors: corsOptions,
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// ===================== MIDDLEWARE =====================

// Security headers
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts' },
});
app.use('/api/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logging
app.use(morgan('dev'));

// ===================== ROUTES =====================

app.get('/api/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    message: databaseReady ? 'LifeNet API and database are ready' : 'LifeNet database is unavailable',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/organs', organRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/centers', centersRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/pharmacies', pharmaciesRoutes);
app.use('/api/suppliers', suppliersRoutes);

// In production, serve the built client and API from the same origin. This
// keeps cookie authentication and Socket.IO on one host without extra CORS setup.
const clientBuildPath = path.join(__dirname, 'public');
if (config.nodeEnv === 'production' && fs.existsSync(path.join(clientBuildPath, 'index.html'))) {
  app.use(express.static(clientBuildPath, { index: false, maxAge: '1d' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) return next();
    return res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use(errorHandler);

// ===================== START SERVER =====================

const startServer = async () => {
  try {
    config.validate();
    // Connect to MongoDB
    await connectDB();

    // Initialize Socket.io handlers
    initSocket(io);

    server.listen(config.port, '0.0.0.0', () => {
      logger.info(`🚀 LifeNet Server running on port ${config.port} [${config.nodeEnv}]`);
      logger.info(`📡 Socket.io ready`);
      logger.info(`🔗 API: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  logger.info(`${signal} received. Closing LifeNet server.`);
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server };
