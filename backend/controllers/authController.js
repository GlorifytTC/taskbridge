const User = require('../models/User');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const JobDescription = require('../models/JobDescription');
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

// ============ NEW SELF-SIGNUP FUNCTIONS ============

// @desc    Self-signup with 14-day trial (no credit card required)
// @route   POST /api/auth/signup
// @access  Public
exports.selfSignup = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      companyName, 
      companySize, 
      phoneNumber 
    } = req.body;
    
    console.log('📝 Self-signup attempt:', email);
    console.log('   Name:', name);
    console.log('   Company:', companyName);
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email and password.' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long.' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email already exists. Please login instead.' 
      });
    }
    
    // Generate unique organization name if needed
    let orgName = companyName || `${name}'s Organization`;
    let orgNameCounter = 1;
    let originalOrgName = orgName;
    
    while (await Organization.findOne({ name: orgName })) {
      orgName = `${originalOrgName} (${orgNameCounter})`;
      orgNameCounter++;
    }
    
    console.log('📝 Using organization name:', orgName);
    
    // Create organization (14-day trial)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    
    const organization = await Organization.create({
      name: orgName,
      email: email.toLowerCase(),
      phone: phoneNumber || '',
      subscription: {
        plan: 'trial',
        status: 'trial',
        startDate: new Date(),
        endDate: trialEndDate
      },
      settings: {
        timezone: 'UTC',
        language: 'en',
        dateFormat: 'YYYY-MM-DD'
      }
    });
    
    console.log('✅ Organization created:', organization.name);
    
    // Create default branch
    const defaultBranch = await Branch.create({
      name: 'Main Branch',
      organization: organization._id,
      isActive: true
    });
    
    // Generate verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ✅ STEP 1: Create user FIRST (without jobDescription)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'superadmin',
      organization: organization._id,
      branch: defaultBranch._id,
      jobDescription: null,  // Temporarily null
      isActive: true,
      isAccountSetup: true,
      emailVerified: false,
      verificationToken,
      verificationExpires,
      trialStartDate: new Date(),
      trialEndDate: trialEndDate,
      companyName: companyName || '',
      companySize: companySize || '1-10',
      phoneNumber: phoneNumber || '',
      signupIP: req.ip || req.connection.remoteAddress,
      signupUserAgent: req.headers['user-agent'] || 'unknown',
      paymentStatus: 'trial'
    });
    
    console.log('✅ User created:', user.email);
    
    // ✅ STEP 2: Create job description with the user as creator
    let defaultJob = await JobDescription.findOne({ organization: organization._id });
    if (!defaultJob) {
      defaultJob = await JobDescription.create({
        name: 'General Staff',
        description: 'General staff position',
        organization: organization._id,
        createdBy: user._id,  // Now user exists
        isActive: true
      });
    }
    
    // ✅ STEP 3: Update user with job description
    user.jobDescription = defaultJob._id;
    await user.save();
    
    // Create subscription record
    const Subscription = require('../models/Subscription');
    await Subscription.create({
      organization: organization._id,
      plan: 'trial',
      status: 'trial',
      startDate: new Date(),
      endDate: trialEndDate,
      trialEndDate: trialEndDate,
      price: { amount: 0, currency: 'SEK', vat: { rate: 25, amount: 0 } },
      features: {
        maxEmployees: 10,
        maxBranches: 2,
        maxEmailsPerMonth: 50,
        maxAdmins: 1,
        reportLevel: 'basic',
        exportReports: false,
        customReports: false,
        apiAccess: false,
        prioritySupport: false
      }
    });
    
    // Send verification email (try-catch so signup still works if email fails)
    try {
      const { sendVerificationEmail } = require('../utils/emailService');
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendVerificationEmail(user, verificationUrl);
      console.log('✅ Verification email sent');
    } catch (emailError) {
      console.error('⚠️ Failed to send verification email:', emailError.message);
    }
    
    console.log('✅ Self-signup successful:', email);
    
    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account and start your 14-day free trial.',
      trialEndDate: trialEndDate,
      requiresVerification: true
    });
    
  } catch (error) {
    console.error('Self-signup error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({ 
          success: false, 
          message: 'This email is already registered. Please login instead.' 
        });
      }
      if (error.keyPattern?.name) {
        return res.status(400).json({ 
          success: false, 
          message: 'Organization name already taken. Please choose a different company name.' 
        });
      }
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join('. ') 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
};

