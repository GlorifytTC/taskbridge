const Subscription = require('../models/Subscription');

exports.checkEmailQuota = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ organization: req.user.organization });
    
    if (!subscription) {
      return res.status(403).json({ 
        success: false,
        message: 'No active subscription found. Please contact your administrator.' 
      });
    }
    
    const plan = Subscription.PLAN_FEATURES[subscription.plan];
    const used = subscription.usage?.emailsSentThisMonth || 0;
    
    if (used >= plan.maxEmailsPerMonth) {
      return res.status(429).json({ 
        success: false,
        message: `Email limit reached for this month. Your ${plan.name} plan allows ${plan.maxEmailsPerMonth} emails per month. Upgrade to send more.`,
        limit: plan.maxEmailsPerMonth,
        used: used,
        remaining: 0
      });
    }
    
    next();
  } catch (error) {
    console.error('Email quota check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};