// utils/emailService.js - Using Brevo HTTP API (port 443)
const SibApiV3Sdk = require('sib-api-v3-sdk');

console.log('🔍 DEBUG: Checking Brevo API Key...');
console.log('   BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
console.log('   BREVO_API_KEY length:', process.env.BREVO_API_KEY?.length || 0);
console.log('   BREVO_API_KEY starts with xkeysib:', process.env.BREVO_API_KEY?.startsWith('xkeysib-'));

// Initialize Brevo API client
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const defaultSender = {
  email: process.env.BREVO_FROM_EMAIL || 'noreply@taskbridge.com',
  name: process.env.BREVO_FROM_NAME || 'TaskBridge'
};

// Main send email function
exports.sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log('📧 Sending email to:', to);
    console.log('📧 Subject:', subject);
    
    if (!to) {
      console.error('❌ Recipient email is empty!');
      return { error: 'Recipient email is empty' };
    }
    
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.sender = defaultSender;
    sendSmtpEmail.to = [{ email: to, name: to.split('@')[0] }];
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.textContent = text || html?.replace(/<[^>]*>/g, '');
    
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent! Message ID:', response.messageId);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.response?.body || error.message);
    return { error: error.message };
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  console.log('📧 Sending password reset email to:', user.email);
  
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
          <p><strong>Organization:</strong> ${organization.name}</p>
          <p><strong>Your Email:</strong> ${admin.email}</p>
          <p><strong>Temporary Password:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
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

// Send welcome email - SIMPLIFIED
exports.sendWelcomeEmail = async (user, organization) => {
  const subject = `🎉 Welcome to TaskBridge, ${user.name}!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome!</h1>
      </div>
      
      <div style="padding: 24px;">
        <p style="font-size: 16px; color: #1e293b;">Hello <strong>${user.name}</strong>,</p>
        
        <p style="color: #334155;">Your account has been created for <strong>${organization.name}</strong>.</p>
        
        <div style="background: #e2e8f0; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; color: #0f172a;"><strong>📧 Your login email:</strong> ${user.email}</p>
        </div>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Login to Your Account →
          </a>
        </div>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #cbd5e1;" />
        
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          TaskBridge - Smart Workforce Management
        </p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: user.email, subject, html });
};

// Send task notification email - SIMPLIFIED (ONLY ONE VERSION)
exports.sendTaskNotification = async (employee, task, organizationId) => {
  const subject = `📋 New Job: ${task.title}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📋 New Job Available!</h1>
      </div>
      
      <div style="padding: 24px;">
        <p style="font-size: 16px; color: #1e293b;">Hello <strong>${employee.name}</strong>,</p>
        
        <p style="color: #334155;">A new job has been posted in your branch:</p>
        
        <div style="background: #e2e8f0; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px;">${task.title}</h2>
          <p style="margin: 4px 0; color: #475569;">
            📅 ${new Date(task.date).toLocaleDateString()} at ${task.startTime} - ${task.endTime}
          </p>
          ${task.location ? `<p style="margin: 4px 0; color: #475569;">📍 ${task.location}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL}/tasks" 
             style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Available Jobs →
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 24px;">
          Go to <strong>Available Jobs</strong> tab to apply
        </p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #cbd5e1;" />
        
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          TaskBridge - Smart Workforce Management<br>
          Questions? Contact your administrator
        </p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: employee.email, subject, html });
};

// Send application status email - SIMPLIFIED
exports.sendApplicationStatusEmail = async (employee, task, status, organizationId, reason = '') => {
  const subject = status === 'approved' ? `✅ Shift Approved: ${task.title}` : `❌ Shift Not Approved: ${task.title}`;
  const statusColor = status === 'approved' ? '#10B981' : '#EF4444';
  const statusIcon = status === 'approved' ? '✅' : '❌';
  const statusText = status === 'approved' ? 'APPROVED' : 'NOT APPROVED';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: ${statusColor}; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${statusIcon} Shift ${statusText}</h1>
      </div>
      
      <div style="padding: 24px;">
        <p style="font-size: 16px; color: #1e293b;">Hello <strong>${employee.name}</strong>,</p>
        
        <p style="color: #334155;">Your application for <strong>${task.title}</strong> has been <strong style="color: ${statusColor};">${status.toUpperCase()}</strong>.</p>
        
        <div style="background: #e2e8f0; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px;">${task.title}</h2>
          <p style="margin: 4px 0; color: #475569;">
            📅 ${new Date(task.date).toLocaleDateString()} at ${task.startTime} - ${task.endTime}
          </p>
        </div>
        
        ${reason ? `<p style="color: #ef4444; background: #fee2e2; padding: 10px; border-radius: 8px;">📝 Reason: ${reason}</p>` : ''}
        
        ${status === 'approved' ? `
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.FRONTEND_URL}/calendar" 
               style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View My Calendar →
            </a>
          </div>
        ` : `
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.FRONTEND_URL}/tasks" 
               style="display: inline-block; padding: 12px 24px; background: #64748b; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Find Other Jobs →
            </a>
          </div>
        `}
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #cbd5e1;" />
        
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          TaskBridge - Smart Workforce Management
        </p>
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
        <p>Hello ${organization.name || 'Administrator'},</p>
        <p>Your plan has been changed from <strong>${oldPlan?.toUpperCase() || 'TRIAL'}</strong> to <strong>${newPlan.toUpperCase()}</strong>.</p>
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px;">
          <p><strong>Duration:</strong> ${duration} months</p>
          <p><strong>Total:</strong> ${totalAmount} SEK</p>
          <p><strong>VAT (25%):</strong> ${vatAmount} SEK</p>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/billing" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px;">Manage Subscription</a>
        </div>
        <hr />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: organization.email, subject, html });
};
// Send password changed notification email
exports.sendPasswordChangedNotification = async (user, ipAddress, userAgent) => {
  const subject = `🔐 Your TaskBridge password was changed`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Password Changed</h1>
      </div>
      
      <div style="padding: 24px;">
        <p style="font-size: 16px; color: #1e293b;">Hello <strong>${user.name}</strong>,</p>
        
        <p style="color: #334155;">Your TaskBridge account password was just changed.</p>
        
        <div style="background: #e2e8f0; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #475569;">📅 <strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="margin: 4px 0; color: #475569;">🌍 <strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
          <p style="margin: 4px 0; color: #475569;">💻 <strong>Device:</strong> ${userAgent || 'Unknown'}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 16px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            ⚠️ <strong>Didn't change your password?</strong><br>
            If you didn't make this change, please reset your password immediately using the link below.
          </p>
        </div>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL}/forgot-password" 
             style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            🔒 Reset Password Now
          </a>
        </div>
        
        <div style="text-align: center; margin: 16px 0;">
          <a href="mailto:support@taskbridge.com" 
             style="color: #00d1ff; text-decoration: none; font-size: 14px;">
            Contact Support
          </a>
          &nbsp;|&nbsp;
          <a href="${process.env.FRONTEND_URL}/security" 
             style="color: #00d1ff; text-decoration: none; font-size: 14px;">
            Security Settings
          </a>
        </div>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #cbd5e1;" />
        
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          This is an automated security notification from TaskBridge.<br>
          If this was you, you can ignore this email.
        </p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: user.email, subject, html });
};

// Send email changed notification
exports.sendEmailChangedNotification = async (user, oldEmail, newEmail, ipAddress, userAgent) => {
  const subject = `📧 Your TaskBridge email address was changed`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📧 Email Changed</h1>
      </div>
      
      <div style="padding: 24px;">
        <p style="font-size: 16px; color: #1e293b;">Hello <strong>${user.name}</strong>,</p>
        
        <p style="color: #334155;">Your TaskBridge account email address was just changed.</p>
        
        <div style="background: #e2e8f0; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #475569;">📧 <strong>Old Email:</strong> ${oldEmail}</p>
          <p style="margin: 4px 0; color: #475569;">📧 <strong>New Email:</strong> ${newEmail}</p>
          <p style="margin: 4px 0; color: #475569;">📅 <strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="margin: 4px 0; color: #475569;">🌍 <strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 16px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            ⚠️ <strong>Didn't make this change?</strong><br>
            Contact support immediately to secure your account.
          </p>
        </div>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="mailto:support@taskbridge.com" 
             style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            🛡️ Contact Support
          </a>
        </div>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #cbd5e1;" />
        
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          If you made this change, no further action is needed.
        </p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: oldEmail, subject, html });
  
  // Also send to the new email to confirm
  await exports.sendEmail({ 
    to: newEmail, 
    subject: `📧 Your TaskBridge email was changed to this address`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">📧 Email Updated</h1>
        </div>
        <div style="padding: 24px;">
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>This email is now associated with your TaskBridge account.</p>
          <p>If you did not make this change, please <a href="${process.env.FRONTEND_URL}/security" style="color: #00d1ff;">secure your account immediately</a>.</p>
          <hr style="margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 11px;">TaskBridge - Smart Workforce Management</p>
        </div>
      </div>
    `
  });
};

