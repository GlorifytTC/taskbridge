const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');

// Get all rooms
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ organization: req.user.organization, isActive: true });
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk create rooms
router.post('/bulk', protect, async (req, res) => {
  try {
    const { startNumber, endNumber, prefix, capacity, roomType } = req.body;
    const rooms = [];
    
    for (let i = startNumber; i <= endNumber; i++) {
      rooms.push({
        organization: req.user.organization,
        roomNumber: `${prefix || ''}${i}`,
        capacity: capacity,
        type: roomType || 'Classroom'
      });
    }
    
    await Room.insertMany(rooms);
    res.json({ success: true, message: `${rooms.length} rooms created`, count: rooms.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update room
router.put('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      req.body,
      { new: true }
    );
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk update capacity
router.put('/bulk/capacity', protect, async (req, res) => {
  try {
    const { capacity, roomIds } = req.body;
    await Room.updateMany(
      { _id: { $in: roomIds }, organization: req.user.organization },
      { capacity }
    );
    res.json({ success: true, message: 'Capacities updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete room
router.delete('/:id', protect, async (req, res) => {
  try {
    await Room.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;