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
  setupOrganizationAccount        
} = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/validate-organization', validateOrganization);
router.post('/setup-organization-account', setupOrganizationAccount);
         

// Protected routes
router.get('/me', protect, getMe);
router.post('/register', protect, authorize('admin', 'superadmin'), register);
router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);
router.post('/forgot-password', forgotPassword);

module.exports = router;