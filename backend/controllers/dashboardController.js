const Task = require('../models/Task');
const Application = require('../models/Application');
const User = require('../models/User');
const moment = require('moment');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const organization = req.user.organization;
    const isEmployee = req.user.role === 'employee';
    
    let query = { organization };
    
    if (isEmployee) {
      query.jobDescription = req.user.jobDescription;
    }
    
    // Get total tasks
    const totalTasks = await Task.countDocuments(query);
    
    // Get pending applications
    let pendingQuery = { organization, status: 'pending' };
    if (isEmployee) {
      pendingQuery.employee = req.user.id;
    }
    const pendingApplications = await Application.countDocuments(pendingQuery);
    
    // Get approved shifts
    let approvedQuery = { organization, status: 'approved' };
    if (isEmployee) {
      approvedQuery.employee = req.user.id;
    }
    const approvedShifts = await Application.countDocuments(approvedQuery);
    
    // Get total employees (admin only)
    let totalEmployees = 0;
    if (!isEmployee) {
      totalEmployees = await User.countDocuments({ 
        organization, 
        role: 'employee',
        isActive: true 
      });
    }
    
    res.json({
      totalTasks,
      pendingApplications,
      approvedShifts,
      totalEmployees
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get attendance data for charts
// @route   GET /api/dashboard/attendance
// @access  Private/Admin
exports.getAttendance = async (req, res) => {
  try {
    const organization = req.user.organization;
    const last7Days = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      last7Days.push(date);
    }
    
    const attendanceData = await Promise.all(last7Days.map(async (date) => {
      const startDate = moment(date).startOf('day').toDate();
      const endDate = moment(date).endOf('day').toDate();
      
      const applications = await Application.find({
        organization,
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      return {
        date,
        present: applications.filter(a => a.attendanceStatus === 'present').length,
        absent: applications.filter(a => a.attendanceStatus === 'absent').length,
        late: applications.filter(a => a.attendanceStatus === 'late').length
      };
    }));
    
    res.json(attendanceData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task status data for pie chart
// @route   GET /api/dashboard/task-status
// @access  Private
exports.getTaskStatus = async (req, res) => {
  try {
    const organization = req.user.organization;
    
    const tasks = await Task.aggregate([
      { $match: { organization: organization._id } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);
    
    const statusMap = {
      open: 'Open',
      filled: 'Filled',
      cancelled: 'Cancelled',
      completed: 'Completed'
    };
    
    const data = tasks.map(task => ({
      name: statusMap[task._id] || task._id,
      value: task.count
    }));
    
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};