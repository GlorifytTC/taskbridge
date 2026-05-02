const express = require('express');
const router = express.Router();
const { getEmailQuotaStatus } = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');
const {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  pauseOrganization,
  resumeOrganization,
  extendSubscription,
  changePlan,  
  getOrganizationUsers,
  createOrganizationUser
} = require('../controllers/organizationController');

// All routes require authentication and master role
router.use(protect);
router.use(authorize('master'));
router.get('/email-quota', protect, getEmailQuotaStatus);
router.put('/:id/cancel-subscription', protect, authorize('master'), cancelSubscription);

// GET and POST for organizations
router.route('/')
  .post(createOrganization)
  .get(getOrganizations);

// IMPORTANT: Specific routes MUST come before the generic :id route
router.get('/:id/users', getOrganizationUsers);
router.post('/:id/users', createOrganizationUser);
router.put('/:id/pause', pauseOrganization);
router.put('/:id/resume', resumeOrganization);
router.put('/:id/extend', extendSubscription);
router.put('/:id/plan', changePlan); 

// Generic :id route - MUST BE LAST
router.route('/:id')
  .get(getOrganization)
  .put(updateOrganization)
  .delete(deleteOrganization);

module.exports = router;