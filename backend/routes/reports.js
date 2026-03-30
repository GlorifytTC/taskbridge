const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAttendanceReport,
  getHoursReport,
  getTaskCompletionReport,
  exportReport
} = require('../controllers/reportController');

// All routes require authentication
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/attendance', getAttendanceReport);
router.get('/hours', getHoursReport);
router.get('/task-completion', getTaskCompletionReport);
router.post('/export', exportReport);

module.exports = router;