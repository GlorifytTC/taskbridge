const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  // Shifts
  getShifts,
  saveShift,
  deleteShift,
  // Rooms
  getRooms,
  bulkCreateRooms,
  updateRooms,
  deleteRooms,
  // Workers
  getWorkers,
  bulkCreateWorkers,
  updateWorkers,
  deleteWorkers,
  // Groups
  getGroups,
  createGroup,
  bulkCreateGroups,
  updateGroups,
  deleteGroups,
  // Sorting
  runSorting,
  confirmAssignments,
  getMapView
} = require('../controllers/roomAssignmentController');

// ============ SHIFTS ============
router.get('/shifts', protect, authorize('superadmin', 'master'), getShifts);
router.post('/shifts', protect, authorize('superadmin', 'master'), saveShift);
router.delete('/shifts/:id', protect, authorize('superadmin', 'master'), deleteShift);

// ============ ROOMS ============
router.get('/rooms', protect, authorize('superadmin', 'master'), getRooms);
router.post('/rooms/bulk', protect, authorize('superadmin', 'master'), bulkCreateRooms);
router.put('/rooms', protect, authorize('superadmin', 'master'), updateRooms);
router.delete('/rooms', protect, authorize('superadmin', 'master'), deleteRooms);

// ============ WORKERS ============
router.get('/workers', protect, authorize('superadmin', 'master'), getWorkers);
router.post('/workers/bulk', protect, authorize('superadmin', 'master'), bulkCreateWorkers);
router.put('/workers', protect, authorize('superadmin', 'master'), updateWorkers);
router.delete('/workers', protect, authorize('superadmin', 'master'), deleteWorkers);

// ============ GROUPS ============
router.get('/groups', protect, authorize('superadmin', 'master'), getGroups);
router.post('/groups', protect, authorize('superadmin', 'master'), createGroup);
router.post('/groups/bulk', protect, authorize('superadmin', 'master'), bulkCreateGroups);
router.put('/groups', protect, authorize('superadmin', 'master'), updateGroups);
router.delete('/groups', protect, authorize('superadmin', 'master'), deleteGroups);

// ============ SORTING & ASSIGNMENTS ============
router.post('/sort', protect, authorize('superadmin', 'master'), runSorting);
router.post('/confirm', protect, authorize('superadmin', 'master'), confirmAssignments);
router.get('/map', protect, authorize('superadmin', 'master'), getMapView);

module.exports = router;