// Send login notification (optional - for new device logins)
exports.sendLoginNotification = async (user, ipAddress, userAgent, isNewDevice = true) => {
  if (!isNewDevice) return; // Only send for new devices
  
  const subject = `🔐 New login to your TaskBridge account`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🔐 New Login Detected</h1>
      </div>
      
      <div style="padding: 24px;">
        <p style="font-size: 16px; color: #1e293b;">Hello <strong>${user.name}</strong>,</p>
        
        <p style="color: #334155;">A new device just logged into your TaskBridge account.</p>
        
        <div style="background: #e2e8f0; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #475569;">📅 <strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="margin: 4px 0; color: #475569;">🌍 <strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
          <p style="margin: 4px 0; color: #475569;">💻 <strong>Device:</strong> ${userAgent || 'Unknown'}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 16px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            ⚠️ <strong>Wasn't you?</strong><br>
            If you don't recognize this login, please reset your password immediately.
          </p>
        </div>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL}/forgot-password" 
             style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            🔒 Reset Password
          </a>
        </div>
        
        <hr style="margin: 20px 0;" />
        
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          If this was you, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: user.email, subject, html });
};

// Send subscription expiration email
// Send subscription expiration email
exports.sendSubscriptionExpirationEmail = async (organization, daysLeft) => {
  const subject = `⚠️ Subscription Expiration Notice - ${daysLeft} days left`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: #EF4444; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Subscription Expiring</h1>
      </div>
      
      <div style="padding: 24px;">
        <p style="font-size: 16px; color: #1e293b;">Hello <strong>${organization.name} Administrator</strong>,</p>
        
        <p style="color: #334155;">Your TaskBridge subscription will expire in <strong style="color: #EF4444;">${daysLeft} days</strong>.</p>
        
        <div style="background: #fef3c7; padding: 16px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            To avoid service interruption, please renew your subscription.
          </p>
        </div>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL}/billing" 
             style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Renew Subscription →
          </a>
        </div>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #cbd5e1;" />
        
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          TaskBridge - Smart Workforce Management<br>
          Contact: support@taskbridge.com
        </p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ to: organization.email, subject, html });
};