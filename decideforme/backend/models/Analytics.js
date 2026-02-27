/**
 * Analytics Model
 * Aggregated stats per user for the dashboard
 */

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Total counters
  totalDecisions: { type: Number, default: 0 },
  totalMinutesSaved: { type: Number, default: 0 }, // avg 8 min per decision
  decisionsFollowed: { type: Number, default: 0 },
  decisionsIgnored: { type: Number, default: 0 },

  // Per category breakdown
  byCategory: {
    food:          { count: { type: Number, default: 0 }, minutesSaved: { type: Number, default: 0 } },
    outfit:        { count: { type: Number, default: 0 }, minutesSaved: { type: Number, default: 0 } },
    task:          { count: { type: Number, default: 0 }, minutesSaved: { type: Number, default: 0 } },
    entertainment: { count: { type: Number, default: 0 }, minutesSaved: { type: Number, default: 0 } },
    custom:        { count: { type: Number, default: 0 }, minutesSaved: { type: Number, default: 0 } }
  },

  // Mood correlation
  moodData: [{
    mood: String,
    count: Number,
    avgConfidence: Number
  }],

  // Weekly activity (last 12 weeks)
  weeklyActivity: [{
    weekStart: Date,
    count: Number
  }],

  // Streaks
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastDecisionDate: Date,

  // AI accuracy (based on feedback)
  avgConfidence: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },

  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analytics', analyticsSchema);
