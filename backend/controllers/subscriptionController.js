const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');

// @desc    Get organization subscription
// @route   GET /api/subscriptions
// @access  Private/SuperAdmin
exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      organization: req.user.organization
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions
// @access  Private/SuperAdmin
exports.updateSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findOne({
      organization: req.user.organization
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    subscription = await Subscription.findOneAndUpdate(
      { organization: req.user.organization },
      req.body,
      { new: true, runValidators: true }
    );
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'update',
      entityType: 'subscription',
      entityId: subscription._id,
      changes: req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/cancel
// @access  Private/SuperAdmin
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      organization: req.user.organization
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    subscription.status = 'cancelled';
    subscription.cancelledAt = Date.now();
    subscription.autoRenew = false;
    await subscription.save();
    
    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Renew subscription
// @route   PUT /api/subscriptions/renew
// @access  Private/SuperAdmin
exports.renewSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      organization: req.user.organization
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    subscription.status = 'active';
    subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await subscription.save();
    
    res.json({ message: 'Subscription renewed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get invoices
// @route   GET /api/subscriptions/invoices
// @access  Private/SuperAdmin
exports.getInvoices = async (req, res) => {
  try {
    const payments = await Payment.find({
      organization: req.user.organization
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};