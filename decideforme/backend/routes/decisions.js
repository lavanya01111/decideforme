/**
 * Decisions Routes
 * POST /api/decisions          - Create + get AI decision
 * GET  /api/decisions          - History (paginated)
 * GET  /api/decisions/:id      - Single decision
 * PUT  /api/decisions/:id/feedback - Submit feedback
 * DELETE /api/decisions/:id    - Soft delete
 */

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Decision = require('../models/Decision');
const Preference = require('../models/Preference');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { makeAIDecision, learnFromDecision } = require('../utils/aiService');

// ─── Create Decision (Main AI endpoint) ──────────────────────────────────────
router.post('/', authenticate, [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('category').isIn(['food', 'outfit', 'task', 'entertainment', 'custom']),
  body('options').isArray({ min: 2, max: 10 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const {
      title, category, customCategory, options, context, mode, timerSeconds
    } = req.body;

    // Add time of day automatically
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

    // Create decision document
    const decision = new Decision({
      user: req.user._id,
      title,
      category,
      customCategory,
      options: options.map(o => ({ text: typeof o === 'string' ? o : o.text })),
      context: { ...context, timeOfDay },
      mode: mode || 'instant',
      timerSeconds
    });

    // Fetch user preferences for AI context
    const preferences = await Preference.findOne({ user: req.user._id });

    // Call AI
    const startTime = Date.now();
    const aiResult = await makeAIDecision(decision, req.user, preferences);

    decision.result = aiResult;
    decision.processingTimeMs = Date.now() - startTime;
    await decision.save();

    // Update analytics and user stats async (don't await)
    updateAnalytics(req.user._id, category).catch(console.error);
    updateRecentChoices(preferences, category, aiResult.chosen, context).catch(console.error);

    res.status(201).json({
      message: 'Decision made!',
      decision
    });

  } catch (err) {
    next(err);
  }
});

// ─── Get Decision History ─────────────────────────────────────────────────────
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isIn(['food', 'outfit', 'task', 'entertainment', 'custom'])
], async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id, isDeleted: { $ne: true } };
    if (req.query.category) filter.category = req.query.category;

    const [decisions, total] = await Promise.all([
      Decision.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Decision.countDocuments(filter)
    ]);

    res.json({
      decisions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── Get Single Decision ──────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const decision = await Decision.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: { $ne: true }
    });

    if (!decision) {
      return res.status(404).json({ error: 'Decision not found.' });
    }

    res.json({ decision });
  } catch (err) {
    next(err);
  }
});

// ─── Submit Feedback ──────────────────────────────────────────────────────────
router.put('/:id/feedback', authenticate, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('followed').optional().isBoolean()
], async (req, res, next) => {
  try {
    const { rating, followed, comment } = req.body;

    const decision = await Decision.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { feedback: { rating, followed, comment } } },
      { new: true }
    );

    if (!decision) return res.status(404).json({ error: 'Decision not found.' });

    // Trigger learning from this feedback
    const preferences = await Preference.findOne({ user: req.user._id });
    learnFromDecision(decision, preferences).catch(console.error);

    // Update analytics
    if (typeof followed === 'boolean') {
      const update = followed
        ? { $inc: { decisionsFollowed: 1 } }
        : { $inc: { decisionsIgnored: 1 } };
      await Analytics.updateOne({ user: req.user._id }, update);
    }

    res.json({ message: 'Feedback saved!', decision });
  } catch (err) {
    next(err);
  }
});

// ─── Delete Decision ──────────────────────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await Decision.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDeleted: true }
    );
    res.json({ message: 'Decision deleted.' });
  } catch (err) {
    next(err);
  }
});

// ─── Helper: Update Analytics ─────────────────────────────────────────────────
async function updateAnalytics(userId, category) {
  const MINUTES_PER_DECISION = 8;
  await Analytics.findOneAndUpdate(
    { user: userId },
    {
      $inc: {
        totalDecisions: 1,
        totalMinutesSaved: MINUTES_PER_DECISION,
        [`byCategory.${category}.count`]: 1,
        [`byCategory.${category}.minutesSaved`]: MINUTES_PER_DECISION
      },
      $set: { updatedAt: new Date() }
    },
    { upsert: true }
  );
  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.totalDecisions': 1, 'stats.minutesSaved': MINUTES_PER_DECISION }
  });
}

// ─── Helper: Update Recent Choices in Preferences ─────────────────────────────
async function updateRecentChoices(preferences, category, chosen, context) {
  if (!preferences) return;
  const entry = {
    category,
    chosen,
    context: context?.mood ? `mood: ${context.mood}` : 'no context',
    date: new Date()
  };
  if (!preferences.recentChoices) preferences.recentChoices = [];
  preferences.recentChoices.push(entry);
  if (preferences.recentChoices.length > 10) {
    preferences.recentChoices = preferences.recentChoices.slice(-10);
  }
  await preferences.save();
}

module.exports = router;
