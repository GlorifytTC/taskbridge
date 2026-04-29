const express = require('express');
const router = express.Router();
const { trialGuard } = require('../middleware/trialGuard');
const { protect, authorize } = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// All routes require authentication
router.use(protect);
router.post('/', protect, trialGuard, createTask);
router.put('/:id', protect, trialGuard, updateTask);
router.delete('/:id', protect, trialGuard, deleteTask);
// Routes
router.route('/')
  .get(getTasks)
  .post(authorize('admin', 'superadmin'), createTask);

router.route('/:id')
  .get(getTask)
  .put(authorize('admin', 'superadmin'), updateTask)
  .delete(authorize('admin', 'superadmin'), deleteTask);

module.exports = router;