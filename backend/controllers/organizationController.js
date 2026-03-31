const Organization = require('../models/Organization');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');
const Task = require('../models/Task');
// @desc    Change organization subscription plan
// @route   PUT /api/organizations/:id/plan
// @access  Private/Master
exports.changePlan = async (req, res) => {
  try {
    const { plan, duration } = req.body;
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Plan prices
    const prices = {
      basic: 49,
      professional: 99,
      enterprise: 299
    };
    
    // Calculate new end date
    const currentEndDate = organization.subscription?.endDate || new Date();
    const newEndDate = new Date(currentEndDate.getTime() + duration * 30 * 24 * 60 * 60 * 1000);
    
    // Update organization subscription
    organization.subscription = {
      ...organization.subscription,
      plan: plan,
      status: 'active',
      endDate: newEndDate
    };
    await organization.save();
    
    // Update subscription record if exists
    const Subscription = require('../models/Subscription');
    await Subscription.findOneAndUpdate(
      { organization: organization._id },
      { 
        plan: plan,
        status: 'active',
        endDate: newEndDate,
        price: {
          amount: prices[plan] * duration,
          currency: 'SEK'
        }
      },
      { upsert: true }
    );
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: organization._id,
      action: 'change_plan',
      entityType: 'subscription',
      entityId: organization._id,
      changes: { plan, duration, newEndDate },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ 
      success: true, 
      message: `Plan changed to ${plan}`,
      data: {
        plan,
        endDate: newEndDate
      }
    });
  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to get plan price
function getPlanPrice(plan, months) {
  const prices = {
    basic: 49,
    professional: 99,
    enterprise: 299
  };
  return (prices[plan] || 0) * months;
}



// @desc    Get all users for an organization
// @route   GET /api/organizations/:id/users
// @access  Private/Master
exports.getOrganizationUsers = async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({ organization: req.params.id })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};


