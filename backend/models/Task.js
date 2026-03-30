const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  jobDescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  period: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'custom'],
    default: 'custom'
  },
  maxEmployees: {
    type: Number,
    default: 1
  },
  currentEmployees: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['open', 'filled', 'cancelled', 'completed'],
    default: 'open'
  },
  location: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  publishedToBranches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  isCrossBranch: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
TaskSchema.index({ organization: 1, date: 1 });
TaskSchema.index({ jobDescription: 1, status: 1 });
TaskSchema.index({ branch: 1, date: 1 });

module.exports = mongoose.model('Task', TaskSchema);