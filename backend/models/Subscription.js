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
    enum: ['trial', 'basic', 'standard', 'professional', 'business', 'enterprise'],
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
    default: true  // Auto-renew by default
  },
  cancelledAt: {
    type: Date
  },
  pauseReason: String,
  upgradedFromPlan: String,
  upgradedAt: Date,
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
      default: 50  // LIMITED - no infinity!
    },
    maxAdmins: {
      type: Number,
      default: 1
    },
    reportLevel: {
      type: String,
      enum: ['basic', 'standard', 'advanced', 'premium'],
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
  lastPaymentDate: Date,
  nextPaymentDate: Date
}, {
  timestamps: true
});

// PLAN FEATURES - REALISTIC LIMITS (NO INFINITY!)
SubscriptionSchema.statics.PLAN_FEATURES = {
  trial: {
    name: 'Trial',
    price: 0,
    maxEmployees: 10,
    maxBranches: 2,
    maxEmailsPerMonth: 50,    // Limited!
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
    maxEmailsPerMonth: 100,   // Limited!
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
    maxEmailsPerMonth: 250,   // Limited!
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
    maxEmailsPerMonth: 500,   // Limited!
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
    maxEmailsPerMonth: 1000,  // Limited!
    maxAdmins: 10,
    reportLevel: 'advanced',
    exportReports: true,
    customReports: false,
    apiAccess: false,
    prioritySupport: true
  },
  enterprise: {
    name: 'Enterprise',
    price: 5000,
    maxEmployees: 500,
    maxBranches: 50,
    maxEmailsPerMonth: 2500,  // Limited!
    maxAdmins: 20,
    reportLevel: 'premium',
    exportReports: true,
    customReports: true,
    apiAccess: true,
    prioritySupport: true
  }
};

// Auto-renew monthly subscription
SubscriptionSchema.methods.renewIfNeeded = async function() {
  const now = new Date();
  
  // Check if subscription expired
  if (this.endDate < now && this.status === 'active' && this.autoRenew) {
    // Renew for another month
    this.startDate = now;
    this.endDate = new Date(now.setMonth(now.getMonth() + 1));
    this.lastPaymentDate = new Date();
    this.nextPaymentDate = this.endDate;
    
    // Reset monthly usage counters
    this.usage.emailsSentThisMonth = 0;
    this.usage.lastResetDate = new Date();
    
    await this.save();
    console.log(`Auto-renewed subscription for ${this.organization}`);
    return true;
  }
  
  // Reset monthly counters if new month
  const lastReset = new Date(this.usage.lastResetDate);
  if (lastReset.getMonth() !== new Date().getMonth()) {
    this.usage.emailsSentThisMonth = 0;
    this.usage.lastResetDate = new Date();
    await this.save();
    console.log(`Reset monthly counters for ${this.organization}`);
  }
  
  return false;
};

// Check if can send more emails this month
SubscriptionSchema.methods.canSendEmail = function() {
  const plan = this.constructor.PLAN_FEATURES[this.plan];
  const maxEmails = plan.maxEmailsPerMonth;
  return this.usage.emailsSentThisMonth < maxEmails;
};

// Increment email counter
SubscriptionSchema.methods.incrementEmailCount = async function() {
  this.usage.emailsSentThisMonth += 1;
  await this.save();
};

// Cancel subscription (stops auto-renew)
SubscriptionSchema.methods.cancel = async function() {
  this.autoRenew = false;
  this.cancelledAt = new Date();
  this.status = 'cancelled';
  await this.save();
};

// Pause subscription
SubscriptionSchema.methods.pause = async function(reason) {
  this.status = 'paused';
  this.pauseReason = reason;
  await this.save();
};

// Resume subscription
SubscriptionSchema.methods.resume = async function() {
  this.status = 'active';
  this.autoRenew = true;
  this.pauseReason = null;
  // Extend end date by remaining days
  const daysLeft = Math.ceil((this.endDate - new Date()) / (1000 * 60 * 60 * 24));
  if (daysLeft > 0) {
    this.endDate = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000);
  }
  await this.save();
};

// Get days remaining
SubscriptionSchema.methods.getDaysRemaining = function() {
  if (!this.endDate) return 0;
  const days = Math.ceil((this.endDate - new Date()) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

// Check if subscription is active
SubscriptionSchema.methods.isActive = function() {
  return (this.status === 'active' || this.status === 'trial') && this.endDate > new Date();
};

// Get usage percentage
SubscriptionSchema.methods.getUsagePercentage = function(feature) {
  const plan = this.constructor.PLAN_FEATURES[this.plan];
  if (!plan) return 0;
  
  switch(feature) {
    case 'employees':
      return (this.usage.currentEmployees / plan.maxEmployees) * 100;
    case 'branches':
      return (this.usage.currentBranches / plan.maxBranches) * 100;
    case 'emails':
      return (this.usage.emailsSentThisMonth / plan.maxEmailsPerMonth) * 100;
    default:
      return 0;
  }
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);