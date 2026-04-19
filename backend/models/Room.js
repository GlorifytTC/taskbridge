const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['Classroom', 'Laboratory', 'Medical', 'Office', 'Factory', 'Conference', 'Other'],
    default: 'Classroom'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  floor: {
    type: String,
    default: ''
  },
  building: {
    type: String,
    default: ''
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);