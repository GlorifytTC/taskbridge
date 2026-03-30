const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'SEK'
  },
  vat: {
    rate: Number,
    amount: Number
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'invoice', 'manual'],
    required: true
  },
  paymentId: String,
  invoiceNumber: {
    type: String,
    unique: true
  },
  paidAt: Date,
  description: String,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Generate invoice number before saving
PaymentSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);