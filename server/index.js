const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

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

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// ===================== MIDDLEWARE =====================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logging
app.use(morgan('dev'));

// ===================== ROUTES =====================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LifeNet API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/organs', organRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use(errorHandler);

// ===================== START SERVER =====================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Socket.io handlers
    initSocket(io);

    server.listen(config.port, () => {
      logger.info(`🚀 LifeNet Server running on port ${config.port} [${config.nodeEnv}]`);
      logger.info(`📡 Socket.io ready`);
      logger.info(`🔗 API: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server };
