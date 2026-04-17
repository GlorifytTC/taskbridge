const User = require('../models/User');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Private/Admin
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, jobDescription, branch } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const admin = await User.findById(req.user.id);
    const organization = admin.organization;
    
    const user = await User.create({
      name,
      email,
      password,
      role,
      organization,
      jobDescription: role === 'employee' ? jobDescription : undefined,
      branch: branch || admin.branch,
      createdBy: req.user.id
    });
    
    await AuditLog.create({
      user: req.user.id,
      organization,
      action: 'create',
      entityType: 'user',
      entityId: user._id,
      changes: { name, email, role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    console.log('✅ User found');
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    console.log('✅ Password matched');
    
    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'mysecretkey123',
      { expiresIn: '30d' }
    );
    
    const userData = await User.findById(user._id)
      .populate('organization', 'name')
      .populate('branch', 'name');
    
    res.json({
      success: true,
      token,
      user: {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        organization: userData.organization || null,
        branch: userData.branch
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Validate organization for school registration
// @route   GET /api/auth/validate-organization
// @access  Public
exports.validateOrganization = async (req, res) => {
  try {
    const { email } = req.query;
    
    console.log('🔍 Validating organization email:', email);
    
    if (!email) {
      return res.status(400).json({ 
        exists: false, 
        needsSetup: false,
        message: 'Email is required' 
      });
    }
    
    const organization = await Organization.findOne({ email: email.toLowerCase() });
    
    if (!organization) {
      return res.json({ 
        exists: false, 
        needsSetup: false,
        message: 'No organization found with this email. Please check your invoice.' 
      });
    }
    
    const existingAdmin = await User.findOne({ 
      organization: organization._id,
      role: 'superadmin'
    });
    
    console.log('Organization found:', organization.name);
    console.log('Existing admin:', existingAdmin ? 'Yes' : 'No');
    
    res.json({
      exists: true,
      needsSetup: !existingAdmin,
      organization: {
        _id: organization._id,
        name: organization.name,
        subscription: organization.subscription || { plan: 'trial' }
      }
    });
    
  } catch (error) {
    console.error('Error validating organization:', error);
    res.status(500).json({ 
      exists: false, 
      needsSetup: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Setup organization account (create super admin)
// @route   POST /api/auth/setup-organization-account
// @access  Public
exports.setupOrganizationAccount = async (req, res) => {
  try {
    const { email, password, schoolName, organizationId, userName } = req.body;
    
    console.log('📝 Setting up account for:', email);
    
    if (!email || !password || !organizationId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and organization are required' 
      });
    }
    
    const organization = await Organization.findById(organizationId);
    
    if (!organization) {
      return res.status(404).json({ 
        success: false, 
        message: 'Organization not found' 
      });
    }
    
    if (organization.name !== schoolName) {
      return res.status(400).json({ 
        success: false, 
        message: `School name does not match. Please enter "${organization.name}" exactly.` 
      });
    }
    
    const existingAdmin = await User.findOne({ 
      organization: organization._id,
      role: 'superadmin'
    });
    
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account already set up for this organization. Please login instead.' 
      });
    }
    
    const defaultBranch = await Branch.findOne({ organization: organization._id });
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const superAdmin = await User.create({
      name: userName || `${organization.name} Admin`,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'superadmin',
      organization: organization._id,
      branch: defaultBranch?._id,
      isActive: true,
      mustChangePassword: false
    });
    
    console.log('✅ Super admin created:', superAdmin.email);
    
    const token = jwt.sign(
      { id: superAdmin._id, email: superAdmin.email, role: superAdmin.role },
      process.env.JWT_SECRET || 'mysecretkey123',
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
        organization: {
          _id: organization._id,
          name: organization.name
        }
      }
    });
    
  } catch (error) {
    console.error('Setup organization error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('organization', 'name logo settings')
      .populate('branch', 'name address')
      .populate('jobDescription', 'name')
      .populate('assignedBranches', 'name');
    
    console.log('User assigned branches:', user.assignedBranches);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return res.json({ 
        success: true, 
        message: 'If that email is registered, you will receive a reset link.' 
      });
    }
    
    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();
    
    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Use your email service to send the email
    const { sendPasswordResetEmail } = require('../utils/emailService');
    await sendPasswordResetEmail(user, resetToken);
    
    res.json({ 
      success: true, 
      message: 'Password reset email sent successfully' 
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Verify reset token
// @route   GET /api/auth/verify-reset-token/:token
// @access  Public
exports.verifyResetToken = async (req, res) => {
  try {
    const crypto = require('crypto');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    console.log('Token verification:', user ? 'Valid for ' + user.email : 'Invalid');
    
    res.json({ valid: !!user });
  } catch (error) {
    console.error('Verify token error:', error);
    res.json({ valid: false });
  }
};


// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    console.log('🔐 Resetting password for token:', token);
    
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }
    
    const crypto = require('crypto');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    // ✅ IMPORTANT: Hash the password before saving
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    console.log('✅ Password reset successfully for:', user.email);
    
    res.json({ 
      success: true, 
      message: 'Password reset successful' 
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');
    
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    // ✅ IMPORTANT: Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    // ✅ SEND PASSWORD CHANGED NOTIFICATION EMAIL
    const { sendPasswordChangedNotification } = require('../utils/emailService');
    await sendPasswordChangedNotification(
      user, 
      req.ip, 
      req.headers['user-agent']
    );
    
    await AuditLog.create({
      user: req.user.id,
      organization: user.organization,
      action: 'update',
      entityType: 'user',
      entityId: user._id,
      changes: { password: 'changed' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully. A confirmation email has been sent to your registered email address.' 
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Change email
// @route   PUT /api/auth/change-email
// @access  Private
exports.changeEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const bcrypt = require('bcryptjs');
    
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }
    
    const oldEmail = user.email;
    user.email = email;
    await user.save();
    
    // ✅ SEND NOTIFICATION EMAIL TO BOTH OLD AND NEW
    const { sendEmailChangedNotification } = require('../utils/emailService');
    await sendEmailChangedNotification(
      user, 
      oldEmail, 
      email, 
      req.ip, 
      req.headers['user-agent']
    );
    
    await AuditLog.create({
      user: req.user.id,
      organization: user.organization,
      action: 'update',
      entityType: 'user',
      entityId: user._id,
      changes: { email: `changed from ${oldEmail} to ${email}` },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ 
      success: true, 
      message: 'Email changed successfully. Confirmation emails have been sent.' 
    });
    
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Delete own account (GDPR)
// @route   DELETE /api/auth/account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.name = `Deleted User ${user._id}`;
    user.email = `deleted_${user._id}@deleted.com`;
    user.password = await bcrypt.hash('deleted', 10);
    user.isActive = false;
    user.deletedAt = Date.now();
    user.personalDataDeleted = true;
    
    await user.save();
    
    await AuditLog.create({
      user: req.user.id,
      organization: user.organization,
      action: 'delete',
      entityType: 'user',
      entityId: user._id,
      changes: { deleted: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};