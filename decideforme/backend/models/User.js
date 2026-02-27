/**
 * User Model
 * Stores user account data and profile
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Never return password in queries
  },
  avatar: {
    type: String,
    default: null
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  // Quick profile data for AI context
  profile: {
    age: Number,
    dietaryRestrictions: [String], // ['vegetarian', 'gluten-free', etc.]
    fitnessGoal: String,           // 'lose weight', 'maintain', 'gain muscle'
    workStyle: String,             // 'focused', 'flexible', 'deadline-driven'
    budget: {
      food: String,     // 'low', 'medium', 'high'
      entertainment: String,
      general: String
    }
  },
  stats: {
    totalDecisions: { type: Number, default: 0 },
    minutesSaved: { type: Number, default: 0 },  // Each decision = ~8 min saved
    currentStreak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
