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
  .get(getSubscription)
  .put(authorize('superadmin', 'master'), changePlan);

router.put('/cancel', authorize('superadmin', 'master'), cancelSubscription);
router.put('/renew', authorize('superadmin', 'master'), renewSubscription);
router.get('/invoices', getInvoices);

// Limit check endpoints
router.get('/can-add-employee', canAddEmployee);
router.get('/can-add-branch', canAddBranch);

module.exports = router;