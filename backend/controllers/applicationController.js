const Application = require('../models/Application');
const Task = require('../models/Task');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');

// @desc    Apply for a task
// @route   POST /api/applications
// @access  Private/Employee
exports.applyForTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    
    console.log('📝 Applying for task:', taskId);
    console.log('Employee jobDescription:', req.user.jobDescription);
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    console.log('Task jobDescription:', task.jobDescription);
    
    // Check if task is still open
    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Task is no longer available' });
    }
    
    // ✅ FIX: Safe comparison of job descriptions
    const employeeJobId = req.user.jobDescription ? req.user.jobDescription.toString() : null;
    const taskJobId = task.jobDescription ? task.jobDescription.toString() : null;
    
    if (employeeJobId !== taskJobId) {
      console.log('Job description mismatch:', employeeJobId, 'vs', taskJobId);
      return res.status(403).json({ 
        message: 'Not eligible for this task. Your job role does not match the task requirements.' 
      });
    }
    
    // Check for double booking
    const existingApplication = await Application.findOne({
      employee: req.user.id,
      task: taskId
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this task' });
    }
    
    // Check for time conflict
    const conflictingTasks = await Application.find({
      employee: req.user.id,
      status: 'approved'
    }).populate('task');
    
    const hasConflict = conflictingTasks.some(app => {
      const existingTask = app.task;
      if (!existingTask) return false;
      return existingTask.date.toDateString() === task.date.toDateString() &&
             ((task.startTime >= existingTask.startTime && task.startTime < existingTask.endTime) ||
              (task.endTime > existingTask.startTime && task.endTime <= existingTask.endTime));
    });
    
    if (hasConflict) {
      return res.status(400).json({ message: 'Time conflict with existing approved shift' });
    }
    
    // Create application
    const application = await Application.create({
      task: taskId,
      employee: req.user.id,
      organization: req.user.organization
    });
    
    // Update task current employees count
    task.currentEmployees += 1;
    if (task.currentEmployees >= task.maxEmployees) {
      task.status = 'filled';
    }
    await task.save();
    
    console.log('✅ Application created:', application._id);
    
    // Notify admin
    const admin = await User.findOne({
      organization: req.user.organization,
      role: 'admin',
      branch: req.user.branch
    });
    
    if (admin) {
      await Notification.create({
        user: admin._id,
        organization: req.user.organization,
        type: 'application_received',
        title: 'New Application',
        message: `${req.user.name} applied for task: ${task.title}`,
        data: { applicationId: application._id, taskId: task._id }
      });
    }
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'create',
      entityType: 'application',
      entityId: application._id,
      changes: { taskId, status: 'pending' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error applying for task:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all applications (for Super Admin/Master/Admin)
// @route   GET /api/applications
// @access  Private/SuperAdmin/Master/Admin
exports.getAllApplications = async (req, res) => {
  try {
    console.log('Getting all applications for user:', req.user.role);
    
    const query = { organization: req.user.organization };
    
    // If admin, only show applications for their assigned branches
    if (req.user.role === 'admin') {
      if (req.user.assignedBranches && req.user.assignedBranches.length > 0) {
        const tasks = await Task.find({ branch: { $in: req.user.assignedBranches } });
        const taskIds = tasks.map(t => t._id);
        query.task = { $in: taskIds };
      } else {
        return res.json({ success: true, count: 0, data: [] });
      }
    }
    
    const applications = await Application.find(query)
      .populate({
        path: 'employee',
        select: 'name email role'
      })
      .populate({
        path: 'task',
        select: 'title date startTime endTime branch location maxEmployees currentEmployees status'
      })
      .populate('reviewedBy', 'name')
      .sort({ appliedAt: -1 });
    
    console.log(`Found ${applications.length} applications`);
    console.log('First application employee:', applications[0]?.employee);
    
    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error getting all applications:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get my applications (employee)
// @route   GET /api/applications/my-applications
// @access  Private/Employee
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ employee: req.user.id })
      .populate({
        path: 'task',
        populate: { path: 'branch jobDescription', select: 'name' }
      })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error getting my applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get applications for admin review
// @route   GET /api/applications/pending
// @access  Private/Admin
exports.getPendingApplications = async (req, res) => {
  try {
    const { branch } = req.query;
    const query = {
      organization: req.user.organization,
      status: 'pending'
    };
    
    if (req.user.role === 'admin' && branch) {
      const tasks = await Task.find({ branch });
      query.task = { $in: tasks.map(t => t._id) };
    }
    
    const applications = await Application.find(query)
      .populate('task', 'title date startTime endTime branch')
      .populate('employee', 'name email')
      .sort({ appliedAt: 1 });
    
    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error getting pending applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve application
// @route   PUT /api/applications/:id/approve
// @access  Private/Admin
exports.approveApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('task')
      .populate('employee');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const task = await Task.findById(application.task._id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if task still has capacity
    if (task.currentEmployees >= task.maxEmployees) {
      return res.status(400).json({ message: 'Task is already full' });
    }
    
    // Update application status
    application.status = 'approved';
    application.reviewedBy = req.user.id;
    application.reviewedAt = Date.now();
    await application.save();
    
    // Increment task's current employees count
    task.currentEmployees = (task.currentEmployees || 0) + 1;
    
    // FIX: Update status based on employee count
    if (task.currentEmployees >= task.maxEmployees) {
      task.status = 'filled';
    } else {
      task.status = 'open';
    }
    
    await task.save();
    
    console.log(`✅ Application approved. Task ${task.title} now has ${task.currentEmployees}/${task.maxEmployees} employees`);
    console.log(`Task status: ${task.status}`);
    
    res.json({
      success: true,
      message: 'Application approved successfully',
      data: {
        application,
        task: {
          currentEmployees: task.currentEmployees,
          status: task.status,
          maxEmployees: task.maxEmployees
        }
      }
    });
    
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Reject application
// @route   PUT /api/applications/:id/reject
// @access  Private/Admin
exports.rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('task')
      .populate('employee');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    application.status = 'rejected';
    application.reviewedBy = req.user.id;
    application.reviewedAt = Date.now();
    application.reviewNotes = reason || '';
    await application.save();
    
    // Create notification for employee
    await Notification.create({
      user: application.employee._id,
      organization: req.user.organization,
      type: 'application_rejected',
      title: 'Application Rejected',
      message: `Your application for ${application.task.title} has been rejected${reason ? `: ${reason}` : ''}`,
      data: { applicationId: application._id, taskId: application.task._id }
    });
    
    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'reject',
      entityType: 'application',
      entityId: application._id,
      changes: { status: 'rejected', reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ message: 'Server error' });
  }
};