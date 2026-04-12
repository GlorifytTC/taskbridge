const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount,
  validateOrganization,
  setupOrganizationAccount,
  verifyResetToken        // ✅ ADD THIS
} = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/validate-organization', validateOrganization);
router.post('/setup-organization-account', setupOrganizationAccount);
router.get('/verify-reset-token/:token', verifyResetToken);  // ✅ Use verifyResetToken directly

// Protected routes
router.get('/me', protect, getMe);
router.post('/register', protect, authorize('admin', 'superadmin'), register);
router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;