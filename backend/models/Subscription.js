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
    enum: ['trial', 'basic', 'standard', 'professional', 'business', 'enterprise', 'unlimited'],
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
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'SEK'
    },
    vat: {
      rate: {
        type: Number,
        default: 25
      },
      amount: Number
    },
    monthlyPrice: Number
  },
  features: {
    maxEmployees: {
      type: Number,
      default: 10
    },
    maxBranches: {
      type: Number,
      default: 2
    },
    maxEmailsPerMonth: {
      type: Number,
      default: 50
    },
    maxAdmins: {
      type: Number,
      default: 1
    },
    reportLevel: {
      type: String,
      enum: ['basic', 'standard', 'advanced', 'premium', 'unlimited'],
      default: 'basic'
    },
    exportReports: {
      type: Boolean,
      default: false
    },
    customReports: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    unlimited: {
      type: Boolean,
      default: false
    }
  },
  usage: {
    currentEmployees: {
      type: Number,
      default: 0
    },
    currentBranches: {
      type: Number,
      default: 0
    },
    emailsSentThisMonth: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  lastPaymentDate: Date,
  nextPaymentDate: Date,
  cancelledAt: Date,
  pauseReason: String,
  upgradedFromPlan: String,
  upgradedAt: Date
}, {
  timestamps: true
});

// Plan pricing and features mapping
SubscriptionSchema.statics.PLAN_FEATURES = {
  trial: {
    name: 'Trial',
    price: 0,
    maxEmployees: 10,
    maxBranches: 2,
    maxEmailsPerMonth: 50,
    maxAdmins: 1,
    reportLevel: 'basic',
    exportReports: false,
    customReports: false,
    apiAccess: false,
    prioritySupport: false,
    trialDays: 14
  },
  basic: {
    name: 'Basic',
    price: 500,
    maxEmployees: 20,
    maxBranches: 3,
    maxEmailsPerMonth: 100,
    maxAdmins: 2,
    reportLevel: 'basic',
    exportReports: false,
    customReports: false,
    apiAccess: false,
    prioritySupport: false
  },
  standard: {
    name: 'Standard',
    price: 1000,
    maxEmployees: 50,
    maxBranches: 5,
    maxEmailsPerMonth: 250,
    maxAdmins: 3,
    reportLevel: 'standard',
    exportReports: false,
    customReports: false,
    apiAccess: false,
    prioritySupport: false
  },
  professional: {
    name: 'Professional',
    price: 1750,
    maxEmployees: 100,
    maxBranches: 10,
    maxEmailsPerMonth: 500,
    maxAdmins: 5,
    reportLevel: 'advanced',
    exportReports: false,
    customReports: false,
    apiAccess: false,
    prioritySupport: false
  },
  business: {
    name: 'Business',
    price: 2500,
    maxEmployees: 200,
    maxBranches: 20,
    maxEmailsPerMonth: 1000,
    maxAdmins: 10,
    reportLevel: 'advanced',
    exportReports: true,
    customReports: false,
    apiAccess: false,
    prioritySupport: false
  },
  enterprise: {
    name: 'Enterprise',
    price: 5000,
    maxEmployees: 500,
    maxBranches: 50,
    maxEmailsPerMonth: 2500,
    maxAdmins: 20,
    reportLevel: 'premium',
    exportReports: true,
    customReports: true,
    apiAccess: true,
    prioritySupport: false
  },
  unlimited: {
    name: 'Unlimited',
    price: 15000,
    maxEmployees: Infinity,
    maxBranches: Infinity,
    maxEmailsPerMonth: Infinity,
    maxAdmins: Infinity,
    reportLevel: 'unlimited',
    exportReports: true,
    customReports: true,
    apiAccess: true,
    prioritySupport: true
  }
};

// Calculate VAT amount
SubscriptionSchema.methods.calculateVAT = function() {
  const vatRate = 25; // Sweden VAT
  const vatAmount = (this.price.amount * vatRate) / 100;
  this.price.vat = {
    rate: vatRate,
    amount: vatAmount
  };
  return vatAmount;
};

// Check if subscription is active
SubscriptionSchema.methods.isActive = function() {
  return (this.status === 'active' || this.status === 'trial') && this.endDate > new Date();
};

// Get days remaining
SubscriptionSchema.methods.getDaysRemaining = function() {
  if (!this.endDate) return 0;
  const days = Math.ceil((this.endDate - new Date()) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

// Get usage percentage for a feature
SubscriptionSchema.methods.getUsagePercentage = function(feature) {
  const plan = this.constructor.PLAN_FEATURES[this.plan];
  if (!plan) return 0;
  
  switch(feature) {
    case 'employees':
      const maxEmployees = plan.maxEmployees;
      return maxEmployees === Infinity ? 0 : (this.usage.currentEmployees / maxEmployees) * 100;
    case 'branches':
      const maxBranches = plan.maxBranches;
      return maxBranches === Infinity ? 0 : (this.usage.currentBranches / maxBranches) * 100;
    case 'emails':
      const maxEmails = plan.maxEmailsPerMonth;
      return maxEmails === Infinity ? 0 : (this.usage.emailsSentThisMonth / maxEmails) * 100;
    default:
      return 0;
  }
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);