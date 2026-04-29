const User = require('../models/User');

// Middleware to check if user can access features (blocks expired trials)
exports.trialGuard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('organization');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Skip check for master users
    if (user.role === 'master') {
      return next();
    }
    
    const trialEndDate = user.trialEndDate || user.organization?.subscription?.endDate;
    const isExpired = trialEndDate && new Date() > new Date(trialEndDate);
    const hasActiveSubscription = user.paymentStatus === 'active';
    
    if (!hasActiveSubscription && isExpired) {
      return res.status(403).json({
        success: false,
        message: 'Your free trial has ended. Please upgrade to continue using TaskBridge.',
        code: 'TRIAL_EXPIRED',
        upgradeUrl: '/billing'
      });
    }
    
    // Block creating new tasks/applications if expired
    const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const isTaskOrApplication = req.originalUrl.includes('/tasks') || 
                                 req.originalUrl.includes('/applications') ||
                                 req.originalUrl.includes('/jobs');
    
    if (isWriteOperation && isTaskOrApplication && !hasActiveSubscription && isExpired) {
      return res.status(403).json({
        success: false,
        message: 'Your trial has expired. Please upgrade to create tasks or applications.',
        code: 'TRIAL_EXPIRED_WRITE_BLOCKED'
      });
    }
    
    next();
  } catch (error) {
    console.error('Trial guard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};