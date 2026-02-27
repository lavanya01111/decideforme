
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
  customCategory: String, 

  
  options: {
    type: [optionSchema],
    validate: {
      validator: v => v.length >= 2,
      message: 'At least 2 options are required'
    }
  },

  
  context: {
    mood: String,          
    timeAvailable: String, 
    priority: String,      
    notes: String,         
    weather: String,       
    timeOfDay: String      
  },


  result: {
    chosen: { type: String },         
    reason: { type: String },        
    confidence: { type: Number },     
    alternatives: [{                  
      option: String,
      note: String
    }],
    tags: [String],                  
    model: { type: String, default: 'gpt-4o-mini' }
  },

  
  mode: {
    type: String,
    enum: ['instant', 'timer', 'group'],
    default: 'instant'
  },

  
  timerSeconds: Number,
  autoChosen: { type: Boolean, default: false },

  
  groupVote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupVote'
  },


  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    followed: Boolean,   
    comment: String
  },

  isScheduled: { type: Boolean, default: false },
  scheduledFor: Date,

  processingTimeMs: Number, 

  isDeleted: { type: Boolean, default: false, select: false }
}, {
  timestamps: true
});


decisionSchema.index({ user: 1, createdAt: -1 });
decisionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Decision', decisionSchema);
