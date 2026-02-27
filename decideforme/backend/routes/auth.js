/**
 * Auth Routes
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 * PUT  /api/auth/profile
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Preference = require('../models/Preference');
const Analytics = require('../models/Analytics');
const { authenticate } = require('../middleware/auth');

// Helper: generate JWT
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// ─── Register ────────────────────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Initialize preferences and analytics
    await Preference.create({ user: user._id });
    await Analytics.create({ user: user._id });

    const token = signToken(user._id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Get user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last active
    user.stats.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.json({
      message: 'Logged in successfully!',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

// ─── Get Current User ─────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// ─── Update Profile ───────────────────────────────────────────────────────────
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const allowedFields = ['name', 'theme', 'timezone', 'profile'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated!', user });
  } catch (err) {
    next(err);
  }
});

// ─── Change Password ──────────────────────────────────────────────────────────
router.put('/password', authenticate, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
