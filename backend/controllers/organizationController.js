const Organization = require('../models/Organization');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');

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
    const organizations = await Organization.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: organizations.length,
      data: organizations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
    
    // Extend end date
    const currentEndDate = organization.subscription.endDate || new Date();
    const newEndDate = new Date(currentEndDate.getTime() + days * 24 * 60 * 60 * 1000);
    
    organization.subscription.endDate = newEndDate;
    await organization.save();
    
    // Update subscription record
    await Subscription.findOneAndUpdate(
      { organization: organization._id },
      { endDate: newEndDate }
    );
    
    // Create audit log
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
    console.error(error);
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