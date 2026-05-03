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

// Import from authController
const { cancelSubscription } = require('../controllers/authController');

// ✅ PROTECT ALL ROUTES FIRST
router.use(protect);

// GET and POST for organizations
router.route('/')
  .post(authorize('master'), createOrganization)
  .get(authorize('master', 'superadmin'), getOrganizations);

// ✅ SuperAdmin can change their own organization's plan
router.put('/my/plan', authorize('superadmin'), async (req, res) => {
  try {
    const { plan, duration = 1 } = req.body;
    const organizationId = req.user.organization;
    
    if (!organizationId) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    const organization = await Organization.findById(organizationId);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    req.params.id = organizationId;
    return changePlan(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// IMPORTANT: Specific routes MUST come before the generic :id route
router.get('/:id/users', authorize('master', 'superadmin'), getOrganizationUsers);
router.post('/:id/users', authorize('master'), createOrganizationUser);
router.put('/:id/pause', authorize('master'), pauseOrganization);
router.put('/:id/resume', authorize('master'), resumeOrganization);
router.put('/:id/extend', authorize('master'), extendSubscription);
router.put('/:id/plan', authorize('master', 'superadmin'), changePlan);

// ✅ ADD CANCEL SUBSCRIPTION ROUTE
router.put('/:id/cancel-subscription', authorize('master', 'superadmin'), cancelSubscription);

// Generic :id route - MUST BE LAST
router.route('/:id')
  .get(authorize('master', 'superadmin'), getOrganization)
  .put(authorize('master'), updateOrganization)
  .delete(authorize('master'), deleteOrganization);

module.exports = router;