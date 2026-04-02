const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  transferOwnership,
  createUser,
  assignBranch,
  removeBranch    
} = require('../controllers/userController');

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(authorize('admin', 'superadmin', 'master'), createUser);

router.route('/:id')
  .get(getUser)
  .put(authorize('admin', 'superadmin', 'master'), updateUser)
  .delete(authorize('admin', 'superadmin', 'master'), deleteUser);

router.put('/:id/reset-password', authorize('admin', 'superadmin', 'master'), resetUserPassword);
router.post('/transfer-ownership', authorize('superadmin'), transferOwnership);
router.put('/:id/assign-branch', authorize('master', 'superadmin'), assignBranch);
router.put('/:id/remove-branch', authorize('master', 'superadmin'), removeBranch);

module.exports = router;