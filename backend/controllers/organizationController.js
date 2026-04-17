const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');
const Task = require('../models/Task');
const { sendWelcomeEmailWithInvoice } = require('../utils/emailService');
const { generateInvoicePDF } = require('../utils/generateInvoice');
const { sendWelcomeEmail, sendPlanChangeEmail } = require('../utils/emailService');
const Application = require('../models/Application'); 
const Notification = require('../models/Notification'); 
const JobDescription = require('../models/JobDescription'); 

// ============ EXISTING FUNCTIONS (keep these) ============

// @desc    Change organization subscription plan
// @route   PUT /api/organizations/:id/plan
// @access  Private/Master
exports.changePlan = async (req, res) => {
  try {
    const { plan, duration = 1, customFeatures } = req.body;
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    const currentPlan = organization.subscription?.plan || 'trial';
    const Subscription = require('../models/Subscription');
    
    // Get plan prices
    const getPlanPrice = (planName) => {
      const prices = {
        trial: 0,
        basic: 399,
        standard: 799,
        pro: 1299,
        business: 2499,
        enterprise: 4999,
        corporate: 9999,
        custom: customFeatures?.price || 0
      };
      return prices[planName] || 0;
    };
    
    const currentPrice = getPlanPrice(currentPlan);
    const newPrice = getPlanPrice(plan);
    
    let effectiveDate = new Date();
    let newEndDate;
    let totalAmount;
    
    // Handle custom plan
    if (plan === 'custom' && customFeatures) {
      // Create custom plan features
      const customPlanFeatures = {
        name: 'Custom',
        price: customFeatures.price,
        maxEmployees: customFeatures.maxEmployees,
        maxBranches: customFeatures.maxBranches,
        maxEmailsPerMonth: customFeatures.maxEmailsPerMonth,
        maxAdmins: customFeatures.maxAdmins,
        reportLevel: 'custom',
        exportReports: true,
        customReports: true,
        apiAccess: true,
        prioritySupport: true,
        dedicatedSupport: true
      };
      
      // Add to PLAN_FEATURES dynamically
      Subscription.PLAN_FEATURES.custom = customPlanFeatures;
      totalAmount = customFeatures.price * duration;
    } else {
      const planFeatures = Subscription.PLAN_FEATURES[plan];
      totalAmount = (planFeatures?.price || 0) * duration;
      
      // Apply discounts for longer durations
      if (duration >= 3) totalAmount = totalAmount * 0.95;
      if (duration >= 6) totalAmount = totalAmount * 0.9;
      if (duration >= 12) totalAmount = totalAmount * 0.85;
    }
    
    // UPGRADE (new price > current price) → Apply immediately
    if (newPrice > currentPrice) {
      newEndDate = new Date(effectiveDate.getTime() + duration * 30 * 24 * 60 * 60 * 1000);
      console.log('⬆️ UPGRADE: Applying immediately');
      
      // Update subscription
      organization.subscription = {
        ...organization.subscription,
        plan: plan,
        endDate: newEndDate,
        status: 'active'
      };
      await organization.save();
      
      // Update Subscription model
      await Subscription.findOneAndUpdate(
        { organization: organization._id },
        { 
          plan: plan,
          endDate: newEndDate,
          status: 'active',
          price: { amount: totalAmount, currency: 'SEK' }
        },
        { upsert: true }
      );
      
      // ✅ SEND PLAN CHANGE EMAIL NOTIFICATION
      console.log('📧 Attempting to send plan change email...');
      try {
        const { sendPlanChangeEmail } = require('../utils/emailService');
        await sendPlanChangeEmail(
          organization,
          currentPlan,
          plan,
          duration,
          Math.round(totalAmount)
        );
        console.log('✅ Plan change email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send plan change email:', emailError.message);
        // Don't fail the plan change if email fails
      }
      
      return res.json({ 
        success: true, 
        message: `Plan changed to ${plan} immediately`,
        endDate: newEndDate,
        totalAmount: Math.round(totalAmount)
      });
    } 
    // DOWNGRADE (new price < current price) → Apply at next billing cycle
    else if (newPrice < currentPrice) {
      newEndDate = organization.subscription?.endDate || new Date();
      console.log('⬇️ DOWNGRADE: Will apply at end of current billing cycle');
      
      // Store pending plan change
      organization.pendingPlan = {
        plan: plan,
        effectiveDate: organization.subscription?.endDate,
        duration: duration
      };
      await organization.save();
      
      // ✅ SEND PLAN CHANGE EMAIL NOTIFICATION (for scheduled change)
      try {
        const { sendPlanChangeEmail } = require('../utils/emailService');
        await sendPlanChangeEmail(
          organization,
          currentPlan,
          plan,
          duration,
          Math.round(totalAmount)
        );
        console.log('✅ Scheduled plan change email sent');
      } catch (emailError) {
        console.error('❌ Failed to send plan change email:', emailError.message);
      }
      
      return res.json({ 
        success: true, 
        message: `Plan will change to ${plan} on ${newEndDate.toLocaleDateString()}`,
        effectiveDate: newEndDate,
        totalAmount: Math.round(totalAmount)
      });
    }
    // SAME PRICE → Apply immediately
    else {
      newEndDate = new Date(effectiveDate.getTime() + duration * 30 * 24 * 60 * 60 * 1000);
      
      organization.subscription = {
        ...organization.subscription,
        plan: plan,
        endDate: newEndDate
      };
      await organization.save();
      
      await Subscription.findOneAndUpdate(
        { organization: organization._id },
        { plan: plan, endDate: newEndDate },
        { upsert: true }
      );
      
      // ✅ SEND PLAN CHANGE EMAIL NOTIFICATION
      try {
        const { sendPlanChangeEmail } = require('../utils/emailService');
        await sendPlanChangeEmail(
          organization,
          currentPlan,
          plan,
          duration,
          Math.round(totalAmount)
        );
        console.log('✅ Plan change email sent');
      } catch (emailError) {
        console.error('❌ Failed to send plan change email:', emailError.message);
      }
      
      res.json({ 
        success: true, 
        message: `Plan changed to ${plan} immediately`,
        endDate: newEndDate,
        totalAmount: Math.round(totalAmount)
      });
    }
    
  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};


// ============ ADD THESE NEW FUNCTIONS BELOW ============

// @desc    Check email quota before sending emails
// @access  Private (use as middleware)
exports.checkEmailQuota = async (req, res, next) => {
  try {
    const Subscription = require('../models/Subscription');
    const subscription = await Subscription.findOne({ organization: req.user.organization });
    
    if (!subscription) {
      return res.status(403).json({ 
        success: false,
        message: 'No active subscription found. Please contact your administrator.' 
      });
    }
    
    if (!subscription.canSendEmail || !subscription.canSendEmail()) {
      const plan = Subscription.PLAN_FEATURES[subscription.plan];
      return res.status(429).json({ 
        success: false,
        message: `Email limit reached for this month. Your ${plan.name} plan allows ${plan.maxEmailsPerMonth} emails per month. Upgrade to send more.`,
        limit: plan.maxEmailsPerMonth,
        used: subscription.usage?.emailsSentThisMonth || 0,
        remaining: Math.max(0, plan.maxEmailsPerMonth - (subscription.usage?.emailsSentThisMonth || 0))
      });
    }
    
    next();
  } catch (error) {
    console.error('Email quota check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error checking email quota' 
    });
  }
};

