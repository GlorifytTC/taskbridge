const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createJobDescription,
  getJobDescriptions,
  getJobDescription,
  updateJobDescription,
  deleteJobDescription
} = require('../controllers/jobDescriptionController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getJobDescriptions)
  .post(authorize('admin', 'superadmin'), createJobDescription);

router.route('/:id')
  .get(getJobDescription)
  .put(authorize('admin', 'superadmin'), updateJobDescription)
  .delete(authorize('admin', 'superadmin'), deleteJobDescription);

module.exports = router;