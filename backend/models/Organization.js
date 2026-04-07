const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an organization name'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  logo: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
  plan: {
    type: String,
    enum: ['trial', 'basic', 'standard', 'pro', 'business', 'enterprise', 'corporate', 'custom'],
    default: 'trial'
  },
    status: {
      type: String,
      enum: ['trial', 'active', 'paused', 'cancelled', 'expired'],
      default: 'trial'
    },
    startDate: Date,
    endDate: Date
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      enum: ['en', 'sv', 'ar'],
      default: 'en'
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD'
    }
  }
}, {
  timestamps: true
});

// Plan definitions with SEK pricing
OrganizationSchema.statics.PLAN_DEFINITIONS = {
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

// Get plan features
OrganizationSchema.methods.getPlanFeatures = function() {
  const plan = this.constructor.PLAN_DEFINITIONS[this.subscription?.plan || 'trial'];
  return plan || this.constructor.PLAN_DEFINITIONS.trial;
};

// Check if organization is within limits
OrganizationSchema.methods.isWithinLimits = async function(type, currentCount) {
  const features = this.getPlanFeatures();
  const limits = {
    employees: features.maxEmployees,
    branches: features.maxBranches,
    admins: features.maxAdmins
  };
  const limit = limits[type];
  return limit === Infinity || currentCount <= limit;
};

module.exports = mongoose.model('Organization', OrganizationSchema);