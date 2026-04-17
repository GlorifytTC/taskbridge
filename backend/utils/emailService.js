// utils/emailService.js - Using Brevo HTTP API
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Debug: Check if API key is loaded
console.log('🔧 Loading Brevo API configuration...');
console.log('   BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
console.log('   BREVO_API_KEY length:', process.env.BREVO_API_KEY?.length || 0);
console.log('   BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL);
console.log('   BREVO_FROM_NAME:', process.env.BREVO_FROM_NAME);

// Initialize Brevo API client
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Verify API key is set
if (!apiKey.apiKey) {
  console.error('❌ BREVO_API_KEY is not set in environment variables!');
}

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const defaultSender = {
  email: process.env.BREVO_FROM_EMAIL || 'noreply@taskbridge.com',
  name: process.env.BREVO_FROM_NAME || 'TaskBridge'
};

// Main send email function using Brevo API
exports.sendEmail = async ({ to, subject, html, text, organizationId }) => {
  try {
    console.log('📧 Sending email to:', to);
    console.log('📧 Subject:', subject);
    
    if (!to) {
      console.error('❌ Recipient email is empty!');
      return { error: 'Recipient email is empty' };
    }
    
    // Double check API key
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY missing!');
      return { error: 'API key not configured' };
    }
    
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.sender = defaultSender;
    sendSmtpEmail.to = [{ email: to, name: to.split('@')[0] }];
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.textContent = text || html?.replace(/<[^>]*>/g, '');
    
    console.log('📧 Attempting to send via Brevo API...');
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent! Message ID:', response.messageId);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.response?.body || error.message);
    console.error('❌ Full error object:', error);
    return { error: error.message };
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  console.log('📧 Sending password reset email to:', user.email);
  console.log('📧 Reset URL:', resetUrl);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Reset Your Password</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1e293b;">Hello ${user.name || user.email.split('@')[0]},</p>
        <p style="color: #334155;">We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #475569; font-size: 14px;">This link will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return await exports.sendEmail({ 
    to: user.email, 
    subject: 'Reset Your TaskBridge Password', 
    html
  });
};

// Send welcome email with invoice
exports.sendWelcomeEmailWithInvoice = async (organization, admin, tempPassword, invoicePath, paymentData) => {
  const subject = `Welcome to TaskBridge - ${organization.name} - Invoice #${paymentData.invoiceNumber}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to TaskBridge!</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1e293b;">Dear ${admin.name},</p>
        <p style="color: #334155;">Your organization <strong>${organization.name}</strong> has been successfully created.</p>
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e293b;">Account Details:</h3>
          <p style="margin: 5px 0;"><strong>Organization:</strong> ${organization.name}</p>
          <p style="margin: 5px 0;"><strong>Your Email:</strong> ${admin.email}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/create-account?email=${encodeURIComponent(admin.email)}" 
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Create Your Account
          </a>
        </div>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: admin.email, subject, html });
};

// Send welcome email
exports.sendWelcomeEmail = async (user, organization) => {
  const subject = `Welcome to TaskBridge - ${organization.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to TaskBridge!</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1e293b;">Hello ${user.name},</p>
        <p style="color: #334155;">Your account has been created for <strong>${organization.name}</strong>.</p>
        <p style="color: #334155;"><strong>Your login email:</strong> ${user.email}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Log In</a>
        </div>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: user.email, subject, html });
};

// Send task notification email
exports.sendTaskNotification = async (employee, task, organizationId) => {
  const subject = `New Task Available: ${task.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">New Task Available</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1e293b;">Hello ${employee.name},</p>
        <p style="color: #334155;">A new task has been assigned to you:</p>
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e293b;">${task.title}</h3>
          <p><strong>Date:</strong> ${new Date(task.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${task.startTime} - ${task.endTime}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/tasks/${task._id}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">View & Apply</a>
        </div>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: employee.email, subject, html });
};

// Send application status email
exports.sendApplicationStatusEmail = async (employee, task, status, organizationId, reason = '') => {
  const subject = `Application ${status}: ${task.title}`;
  const statusColor = status === 'approved' ? '#10B981' : '#EF4444';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${statusColor}; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Application ${status.toUpperCase()}</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1e293b;">Hello ${employee.name},</p>
        <p style="color: #334155;">Your application for <strong>${task.title}</strong> has been <strong style="color: ${statusColor};">${status}</strong>.</p>
        ${reason ? `<p style="color: #ef4444;"><strong>Reason:</strong> ${reason}</p>` : ''}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/calendar" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">View Calendar</a>
        </div>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: employee.email, subject, html });
};

// Send plan change notification email
exports.sendPlanChangeEmail = async (organization, oldPlan, newPlan, duration, totalAmount) => {
  const subject = `Plan Changed: ${oldPlan?.toUpperCase() || 'TRIAL'} → ${newPlan.toUpperCase()}`;
  const vatAmount = (totalAmount * 0.25).toFixed(2);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Plan Updated!</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1e293b;">Hello ${organization.name || 'Administrator'},</p>
        <p style="color: #334155;">Your plan has been changed from <strong>${oldPlan?.toUpperCase() || 'TRIAL'}</strong> to <strong>${newPlan.toUpperCase()}</strong>.</p>
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Duration:</strong> ${duration} months</p>
          <p><strong>Total:</strong> ${totalAmount} SEK</p>
          <p><strong>VAT (25%):</strong> ${vatAmount} SEK</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/billing" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Manage Subscription</a>
        </div>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: organization.email, subject, html });
};

// Send subscription expiration email
exports.sendSubscriptionExpirationEmail = async (organization, daysLeft) => {
  const subject = `Subscription Expiration Notice - ${daysLeft} days left`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #EF4444; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Subscription Expiration Notice</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1e293b;">Hello ${organization.name} Administrator,</p>
        <p style="color: #334155;">Your subscription will expire in <strong style="color: #EF4444;">${daysLeft} days</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/billing" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Manage Subscription</a>
        </div>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: organization.email, subject, html });
};