const axios = require('axios');
const { trackEmailSent } = require('../controllers/organizationController');

// Mailazy API configuration
const MAILAZY_API_URL = 'https://api.mailazy.com/v1/emails';

// Send email function
exports.sendEmail = async ({ to, subject, html, text, organizationId }) => {
  try {
    console.log('📧 Sending email to:', to);
    console.log('   Subject:', subject);
    console.log('   API Key:', process.env.MAILAZY_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('   Secret Key:', process.env.MAILAZY_SECRET_KEY ? '✅ Set' : '❌ Not set');
    
    const auth = Buffer.from(`${process.env.MAILAZY_API_KEY}:${process.env.MAILAZY_SECRET_KEY}`).toString('base64');
    
    const response = await axios.post(MAILAZY_API_URL, {
      to: [{ email: to }],
      subject: subject,
      html: html || text,
      text: text || html?.replace(/<[^>]*>/g, ''),
      from: {
        email: process.env.MAILAZY_FROM_EMAIL || 'taskbridge.noreply@gmail.com',
        name: 'TaskBridge'
      }
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Email sent!', response.data);
    
    if (organizationId) {
      await trackEmailSent(organizationId);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Mailazy error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No response from server:', error.message);
    } else {
      console.error('   Error:', error.message);
    }
    return { error: error.message };
  }
};


// Send welcome email with invoice (for new organization creation)
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
  
  await exports.sendEmail({ 
    to: admin.email, 
    subject, 
    html,
    organizationId: organization._id 
  });
};

// Send welcome email - ADD ORGANIZATION ID
exports.sendWelcomeEmail = async (user, organization) => {
  const subject = `Welcome to TaskBridge - ${organization.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Welcome to TaskBridge!</h1>
      <p>Hello ${user.name},</p>
      <p>Your account has been created for ${organization.name}. You can now log in to manage your shifts and tasks.</p>
      <p><strong>Your login email:</strong> ${user.email}</p>
      <p>Click the button below to log in:</p>
      <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Log In</a>
      <p style="margin-top: 20px;">If you have any questions, please contact your administrator.</p>
      <hr style="margin: 20px 0;" />
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
    </div>
  `;
  
  await exports.sendEmail({ 
    to: user.email, 
    subject, 
    html,
    organizationId: organization._id 
  });
};

// Send task notification email - ADD ORGANIZATION ID
exports.sendTaskNotification = async (employee, task, organizationId) => {
  const subject = `New Task Available: ${task.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">New Task Available</h1>
      <p>Hello ${employee.name},</p>
      <p>A new task has been assigned to your job description:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin: 0 0 10px 0;">${task.title}</h3>
        <p><strong>Date:</strong> ${new Date(task.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${task.startTime} - ${task.endTime}</p>
        <p><strong>Location:</strong> ${task.location || 'Not specified'}</p>
        ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
      </div>
      <a href="${process.env.FRONTEND_URL}/tasks/${task._id}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">View & Apply</a>
      <hr style="margin: 20px 0;" />
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
    </div>
  `;
  
  await exports.sendEmail({ 
    to: employee.email, 
    subject, 
    html,
    organizationId: organizationId 
  });
};

// Send application status email - ADD ORGANIZATION ID
exports.sendApplicationStatusEmail = async (employee, task, status, organizationId, reason = '') => {
  const subject = `Application ${status}: ${task.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: ${status === 'approved' ? '#10B981' : '#EF4444'};">Application ${status.toUpperCase()}</h1>
      <p>Hello ${employee.name},</p>
      <p>Your application for the following task has been ${status}:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin: 0 0 10px 0;">${task.title}</h3>
        <p><strong>Date:</strong> ${new Date(task.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${task.startTime} - ${task.endTime}</p>
      </div>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <a href="${process.env.FRONTEND_URL}/calendar" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">View Calendar</a>
      <hr style="margin: 20px 0;" />
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
    </div>
  `;
  
  await exports.sendEmail({ 
    to: employee.email, 
    subject, 
    html,
    organizationId: organizationId 
  });
};

// Send plan change notification email (SINGLE VERSION - NO DUPLICATE)
exports.sendPlanChangeEmail = async (organization, oldPlan, newPlan, duration, totalAmount) => {
  console.log('📧 Preparing plan change email for:', organization.email);
  console.log('   Old plan:', oldPlan, '→ New plan:', newPlan);
  
  const subject = `Plan Changed: ${oldPlan?.toUpperCase() || 'TRIAL'} → ${newPlan.toUpperCase()}`;
  console.log('   Subject:', subject);
  
  // Get plan features for the new plan
  const Subscription = require('../models/Subscription');
  const planFeatures = Subscription.PLAN_FEATURES[newPlan];
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Plan Update Confirmation</h1>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1e293b;">Dear ${organization.name} Administrator,</p>
        
        <p style="color: #334155;">Your subscription plan has been successfully updated.</p>
        
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e293b;">Plan Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;"><strong>Previous Plan:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${oldPlan?.toUpperCase() || 'Trial'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>New Plan:</strong></td>
              <td style="padding: 8px 0; text-align: right; color: #00d1ff; font-weight: bold;">${newPlan.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Duration:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${duration} month(s)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${totalAmount.toLocaleString()} SEK</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>VAT (25%):</strong></td>
              <td style="padding: 8px 0; text-align: right;">${(totalAmount * 0.25).toLocaleString()} SEK</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">New Plan Features:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>👥 Up to ${planFeatures?.maxEmployees || 0} employees</li>
            <li>🏢 Up to ${planFeatures?.maxBranches || 0} branches</li>
            <li>📧 Up to ${planFeatures?.maxEmailsPerMonth || 0} emails/month</li>
            <li>👔 Up to ${planFeatures?.maxAdmins || 0} administrators</li>
            ${planFeatures?.exportReports ? '<li>📊 Advanced report exports</li>' : ''}
            ${planFeatures?.prioritySupport ? '<li>⭐ Priority support</li>' : ''}
            ${planFeatures?.apiAccess ? '<li>🔌 API access</li>' : ''}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://taskbridge-five.vercel.app'}/billing" 
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Billing Details
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #cbd5e1;" />
        
        <p style="color: #64748b; font-size: 12px;">If you did not authorize this change, please contact us immediately at support@taskbridge.com</p>
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  if (!subject) {
    console.error('❌ Subject is undefined!');
    return;
  }
  
  await exports.sendEmail({ 
    to: organization.email, 
    subject: subject,
    html: html,
    organizationId: organization._id 
  });
};

// Send subscription expiration email - ADD ORGANIZATION ID
exports.sendSubscriptionExpirationEmail = async (organization, daysLeft) => {
  const subject = `Subscription Expiration Notice - ${daysLeft} days left`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #EF4444;">Subscription Expiration Notice</h1>
      <p>Hello ${organization.name} Administrator,</p>
      <p>Your subscription will expire in <strong>${daysLeft} days</strong>.</p>
      <p>To avoid service interruption, please renew your subscription.</p>
      <a href="${process.env.FRONTEND_URL}/billing" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Manage Subscription</a>
      <hr style="margin: 20px 0;" />
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
    </div>
  `;
  
  await exports.sendEmail({ 
    to: organization.email, 
    subject, 
    html,
    organizationId: organization._id 
  });
};