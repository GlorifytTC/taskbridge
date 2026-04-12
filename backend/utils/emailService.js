const emailjs = require('@emailjs/nodejs');

// Initialize EmailJS
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY
});

exports.sendEmail = async ({ to, subject, html, text, templateParams, organizationId }) => {
  try {
    console.log('📧 Sending email to:', to);
    
    if (!to) {
      console.error('❌ Recipient email is empty!');
      return { error: 'Recipient email is empty' };
    }
    
    // If templateParams provided, use those for EmailJS template
    const params = templateParams || {
      to_email: to,
      to_name: to.split('@')[0],
      subject: subject,
      message_html: html || text,
      message_text: text || html?.replace(/<[^>]*>/g, '')
    };
    
    // Make sure subject is in params
    if (!params.subject && subject) {
      params.subject = subject;
    }
    if (!params.to_email) {
      params.to_email = to;
    }
    
    console.log('📧 Template params:', { 
      to_email: params.to_email, 
      subject: params.subject,
      old_plan: params.old_plan,
      new_plan: params.new_plan
    });
    
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      params
    );
    
    console.log('✅ Email sent!', response.status);
    return response;
  } catch (error) {
    console.error('❌ Email error:', error.text || error.message);
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

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const templateParams = {
    to_email: user.email,
    to_name: user.name || user.email.split('@')[0],
    reset_link: resetLink,
    year: new Date().getFullYear()
  };
  
  await emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    process.env.EMAILJS_PASSWORD_RESET_TEMPLATE_ID, // Your new template ID
    templateParams
  );
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

// Send plan change notification email
exports.sendPlanChangeEmail = async (organization, oldPlan, newPlan, duration, totalAmount) => {
  console.log('📧 Preparing plan change email for:', organization.email);
  console.log('   Old plan:', oldPlan, '→ New plan:', newPlan);
  
  // Get plan features for the new plan
  const Subscription = require('../models/Subscription');
  const planFeatures = Subscription.PLAN_FEATURES[newPlan];
  
  const subject = `Plan Changed: ${oldPlan?.toUpperCase() || 'TRIAL'} → ${newPlan.toUpperCase()}`;
  
  // Calculate VAT
  const vatAmount = (totalAmount * 0.25).toFixed(2);
  
  // Prepare template parameters for EmailJS
  const templateParams = {
    to_email: organization.email,
    to_name: organization.name || 'Administrator',
    old_plan: oldPlan?.toUpperCase() || 'TRIAL',
    new_plan: newPlan.toUpperCase(),
    duration: duration.toString(),
    total_amount: totalAmount.toString(),
    vat_amount: vatAmount,
    max_employees: planFeatures?.maxEmployees || 0,
    max_branches: planFeatures?.maxBranches || 0,
    max_emails: planFeatures?.maxEmailsPerMonth || 0,
    max_admins: planFeatures?.maxAdmins || 0,
    subject: subject,
    message_html: `
        <h2>Plan Update Confirmation</h2>
        <p>Your plan has been changed from {{old_plan}} to {{new_plan}}.</p>
        <p>Total: {{total_amount}} SEK</p>
      `
  };
  
  console.log('📧 Template params:', templateParams);
  
  await exports.sendEmail({ 
    to: organization.email, 
    subject: subject,
    templateParams: templateParams,
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