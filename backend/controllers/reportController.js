const Task = require('../models/Task');
const Application = require('../models/Application');
const User = require('../models/User');
const moment = require('moment');

// @desc    Get attendance report
// @route   GET /api/reports/attendance
// @access  Private/Admin
exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, branch } = req.query;
    
    const query = {
      organization: req.user.organization,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (branch) query.branch = branch;
    
    const applications = await Application.find(query)
      .populate('employee', 'name email')
      .populate('task', 'title date startTime endTime');
    
    const report = {
      totalApplications: applications.length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      pending: applications.filter(a => a.status === 'pending').length,
      attendance: {
        present: applications.filter(a => a.attendanceStatus === 'present').length,
        absent: applications.filter(a => a.attendanceStatus === 'absent').length,
        late: applications.filter(a => a.attendanceStatus === 'late').length
      },
      applications
    };
    
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hours report
// @route   GET /api/reports/hours
// @access  Private/Admin
exports.getHoursReport = async (req, res) => {
  try {
    const { startDate, endDate, employee } = req.query;
    
    const query = {
      organization: req.user.organization,
      status: 'approved'
    };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (employee) query.employee = employee;
    
    const applications = await Application.find(query)
      .populate('employee', 'name email')
      .populate('task', 'title date startTime endTime');
    
    const totalHours = applications.reduce((total, app) => {
      if (app.hoursWorked) {
        return total + app.hoursWorked;
      }
      return total;
    }, 0);
    
    const report = {
      totalApplications: applications.length,
      totalHours,
      averageHours: applications.length > 0 ? totalHours / applications.length : 0,
      applications: applications.map(app => ({
        employee: app.employee.name,
        task: app.task.title,
        date: app.task.date,
        hours: app.hoursWorked || 0
      }))
    };
    
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task completion report
// @route   GET /api/reports/task-completion
// @access  Private/Admin
exports.getTaskCompletionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {
      organization: req.user.organization
    };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const tasks = await Task.find(query)
      .populate('jobDescription', 'name')
      .populate('branch', 'name');
    
    const completed = tasks.filter(t => t.status === 'completed').length;
    const open = tasks.filter(t => t.status === 'open').length;
    const filled = tasks.filter(t => t.status === 'filled').length;
    const cancelled = tasks.filter(t => t.status === 'cancelled').length;
    
    const report = {
      totalTasks: tasks.length,
      completed,
      open,
      filled,
      cancelled,
      completionRate: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
      tasks
    };
    
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export report
// @route   POST /api/reports/export
// @access  Private/Admin
exports.exportReport = async (req, res) => {
  try {
    const { type, format, filters } = req.body;
    
    // Generate report based on type
    let reportData;
    switch (type) {
      case 'attendance':
        reportData = await exports.getAttendanceReportData(req.user, filters);
        break;
      case 'hours':
        reportData = await exports.getHoursReportData(req.user, filters);
        break;
      case 'task-completion':
        reportData = await exports.getTaskCompletionReportData(req.user, filters);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    // Format for export
    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.csv`);
      return res.send(csv);
    } else if (format === 'excel') {
      // For Excel, we'll send JSON and let frontend handle conversion
      res.setHeader('Content-Type', 'application/json');
      return res.json(reportData);
    } else {
      return res.json(reportData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to convert to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}