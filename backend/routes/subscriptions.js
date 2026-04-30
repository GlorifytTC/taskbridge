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
// Add these routes
router.post('/create-payment-intent', authorize('superadmin', 'master'), createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
// Limit check endpoints
router.get('/can-add-employee', canAddEmployee);
router.get('/can-add-branch', canAddBranch);

module.exports = router;