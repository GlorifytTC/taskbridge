const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Worker = require('../models/Worker');
const Group = require('../models/Group');
const Assignment = require('../models/Assignment');
const Learning = require('../models/Learning');
const { protect } = require('../middleware/auth');

// Calculate match score between a group, room, and worker
function calculateMatchScore(group, room, worker, learningData) {
  let score = 0;
  let warnings = [];
  
  // 1. Capacity check (40% of score)
  if (room.capacity >= group.peopleCount) {
    score += 40;
  } else {
    warnings.push(`Room ${room.roomNumber} capacity (${room.capacity}) is less than group size (${group.peopleCount})`);
    score += Math.max(0, 40 - ((group.peopleCount - room.capacity) / group.peopleCount) * 40);
  }
  
  // 2. Skill match (40% of score)
  if (worker.specializations.includes(group.requiredSkill)) {
    score += 40;
  } else {
    // Check learning data for alternative skills
    const learnedMatch = learningData.find(l => 
      l.skill === group.requiredSkill && l.worker.toString() === worker._id.toString()
    );
    if (learnedMatch && learnedMatch.successCount > 0) {
      score += 30;
      warnings.push(`Worker ${worker.name} has learned to handle ${group.requiredSkill} (${learnedMatch.successCount} successful assignments)`);
    } else {
      warnings.push(`Worker ${worker.name} doesn't have ${group.requiredSkill} specialization`);
    }
  }
  
  // 3. Room type preference (10% of score)
  if (group.preferredRoomType && room.type === group.preferredRoomType) {
    score += 10;
  }
  
  // 4. Worker type (10% of score)
  if (group.priority === 'urgent' && worker.workerType === 'regular') {
    score += 10;
  } else if (worker.workerType === 'substitute') {
    score += 5;
  }
  
  return { score: Math.round(score), warnings };
}

// Check if room is available at given time
async function isRoomAvailable(roomId, date, groupId) {
  const existingAssignments = await Assignment.find({
    room: roomId,
    date: { $gte: new Date(date).setHours(0, 0, 0), $lte: new Date(date).setHours(23, 59, 59) },
    status: 'confirmed'
  });
  return existingAssignments.length === 0;
}

// Check if worker is available at given time
async function isWorkerAvailable(workerId, date, groupId) {
  const existingAssignments = await Assignment.find({
    worker: workerId,
    date: { $gte: new Date(date).setHours(0, 0, 0), $lte: new Date(date).setHours(23, 59, 59) },
    status: 'confirmed'
  });
  return existingAssignments.length === 0;
}

