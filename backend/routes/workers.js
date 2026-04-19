const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');

// Get all workers
router.get('/', protect, async (req, res) => {
  try {
    const workers = await Worker.find({ organization: req.user.organization, isActive: true });
    res.json({ success: true, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create worker
router.post('/', protect, async (req, res) => {
  try {
    const worker = await Worker.create({ ...req.body, organization: req.user.organization });
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk create workers
router.post('/bulk', protect, async (req, res) => {
  try {
    const workers = req.body.workers.map(w => ({ ...w, organization: req.user.organization }));
    await Worker.insertMany(workers);
    res.json({ success: true, message: `${workers.length} workers created` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update worker
router.put('/:id', protect, async (req, res) => {
  try {
    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      req.body,
      { new: true }
    );
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk update availability
router.put('/bulk/availability', protect, async (req, res) => {
  try {
    const { workerIds, isAvailable } = req.body;
    await Worker.updateMany(
      { _id: { $in: workerIds }, organization: req.user.organization },
      { isAvailable }
    );
    res.json({ success: true, message: 'Availability updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete worker
router.delete('/:id', protect, async (req, res) => {
  try {
    await Worker.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;