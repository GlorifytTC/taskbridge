const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  getInvoices
} = require('../controllers/subscriptionController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getSubscription)
  .put(authorize('superadmin'), updateSubscription);

router.put('/cancel', authorize('superadmin'), cancelSubscription);
router.put('/renew', authorize('superadmin'), renewSubscription);
router.get('/invoices', getInvoices);

module.exports = router;