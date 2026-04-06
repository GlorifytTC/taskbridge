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
    enum: ['trial', 'basic', 'standard', 'pro', 'business', 'enterprise', 'corporate', 'custom'],
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
    default: true
  },
  cancelledAt: Date,
  pauseReason: String,
  upgradedFromPlan: String,
  upgradedAt: Date,
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'SEK' },
    vat: { rate: { type: Number, default: 25 }, amount: Number },
    monthlyPrice: Number
  },
  features: {
    maxEmployees: { type: Number, default: 10 },
    maxBranches: { type: Number, default: 2 },
    maxEmailsPerMonth: { type: Number, default: 50 },
    maxAdmins: { type: Number, default: 1 },
    reportLevel: { type: String, enum: ['basic', 'standard', 'advanced', 'premium', 'unlimited'], default: 'basic' },
    exportReports: { type: Boolean, default: false },
    customReports: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    dedicatedSupport: { type: Boolean, default: false }
  },
  usage: {
    currentEmployees: { type: Number, default: 0 },
    currentBranches: { type: Number, default: 0 },
    emailsSentThisMonth: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  },
  lastPaymentDate: Date,
  nextPaymentDate: Date
}, { timestamps: true });

// NEW PLAN FEATURES - 50/50 Split Model
SubscriptionSchema.statics.PLAN_FEATURES = {
  // 💰 ECONOMY PLANS (50% of customers)
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
    dedicatedSupport: false,
    trialDays: 14
  },
  basic: {
    name: 'Basic',
    price: 399,
    maxEmployees: 25,
    maxBranches: 3,
    maxEmailsPerMonth: 200,
    maxAdmins: 2,
    reportLevel: 'basic',
    exportReports: false,
    customReports: false,
    apiAccess: false,
    prioritySupport: false,
    dedicatedSupport: false
  },
  standard: {
    name: 'Standard',
    price: 799,
    maxEmployees: 50,
    maxBranches: 5,
    maxEmailsPerMonth: 400,
    maxAdmins: 3,
    reportLevel: 'standard',
    exportReports: false,
    customReports: false,
    apiAccess: false,
    prioritySupport: false,
    dedicatedSupport: false
  },
  pro: {
    name: 'Pro',
    price: 1299,
    maxEmployees: 100,
    maxBranches: 8,
    maxEmailsPerMonth: 700,
    maxAdmins: 5,
    reportLevel: 'advanced',
    exportReports: false,
    customReports: false,
    apiAccess: false,
    prioritySupport: true,
    dedicatedSupport: false
  },
  // 💎 PREMIUM PLANS (50% of customers)
  business: {
    name: 'Business',
    price: 2499,
    maxEmployees: 250,
    maxBranches: 15,
    maxEmailsPerMonth: 2000,
    maxAdmins: 10,
    reportLevel: 'advanced',
    exportReports: true,
    customReports: false,
    apiAccess: false,
    prioritySupport: true,
    dedicatedSupport: false
  },
  enterprise: {
    name: 'Enterprise',
    price: 4999,
    maxEmployees: 500,
    maxBranches: 30,
    maxEmailsPerMonth: 5000,
    maxAdmins: 20,
    reportLevel: 'premium',
    exportReports: true,
    customReports: true,
    apiAccess: true,
    prioritySupport: true,
    dedicatedSupport: false
  },
  corporate: {
    name: 'Corporate',
    price: 9999,
    maxEmployees: 1000,
    maxBranches: 60,
    maxEmailsPerMonth: 12000,
    maxAdmins: 50,
    reportLevel: 'premium',
    exportReports: true,
    customReports: true,
    apiAccess: true,
    prioritySupport: true,
    dedicatedSupport: true
  },
  custom: {
    name: 'Custom',
    price: 0, // Contact for pricing
    maxEmployees: 5000,
    maxBranches: 200,
    maxEmailsPerMonth: 50000,
    maxAdmins: 200,
    reportLevel: 'unlimited',
    exportReports: true,
    customReports: true,
    apiAccess: true,
    prioritySupport: true,
    dedicatedSupport: true
  }
};

// Auto-renew monthly subscription
SubscriptionSchema.methods.renewIfNeeded = async function() {
  const now = new Date();
  
  if (this.endDate < now && this.status === 'active' && this.autoRenew && this.plan !== 'trial') {
    this.startDate = now;
    this.endDate = new Date(now.setMonth(now.getMonth() + 1));
    this.lastPaymentDate = new Date();
    this.nextPaymentDate = this.endDate;
    this.usage.emailsSentThisMonth = 0;
    this.usage.lastResetDate = new Date();
    await this.save();
    console.log(`Auto-renewed ${this.plan} subscription for ${this.organization}`);
    return true;
  }
  
  const lastReset = new Date(this.usage.lastResetDate);
  if (lastReset.getMonth() !== new Date().getMonth()) {
    this.usage.emailsSentThisMonth = 0;
    this.usage.lastResetDate = new Date();
    await this.save();
  }
  
  return false;
};

SubscriptionSchema.methods.canSendEmail = function() {
  const plan = this.constructor.PLAN_FEATURES[this.plan];
  return this.usage.emailsSentThisMonth < plan.maxEmailsPerMonth;
};

SubscriptionSchema.methods.incrementEmailCount = async function() {
  this.usage.emailsSentThisMonth += 1;
  await this.save();
};

SubscriptionSchema.methods.cancel = async function() {
  this.autoRenew = false;
  this.cancelledAt = new Date();
  this.status = 'cancelled';
  await this.save();
};

SubscriptionSchema.methods.pause = async function(reason) {
  this.status = 'paused';
  this.pauseReason = reason;
  await this.save();
};

SubscriptionSchema.methods.resume = async function() {
  this.status = 'active';
  this.autoRenew = true;
  this.pauseReason = null;
  await this.save();
};

SubscriptionSchema.methods.getDaysRemaining = function() {
  if (!this.endDate) return 0;
  const days = Math.ceil((this.endDate - new Date()) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

SubscriptionSchema.methods.isActive = function() {
  return (this.status === 'active' || this.status === 'trial') && this.endDate > new Date();
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);