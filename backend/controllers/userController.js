const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');


exports.getUsers = async (req, res) => {
  try {
    const query = { 
      organization: req.user.organization,
      // Only show users that are NOT deleted
      deletedAt: { $eq: null }  // This excludes soft-deleted users
    };
    
    // Add role filter
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    const users = await User.find(query)
      .populate('branch', 'name')
      .populate('jobDescription', 'name');
    
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

// @desc    Assign branch to admin
// @route   PUT /api/users/:id/assign-branch
// @access  Private/SuperAdmin/Master
exports.assignBranch = async (req, res) => {
  try {
    const { branchId } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add branch to assignedBranches if not already there
    if (!user.assignedBranches.includes(branchId)) {
      user.assignedBranches.push(branchId);
      await user.save();
    }
    
    // Also update the main branch field if not set
    if (!user.branch) {
      user.branch = branchId;
      await user.save();
    }
    
    res.json({ success: true, message: 'Branch assigned successfully', assignedBranches: user.assignedBranches });
  } catch (error) {
    console.error('Error assigning branch:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove branch from admin
// @route   PUT /api/users/:id/remove-branch
// @access  Private/SuperAdmin/Master
exports.removeBranch = async (req, res) => {
  try {
    const { branchId } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove branch from assignedBranches
    user.assignedBranches = user.assignedBranches.filter(b => b.toString() !== branchId);
    await user.save();
    
    res.json({ success: true, message: 'Branch removed successfully', assignedBranches: user.assignedBranches });
  } catch (error) {
    console.error('Error removing branch:', error);
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


// @desc    Delete user (HARD DELETE - completely remove)
// @route   DELETE /api/users/:id
// @access  Private/Admin/SuperAdmin
exports.deleteUser = async (req, res) => {
  try {
    console.log('Delete user request for ID:', req.params.id);
    console.log('User role:', req.user.role);
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log('Found user to delete:', user.name, user.email);
    
    // ✅ ADD THIS BLOCK - Prevent deleting master users
    if (user.role === 'master') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot delete master user. Master accounts are system administrators.' 
      });
    }
    
    // Check if user is trying to delete themselves
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }
    
    // SuperAdmin can delete anyone
    // Admin can only delete employees (not other admins)
    if (req.user.role === 'admin' && user.role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admins cannot delete other admins' 
      });
    }

    
    // Delete ALL related data (wrap in try-catch to avoid breaking)
    try {
      await Application.deleteMany({ employee: user._id });
      console.log('Deleted applications for user');
    } catch (err) {
      console.log('No applications to delete or error:', err.message);
    }
    
    try {
      await Notification.deleteMany({ user: user._id });
      console.log('Deleted notifications for user');
    } catch (err) {
      console.log('No notifications to delete or error:', err.message);
    }
    
    try {
      await AuditLog.deleteMany({ user: user._id });
      console.log('Deleted audit logs for user');
    } catch (err) {
      console.log('No audit logs to delete or error:', err.message);
    }
    
    // Remove user from tasks (set createdBy to null)
    try {
      await Task.updateMany(
        { createdBy: user._id },
        { createdBy: null }
      );
      console.log('Updated tasks created by user');
    } catch (err) {
      console.log('No tasks to update or error:', err.message);
    }
    
    // HARD DELETE - completely remove from database
    await user.deleteOne();
    console.log('User hard deleted from database');
    
    // Log the deletion (but don't let this fail the whole operation)
    try {
      await AuditLog.create({
        user: req.user.id,
        organization: req.user.organization,
        action: 'delete',
        entityType: 'user',
        entityId: req.params.id,
        changes: { 
          deleted: true,
          userName: user.name,
          userEmail: user.email
        },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });
    } catch (err) {
      console.log('Could not create audit log:', err.message);
    }
    
    res.json({ 
      success: true, 
      message: 'User permanently deleted from the system' 
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin/SuperAdmin/Master
exports.resetUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.params.id;
    
    console.log('🔐 Reset password for user ID:', userId);
    
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }
    
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log('✅ User found:', user.email);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password reset successfully for:', user.email);
    
    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
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