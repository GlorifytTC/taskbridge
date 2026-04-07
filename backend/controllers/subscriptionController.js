const Subscription = require('../models/Subscription');
const Organization = require('../models/Organization');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Task = require('../models/Task');

// Plan pricing mapping (SEK)
const PLAN_PRICES = {
  trial: 0,
  basic: 500,
  standard: 1000,
  professional: 1750,
  business: 2500,
  enterprise: 5000,
  unlimited: 15000
};

const PLAN_FEATURES = {
  trial: { maxEmployees: 10, maxBranches: 2, maxEmailsPerMonth: 50, maxAdmins: 1 },
  basic: { maxEmployees: 20, maxBranches: 3, maxEmailsPerMonth: 100, maxAdmins: 2 },
  standard: { maxEmployees: 50, maxBranches: 5, maxEmailsPerMonth: 250, maxAdmins: 3 },
  professional: { maxEmployees: 100, maxBranches: 10, maxEmailsPerMonth: 500, maxAdmins: 5 },
  business: { maxEmployees: 200, maxBranches: 20, maxEmailsPerMonth: 1000, maxAdmins: 10 },
  enterprise: { maxEmployees: 500, maxBranches: 50, maxEmailsPerMonth: 2500, maxAdmins: 20 },
  unlimited: { maxEmployees: Infinity, maxBranches: Infinity, maxEmailsPerMonth: Infinity, maxAdmins: Infinity }
};

// @desc    Get organization subscription with usage stats
// @route   GET /api/subscriptions
// @access  Private/SuperAdmin/Master
exports.getSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findOne({
      organization: req.user.organization
    });
    
    if (!subscription) {
      // Create default trial subscription if none exists
      subscription = await Subscription.create({
        organization: req.user.organization,
        plan: 'trial',
        status: 'trial',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        price: { amount: 0, currency: 'SEK', vat: { rate: 25, amount: 0 } },
        features: PLAN_FEATURES.trial
      });
    }
    
    // Get current usage stats
    const employeeCount = await User.countDocuments({ 
      organization: req.user.organization, 
      role: 'employee',
      isActive: true 
    });
    
    const branchCount = await Branch.countDocuments({ 
      organization: req.user.organization,
      isActive: true 
    });
    
    const adminCount = await User.countDocuments({ 
      organization: req.user.organization, 
      role: 'admin',
      isActive: true 
    });
    
    const taskCount = await Task.countDocuments({ 
      organization: req.user.organization 
    });
    
    const planFeatures = PLAN_FEATURES[subscription.plan] || PLAN_FEATURES.trial;
    
    // Calculate usage percentages
    const usage = {
      employees: {
        current: employeeCount,
        limit: planFeatures.maxEmployees,
        percentage: planFeatures.maxEmployees === Infinity ? 0 : (employeeCount / planFeatures.maxEmployees) * 100
      },
      branches: {
        current: branchCount,
        limit: planFeatures.maxBranches,
        percentage: planFeatures.maxBranches === Infinity ? 0 : (branchCount / planFeatures.maxBranches) * 100
      },
      admins: {
        current: adminCount,
        limit: planFeatures.maxAdmins,
        percentage: planFeatures.maxAdmins === Infinity ? 0 : (adminCount / planFeatures.maxAdmins) * 100
      },
      tasks: { current: taskCount, limit: null, percentage: 0 }
    };
    
    const daysRemaining = Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24));
    
    res.json({
      success: true,
      data: {
        ...subscription.toObject(),
        usage,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        isExpired: daysRemaining <= 0,
        planFeatures
      }
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all available plans
// @route   GET /api/subscriptions/plans
// @access  Private
exports.getPlans = async (req, res) => {
  try {
    const plans = [
      { id: 'trial', name: 'Trial', price: 0, period: '14 days', features: PLAN_FEATURES.trial },
      { id: 'basic', name: 'Basic', price: 500, period: 'month', features: PLAN_FEATURES.basic },
      { id: 'standard', name: 'Standard', price: 1000, period: 'month', features: PLAN_FEATURES.standard },
      { id: 'professional', name: 'Professional', price: 1750, period: 'month', features: PLAN_FEATURES.professional },
      { id: 'business', name: 'Business', price: 2500, period: 'month', features: PLAN_FEATURES.business },
      { id: 'enterprise', name: 'Enterprise', price: 5000, period: 'month', features: PLAN_FEATURES.enterprise },
      { id: 'unlimited', name: 'Unlimited', price: 15000, period: 'month', features: PLAN_FEATURES.unlimited }
    ];
    
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// @desc    Cancel subscription (stop auto-renew)
// @route   PUT /api/organizations/:id/cancel-subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ organization: req.params.id });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    await subscription.cancel();
    
    res.json({ 
      success: true, 
      message: 'Subscription cancelled. Will not renew after end date.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resume subscription
// @route   PUT /api/organizations/:id/resume-subscription
exports.resumeSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ organization: req.params.id });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    await subscription.resume();
    
    res.json({ 
      success: true, 
      message: 'Subscription resumed' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check email quota before sending
exports.checkEmailQuota = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ organization: req.user.organization });
    if (!subscription) {
      return res.json({ canSend: false, message: 'No subscription found' });
    }
    
    const canSend = subscription.canSendEmail();
    const remaining = subscription.plan === 'trial' ? 50 : 
                     subscription.plan === 'basic' ? 100 :
                     subscription.plan === 'standard' ? 250 :
                     subscription.plan === 'professional' ? 500 :
                     subscription.plan === 'business' ? 1000 : 2500;
    
    res.json({
      canSend,
      used: subscription.usage.emailsSentThisMonth,
      limit: subscription.PLAN_FEATURES[subscription.plan].maxEmailsPerMonth,
      remaining: Math.max(0, remaining - subscription.usage.emailsSentThisMonth)
    });
  } catch (error) {
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
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'renew',
      entityType: 'subscription',
      entityId: subscription._id,
      changes: { endDate: subscription.endDate },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true, message: 'Subscription renewed successfully' });
  } catch (error) {
    console.error('Error renewing subscription:', error);
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
    console.error('Error getting invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if organization can add more employees
// @route   GET /api/subscriptions/can-add-employee
// @access  Private
exports.canAddEmployee = async (req, res) => {
  try {
    const employeeCount = await User.countDocuments({
      organization: req.user.organization,
      role: 'employee',
      isActive: true
    });
    
    const subscription = await Subscription.findOne({
      organization: req.user.organization
    });
    
    const planFeatures = PLAN_FEATURES[subscription?.plan || 'trial'];
    const canAdd = employeeCount < planFeatures.maxEmployees;
    
    res.json({
      success: true,
      canAdd,
      current: employeeCount,
      limit: planFeatures.maxEmployees,
      remaining: planFeatures.maxEmployees - employeeCount
    });
  } catch (error) {
    console.error('Error checking employee limit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if organization can add more branches
// @route   GET /api/subscriptions/can-add-branch
// @access  Private
exports.canAddBranch = async (req, res) => {
  try {
    const branchCount = await Branch.countDocuments({
      organization: req.user.organization,
      isActive: true
    });
    
    const subscription = await Subscription.findOne({
      organization: req.user.organization
    });
    
    const planFeatures = PLAN_FEATURES[subscription?.plan || 'trial'];
    const canAdd = branchCount < planFeatures.maxBranches;
    
    res.json({
      success: true,
      canAdd,
      current: branchCount,
      limit: planFeatures.maxBranches,
      remaining: planFeatures.maxBranches - branchCount
    });
  } catch (error) {
    console.error('Error checking branch limit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};