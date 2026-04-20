const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  specializations: [{
    type: String
  }],
  workerType: {
    type: String,
    enum: ['regular', 'substitute'],
    default: 'regular'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Worker || mongoose.model('Worker', workerSchema);