// @desc    Track email sent (call this after sending each email)
// @route   Used internally
exports.trackEmailSent = async (organizationId) => {
  try {
    const Subscription = require('../models/Subscription');
    const subscription = await Subscription.findOne({ organization: organizationId });
    if (subscription && subscription.incrementEmailCount) {
      await subscription.incrementEmailCount();
      console.log(`Email tracked for organization ${organizationId}`);
    }
  } catch (error) {
    console.error('Error tracking email:', error);
  }
};

// @desc    Get email quota status
// @route   GET /api/organizations/email-quota
// @access  Private
exports.getEmailQuotaStatus = async (req, res) => {
  try {
    const Subscription = require('../models/Subscription');
    const subscription = await Subscription.findOne({ organization: req.user.organization });
    
    if (!subscription) {
      return res.status(404).json({ 
        success: false,
        message: 'No subscription found' 
      });
    }
    
    const plan = Subscription.PLAN_FEATURES[subscription.plan];
    const used = subscription.usage?.emailsSentThisMonth || 0;
    const limit = plan.maxEmailsPerMonth;
    
    res.json({
      success: true,
      data: {
        plan: subscription.plan,
        planName: plan.name,
        used: used,
        limit: limit,
        remaining: Math.max(0, limit - used),
        percentage: (used / limit) * 100,
        canSend: used < limit
      }
    });
  } catch (error) {
    console.error('Error getting quota status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Helper function to get plan price
function getPlanPrice(plan, months = 1) {
  const prices = {
    trial: 0,
    basic: 399,
    standard: 799,
    pro: 1299,
    business: 2499,
    enterprise: 4999,
    corporate: 9999,
    custom: 0
  };
  
  let price = (prices[plan] || 0) * months;
  
  // Apply discounts for longer durations
  if (months >= 3) price = price * 0.95;
  if (months >= 6) price = price * 0.9;
  if (months >= 12) price = price * 0.85;
  
  return Math.round(price);
}



// @desc    Get organization users
// @route   GET /api/organizations/:id/users
// @access  Private/Master
exports.getOrganizationUsers = async (req, res) => {
  try {
    // ✅ Use 'id' not 'orgId' - match your route parameter
    const organizationId = req.params.id;
    
    console.log('🔍 Fetching users for organization ID:', organizationId);
    
    if (!organizationId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Organization ID is required' 
      });
    }
    
    const users = await User.find({ 
      organization: organizationId
    }).select('-password');
    
    console.log(`✅ Found ${users.length} users for organization`);
    
    res.json({ success: true, data: users });
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
    const { name, email, phone, address, subscriptionPlan, trialDays, adminName, adminPassword } = req.body;
    
    console.log('Creating organization with plan:', subscriptionPlan);
    
    // Check if organization exists
    const orgExists = await Organization.findOne({ name });
    if (orgExists) {
      return res.status(400).json({ message: 'Organization already exists' });
    }
    
    const selectedPlan = subscriptionPlan || 'trial';
    const planFeatures = Subscription.PLAN_FEATURES[selectedPlan];
    
    if (!planFeatures) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }
    
    let endDate;
    let status;
    
    if (selectedPlan === 'trial') {
      endDate = new Date(Date.now() + (trialDays || 14) * 24 * 60 * 60 * 1000);
      status = 'trial';
    } else {
      endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      status = 'active';
    }
    
    // Create organization
    const organization = await Organization.create({
      name, email, phone, address,
      subscription: { plan: selectedPlan, status, startDate: new Date(), endDate }
    });
    
    // Create default branch
    const defaultBranch = await Branch.create({
      name: 'Main Branch',
      organization: organization._id,
      isActive: true
    });
    
    // Create temporary password for admin (they will reset on first login)
    const bcrypt = require('bcryptjs');
    const tempPassword = adminPassword || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create Super Admin user for the organization
    const superAdmin = await User.create({
      name: adminName || 'Super Admin',
      email: email,
      password: hashedPassword,
      role: 'superadmin',
      organization: organization._id,
      branch: defaultBranch._id,
      isActive: true,
      mustChangePassword: true 
    });
    
    const priceAmount = planFeatures.price || 0;
    
    // Create subscription record
    const subscription = await Subscription.create({
      organization: organization._id,
      plan: selectedPlan,
      status: status,
      startDate: new Date(),
      endDate: endDate,
      trialEndDate: selectedPlan === 'trial' ? endDate : null,
      price: {
        amount: priceAmount,
        currency: 'SEK',
        vat: { rate: 25, amount: (priceAmount * 25) / 100 },
        monthlyPrice: priceAmount
      },
      features: {
        maxEmployees: planFeatures.maxEmployees,
        maxBranches: planFeatures.maxBranches,
        maxEmailsPerMonth: planFeatures.maxEmailsPerMonth,
        maxAdmins: planFeatures.maxAdmins,
        reportLevel: planFeatures.reportLevel,
        exportReports: planFeatures.exportReports,
        customReports: planFeatures.customReports,
        apiAccess: planFeatures.apiAccess,
        prioritySupport: planFeatures.prioritySupport,
        dedicatedSupport: planFeatures.dedicatedSupport
      },
      usage: {
        currentEmployees: 0,
        currentBranches: 1,
        emailsSentThisMonth: 0,
        lastResetDate: new Date()
      }
    });
    
    // Send simple welcome email (no invoice PDF)
const { sendWelcomeEmail } = require('../utils/emailService');
await sendWelcomeEmail(superAdmin, organization);
console.log(`📧 Welcome email sent to ${organization.email}`);


    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: organization._id,
      action: 'create',
      entityType: 'organization',
      entityId: organization._id,
      changes: { name, email, plan: selectedPlan, price: priceAmount },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      message: `Organization created with ${selectedPlan} plan. Welcome email sent to ${email}`,
      data: {
        organization,
        defaultBranch,
        superAdmin: {
          email: superAdmin.email,
          tempPassword: tempPassword
        }
      }
    });
    
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};



