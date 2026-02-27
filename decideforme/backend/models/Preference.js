/**
 * Preferences Model
 * Stores learned user preferences per category for AI context
 */

const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Food preferences
  food: {
    favoriteCuisines: [String],
    dislikedFoods: [String],
    dietaryRestrictions: [String],
    healthGoal: String,
    typicalMealBudget: String,
    preferHomeCooked: Boolean
  },

  // Outfit preferences
  outfit: {
    style: [String],          // ['casual', 'formal', 'sporty']
    favoriteColors: [String],
    dislikedColors: [String],
    occasionTypes: [String]   // ['work', 'gym', 'date', 'home']
  },

  // Task/productivity preferences
  task: {
    workStyle: String,         // 'pomodoro', 'deep-work', 'flexible'
    peakHours: [String],       // ['morning', 'evening']
    defaultPriority: String,   // 'urgency', 'importance', 'ease'
    breakFrequency: String
  },

  // Entertainment preferences
  entertainment: {
    favoriteGenres: [String],
    platforms: [String],       // ['netflix', 'spotify', 'youtube']
    maxDuration: String,
    mood: [String]
  },

  // General AI learning memory
  // Stores patterns detected across all categories
  learnedPatterns: [{
    pattern: String,           // e.g. "Prefers lighter meals when mood is tired"
    category: String,
    confidence: Number,
    observedCount: Number,
    lastUpdated: Date
  }],

  // Recent choices for context window
  recentChoices: [{
    category: String,
    chosen: String,
    context: String,
    date: Date
  }]

}, {
  timestamps: true
});

module.exports = mongoose.model('Preference', preferenceSchema);
