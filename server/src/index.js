const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  clientUrl,
  clientUrl.replace(/\/$/, ''),
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Global rate limit
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  message: { message: 'Too many requests, please try again later.' },
}));

// Stricter limit for auth
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many auth attempts, please try again later.' },
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/ideas', require('./routes/ideaRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  env: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
}));

// 404
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