// Main sorting engine
router.post('/auto-assign', protect, async (req, res) => {
  try {
    const { date = new Date(), groupIds = null } = req.body;
    const organizationId = req.user.organization;
    
    // Get all data
    let groups = groupIds 
      ? await Group.find({ _id: { $in: groupIds }, organization: organizationId, status: 'pending' })
      : await Group.find({ organization: organizationId, status: 'pending' });
    
    const rooms = await Room.find({ organization: organizationId, isActive: true, isAvailable: true });
    const workers = await Worker.find({ organization: organizationId, isActive: true, isAvailable: true });
    const learningData = await Learning.find({ organization: organizationId });
    
    if (groups.length === 0) {
      return res.json({ success: true, message: 'No pending groups to assign', assignments: [] });
    }
    
    const assignments = [];
    const assignedRooms = new Set();
    const assignedWorkers = new Set();
    
    // Sort groups by priority (urgent > high > medium > low) and then by size
    groups.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.peopleCount - a.peopleCount;
    });
    
    for (const group of groups) {
      let bestMatch = null;
      let bestScore = 0;
      let bestRoom = null;
      let bestWorker = null;
      let bestWarnings = [];
      
      // Try each room and worker combination
      for (const room of rooms) {
        // Skip if room already assigned
        if (assignedRooms.has(room._id.toString())) continue;
        
        // Check room availability
        const roomAvailable = await isRoomAvailable(room._id, date, group._id);
        if (!roomAvailable) continue;
        
        for (const worker of workers) {
          // Skip if worker already assigned
          if (assignedWorkers.has(worker._id.toString())) continue;
          
          // Check worker availability
          const workerAvailable = await isWorkerAvailable(worker._id, date, group._id);
          if (!workerAvailable) continue;
          
          // Calculate match score
          const { score, warnings } = calculateMatchScore(group, room, worker, learningData);
          
          if (score > bestScore) {
            bestScore = score;
            bestRoom = room;
            bestWorker = worker;
            bestWarnings = warnings;
          }
        }
      }
      
      // Create assignment if we found a match
      if (bestRoom && bestWorker) {
        const assignment = await Assignment.create({
          organization: organizationId,
          date: date,
          group: group._id,
          room: bestRoom._id,
          worker: bestWorker._id,
          matchScore: bestScore,
          warnings: bestWarnings,
          status: bestScore >= 70 ? 'pending' : 'pending'
        });
        
        assignments.push({
          group: group,
          room: bestRoom,
          worker: bestWorker,
          matchScore: bestScore,
          warnings: bestWarnings,
          assignmentId: assignment._id
        });
        
        assignedRooms.add(bestRoom._id.toString());
        assignedWorkers.add(bestWorker._id.toString());
      } else {
        assignments.push({
          group: group,
          room: null,
          worker: null,
          matchScore: 0,
          warnings: ['No suitable room or worker found'],
          assignmentId: null
        });
      }
    }
    
    res.json({ 
      success: true, 
      assignments,
      summary: {
        totalGroups: groups.length,
        assigned: assignments.filter(a => a.room).length,
        unassigned: assignments.filter(a => !a.room).length
      }
    });
    
  } catch (error) {
    console.error('Sorting error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Confirm assignment (user approved)
router.post('/confirm/:assignmentId', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate('group')
      .populate('room')
      .populate('worker');
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    assignment.status = 'confirmed';
    await assignment.save();
    
    // Update group with assigned room and worker
    await Group.findByIdAndUpdate(assignment.group._id, {
      assignedRoom: assignment.room._id,
      assignedWorker: assignment.worker._id,
      status: 'assigned'
    });
    
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Override assignment (user changed it)
router.post('/override/:assignmentId', protect, async (req, res) => {
  try {
    const { newRoomId, newWorkerId } = req.body;
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate('group')
      .populate('room')
      .populate('worker');
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    // Store original suggestion for learning
    assignment.originalSuggestion = {
      room: assignment.room._id,
      worker: assignment.worker._id,
      matchScore: assignment.matchScore
    };
    
    // Update with new values
    if (newRoomId) assignment.room = newRoomId;
    if (newWorkerId) assignment.worker = newWorkerId;
    assignment.userOverridden = true;
    assignment.status = 'confirmed';
    await assignment.save();
    
    // Update group
    await Group.findByIdAndUpdate(assignment.group._id, {
      assignedRoom: newRoomId || assignment.room._id,
      assignedWorker: newWorkerId || assignment.worker._id,
      status: 'assigned'
    });
    
    // LEARNING SYSTEM: Record the override
    const oldWorker = assignment.originalSuggestion.worker;
    const newWorker = newWorkerId;
    const requiredSkill = assignment.group.requiredSkill;
    
    if (oldWorker && newWorker && oldWorker.toString() !== newWorker.toString()) {
      // User preferred different worker for this skill
      await Learning.findOneAndUpdate(
        { organization: assignment.organization, skill: requiredSkill, worker: newWorker },
        { $inc: { successCount: 1 }, lastUsed: new Date() },
        { upsert: true }
      );
      
      // Decrease confidence in old worker
      await Learning.findOneAndUpdate(
        { organization: assignment.organization, skill: requiredSkill, worker: oldWorker },
        { $inc: { overrideCount: 1 }, lastUsed: new Date() },
        { upsert: true }
      );
    }
    
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get assignments for date
router.get('/assignments', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
    
    const assignments = await Assignment.find({
      organization: req.user.organization,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    })
      .populate('group')
      .populate('room')
      .populate('worker');
    
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate map view
router.get('/map', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
    
    const assignments = await Assignment.find({
      organization: req.user.organization,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    })
      .populate('group')
      .populate('room')
      .populate('worker');
    
    const allRooms = await Room.find({ organization: req.user.organization, isActive: true });
    
    // Create map data
    const mapData = allRooms.map(room => {
      const assignment = assignments.find(a => a.room._id.toString() === room._id.toString());
      
      let status = 'available';
      if (assignment) {
        const isCapacityOk = assignment.group.peopleCount <= room.capacity;
        const isSkillMatch = assignment.worker.specializations.includes(assignment.group.requiredSkill);
        
        if (isCapacityOk && isSkillMatch) status = 'good';
        else if (!isCapacityOk) status = 'capacity-warning';
        else if (!isSkillMatch) status = 'skill-warning';
        else status = 'warning';
      }
      
      return {
        room: {
          _id: room._id,
          roomNumber: room.roomNumber,
          name: room.name,
          capacity: room.capacity,
          type: room.type
        },
        assignment: assignment ? {
          groupName: assignment.group.name,
          peopleCount: assignment.group.peopleCount,
          workerName: assignment.worker.name,
          workerSpecializations: assignment.worker.specializations,
          requiredSkill: assignment.group.requiredSkill,
          matchScore: assignment.matchScore
        } : null,
        status
      };
    });
    
    res.json({ success: true, data: mapData, date: queryDate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;