const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'create', 'update', 'delete', 'login', 'logout',
      'approve', 'reject', 'assign', 'transfer', 'pause',
      'resume', 'cancel', 'export', 'import', 'view',
      'change_plan'  // ✅ ADD THIS LINE
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: [
      'user', 'organization', 'branch', 'task', 'application',
      'job_description', 'subscription', 'payment', 'report'
    ]
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  },
  errorMessage: String
}, {
  timestamps: true
});

// Indexes for efficient querying
AuditLogSchema.index({ organization: 1, createdAt: -1 });
AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);