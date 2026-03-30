const JobDescription = require('../models/JobDescription');
const User = require('../models/User');
const Task = require('../models/Task');
const AuditLog = require('../models/AuditLog');

// @desc    Create job description
// @route   POST /api/job-descriptions
// @access  Private/Admin
exports.createJobDescription = async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    
    const jobDescription = await JobDescription.create({
      name,
      description,
      organization: req.user.organization,
      branch: req.user.branch,
      createdBy: req.user.id,
      settings: settings || {}
    });
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'create',
      entityType: 'job_description',
      entityId: jobDescription._id,
      changes: { name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      data: jobDescription
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get job descriptions
// @route   GET /api/job-descriptions
// @access  Private
exports.getJobDescriptions = async (req, res) => {
  try {
    const query = { 
      organization: req.user.organization,
      isActive: true
    };
    
    if (req.user.role === 'admin' && req.user.branch) {
      query.branch = req.user.branch;
    }
    
    const jobDescriptions = await JobDescription.find(query)
      .populate('createdBy', 'name')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      count: jobDescriptions.length,
      data: jobDescriptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single job description
// @route   GET /api/job-descriptions/:id
// @access  Private
exports.getJobDescription = async (req, res) => {
  try {
    const jobDescription = await JobDescription.findById(req.params.id);
    
    if (!jobDescription) {
      return res.status(404).json({ message: 'Job description not found' });
    }
    
    // Check authorization
    if (jobDescription.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({
      success: true,
      data: jobDescription
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update job description
// @route   PUT /api/job-descriptions/:id
// @access  Private/Admin
exports.updateJobDescription = async (req, res) => {
  try {
    let jobDescription = await JobDescription.findById(req.params.id);
    
    if (!jobDescription) {
      return res.status(404).json({ message: 'Job description not found' });
    }
    
    // Check authorization
    if (jobDescription.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    jobDescription = await JobDescription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'update',
      entityType: 'job_description',
      entityId: jobDescription._id,
      changes: req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      data: jobDescription
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete job description
// @route   DELETE /api/job-descriptions/:id
// @access  Private/Admin
exports.deleteJobDescription = async (req, res) => {
  try {
    const jobDescription = await JobDescription.findById(req.params.id);
    
    if (!jobDescription) {
      return res.status(404).json({ message: 'Job description not found' });
    }
    
    // Check if there are employees with this job description
    const employees = await User.countDocuments({
      jobDescription: jobDescription._id,
      isActive: true
    });
    
    if (employees > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete job description with active employees. Reassign employees first.' 
      });
    }
    
    // Check if there are tasks with this job description
    const tasks = await Task.countDocuments({
      jobDescription: jobDescription._id,
      status: { $in: ['open', 'filled'] }
    });
    
    if (tasks > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete job description with active tasks. Complete or cancel tasks first.' 
      });
    }
    
    await jobDescription.deleteOne();
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'delete',
      entityType: 'job_description',
      entityId: jobDescription._id,
      changes: { deleted: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'Job description deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};