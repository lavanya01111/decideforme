

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
    select: false 
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

  profile: {
    age: Number,
    dietaryRestrictions: [String], 
    fitnessGoal: String,           
    workStyle: String,             
    budget: {
      food: String,     
      entertainment: String,
      general: String
    }
  },
  stats: {
    totalDecisions: { type: Number, default: 0 },
    minutesSaved: { type: Number, default: 0 },  
    currentStreak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
