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
      enum: ['trial', 'basic', 'professional', 'enterprise'],
      default: 'trial'
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'paused', 'cancelled', 'expired'],
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

module.exports = mongoose.model('Organization', OrganizationSchema);