/**
 * DecideForMe - Main Server Entry Point
 * Production-ready Express + MongoDB backend
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Workaround for MongoDB querySrv ECONNREFUSED error common on some Windows setups / ISPs
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
  console.warn('Could not set DNS servers manually:', err.message);
}

// Route imports
const authRoutes = require('./routes/auth');
const decisionRoutes = require('./routes/decisions');
const preferenceRoutes = require('./routes/preferences');
const analyticsRoutes = require('./routes/analytics');
const groupRoutes = require('./routes/groups');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser clients (curl/postman) with no Origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// AI endpoint gets stricter limits (costs money per call)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'AI rate limit reached. Please wait a minute.' }
});
app.use('/api/decisions/decide', aiLimiter);

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/groups', groupRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DecideForMe server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
