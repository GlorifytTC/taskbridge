const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  warnings: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'override'],
    default: 'pending'
  },
  userOverridden: {
    type: Boolean,
    default: false
  },
  originalSuggestion: {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    matchScore: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);