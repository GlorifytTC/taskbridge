const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  attendanceStatus: {
    type: String,
    enum: ['pending', 'present', 'absent', 'late'],
    default: 'pending'
  },
  hoursWorked: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure one application per task per employee
ApplicationSchema.index({ task: 1, employee: 1 }, { unique: true });
ApplicationSchema.index({ organization: 1, status: 1 });
ApplicationSchema.index({ employee: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);