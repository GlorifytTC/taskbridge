const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      enum: ['en', 'sv', 'ar'],
      default: 'en'
    }
  }
}, {
  timestamps: true
});

BranchSchema.index({ organization: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Branch', BranchSchema);