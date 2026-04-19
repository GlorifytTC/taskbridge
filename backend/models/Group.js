const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  peopleCount: {
    type: Number,
    required: true,
    min: 1
  },
  requiredSkill: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  preferredRoomType: {
    type: String,
    default: ''
  },
  preferredWorker: {
    type: String,
    default: ''
  },
  startTime: {
    type: String,
    default: '09:00'
  },
  endTime: {
    type: String,
    default: '17:00'
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  assignedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Group', groupSchema);