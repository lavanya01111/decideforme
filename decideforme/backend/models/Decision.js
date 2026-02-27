/**
 * Decision Model
 * Core model storing each decision request and AI result
 */

const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  metadata: mongoose.Schema.Types.Mixed // optional extra info per option
}, { _id: false });

const decisionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // The question or situation
  title: {
    type: String,
    required: [true, 'Decision title is required'],
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['food', 'outfit', 'task', 'entertainment', 'custom'],
    required: true
  },
  customCategory: String, // used when category === 'custom'

  // Options the user provided
  options: {
    type: [optionSchema],
    validate: {
      validator: v => v.length >= 2,
      message: 'At least 2 options are required'
    }
  },

  // Context passed to AI
  context: {
    mood: String,          // 'happy', 'tired', 'stressed', 'energetic', 'neutral'
    timeAvailable: String, // '15min', '30min', '1hr', 'all day'
    priority: String,      // 'health', 'speed', 'cost', 'enjoyment'
    notes: String,         // Free-form user notes
    weather: String,       // injected from weather API if enabled
    timeOfDay: String      // 'morning', 'afternoon', 'evening', 'night'
  },

  // AI Decision Result
  result: {
    chosen: { type: String },         // The chosen option text
    reason: { type: String },         // AI explanation
    confidence: { type: Number },     // 0-100
    alternatives: [{                  // Runner-up options with brief notes
      option: String,
      note: String
    }],
    tags: [String],                   // e.g. ['healthy', 'quick', 'budget-friendly']
    model: { type: String, default: 'gpt-4o-mini' }
  },

  // Decision mode
  mode: {
    type: String,
    enum: ['instant', 'timer', 'group'],
    default: 'instant'
  },

  // For timer mode
  timerSeconds: Number,
  autoChosen: { type: Boolean, default: false },

  // Group decision ref
  groupVote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupVote'
  },

  // Was user satisfied?
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    followed: Boolean,   // Did they follow the AI choice?
    comment: String
  },

  // For daily automatic decisions
  isScheduled: { type: Boolean, default: false },
  scheduledFor: Date,

  processingTimeMs: Number, // track AI latency

  isDeleted: { type: Boolean, default: false, select: false }
}, {
  timestamps: true
});

// Index for fast history queries
decisionSchema.index({ user: 1, createdAt: -1 });
decisionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Decision', decisionSchema);
