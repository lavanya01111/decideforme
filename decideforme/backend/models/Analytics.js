
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  
  totalDecisions: { type: Number, default: 0 },
  totalMinutesSaved: { type: Number, default: 0 }, 
  decisionsFollowed: { type: Number, default: 0 },
  decisionsIgnored: { type: Number, default: 0 },

  
  byCategory: {
    food:          { count: { type: Number, default: 0 }, minutesSaved: { type: Number, default: 0 } },
    outfit:        { count: { type: Number, default: 0 }, minutesSaved: { type: Number, default: 0 } },
    task:          { count: { type: Number, default: 0 }, minutesSaved: { type: Number, default: 0 } },
    entertainment: { count: { type: Number, default: 0 }, minutesSaved: { type: Number, default: 0 } },
    custom:        { count: { type: Number, default: 0 }, minutesSaved: { type: Number, default: 0 } }
  },

  
  moodData: [{
    mood: String,
    count: Number,
    avgConfidence: Number
  }],

  
  weeklyActivity: [{
    weekStart: Date,
    count: Number
  }],

  
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastDecisionDate: Date,

  
  avgConfidence: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },

  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analytics', analyticsSchema);
