const Branch = require('../models/Branch');
const User = require('../models/User');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
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
// @desc    Check if branch has related data
// @route   GET /api/branches/:id/check
// @access  Private/Admin/SuperAdmin
exports.checkBranchRelations = async (req, res) => {
  try {
    const branchId = req.params.id;
    
    const employeeCount = await User.countDocuments({ 
      branch: branchId, 
      role: 'employee' 
    });
    
    const taskCount = await Task.countDocuments({ 
      branch: branchId 
    });
    
    res.json({
      success: true,
      hasEmployees: employeeCount > 0,
      hasTasks: taskCount > 0,
      employeeCount,
      taskCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete branch
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
    
    // Force delete if ?force=true is in the URL
    const forceDelete = req.query.force === 'true';
    
    // Check for employees in this branch
    const employees = await User.find({ 
      branch: branch._id,
      role: 'employee' 
    });
    
    // Check for tasks in this branch  
    const tasks = await Task.find({ branch: branch._id });
    
    // If there are employees or tasks and not force delete, block deletion
    if ((employees.length > 0 || tasks.length > 0) && !forceDelete) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete branch: ${employees.length} employee(s) and ${tasks.length} task(s) assigned. Use ?force=true to delete everything.`
      });
    }
    
    // FORCE DELETE - remove all related data
    if (forceDelete) {
      // Delete all applications for tasks in this branch
      for (const task of tasks) {
        await Application.deleteMany({ task: task._id });
      }
      
      // Delete all tasks in this branch
      await Task.deleteMany({ branch: branch._id });
      
      // Delete all employees in this branch
      for (const employee of employees) {
        await Application.deleteMany({ employee: employee._id });
        await Notification.deleteMany({ user: employee._id });
        await employee.deleteOne();
      }
    }
    
    // Remove branch from any admins' assignedBranches
    await User.updateMany(
      { assignedBranches: branch._id },
      { $pull: { assignedBranches: branch._id } }
    );
    
    // Delete the branch
    await branch.deleteOne();
    
    res.json({ 
      success: true, 
      message: 'Branch deleted successfully' 
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