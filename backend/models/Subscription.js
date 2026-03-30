const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['trial', 'basic', 'professional', 'enterprise'],
    default: 'trial'
  },
  status: {
    type: String,
    enum: ['active', 'trial', 'paused', 'cancelled', 'expired'],
    default: 'trial'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  trialEndDate: {
    type: Date
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  price: {
    amount: Number,
    currency: {
      type: String,
      default: 'SEK'
    },
    vat: {
      rate: Number,
      amount: Number
    }
  },
  features: {
    maxEmployees: {
      type: Number,
      default: 10
    },
    maxBranches: {
      type: Number,
      default: 1
    },
    crossBranchTasks: {
      type: Boolean,
      default: false
    },
    reports: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    }
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  lastPaymentDate: Date,
  nextPaymentDate: Date,
  cancelledAt: Date,
  pauseReason: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);