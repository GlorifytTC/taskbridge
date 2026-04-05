const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBranch,
  getBranches,
  getBranch,
  updateBranch,
  deleteBranch,
  assignAdmin
  checkBranchRelations  
} = require('../controllers/branchController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getBranches)
  .post(authorize('admin', 'superadmin'), createBranch);

router.route('/:id')
  .get(getBranch)
  .put(authorize('admin', 'superadmin'), updateBranch)
  .delete(authorize('admin', 'superadmin'), deleteBranch);

router.post('/:id/assign-admin', authorize('superadmin'), assignAdmin);

module.exports = router;