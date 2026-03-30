const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  transferOwnership
} = require('../controllers/userController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(authorize('admin', 'superadmin'), updateUser)
  .delete(authorize('admin', 'superadmin'), deleteUser);

router.put('/:id/reset-password', authorize('admin', 'superadmin'), resetUserPassword);
router.post('/transfer-ownership', authorize('superadmin'), transferOwnership);

module.exports = router;