// @desc    Create organization (Master only)
// @route   POST /api/organizations
// @access  Private/Master
exports.createOrganization = async (req, res) => {
  try {
    const { name, email, phone, address, subscriptionPlan, trialDays } = req.body;
    
    // Check if organization exists
    const orgExists = await Organization.findOne({ name });
    if (orgExists) {
      return res.status(400).json({ message: 'Organization already exists' });
    }
    
    // Create organization
    const organization = await Organization.create({
      name,
      email,
      phone,
      address,
      subscription: {
        plan: subscriptionPlan || 'trial',
        status: 'trial',
        startDate: Date.now(),
        endDate: new Date(Date.now() + (trialDays || 14) * 24 * 60 * 60 * 1000)
      }
    });
    
    // Create default branch
    const defaultBranch = await Branch.create({
      name: 'Main Branch',
      organization: organization._id,
      isActive: true
    });
    
    // Create subscription record
    await Subscription.create({
      organization: organization._id,
      plan: subscriptionPlan || 'trial',
      status: 'trial',
      startDate: Date.now(),
      endDate: new Date(Date.now() + (trialDays || 14) * 24 * 60 * 60 * 1000),
      trialEndDate: new Date(Date.now() + (trialDays || 14) * 24 * 60 * 60 * 1000)
    });
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: organization._id,
      action: 'create',
      entityType: 'organization',
      entityId: organization._id,
      changes: { name, email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      data: {
        organization,
        defaultBranch
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all organizations (Master only)
// @route   GET /api/organizations
// @access  Private/Master
exports.getOrganizations = async (req, res) => {
  try {
    console.log('Fetching organizations for user:', req.user.id);
    
    const organizations = await Organization.find()
      .select('-__v')
      .sort({ createdAt: -1 });
    
    // Add counts for each organization
    const orgsWithCounts = await Promise.all(organizations.map(async (org) => {
      const userCount = await User.countDocuments({ organization: org._id, role: 'employee' });
      const taskCount = await Task.countDocuments({ organization: org._id });
      
      return {
        ...org.toObject(),
        userCount,
        taskCount
      };
    }));
    
    console.log(`Found ${orgsWithCounts.length} organizations`);
    
    res.json({
      success: true,
      count: orgsWithCounts.length,
      data: orgsWithCounts
    });
  } catch (error) {
    console.error('Error in getOrganizations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Private/Master
exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('branches')
      .populate('users', 'name email role');
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private/Master
exports.updateOrganization = async (req, res) => {
  try {
    let organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    const oldData = { ...organization.toObject() };
    
    organization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: organization._id,
      action: 'update',
      entityType: 'organization',
      entityId: organization._id,
      changes: { old: oldData, new: req.body },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete organization (Master only)
// @route   DELETE /api/organizations/:id
// @access  Private/Master
exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Delete all related data
    await User.deleteMany({ organization: organization._id });
    await Branch.deleteMany({ organization: organization._id });
    await Subscription.deleteOne({ organization: organization._id });
    
    // Delete organization
    await organization.deleteOne();
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: organization._id,
      action: 'delete',
      entityType: 'organization',
      entityId: organization._id,
      changes: { deleted: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin/SuperAdmin/Master
exports.resetUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check authorization
    if (user.organization.toString() !== req.user.organization.toString() && req.user.role !== 'master') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    
    // Create audit log
    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      user: req.user.id,
      organization: user.organization,
      action: 'reset_password',
      entityType: 'user',
      entityId: user._id,
      changes: { passwordReset: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create user for organization (Super Admin or Admin)
// @route   POST /api/organizations/:id/users
// @access  Private/Master
exports.createOrganizationUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const User = require('../models/User');
    const Organization = require('../models/Organization');
    const bcrypt = require('bcryptjs');
    
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ 
        success: false, 
        message: 'Organization not found' 
      });
    }
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === 'superadmin' ? 'superadmin' : 'admin',
      organization: organization._id,
      createdBy: req.user.id,
      isActive: true
    });
    
    // Create audit log
    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      user: req.user.id,
      organization: organization._id,
      action: 'create',
      entityType: 'user',
      entityId: user._id,
      changes: { name, email, role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};


// @desc    Pause organization (Master only)
// @route   PUT /api/organizations/:id/pause
// @access  Private/Master
exports.pauseOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    organization.isActive = false;
    await organization.save();
    
    // Update subscription
    await Subscription.findOneAndUpdate(
      { organization: organization._id },
      { status: 'paused' }
    );
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: organization._id,
      action: 'pause',
      entityType: 'organization',
      entityId: organization._id,
      changes: { isActive: false },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'Organization paused successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Extend organization subscription
// @route   PUT /api/organizations/:id/extend
// @access  Private/Master
exports.extendSubscription = async (req, res) => {
  try {
    const { days } = req.body;
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    const currentEndDate = organization.subscription?.endDate || new Date();
    const newEndDate = new Date(currentEndDate.getTime() + days * 24 * 60 * 60 * 1000);
    
    organization.subscription = {
      ...organization.subscription,
      endDate: newEndDate
    };
    await organization.save();
    
    const Subscription = require('../models/Subscription');
    await Subscription.findOneAndUpdate(
      { organization: organization._id },
      { endDate: newEndDate },
      { upsert: true }
    );
    
    await AuditLog.create({
      user: req.user.id,
      organization: organization._id,
      action: 'extend',
      entityType: 'subscription',
      entityId: organization._id,
      changes: { days, newEndDate },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ 
      success: true, 
      message: `Subscription extended by ${days} days`,
      newEndDate
    });
  } catch (error) {
    console.error('Error extending subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Resume organization (Master only)
// @route   PUT /api/organizations/:id/resume
// @access  Private/Master
exports.resumeOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    organization.isActive = true;
    await organization.save();
    
    // Update subscription
    await Subscription.findOneAndUpdate(
      { organization: organization._id },
      { status: 'active' }
    );
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: organization._id,
      action: 'resume',
      entityType: 'organization',
      entityId: organization._id,
      changes: { isActive: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'Organization resumed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};