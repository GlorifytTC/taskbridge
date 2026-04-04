const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  assignBranch,
  removeBranch,
  transferOwnership
} = require('../controllers/userController');

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log('📢 Users Route - Method:', req.method, 'URL:', req.url);
  console.log('User role:', req.user?.role);
  console.log('User ID:', req.user?.id);
  next();
});

// All routes require authentication
router.use(protect);

router.get('/', getUsers);
router.post('/', authorize('admin', 'superadmin', 'master'), createUser);

router.get('/:id', getUser);
router.put('/:id', authorize('admin', 'superadmin', 'master'), updateUser);
router.delete('/:id', authorize('admin', 'superadmin', 'master'), deleteUser);

router.put('/:id/reset-password', authorize('admin', 'superadmin', 'master'), resetUserPassword);
router.put('/:id/assign-branch', authorize('master', 'superadmin'), assignBranch);
router.put('/:id/remove-branch', authorize('master', 'superadmin'), removeBranch);
router.post('/transfer-ownership', authorize('superadmin'), transferOwnership);

module.exports = router;