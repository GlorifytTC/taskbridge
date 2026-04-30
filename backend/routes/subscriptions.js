const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSubscription,
  getPlans,
  changePlan,
  cancelSubscription,
  renewSubscription,
  getInvoices,
  canAddEmployee,
  canAddBranch
} = require('../controllers/subscriptionController');

// All routes require authentication
router.use(protect);

// Public plans (authenticated but any role)
router.get('/plans', getPlans);

// Subscription management
router.route('/')
  .get(getSubscription);

// ✅ PUT for changing plan (needs organization ID)
router.put('/:id/plan', authorize('superadmin', 'master'), changePlan);

// ✅ POST for cancelling (with organization ID)
router.post('/:id/cancel', authorize('superadmin', 'master'), cancelSubscription);

// ✅ POST for renewing (with organization ID)
router.post('/:id/renew', authorize('superadmin', 'master'), renewSubscription);

// Get invoices for current user's organization
router.get('/invoices', getInvoices);

// Limit check endpoints
router.get('/can-add-employee', canAddEmployee);
router.get('/can-add-branch', canAddBranch);

module.exports = router;