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
  validateEmail,
  setupAccount       
} = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/validate-email', validateEmail);       
router.post('/setup-account', setupAccount);         

// Protected routes
router.get('/me', protect, getMe);
router.post('/register', protect, authorize('admin', 'superadmin'), register);
router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;