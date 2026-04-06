const { checkEmailQuota } = require('../middleware/emailQuota');
const { sendEmail } = require('../utils/emailService');

// Protect email routes with quota check
router.post('/send-bulk', protect, checkEmailQuota, async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;
    
    for (const recipient of recipients) {
      await sendEmail({
        to: recipient.email,
        subject: subject,
        html: message,
        organizationId: req.user.organization
      });
    }
    
    res.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ success: false, message: 'Failed to send emails' });
  }
});