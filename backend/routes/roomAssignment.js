const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getShifts,
  saveShift,
  deleteShift,
  getRooms,
  bulkCreateRooms,
  updateRooms,
  deleteRooms,
  getWorkers,
  bulkCreateWorkers,
  updateWorkers,
  deleteWorkers,
  getGroups,
  createGroup,
  bulkCreateGroups,
  updateGroups,
  deleteGroups,
  runSorting,
  confirmAssignments,
  getMapView
} = require('../controllers/roomAssignmentController');

// Shifts
router.get('/shifts', protect, authorize('superadmin', 'master', 'admin'), getShifts);
router.post('/shifts', protect, authorize('superadmin', 'master', 'admin'), saveShift);
router.delete('/shifts/:id', protect, authorize('superadmin', 'master', 'admin'), deleteShift);

// Rooms
router.get('/rooms', protect, authorize('superadmin', 'master', 'admin'), getRooms);
router.post('/rooms/bulk', protect, authorize('superadmin', 'master', 'admin'), bulkCreateRooms);
router.put('/rooms', protect, authorize('superadmin', 'master', 'admin'), updateRooms);
router.delete('/rooms', protect, authorize('superadmin', 'master', 'admin'), deleteRooms);

// Workers
router.get('/workers', protect, authorize('superadmin', 'master', 'admin'), getWorkers);
router.post('/workers/bulk', protect, authorize('superadmin', 'master', 'admin'), bulkCreateWorkers);
router.put('/workers', protect, authorize('superadmin', 'master', 'admin'), updateWorkers);
router.delete('/workers', protect, authorize('superadmin', 'master', 'admin'), deleteWorkers);

// Groups
router.get('/groups', protect, authorize('superadmin', 'master', 'admin'), getGroups);
router.post('/groups', protect, authorize('superadmin', 'master', 'admin'), createGroup);
router.post('/groups/bulk', protect, authorize('superadmin', 'master', 'admin'), bulkCreateGroups); 
router.put('/groups', protect, authorize('superadmin', 'master', 'admin'), updateGroups);
router.delete('/groups', protect, authorize('superadmin', 'master', 'admin'), deleteGroups);


// Sorting
router.post('/sort', protect, authorize('superadmin', 'master', 'admin'), runSorting);
router.post('/confirm', protect, authorize('superadmin', 'master', 'admin'), confirmAssignments);
router.get('/map', protect, authorize('superadmin', 'master', 'admin'), getMapView);

module.exports = router;