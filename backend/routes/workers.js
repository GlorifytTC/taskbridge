const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');

// ✅ TEST ROUTE - Add this at the very top
router.get('/ping', protect, async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Workers API is working!',
      organization: req.user?.organization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all workers
router.get('/', protect, async (req, res) => {
  try {
    console.log('📋 Fetching workers for organization:', req.user.organization);
    const workers = await Worker.find({ organization: req.user.organization, isActive: true });
    console.log(`✅ Found ${workers.length} workers`);
    res.json({ success: true, data: workers });
  } catch (error) {
    console.error('❌ Error fetching workers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk create workers
router.post('/bulk', protect, async (req, res) => {
  try {
    const { workers } = req.body;
    const workersWithOrg = workers.map(w => ({ ...w, organization: req.user.organization }));
    const created = await Worker.insertMany(workersWithOrg);
    res.json({ success: true, message: `${created.length} workers created`, data: created });
  } catch (error) {
    console.error('Error bulk creating workers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create worker
router.post('/', protect, async (req, res) => {
  try {
    console.log('📝 Creating worker:', req.body.name);
    const worker = await Worker.create({ ...req.body, organization: req.user.organization });
    console.log('✅ Worker created:', worker._id);
    res.json({ success: true, data: worker });
  } catch (error) {
    console.error('❌ Error creating worker:', error);
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
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.json({ success: true, data: worker });
  } catch (error) {
    console.error('Error updating worker:', error);
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
    console.error('Error updating availabilities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete worker
router.delete('/:id', protect, async (req, res) => {
  try {
    const worker = await Worker.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;