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
  deleteAccount
} = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/validate-email', authController.validateEmail);
router.post('/setup-account', authController.setupAccount);
router.get('/me', protect, getMe);
router.post('/register', protect, authorize('admin', 'superadmin'), register);
router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;