// Send welcome email with invoice attachment
exports.sendWelcomeEmailWithInvoice = async (organization, admin, tempPassword, invoicePath, paymentData) => {
  const subject = `Welcome to TaskBridge - ${organization.name} - Invoice #${paymentData.invoiceNumber}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to TaskBridge!</h1>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1e293b;">Dear ${admin.name},</p>
        
        <p style="color: #334155;">Your organization <strong>${organization.name}</strong> has been successfully created with the <strong>${paymentData.description}</strong>.</p>
        
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e293b;">Account Details:</h3>
          <p style="margin: 5px 0;"><strong>Organization:</strong> ${organization.name}</p>
          <p style="margin: 5px 0;"><strong>Your Email:</strong> ${admin.email}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">Invoice Summary:</h3>
          <p style="margin: 5px 0;"><strong>Invoice #:</strong> ${paymentData.invoiceNumber}</p>
          <p style="margin: 5px 0;"><strong>Plan:</strong> ${paymentData.description}</p>
          <p style="margin: 5px 0;"><strong>Subtotal:</strong> ${paymentData.amount} SEK</p>
          <p style="margin: 5px 0;"><strong>VAT (25%):</strong> ${paymentData.vat.amount} SEK</p>
          <p style="margin: 5px 0; font-size: 18px;"><strong>Total:</strong> ${paymentData.totalAmount} SEK</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/create-account?email=${encodeURIComponent(admin.email)}" 
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Create Your Account
          </a>
        </div>
        
        <p style="color: #475569; font-size: 14px;">Click the button above to set up your password and access your dashboard.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #cbd5e1;" />
        
        <p style="color: #64748b; font-size: 12px;">If you have any questions, contact us at support@taskbridge.com</p>
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  // Read the invoice file as attachment
  const invoiceAttachment = fs.readFileSync(invoicePath);
  
  await exports.sendEmail({
    to: admin.email,
    subject,
    html,
    attachments: [{
      filename: `invoice-${paymentData.invoiceNumber}.pdf`,
      content: invoiceAttachment,
      contentType: 'application/pdf'
    }]
  });
  
  // Clean up - delete the temporary invoice file
  fs.unlinkSync(invoicePath);
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

// @desc    Delete organization (HARD DELETE - completely remove)
// @route   DELETE /api/organizations/:id
// @access  Private/Master
exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Delete ALL related data (only models that exist)
    await User.deleteMany({ organization: organization._id });
    await Branch.deleteMany({ organization: organization._id });
    await Task.deleteMany({ organization: organization._id });
    await Subscription.deleteOne({ organization: organization._id });
    await AuditLog.deleteMany({ organization: organization._id });
    
    // HARD DELETE the organization
    await organization.deleteOne();
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      entityType: 'organization',
      entityId: req.params.id,
      changes: { 
        deleted: true,
        orgName: organization.name,
        orgEmail: organization.email
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ 
      success: true, 
      message: 'Organization and all related data permanently deleted' 
    });
    
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};


// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin/SuperAdmin/Master
exports.resetUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.params.id;
    
    console.log('🔐 Reset password for user ID:', userId);
    console.log('📝 Password provided:', password ? 'Yes' : 'No');
    
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }
    
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log('✅ User found:', user.email);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password saved for:', user.email);
    
    // Return success without audit log for now
    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Create user for organization
// @route   POST /api/organizations/:id/users
// @access  Private/Master
exports.createOrganizationUser = async (req, res) => {
  try {
    // ✅ Use 'id' not 'orgId'
    const organizationId = req.params.id;
    const { name, email, password, role } = req.body;
    
    console.log('📝 Creating user for organization:', organizationId);
    
    const Organization = require('../models/Organization');
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    
    const organization = await Organization.findById(organizationId);
    
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
    
    console.log('✅ User created:', user.email);
    
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
      message: 'Server error: ' + error.message 
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