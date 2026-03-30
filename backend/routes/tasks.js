const express = require('express');
const router = express.Router();
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

// Routes
router.route('/')
  .get(getTasks)
  .post(authorize('admin', 'superadmin'), createTask);

router.route('/:id')
  .get(getTask)
  .put(authorize('admin', 'superadmin'), updateTask)
  .delete(authorize('admin', 'superadmin'), deleteTask);

module.exports = router;