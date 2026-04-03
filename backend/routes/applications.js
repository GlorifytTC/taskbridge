const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  applyForTask,
  getMyApplications,
  getPendingApplications,
  approveApplication,
  rejectApplication
} = require('../controllers/applicationController');

// All routes require authentication
router.use(protect);

// Employee routes
router.post('/apply', authorize('employee'), applyForTask);
router.get('/my-applications', authorize('employee'), getMyApplications);

// Admin routes
router.get('/pending', authorize('admin', 'superadmin'), getPendingApplications);
router.put('/:id/approve', authorize('admin', 'superadmin'), approveApplication);
router.put('/:id/reject', authorize('admin', 'superadmin'), rejectApplication);
router.get('/', protect, authorize('superadmin', 'master'), getAllApplications);
module.exports = router;