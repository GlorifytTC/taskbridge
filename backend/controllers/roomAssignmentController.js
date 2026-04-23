const Room = require('../models/Room');
const Worker = require('../models/Worker');
const Group = require('../models/Group');
const Assignment = require('../models/Assignment');
const Shift = require('../models/Shift');
const AuditLog = require('../models/AuditLog');

// ============ SHIFTS MANAGEMENT ============

// @desc    Get all shifts
// @route   GET /api/room-assignment/shifts
// @access  Private/SuperAdmin
exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ organization: req.user.organization })
      .sort({ startTime: 1 });
    
    res.json({ success: true, data: shifts });
  } catch (error) {
    console.error('Error getting shifts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create/Update shift
// @route   POST /api/room-assignment/shifts
// @access  Private/SuperAdmin
exports.saveShift = async (req, res) => {
  try {
    const { _id, name, startTime, endTime, color, isActive } = req.body;
    
    let shift;
    if (_id) {
      shift = await Shift.findOneAndUpdate(
        { _id, organization: req.user.organization },
        { name, startTime, endTime, color, isActive },
        { new: true }
      );
    } else {
      shift = await Shift.create({
        name,
        startTime,
        endTime,
        color: color || '#00d1ff',
        isActive: isActive !== false,
        organization: req.user.organization,
        createdBy: req.user.id
      });
    }
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: _id ? 'update' : 'create',
      entityType: 'shift',
      entityId: shift._id,
      changes: { name, startTime, endTime },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true, data: shift });
  } catch (error) {
    console.error('Error saving shift:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete shift
// @route   DELETE /api/room-assignment/shifts/:id
// @access  Private/SuperAdmin
exports.deleteShift = async (req, res) => {
  try {
    await Shift.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    res.json({ success: true, message: 'Shift deleted' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ROOMS MANAGEMENT ============

// @desc    Get all rooms
// @route   GET /api/room-assignment/rooms
// @access  Private/SuperAdmin
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ organization: req.user.organization })
      .sort({ roomNumber: 1 });
    
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Error getting rooms:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk create rooms
// @route   POST /api/room-assignment/rooms/bulk
// @access  Private/SuperAdmin
exports.bulkCreateRooms = async (req, res) => {
  try {
    const { startNumber, endNumber, prefix, capacity, roomType } = req.body;
    
    // ✅ ADD THIS VALIDATION
    if (!startNumber || !endNumber) {
      return res.status(400).json({ success: false, message: 'Start and end numbers are required' });
    }
    
    if (startNumber > endNumber) {
      return res.status(400).json({ success: false, message: 'Start number must be less than end number' });
    }
    
    const rooms = [];
    for (let i = startNumber; i <= endNumber; i++) {
      rooms.push({
        roomNumber: `${prefix || ''}${i}`,
        name: `${roomType || 'Room'} ${i}`,
        capacity: capacity || 30,
        roomType: roomType || 'Standard',
        organization: req.user.organization,
        createdBy: req.user.id
      });
    }
    
    const createdRooms = await Room.insertMany(rooms);
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'bulk_create',
      entityType: 'room',
      changes: { count: createdRooms.length, startNumber, endNumber },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true, data: createdRooms, count: createdRooms.length });
  } catch (error) {
    console.error('Error bulk creating rooms:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update room (bulk or single)
// @route   PUT /api/room-assignment/rooms
// @access  Private/SuperAdmin
exports.updateRooms = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, roomNumber, name, capacity, roomType, isActive }
    
    const updatedRooms = [];
    for (const update of updates) {
      const room = await Room.findOneAndUpdate(
        { _id: update.id, organization: req.user.organization },
        {
          roomNumber: update.roomNumber,
          name: update.name,
          capacity: update.capacity,
          roomType: update.roomType,
          isActive: update.isActive !== false
        },
        { new: true }
      );
      if (room) updatedRooms.push(room);
    }
    
    res.json({ success: true, data: updatedRooms });
  } catch (error) {
    console.error('Error updating rooms:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete rooms (bulk)
// @route   DELETE /api/room-assignment/rooms
// @access  Private/SuperAdmin
exports.deleteRooms = async (req, res) => {
  try {
    const { ids } = req.body;
    await Room.deleteMany({ _id: { $in: ids }, organization: req.user.organization });
    res.json({ success: true, message: `${ids.length} rooms deleted` });
  } catch (error) {
    console.error('Error deleting rooms:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ WORKERS MANAGEMENT ============

// @desc    Get all workers
// @route   GET /api/room-assignment/workers
// @access  Private/SuperAdmin
exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({ organization: req.user.organization })
      .sort({ name: 1 });
    
    res.json({ success: true, data: workers });
  } catch (error) {
    console.error('Error getting workers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk create workers
// @route   POST /api/room-assignment/workers/bulk
// @access  Private/SuperAdmin
exports.bulkCreateWorkers = async (req, res) => {
  try {
    const { names, defaultSpecialization, defaultType } = req.body;
    
    // ✅ ADD THIS VALIDATION
    if (!names) {
      return res.status(400).json({ success: false, message: 'Names are required' });
    }
    
    const workers = names.split(',').map(name => ({
      name: name.trim(),
      specializations: [defaultSpecialization || 'General'],
      workerType: defaultType || 'Regular',
      organization: req.user.organization,
      createdBy: req.user.id
    }));
    
    const createdWorkers = await Worker.insertMany(workers);
    
    res.json({ success: true, data: createdWorkers, count: createdWorkers.length });
  } catch (error) {
    console.error('Error bulk creating workers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update workers (bulk)
// @route   PUT /api/room-assignment/workers
// @access  Private/SuperAdmin
exports.updateWorkers = async (req, res) => {
  try {
    const { updates } = req.body;
    
    const updatedWorkers = [];
    for (const update of updates) {
      const worker = await Worker.findOneAndUpdate(
        { _id: update.id, organization: req.user.organization },
        {
          name: update.name,
          specializations: update.specializations,
          workerType: update.workerType,
          isAvailable: update.isAvailable,
          shiftIds: update.shiftIds
        },
        { new: true }
      );
      if (worker) updatedWorkers.push(worker);
    }
    
    res.json({ success: true, data: updatedWorkers });
  } catch (error) {
    console.error('Error updating workers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete workers (bulk)
// @route   DELETE /api/room-assignment/workers
// @access  Private/SuperAdmin
exports.deleteWorkers = async (req, res) => {
  try {
    const { ids } = req.body;
    await Worker.deleteMany({ _id: { $in: ids }, organization: req.user.organization });
    res.json({ success: true, message: `${ids.length} workers deleted` });
  } catch (error) {
    console.error('Error deleting workers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ GROUPS MANAGEMENT ============

// @desc    Get all groups
// @route   GET /api/room-assignment/groups
// @access  Private/SuperAdmin
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ organization: req.user.organization })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Error getting groups:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create group
// @route   POST /api/room-assignment/groups
// @access  Private/SuperAdmin
exports.createGroup = async (req, res) => {
  try {
    const { name, peopleCount, requiredSkill, priority, shiftId, notes } = req.body;
    
    const group = await Group.create({
      name,
      peopleCount: peopleCount || 1,
      requiredSkill,
      priority: priority || 'Normal',
      shiftId,
      notes,
      organization: req.user.organization,
      createdBy: req.user.id
    });
    
    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk create groups
// @route   POST /api/room-assignment/groups/bulk
// @access  Private/SuperAdmin
exports.bulkCreateGroups = async (req, res) => {
  try {
    const { groups } = req.body;
    
    if (!groups || !Array.isArray(groups) || groups.length === 0) {
      return res.status(400).json({ success: false, message: 'Groups array is required' });
    }
    
    const createdGroups = await Group.insertMany(
      groups.map(g => ({
        ...g,
        organization: req.user.organization,
        createdBy: req.user.id
      }))
    );
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'bulk_create',
      entityType: 'group',
      changes: { count: createdGroups.length },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true, data: createdGroups, count: createdGroups.length });
  } catch (error) {
    console.error('Error bulk creating groups:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update groups (bulk)
// @route   PUT /api/room-assignment/groups
// @access  Private/SuperAdmin
exports.updateGroups = async (req, res) => {
  try {
    const { updates } = req.body;
    
    const updatedGroups = [];
    for (const update of updates) {
      const group = await Group.findOneAndUpdate(
        { _id: update.id, organization: req.user.organization },
        update,
        { new: true }
      );
      if (group) updatedGroups.push(group);
    }
    
    res.json({ success: true, data: updatedGroups });
  } catch (error) {
    console.error('Error updating groups:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete groups (bulk)
// @route   DELETE /api/room-assignment/groups
// @access  Private/SuperAdmin
exports.deleteGroups = async (req, res) => {
  try {
    const { ids } = req.body;
    await Group.deleteMany({ _id: { $in: ids }, organization: req.user.organization });
    res.json({ success: true, message: `${ids.length} groups deleted` });
  } catch (error) {
    console.error('Error deleting groups:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ SORTING ENGINE ============

// @desc    Run sorting algorithm
// @route   POST /api/room-assignment/sort
// @access  Private/SuperAdmin
exports.runSorting = async (req, res) => {
  try {
    const { shiftId, date } = req.body;
    
    // Get all data
    const rooms = await Room.find({ 
      organization: req.user.organization,
      isActive: true 
    });
    
    const workers = await Worker.find({ 
      organization: req.user.organization,
      isAvailable: true 
    });
    
    const groups = await Group.find({ 
      organization: req.user.organization,
      status: 'pending'
    });
    
    // Filter by shift if provided
    let availableWorkers = workers;
    let availableRooms = rooms;
    
    if (shiftId) {
      availableWorkers = workers.filter(w => w.shiftIds?.includes(shiftId));
      // Rooms are always available unless specifically filtered
    }
    
    // Sorting algorithm - match groups to best room and worker
    const assignments = [];
    const usedRooms = new Set();
    const usedWorkers = new Set();
    
    // Sort groups by priority (Urgent > High > Normal > Low)
    const priorityOrder = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
    const sortedGroups = [...groups].sort((a, b) => 
      (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
    );
    
    for (const group of sortedGroups) {
      let bestMatch = null;
      let bestScore = 0;
      
      // Find best room
      for (const room of availableRooms) {
        if (usedRooms.has(room._id.toString())) continue;
        
        let roomScore = 0;
        
        // Capacity match (40% of score)
        if (room.capacity >= group.peopleCount) {
          roomScore += 40;
          // Bonus for exact capacity
          if (room.capacity === group.peopleCount) roomScore += 10;
        } else {
          roomScore += (room.capacity / group.peopleCount) * 20;
        }
        
        // Room type match (20% of score)
        if (group.preferredRoomType && group.preferredRoomType === room.roomType) {
          roomScore += 20;
        }
        
        if (roomScore > (bestMatch?.roomScore || 0)) {
          bestMatch = { ...bestMatch, room, roomScore };
        }
      }
      
      // Find best worker
      for (const worker of availableWorkers) {
        if (usedWorkers.has(worker._id.toString())) continue;
        
        let workerScore = 0;
        
        // Skill match (40% of score)
        if (group.requiredSkill) {
          if (worker.specializations.includes(group.requiredSkill)) {
            workerScore += 40;
          } else if (worker.specializations.includes('General')) {
            workerScore += 20;
          }
        } else {
          workerScore += 40; // No skill required
        }
        
        // Worker type bonus (10% of score)
        if (worker.workerType === 'Regular') {
          workerScore += 10;
        }
        
        if (workerScore > (bestMatch?.workerScore || 0)) {
          bestMatch = { ...bestMatch, worker, workerScore };
        }
      }
      
      const totalScore = (bestMatch?.roomScore || 0) + (bestMatch?.workerScore || 0);
      
      assignments.push({
        groupId: group._id,
        groupName: group.name,
        peopleCount: group.peopleCount,
        requiredSkill: group.requiredSkill,
        roomId: bestMatch?.room?._id,
        roomName: bestMatch?.room?.name,
        roomNumber: bestMatch?.room?.roomNumber,
        roomCapacity: bestMatch?.room?.capacity,
        workerId: bestMatch?.worker?._id,
        workerName: bestMatch?.worker?.name,
        workerSpecializations: bestMatch?.worker?.specializations,
        matchScore: totalScore,
        warnings: []
      });
      
      if (bestMatch?.room) usedRooms.add(bestMatch.room._id.toString());
      if (bestMatch?.worker) usedWorkers.add(bestMatch.worker._id.toString());
    }
    
    // Add warnings for assignments with issues
    for (const assignment of assignments) {
      if (assignment.roomCapacity < assignment.peopleCount) {
        assignment.warnings.push(`Capacity exceeded: ${assignment.peopleCount} people need room with capacity ${assignment.roomCapacity}`);
      }
      if (assignment.requiredSkill && !assignment.workerSpecializations?.includes(assignment.requiredSkill)) {
        assignment.warnings.push(`Wrong specialist: Needs ${assignment.requiredSkill}, but assigned ${assignment.workerSpecializations?.join(', ') || 'none'}`);
      }
      if (assignment.matchScore < 50) {
        assignment.warnings.push(`Poor match (${assignment.matchScore}%). Consider manual reassignment.`);
      }
    }
    
    res.json({ 
      success: true, 
      data: assignments,
      summary: {
        totalGroups: groups.length,
        matchedGroups: assignments.filter(a => a.matchScore >= 50).length,
        partialMatches: assignments.filter(a => a.matchScore >= 30 && a.matchScore < 50).length,
        unmatched: assignments.filter(a => a.matchScore < 30).length
      }
    });
    
  } catch (error) {
    console.error('Error running sorting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save confirmed assignments
// @route   POST /api/room-assignment/confirm
// @access  Private/SuperAdmin
exports.confirmAssignments = async (req, res) => {
  try {
    const { assignments, date, shiftId } = req.body;
    
    const savedAssignments = [];
    for (const assignment of assignments) {
      const saved = await Assignment.create({
        groupId: assignment.groupId,
        roomId: assignment.roomId,
        workerId: assignment.workerId,
        date: date || new Date(),
        shiftId: shiftId,
        organization: req.user.organization,
        createdBy: req.user.id,
        matchScore: assignment.matchScore,
        warnings: assignment.warnings
      });
      savedAssignments.push(saved);
      
      // Update group status
      await Group.findByIdAndUpdate(assignment.groupId, { status: 'assigned' });
    }
    
    await AuditLog.create({
      user: req.user.id,
      organization: req.user.organization,
      action: 'confirm_assignments',
      entityType: 'assignment',
      changes: { count: savedAssignments.length, date, shiftId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true, data: savedAssignments });
  } catch (error) {
    console.error('Error confirming assignments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get assignments for map view
// @route   GET /api/room-assignment/map
// @access  Private/SuperAdmin
exports.getMapView = async (req, res) => {
  try {
    const { date, shiftId } = req.query;
    
    const query = { organization: req.user.organization };
    if (date) query.date = new Date(date);
    if (shiftId) query.shiftId = shiftId;
    
    const assignments = await Assignment.find(query)
      .populate('groupId', 'name peopleCount requiredSkill priority')
      .populate('roomId', 'name roomNumber capacity roomType')
      .populate('workerId', 'name specializations workerType');
    
    // Group by room for map view
    const mapData = assignments.map(a => ({
      room: a.roomId,
      worker: a.workerId,
      group: a.groupId,
      matchScore: a.matchScore,
      warnings: a.warnings,
      status: a.matchScore >= 70 ? 'good' : a.matchScore >= 40 ? 'warning' : 'critical'
    }));
    
    res.json({ success: true, data: mapData });
  } catch (error) {
    console.error('Error getting map view:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};