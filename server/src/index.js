const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Resolve from this file so SMTP and secrets load in Docker/PaaS even when cwd is not /app
dotenv.config({ path: path.join(__dirname, '../.env') });
connectDB();

const { logSmtpStartupCheck, smtpEnvReady } = require('./config/email');

const app = express();

// Railway / Render send X-Forwarded-For. express-rate-limit v7 errors if trust proxy stays false (Express default).
// Use a number (hop count), not `true` — v7 also rejects trust proxy === true (ERR_ERL_PERMISSIVE_TRUST_PROXY).
const trustProxyHopsRaw = process.env.TRUST_PROXY_HOPS;
const trustProxyHops =
  trustProxyHopsRaw != null && String(trustProxyHopsRaw).trim() !== '' && Number.isFinite(Number(trustProxyHopsRaw))
    ? Math.max(1, Math.min(32, Number(trustProxyHopsRaw)))
    : 1;
app.set('trust proxy', trustProxyHops);

// If anything resets settings, rate-limit still sees trust proxy on each request.
app.use((req, _res, next) => {
  if (req.app.get('trust proxy') === false) {
    req.app.set('trust proxy', trustProxyHops);
  }
  next();
});

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — CLIENT_URL is the deployed frontend; add CORS_EXTRA_ORIGINS for local dev hitting this API (e.g. http://localhost:5173)
const normalizeOrigin = (u) => String(u || '').trim().replace(/\/$/, '');
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = new Set(
  [
    normalizeOrigin(clientUrl),
    ...String(process.env.CORS_EXTRA_ORIGINS || '')
      .split(',')
      .map((s) => normalizeOrigin(s))
      .filter(Boolean),
  ],
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(normalizeOrigin(origin))) return callback(null, true);
    return callback(null, false);
  },
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

// Health check (smtpEnvReady: RESEND_API_KEY + FROM_EMAIL set — check logs for "Resend API OK" after boot)
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  env: process.env.NODE_ENV,
  smtpEnvReady,
  trustProxy: app.get('trust proxy'),
  timestamp: new Date().toISOString(),
}));

// 404
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Express trust proxy = ${app.get('trust proxy')} (set TRUST_PROXY_HOPS if Railway uses multiple hops)`);
  logSmtpStartupCheck();
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