// @desc    Send verification email
// @route   Internal
exports.sendVerificationEmail = async (user, verificationUrl) => {
  const subject = 'Verify Your Email - TaskBridge';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">✅ Verify Your Email</h1>
      </div>
      
      <div style="padding: 24px;">
        <p style="font-size: 16px; color: #1e293b;">Hello <strong>${user.name}</strong>,</p>
        
        <p style="color: #334155;">Thank you for signing up for TaskBridge! Please verify your email address to activate your <strong>14-day free trial</strong>.</p>
        
        <div style="background: #e2e8f0; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; color: #0f172a;">📧 <strong>Email:</strong> ${user.email}</p>
          <p style="margin: 8px 0 0 0; color: #0f172a;">📅 <strong>Trial expires:</strong> ${new Date(user.trialEndDate).toLocaleDateString()}</p>
        </div>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Verify Email & Start Trial →
          </a>
        </div>
        
        <p style="color: #475569; font-size: 14px;">This link will expire in 24 hours.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #cbd5e1;" />
        
        <p style="color: #64748b; font-size: 12px;">
          If you didn't sign up for TaskBridge, please ignore this email.
        </p>
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: user.email, subject, html });
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification link. Please request a new one.' 
      });
    }
    
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    user.isActive = true;
    await user.save();
    
    console.log('✅ Email verified for:', user.email);
    
    // Generate JWT token for auto-login
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      message: 'Email verified! Your 14-day trial has started.',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization
      }
    });
    
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    
    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await exports.sendVerificationEmail(user, verificationUrl);
    
    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Cancel subscription (stops at end of billing period)
// @route   POST /api/auth/cancel-subscription
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.cancelAtPeriodEnd = true;
    user.paymentStatus = 'cancelled';
    await user.save();
    
    // Also update organization subscription
    const organization = await Organization.findById(user.organization);
    if (organization) {
      organization.subscription.status = 'cancelled';
      await organization.save();
    }
    
    const Subscription = require('../models/Subscription');
    await Subscription.findOneAndUpdate(
      { organization: user.organization },
      { status: 'cancelled', autoRenew: false }
    );
    
    res.json({
      success: true,
      message: 'Subscription cancelled. You will have access until the end of your billing period.',
      endDate: organization?.subscription?.endDate
    });
    
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Check if user can access features (trial check middleware)
exports.checkTrialStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('organization');
    
    if (!user || !user.organization) {
      return res.status(403).json({ 
        success: false, 
        message: 'Organization not found' 
      });
    }
    
    const trialEndDate = user.trialEndDate || user.organization.subscription?.endDate;
    const isTrialExpired = trialEndDate && new Date() > new Date(trialEndDate);
    const isPaidActive = user.paymentStatus === 'active';
    const isCancelledButActive = user.cancelAtPeriodEnd && user.paymentStatus === 'cancelled';
    
    // Check if user has paid subscription or trial is still active
    if (!isPaidActive && !isCancelledButActive && isTrialExpired) {
      return res.status(403).json({
        success: false,
        message: 'Your trial has expired. Please upgrade to continue using TaskBridge.',
        code: 'TRIAL_EXPIRED',
        upgradeRequired: true
      });
    }
    
    // For admins, also check organization subscription
    if (user.role !== 'master') {
      const organizationSub = user.organization.subscription;
      if (organizationSub && organizationSub.status === 'expired') {
        return res.status(403).json({
          success: false,
          message: 'Organization subscription has expired. Please contact your administrator.',
          code: 'SUBSCRIPTION_EXPIRED'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Trial check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};