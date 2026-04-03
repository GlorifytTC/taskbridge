const Task = require('../models/Task');
const Application = require('../models/Application');
const User = require('../models/User');
const JobDescription = require('../models/JobDescription');
const Branch = require('../models/Branch');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');

// @desc    Create new task/shift
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      branch,
      jobDescription,
      date,
      startTime,
      endTime,
      period,
      maxEmployees,
      location,
      notes,
      isCrossBranch,
      publishedToBranches
    } = req.body;
    
    const organization = req.user.organization;
    
    // Check if job description exists and belongs to organization
    const jobDesc = await JobDescription.findOne({
      _id: jobDescription,
      organization
    });
    
    if (!jobDesc) {
      return res.status(404).json({ message: 'Job description not found' });
    }
    
    // Create task
    const task = await Task.create({
      title,
      description,
      organization,
      branch,
      jobDescription,
      createdBy: req.user.id,
      date,
      startTime,
      endTime,
      period,
      maxEmployees,
      location,
      notes,
      isCrossBranch: isCrossBranch || false,
      publishedToBranches: publishedToBranches || []
    });
    
    // Get eligible employees
    const employees = await User.find({
      organization,
      role: 'employee',
      jobDescription,
      isActive: true
    });
    
    // Create notifications for employees
    const notifications = employees.map(employee => ({
      user: employee._id,
      organization,
      type: 'task_created',
      title: 'New Task Available',
      message: `A new task "${title}" has been created for ${new Date(date).toLocaleDateString()}`,
      data: { taskId: task._id }
    }));
    
    await Notification.insertMany(notifications);
    
    // Send email notifications
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      for (const employee of employees) {
        await sendEmail({
          to: employee.email,
          subject: 'New Task Available',
          html: `
            <h1>New Task: ${title}</h1>
            <p>Date: ${new Date(date).toLocaleDateString()}</p>
            <p>Time: ${startTime} - ${endTime}</p>
            <p>${description || ''}</p>
            <a href="${process.env.FRONTEND_URL}/tasks/${task._id}">View Task</a>
          `
        });
      }
    }
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization,
      action: 'create',
      entityType: 'task',
      entityId: task._id,
      changes: { title, date, jobDescription },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const query = { organization: req.user.organization };
    
    // Filter by role
    if (req.user.role === 'employee') {
      query.jobDescription = req.user.jobDescription;
      query.status = 'open';
    } else if (req.user.role === 'admin') {
      // If admin has assigned branches, only show tasks from those branches
      if (req.user.assignedBranches && req.user.assignedBranches.length > 0) {
        query.branch = { $in: req.user.assignedBranches };
      } else if (req.query.branches) {
        const branches = req.query.branches.split(',');
        query.branch = { $in: branches };
      }
    }
    
    // Date filter
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    const tasks = await Task.find(query)
      .populate('branch', 'name')
      .populate('jobDescription', 'name')
      .populate('createdBy', 'name')
      .sort({ date: 1, startTime: 1 });
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single task with applications
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('branch', 'name address')
      .populate('jobDescription', 'name')
      .populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check authorization
    if (task.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get applications for this task with employee details
    const applications = await Application.find({ task: task._id, status: 'approved' })
      .populate('employee', 'name email')
      .populate('reviewedBy', 'name');
    
    res.json({
      success: true,
      data: {
        task,
        applications
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Debug - check task employee count
// @route   GET /api/tasks/debug/:id
// @access  Private/Admin
exports.debugTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('branch', 'name')
      .populate('jobDescription', 'name');
    
    const applications = await Application.find({ task: req.params.id, status: 'approved' })
      .populate('employee', 'name email');
    
    res.json({
      task: {
        id: task._id,
        title: task.title,
        currentEmployees: task.currentEmployees,
        maxEmployees: task.maxEmployees,
        status: task.status
      },
      approvedApplications: applications,
      count: applications.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private/Admin
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check authorization
    if (task.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const oldData = { ...task.toObject() };
    
    // Update task
    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'update',
      entityType: 'task',
      entityId: task._id,
      changes: { old: oldData, new: req.body },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check authorization
    if (task.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete all applications for this task
    await Application.deleteMany({ task: task._id });
    
    // Delete task
    await task.deleteOne();
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'delete',
      entityType: 'task',
      entityId: task._id,
      changes: { deleted: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};