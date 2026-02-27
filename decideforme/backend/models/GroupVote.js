
const mongoose = require('mongoose');

const groupVoteSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: String,
  options: [{
    text: String,
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    voteCount: { type: Number, default: 0 }
  }],
  
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    hasVoted: { type: Boolean, default: false },
    votedFor: String
  }],
  
  shareToken: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'decided'],
    default: 'open'
  },
  winner: String,
  aiBreaksTie: { type: Boolean, default: true },
  expiresAt: Date,
  maxParticipants: { type: Number, default: 20 }
}, {
  timestamps: true
});

module.exports = mongoose.model('GroupVote', groupVoteSchema);
