const Branch = require('../models/Branch');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Create branch
// @route   POST /api/branches
// @access  Private/Admin
exports.createBranch = async (req, res) => {
  try {
    const { name, address, phone, email } = req.body;
    
    const branch = await Branch.create({
      name,
      organization: req.user.organization,
      address,
      phone,
      email,
      createdBy: req.user.id
    });
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'create',
      entityType: 'branch',
      entityId: branch._id,
      changes: { name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      data: branch
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get branches
// @route   GET /api/branches
// @access  Private
exports.getBranches = async (req, res) => {
  try {
    const query = { organization: req.user.organization };
    
    if (req.user.role === 'admin' && req.user.branch) {
      query._id = req.user.branch;
    }
    
    const branches = await Branch.find(query)
      .populate('admins', 'name email')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      count: branches.length,
      data: branches
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Private
exports.getBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate('admins', 'name email');
    
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    
    // Check authorization
    if (branch.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({
      success: true,
      data: branch
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Private/Admin
exports.updateBranch = async (req, res) => {
  try {
    let branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    
    // Check authorization
    if (branch.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    branch = await Branch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'update',
      entityType: 'branch',
      entityId: branch._id,
      changes: req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      data: branch
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete branch (HARD DELETE - completely remove)
// @route   DELETE /api/branches/:id
// @access  Private/Admin/SuperAdmin
exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        message: 'Branch not found' 
      });
    }
    
    // Check if branch has employees assigned
    const employeesInBranch = await User.find({ 
      branch: branch._id,
      role: 'employee'
    });
    
    if (employeesInBranch.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete branch: ${employeesInBranch.length} employees are assigned to this branch. Please reassign or delete them first.` 
      });
    }
    
    // Check if branch has tasks
    const tasksInBranch = await Task.find({ branch: branch._id });
    
    if (tasksInBranch.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete branch: ${tasksInBranch.length} tasks are assigned to this branch. Please delete or reassign them first.` 
      });
    }
    
    // Check if admins are assigned to this branch
    const adminsWithBranch = await User.find({ 
      assignedBranches: branch._id
    });
    
    if (adminsWithBranch.length > 0) {
      // Remove branch from admin's assigned branches
      await User.updateMany(
        { assignedBranches: branch._id },
        { $pull: { assignedBranches: branch._id } }
      );
      console.log(`Removed branch from ${adminsWithBranch.length} admins`);
    }
    
    // HARD DELETE the branch
    await branch.deleteOne();
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'delete',
      entityType: 'branch',
      entityId: req.params.id,
      changes: { 
        deleted: true,
        branchName: branch.name,
        branchAddress: branch.address
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ 
      success: true, 
      message: 'Branch permanently deleted from the system' 
    });
    
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Assign admin to branch
// @route   POST /api/branches/:id/assign-admin
// @access  Private/SuperAdmin
exports.assignAdmin = async (req, res) => {
  try {
    const { adminId } = req.body;
    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(400).json({ message: 'Invalid admin user' });
    }
    
    // Add admin to branch
    if (!branch.admins.includes(adminId)) {
      branch.admins.push(adminId);
      await branch.save();
    }
    
    // Update admin's branch
    admin.branch = branch._id;
    await admin.save();
    
    res.json({
      success: true,
      message: 'Admin assigned successfully',
      data: branch
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};