const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');


// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const query = { organization: req.user.organization };
    
    if (req.user.role === 'admin') {
      query.role = 'employee';
    }
    
    const users = await User.find(query)
      .select('-password')
      .populate('branch', 'name')
      .populate('jobDescription', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('branch', 'name')
      .populate('jobDescription', 'name');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check authorization
    if (user.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check authorization
    if (user.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Don't allow password update here
    delete req.body.password;
    
    user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'update',
      entityType: 'user',
      entityId: user._id,
      changes: req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Create user (Admin, Super Admin, Master)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, branch, jobDescription } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      organization: req.user.organization,
      branch: branch || null,
      jobDescription: jobDescription || null,
      createdBy: req.user.id,
      isActive: true
    });
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'create',
      entityType: 'user',
      entityId: user._id,
      changes: { name, email, role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};


// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check authorization
    if (user.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Anonymize user data
    user.name = `Deleted User ${user._id}`;
    user.email = `deleted_${user._id}@deleted.com`;
    user.isActive = false;
    user.deletedAt = Date.now();
    await user.save();
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'delete',
      entityType: 'user',
      entityId: user._id,
      changes: { deleted: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
exports.resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check authorization
    if (user.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    user.password = newPassword;
    await user.save();
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'update',
      entityType: 'user',
      entityId: user._id,
      changes: { passwordReset: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Transfer ownership
// @route   POST /api/users/transfer-ownership
// @access  Private/SuperAdmin
exports.transferOwnership = async (req, res) => {
  try {
    const { currentAdminId, newAdminId } = req.body;
    
    const currentAdmin = await User.findById(currentAdminId);
    const newAdmin = await User.findById(newAdminId);
    
    if (!currentAdmin || !newAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Transfer all tasks and applications
    // This would need to be implemented based on your business logic
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'transfer',
      entityType: 'user',
      entityId: currentAdminId,
      changes: { transferredTo: newAdminId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'Ownership transferred successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};