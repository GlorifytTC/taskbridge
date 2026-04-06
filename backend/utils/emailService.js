const nodemailer = require('nodemailer');
const { trackEmailSent } = require('../controllers/organizationController');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send email function - ADD ORGANIZATION ID PARAMETER
exports.sendEmail = async ({ to, subject, html, text, organizationId }) => {
  try {
    const mailOptions = {
      from: `"TaskBridge" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html: html || text,
      text: text || html?.replace(/<[^>]*>/g, '')
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    // ✅ TRACK THE EMAIL FOR QUOTA (if organizationId provided)
    if (organizationId) {
      await trackEmailSent(organizationId);
    }
    
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
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
  
  // ✅ Pass organization ID for tracking
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
  
  // ✅ Pass organization ID for tracking
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
  
  // ✅ Pass organization ID for tracking
  await exports.sendEmail({ 
    to: employee.email, 
    subject, 
    html,
    organizationId: organizationId 
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
  
  // ✅ Pass organization ID for tracking
  await exports.sendEmail({ 
    to: organization.email, 
    subject, 
    html,
    organizationId: organization._id 
  });
};