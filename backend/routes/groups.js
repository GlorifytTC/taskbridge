const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

// Get all groups
router.get('/', protect, async (req, res) => {
  try {
    const groups = await Group.find({ organization: req.user.organization })
      .populate('assignedRoom')
      .populate('assignedWorker');
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create group
router.post('/', protect, async (req, res) => {
  try {
    const group = await Group.create({ ...req.body, organization: req.user.organization });
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk create groups
router.post('/bulk', protect, async (req, res) => {
  try {
    const groups = req.body.groups.map(g => ({ ...g, organization: req.user.organization }));
    await Group.insertMany(groups);
    res.json({ success: true, message: `${groups.length} groups created` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update group
router.put('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      req.body,
      { new: true }
    );
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete group
router.delete('/:id', protect, async (req, res) => {
  try {
    await Group.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;