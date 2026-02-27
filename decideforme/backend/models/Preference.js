

const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },


  food: {
    favoriteCuisines: [String],
    dislikedFoods: [String],
    dietaryRestrictions: [String],
    healthGoal: String,
    typicalMealBudget: String,
    preferHomeCooked: Boolean
  },


  outfit: {
    style: [String],         
    favoriteColors: [String],
    dislikedColors: [String],
    occasionTypes: [String]   
  },

  
  task: {
    workStyle: String,         
    peakHours: [String],      
    defaultPriority: String,   
    breakFrequency: String
  },

  
  entertainment: {
    favoriteGenres: [String],
    platforms: [String],       
    maxDuration: String,
    mood: [String]
  },


  learnedPatterns: [{
    pattern: String,           
    category: String,
    confidence: Number,
    observedCount: Number,
    lastUpdated: Date
  }],


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
