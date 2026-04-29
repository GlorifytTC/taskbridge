const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  
  console.log('🔐 Auth Middleware - Headers:', req.headers.authorization);
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('✅ Token found');
  }
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified for user ID:', decoded.id);
    
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('organization', 'name isActive')
      .populate('branch', 'name')
      .populate('assignedBranches', 'name')
      .populate('jobDescription', 'name');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      role: user.role,
      email: user.email
    });
    
    if (user.isActive === false) {
      console.log('❌ User account is deactivated');
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    if (user.role !== 'master' && user.organization && !user.organization.isActive) {
      console.log('❌ Organization is deactivated');
      return res.status(401).json({ message: 'Organization is deactivated' });
    }
    
    req.user = user;
    console.log('✅ User attached to req.user');
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(401).json({ message: 'Not authorized - Invalid token' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 Authorize middleware - User role:', req.user?.role);
    console.log('🔐 Required roles:', roles);
    
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`❌ Role ${req.user.role} not authorized. Required: ${roles}`);
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    console.log('✅ Authorization passed');
    next();
  };
};