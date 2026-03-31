const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  pauseOrganization,
  resumeOrganization,
  extendSubscription  // Add this
} = require('../controllers/organizationController');

// All routes require authentication and master role
router.use(protect);
router.use(authorize('master'));

router.route('/')
  .post(createOrganization)
  .get(getOrganizations);

router.route('/:id')
  .get(getOrganization)
  .put(updateOrganization)
  .delete(deleteOrganization);

router.put('/:id/pause', pauseOrganization);
router.put('/:id/resume', resumeOrganization);
router.put('/:id/extend', extendSubscription);  // Add this line

module.exports = router;