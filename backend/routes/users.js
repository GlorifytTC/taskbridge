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

router.use(protect);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(authorize('admin', 'superadmin', 'master'), updateUser)
  .delete(authorize('admin', 'superadmin', 'master'), deleteUser);

router.put('/:id/reset-password', authorize('admin', 'superadmin', 'master'), resetUserPassword);
router.post('/transfer-ownership', authorize('superadmin'), transferOwnership);

module.exports = router;