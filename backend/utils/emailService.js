const nodemailer = require('nodemailer');

// Create SMTP transporter for Brevo
const createTransporter = () => {
  console.log('📧 Creating Brevo SMTP transporter...');
  console.log('   Host:', process.env.BREVO_SMTP_HOST);
  console.log('   Port:', process.env.BREVO_SMTP_PORT);
  console.log('   Login:', process.env.BREVO_SMTP_LOGIN);
  
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_LOGIN,
      pass: process.env.BREVO_SMTP_KEY
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Default sender information
const defaultSender = {
  email: process.env.BREVO_FROM_EMAIL || 'noreply@taskbridge.com',
  name: process.env.BREVO_FROM_NAME || 'TaskBridge'
};

// Main send email function
exports.sendEmail = async ({ to, subject, html, text, organizationId }) => {
  try {
    console.log('📧 Sending email to:', to);
    console.log('📧 Subject:', subject);
    
    if (!to) {
      console.error('❌ Recipient email is empty!');
      return { error: 'Recipient email is empty' };
    }
    
    const transporter = createTransporter();
    
    // Verify SMTP connection first
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    const mailOptions = {
      from: `"${defaultSender.name}" <${defaultSender.email}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html?.replace(/<[^>]*>/g, '')
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent! Message ID:', info.messageId);
    console.log('✅ Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    console.error('❌ Full error:', error);
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
        <p style="color: #334155;">Your account has been created for <strong>${organization.name}</strong>. You can now log in to manage your shifts and tasks.</p>
        <p style="color: #334155;"><strong>Your login email:</strong> ${user.email}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Log In</a>
        </div>
        <p style="color: #475569; font-size: 14px;">If you have any questions, please contact your administrator.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ 
    to: user.email, 
    subject, 
    html,
    organizationId: organization._id 
  });
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
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
        <p style="color: #475569; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ 
    to: user.email, 
    subject: 'Reset Your TaskBridge Password', 
    html,
    organizationId: user.organization?._id || 'general'
  });
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
        <p style="color: #334155;">A new task has been assigned to your job description:</p>
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e293b;">${task.title}</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(task.date).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${task.startTime} - ${task.endTime}</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> ${task.location || 'Not specified'}</p>
          ${task.description ? `<p style="margin: 5px 0;"><strong>Description:</strong> ${task.description}</p>` : ''}
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/tasks/${task._id}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">View & Apply</a>
        </div>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ 
    to: employee.email, 
    subject, 
    html,
    organizationId: organizationId 
  });
};

// Send application status email
exports.sendApplicationStatusEmail = async (employee, task, status, organizationId, reason = '') => {
  const subject = `Application ${status}: ${task.title}`;
  const statusColor = status === 'approved' ? '#10B981' : '#EF4444';
  const statusText = status.toUpperCase();
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${statusColor}; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Application ${statusText}</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1e293b;">Hello ${employee.name},</p>
        <p style="color: #334155;">Your application for the following task has been <strong style="color: ${statusColor};">${status}</strong>:</p>
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e293b;">${task.title}</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(task.date).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${task.startTime} - ${task.endTime}</p>
        </div>
        ${reason ? `<p style="color: #ef4444;"><strong>Reason:</strong> ${reason}</p>` : ''}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/calendar" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">View Calendar</a>
        </div>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ 
    to: employee.email, 
    subject, 
    html,
    organizationId: organizationId 
  });
};

// Send plan change notification email
exports.sendPlanChangeEmail = async (organization, oldPlan, newPlan, duration, totalAmount) => {
  console.log('📧 Preparing plan change email for:', organization.email);
  console.log('   Old plan:', oldPlan, '→ New plan:', newPlan);
  
  const subject = `Plan Changed: ${oldPlan?.toUpperCase() || 'TRIAL'} → ${newPlan.toUpperCase()}`;
  const vatAmount = (totalAmount * 0.25).toFixed(2);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00f5ff, #00d1ff); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Plan Updated!</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1e293b;">Hello ${organization.name || 'Administrator'},</p>
        <p style="color: #334155;">Your plan has been successfully changed from <strong>${oldPlan?.toUpperCase() || 'TRIAL'}</strong> to <strong>${newPlan.toUpperCase()}</strong>.</p>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">New Plan Features:</h3>
          <p style="margin: 5px 0;"><strong>Employees:</strong> Up to ${subscriptionData?.maxEmployees || 0}</p>
          <p style="margin: 5px 0;"><strong>Branches:</strong> Up to ${subscriptionData?.maxBranches || 0}</p>
          <p style="margin: 5px 0;"><strong>Admins:</strong> Up to ${subscriptionData?.maxAdmins || 0}</p>
        </div>
        
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e293b;">Billing Summary:</h3>
          <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration} months</p>
          <p style="margin: 5px 0;"><strong>Total:</strong> ${totalAmount} SEK</p>
          <p style="margin: 5px 0;"><strong>VAT (25%):</strong> ${vatAmount} SEK</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/billing" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Manage Subscription</a>
        </div>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ 
    to: organization.email, 
    subject: subject,
    html,
    organizationId: organization._id 
  });
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
        <p style="color: #334155;">To avoid service interruption, please renew your subscription.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/billing" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00f5ff, #00d1ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Manage Subscription</a>
        </div>
        <hr style="margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} TaskBridge. All rights reserved.</p>
      </div>
    </div>
  `;
  
  await exports.sendEmail({ 
    to: organization.email, 
    subject, 
    html,
    organizationId: organization._id 
  });
};