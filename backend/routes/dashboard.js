const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStats,
  getAttendance,
  getTaskStatus
} = require('../controllers/dashboardController');

router.use(protect);

router.get('/stats', getStats);
router.get('/attendance', getAttendance);
router.get('/task-status', getTaskStatus);

module.exports = router;