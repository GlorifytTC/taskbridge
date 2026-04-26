import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomAssignment = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('roomAssignmentTab') || 'rooms';
  });
  const [rooms, setRooms] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkRoomData, setBulkRoomData] = useState({ startNumber: 1, endNumber: 10, capacity: 30, roomType: 'Classroom', prefix: '' });
  const [bulkWorkerData, setBulkWorkerData] = useState({ names: '', defaultSpecialization: 'General' });
  const [sortingResults, setSortingResults] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [newShift, setNewShift] = useState({ name: '', startTime: '08:00', endTime: '17:00', color: '#00d1ff' });
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Sorting states
  const [roomSortField, setRoomSortField] = useState('roomNumber');
  const [roomSortDirection, setRoomSortDirection] = useState('asc');
  const [workerSortField, setWorkerSortField] = useState('name');
  const [workerSortDirection, setWorkerSortDirection] = useState('asc');
  const [groupSortField, setGroupSortField] = useState('name');
  const [groupSortDirection, setGroupSortDirection] = useState('asc');

  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('roomAssignmentTab', activeTab);
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch all data
  const fetchRooms = async () => {
    try {
      const res = await api.get('/room-assignment/rooms');
      setRooms(res.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      showToast('Failed to load rooms', 'error');
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/room-assignment/workers');
      setWorkers(res.data.data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      showToast('Failed to load workers', 'error');
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/room-assignment/groups');
      setGroups(res.data.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      showToast('Failed to load groups', 'error');
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await api.get('/room-assignment/shifts');
      setShifts(res.data.data || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      showToast('Failed to load shifts', 'error');
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchWorkers();
    fetchGroups();
    fetchShifts();
  }, []);

  // Toggle room availability
  const toggleRoomAvailability = async (roomId, currentStatus) => {
    setLoading(true);
    try {
      const room = rooms.find(r => r._id === roomId);
      const updatedRoom = { ...room, isActive: !currentStatus };
      await api.put('/room-assignment/rooms', { updates: [updatedRoom] });
      await fetchRooms();
      showToast(`Room ${room.roomNumber} is now ${!currentStatus ? 'Available' : 'Unavailable'}`, 'success');
    } catch (error) {
      console.error('Error toggling room availability:', error);
      showToast('Failed to update room status', 'error');
    }
    setLoading(false);
  };

  // Bulk toggle room availability
  const bulkToggleRoomAvailability = async () => {
    if (selectedRows.size === 0) {
      showToast('No rooms selected', 'error');
      return;
    }
    
    const selectedRooms = rooms.filter(r => selectedRows.has(r._id));
    const makeAvailable = selectedRooms.some(r => !r.isActive);
    
    setLoading(true);
    try {
      const updates = selectedRooms.map(room => ({
        id: room._id,
        ...room,
        isActive: makeAvailable
      }));
      await api.put('/room-assignment/rooms', { updates });
      await fetchRooms();
      setSelectedRows(new Set());
      showToast(`${selectedRows.size} rooms marked as ${makeAvailable ? 'Available' : 'Unavailable'}`, 'success');
    } catch (error) {
      console.error('Error bulk updating rooms:', error);
      showToast('Failed to update rooms', 'error');
    }
    setLoading(false);
  };

  // Sorting functions
  const sortRooms = (field) => {
    const direction = roomSortField === field && roomSortDirection === 'asc' ? 'desc' : 'asc';
    setRoomSortField(field);
    setRoomSortDirection(direction);
    
    const sorted = [...rooms].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      if (field === 'capacity') {
        aVal = parseInt(aVal) || 0;
        bVal = parseInt(bVal) || 0;
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setRooms(sorted);
  };

  const sortWorkers = (field) => {
    const direction = workerSortField === field && workerSortDirection === 'asc' ? 'desc' : 'asc';
    setWorkerSortField(field);
    setWorkerSortDirection(direction);
    
    const sorted = [...workers].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      if (field === 'specializations') {
        aVal = a.specializations?.join(',') || '';
        bVal = b.specializations?.join(',') || '';
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setWorkers(sorted);
  };

  const sortGroups = (field) => {
    const direction = groupSortField === field && groupSortDirection === 'asc' ? 'desc' : 'asc';
    setGroupSortField(field);
    setGroupSortDirection(direction);
    
    const sorted = [...groups].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      if (field === 'peopleCount') {
        aVal = parseInt(aVal) || 0;
        bVal = parseInt(bVal) || 0;
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setGroups(sorted);
  };

  const getSortIcon = (field, currentField, currentDirection) => {
    if (field !== currentField) return '↕️';
    return currentDirection === 'asc' ? '↑' : '↓';
  };

  // ============ SHIFT FUNCTIONS ============
  const handleSaveShift = async () => {
    if (!newShift.name) {
      showToast('Please enter shift name', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/room-assignment/shifts', newShift);
      await fetchShifts();
      setShowShiftModal(false);
      setNewShift({ name: '', startTime: '08:00', endTime: '17:00', color: '#00d1ff' });
      showToast('Shift saved successfully', 'success');
    } catch (error) {
      console.error('Error saving shift:', error);
      showToast(error.response?.data?.message || 'Failed to save shift', 'error');
    }
    setLoading(false);
  };

  const handleDeleteShift = async (shiftId) => {
    if (!window.confirm('Delete this shift? It will be removed from all workers.')) return;
    setLoading(true);
    try {
      await api.delete(`/room-assignment/shifts/${shiftId}`);
      await fetchShifts();
      showToast('Shift deleted', 'success');
    } catch (error) {
      console.error('Error deleting shift:', error);
      showToast('Failed to delete shift', 'error');
    }
    setLoading(false);
  };

  // ============ ROOM FUNCTIONS ============
  const handleBulkCreateRooms = async () => {
    if (bulkRoomData.startNumber > bulkRoomData.endNumber) {
      showToast('Start number must be less than end number', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/room-assignment/rooms/bulk', bulkRoomData);
      await fetchRooms();
      setBulkMode(false);
      setBulkRoomData({ startNumber: 1, endNumber: 10, capacity: 30, roomType: 'Classroom', prefix: '' });
      showToast(`Created rooms ${bulkRoomData.startNumber} to ${bulkRoomData.endNumber}`, 'success');
    } catch (error) {
      console.error('Error creating rooms:', error);
      showToast(error.response?.data?.message || 'Failed to create rooms', 'error');
    }
    setLoading(false);
  };

  const handleUpdateRoom = async (roomId, field, value) => {
    const room = rooms.find(r => r._id === roomId);
    const updatedRoom = { ...room, [field]: value };
    
    try {
      await api.put('/room-assignment/rooms', { updates: [updatedRoom] });
      setRooms(rooms.map(r => r._id === roomId ? updatedRoom : r));
      setEditingCell(null);
      showToast('Room updated', 'success');
    } catch (error) {
      console.error('Error updating room:', error);
      showToast('Failed to update room', 'error');
    }
  };

  const handleDeleteRooms = async () => {
    if (selectedRows.size === 0) {
      showToast('No rooms selected', 'error');
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.size} room(s)? This cannot be undone.`)) return;
    
    setLoading(true);
    try {
      await api.delete('/room-assignment/rooms', { data: { ids: Array.from(selectedRows) } });
      await fetchRooms();
      setSelectedRows(new Set());
      showToast(`${selectedRows.size} rooms deleted`, 'success');
    } catch (error) {
      console.error('Error deleting rooms:', error);
      showToast('Failed to delete rooms', 'error');
    }
    setLoading(false);
  };

  // ============ WORKER FUNCTIONS ============
  const handleBulkCreateWorkers = async () => {
    if (!bulkWorkerData.names) {
      showToast('Enter worker names separated by commas', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/room-assignment/workers/bulk', bulkWorkerData);
      await fetchWorkers();
      setBulkMode(false);
      setBulkWorkerData({ names: '', defaultSpecialization: 'General' });
      showToast('Workers added successfully', 'success');
    } catch (error) {
      console.error('Error creating workers:', error);
      showToast(error.response?.data?.message || 'Failed to create workers', 'error');
    }
    setLoading(false);
  };

  const handleUpdateWorker = async (workerId, field, value) => {
    const worker = workers.find(w => w._id === workerId);
    let updatedWorker = { ...worker, [field]: value };
    
    if (field === 'specializations' && typeof value === 'string') {
      updatedWorker.specializations = value.split(',').map(s => s.trim());
    }
    if (field === 'shiftIds' && value) {
      updatedWorker.shiftIds = [value];
    }
    
    try {
      await api.put('/room-assignment/workers', { updates: [updatedWorker] });
      setWorkers(workers.map(w => w._id === workerId ? updatedWorker : w));
      setEditingCell(null);
      showToast('Worker updated', 'success');
    } catch (error) {
      console.error('Error updating worker:', error);
      showToast('Failed to update worker', 'error');
    }
  };

  const handleDeleteWorkers = async () => {
    if (selectedRows.size === 0) {
      showToast('No workers selected', 'error');
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.size} worker(s)? This cannot be undone.`)) return;
    
    setLoading(true);
    try {
      await api.delete('/room-assignment/workers', { data: { ids: Array.from(selectedRows) } });
      await fetchWorkers();
      setSelectedRows(new Set());
      showToast(`${selectedRows.size} workers deleted`, 'success');
    } catch (error) {
      console.error('Error deleting workers:', error);
      showToast('Failed to delete workers', 'error');
    }
    setLoading(false);
  };

  // ============ GROUP FUNCTIONS ============
  const handleQuickAddGroup = async () => {
    const name = prompt('Group name:', 'New Group');
    if (!name) return;
    const peopleCount = parseInt(prompt('Number of people:', '25')) || 25;
    const requiredSkill = prompt('Required skill (e.g., Math, Science, General):', 'General');
    const priority = prompt('Priority (Urgent/High/Normal/Low):', 'Normal');
    
    setLoading(true);
    try {
      await api.post('/room-assignment/groups', {
        name,
        peopleCount,
        requiredSkill: requiredSkill || 'General',
        priority: priority || 'Normal',
        shiftId: selectedShift || null
      });
      await fetchGroups();
      showToast(`Group "${name}" added`, 'success');
    } catch (error) {
      console.error('Error adding group:', error);
      showToast('Failed to add group', 'error');
    }
    setLoading(false);
  };

  const handleUpdateGroup = async (groupId, field, value) => {
    const group = groups.find(g => g._id === groupId);
    const updatedGroup = { ...group, [field]: value };
    
    try {
      await api.put('/room-assignment/groups', { updates: [updatedGroup] });
      setGroups(groups.map(g => g._id === groupId ? updatedGroup : g));
      setEditingCell(null);
      showToast('Group updated', 'success');
    } catch (error) {
      console.error('Error updating group:', error);
      showToast('Failed to update group', 'error');
    }
  };

  const handleDeleteGroups = async () => {
    if (selectedRows.size === 0) {
      showToast('No groups selected', 'error');
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.size} group(s)? This cannot be undone.`)) return;
    
    setLoading(true);
    try {
      await api.delete('/room-assignment/groups', { data: { ids: Array.from(selectedRows) } });
      await fetchGroups();
      setSelectedRows(new Set());
      showToast(`${selectedRows.size} groups deleted`, 'success');
    } catch (error) {
      console.error('Error deleting groups:', error);
      showToast('Failed to delete groups', 'error');
    }
    setLoading(false);
  };

  // ============ IMPROVED SORTING ALGORITHM ============
  const handleRunSorting = async () => {
    setLoading(true);
    try {
      // Get all data
      let availableRooms = rooms.filter(room => room.isActive === true);
      let availableWorkers = workers.filter(worker => worker.isAvailable === true);
      let pendingGroups = groups.filter(group => group.status !== 'assigned');
      
      // Filter by selected shift
      if (selectedShift) {
        availableWorkers = availableWorkers.filter(w => w.shiftIds?.includes(selectedShift));
        // Rooms don't have shifts, so they're always available
      }
      
      const newAssignments = [];
      const usedRooms = new Set();
      const usedWorkers = new Set();
      
      // Sort groups by priority (Urgent > High > Normal > Low)
      const priorityOrder = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
      const sortedGroups = [...pendingGroups].sort((a, b) => 
        (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
      );
      
      for (const group of sortedGroups) {
        let bestRoom = null;
        let bestWorker = null;
        let bestRoomScore = 0;
        let bestWorkerScore = 0;
        
        // Find best matching room
        for (const room of availableRooms) {
          if (usedRooms.has(room._id)) continue;
          
          let roomScore = 0;
          
          // Capacity check (50% of score)
          if (room.capacity >= group.peopleCount) {
            roomScore += 50;
            // Bonus for exact capacity (10%)
            if (room.capacity === group.peopleCount) {
              roomScore += 10;
            }
          } else {
            // Penalty for insufficient capacity (scaled)
            roomScore += Math.max(0, (room.capacity / group.peopleCount) * 30);
          }
          
          // Room type match (20% of score)
          if (group.preferredRoomType && group.preferredRoomType === room.roomType) {
            roomScore += 20;
          }
          
          // Check if this room has been successful with similar groups (10%)
          // This is where learning data could be added
          
          if (roomScore > bestRoomScore) {
            bestRoomScore = roomScore;
            bestRoom = room;
          }
        }
        
        // Find best matching worker
        for (const worker of availableWorkers) {
          if (usedWorkers.has(worker._id)) continue;
          
          let workerScore = 0;
          
          // Skill match (60% of score)
          if (group.requiredSkill) {
            if (worker.specializations && worker.specializations.includes(group.requiredSkill)) {
              workerScore += 60;
            } else if (worker.specializations && worker.specializations.includes('General')) {
              workerScore += 30;
            }
          } else {
            workerScore += 60; // No skill required
          }
          
          // Worker type bonus (20% of score)
          if (worker.workerType === 'Regular') {
            workerScore += 20;
          } else if (worker.workerType === 'Substitute') {
            workerScore += 10;
          }
          
          // Shift match (10% of score)
          if (selectedShift && worker.shiftIds && worker.shiftIds.includes(selectedShift)) {
            workerScore += 10;
          }
          
          if (workerScore > bestWorkerScore) {
            bestWorkerScore = workerScore;
            bestWorker = worker;
          }
        }
        
        const totalScore = (bestRoomScore + bestWorkerScore) / 2;
        
        // Calculate match percentage out of 100
        const matchPercentage = Math.round(totalScore);
        
        // Build warnings
        const warnings = [];
        if (bestRoom && bestRoom.capacity < group.peopleCount) {
          warnings.push(`⚠️ Capacity mismatch: Room ${bestRoom.roomNumber} has ${bestRoom.capacity} capacity, needs ${group.peopleCount}`);
        }
        if (bestWorker && group.requiredSkill && !bestWorker.specializations?.includes(group.requiredSkill)) {
          warnings.push(`⚠️ Skill mismatch: Needs ${group.requiredSkill}, worker has ${bestWorker.specializations?.join(', ') || 'none'}`);
        }
        if (!bestRoom) {
          warnings.push(`⚠️ No available room found for this group`);
        }
        if (!bestWorker) {
          warnings.push(`⚠️ No available worker found for this group`);
        }
        
        newAssignments.push({
          groupId: group._id,
          groupName: group.name,
          peopleCount: group.peopleCount,
          requiredSkill: group.requiredSkill,
          priority: group.priority,
          roomId: bestRoom?._id,
          roomName: bestRoom?.name,
          roomNumber: bestRoom?.roomNumber,
          roomCapacity: bestRoom?.capacity,
          workerId: bestWorker?._id,
          workerName: bestWorker?.name,
          workerSpecializations: bestWorker?.specializations,
          matchScore: matchPercentage,
          warnings: warnings
        });
        
        if (bestRoom) usedRooms.add(bestRoom._id);
        if (bestWorker) usedWorkers.add(bestWorker._id);
      }
      
      setAssignments(newAssignments);
      setShowMap(true);
      
      const stats = {
        totalGroups: pendingGroups.length,
        matchedGroups: newAssignments.filter(a => a.matchScore >= 60 && a.roomId && a.workerId).length,
        partialMatches: newAssignments.filter(a => a.matchScore >= 40 && a.matchScore < 60).length,
        unmatched: newAssignments.filter(a => a.matchScore < 40 || !a.roomId || !a.workerId).length,
        averageScore: Math.round(newAssignments.reduce((sum, a) => sum + a.matchScore, 0) / newAssignments.length) || 0
      };
      
      setSortingResults({ summary: stats, data: newAssignments });
      showToast(`Sorting complete! ${stats.matchedGroups} matches, ${stats.unmatched} unmatched`, 'success');
      
    } catch (error) {
      console.error('Error running sorting:', error);
      showToast(error.response?.data?.message || 'Failed to run sorting', 'error');
    }
    setLoading(false);
  };

  const handleConfirmAssignments = async () => {
    if (!assignments.length) {
      showToast('No assignments to confirm. Run sorting first.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/room-assignment/confirm', {
        assignments: assignments.filter(a => a.roomId && a.workerId),
        date: selectedDate,
        shiftId: selectedShift || null
      });
      
      showToast('Assignments confirmed and saved!', 'success');
      await fetchGroups(); // Refresh groups to update statuses
    } catch (error) {
      console.error('Error confirming assignments:', error);
      showToast('Failed to confirm assignments', 'error');
    }
    setLoading(false);
  };

  // Selection helpers
  const toggleSelectRow = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const selectAll = () => {
    const items = activeTab === 'rooms' ? rooms : activeTab === 'workers' ? workers : groups;
    setSelectedRows(new Set(items.map(i => i._id)));
  };

  const deselectAll = () => {
    setSelectedRows(new Set());
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };
useEffect(() => {
  // Update page title for SEO
  document.title = 'TaskBridge Room Assignment - Smart Staff & Room Management for Schools, Hospitals, Factories';
  
  // Update meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = 'TaskBridge Room Assignment: Automatically assign rooms, workers, and shifts for schools (skola), hospitals (sjukhus), and factories (fabrik). Supports English, Swedish, Finnish, Norwegian, Danish, German.';
  
  // Update keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.content = 'taskbridge, room assignment, shift management, school staffing, hospital rostering, factory scheduling, personalhantering, skiftplanering, rumsplacering, skola, sjukhus, fabrik, workforce management';
  
  return () => { document.title = 'TaskBridge'; };
}, []);
  const getScoreEmoji = (score) => {
    if (score >= 80) return '🎉 Perfect Match!';
    if (score >= 60) return '👍 Good Match';
    if (score >= 40) return '⚠️ Partial Match';
    return '❌ Poor Match';
  };

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          ...styles.toast,
          background: toastMessage.type === 'success' ? '#10b981' : toastMessage.type === 'info' ? '#3b82f6' : '#ef4444'
        }}>
          {toastMessage.message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏢 Room Assignment System</h1>
        <button onClick={onClose} style={styles.closeButton}>✕</button>
      </div>

      {/* Shift Selector */}
      <div style={styles.shiftBar}>
        <div style={styles.shiftSelector}>
          <label style={styles.label}>Select Shift:</label>
          <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} style={styles.select}>
            <option value="">All Shifts</option>
            {shifts.map(shift => (
              <option key={shift._id} value={shift._id}>{shift.name} ({shift.startTime} - {shift.endTime})</option>
            ))}
          </select>
          <button onClick={() => setShowShiftModal(true)} style={styles.addShiftButton}>+ Add Shift</button>
          {shifts.length > 0 && (
            <button onClick={() => {
              const shiftToDelete = prompt('Enter shift name to delete:', shifts[0]?.name);
              const shift = shifts.find(s => s.name === shiftToDelete);
              if (shift) handleDeleteShift(shift._id);
              else if (shiftToDelete) showToast('Shift not found', 'error');
            }} style={styles.deleteShiftButton}>🗑️ Remove Shift</button>
          )}
        </div>
        <div style={styles.dateSelector}>
          <label style={styles.label}>Date:</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={styles.dateInput} />
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button onClick={() => { setActiveTab('rooms'); setSelectedRows(new Set()); setBulkMode(false); }} style={{...styles.tab, background: activeTab === 'rooms' ? '#00d1ff' : 'transparent'}}>🏠 Rooms</button>
        <button onClick={() => { setActiveTab('workers'); setSelectedRows(new Set()); setBulkMode(false); }} style={{...styles.tab, background: activeTab === 'workers' ? '#00d1ff' : 'transparent'}}>👥 Workers</button>
        <button onClick={() => { setActiveTab('groups'); setSelectedRows(new Set()); setBulkMode(false); }} style={{...styles.tab, background: activeTab === 'groups' ? '#00d1ff' : 'transparent'}}>📋 Groups</button>
        <button onClick={() => { setActiveTab('sorting'); setShowMap(true); }} style={{...styles.tab, background: activeTab === 'sorting' ? '#00d1ff' : 'transparent'}}>🔄 Sort & Map</button>
      </div>

      {/* Action Bar */}
      <div style={styles.actionBar}>
        {activeTab !== 'sorting' && (
          <>
            <button onClick={selectAll} style={styles.actionButton}>✓ Select All</button>
            <button onClick={deselectAll} style={styles.actionButton}>✗ Deselect All</button>
            <button onClick={() => setBulkMode(!bulkMode)} style={styles.actionButton}>📦 Bulk Add</button>
            {activeTab === 'rooms' && (
              <button onClick={bulkToggleRoomAvailability} style={{...styles.actionButton, background: '#8b5cf6'}}>🔄 Mark Selected Available/Unavailable</button>
            )}
            <button onClick={activeTab === 'rooms' ? handleDeleteRooms : activeTab === 'workers' ? handleDeleteWorkers : handleDeleteGroups} style={{...styles.actionButton, background: '#ef4444'}}>🗑️ Delete Selected ({selectedRows.size})</button>
          </>
        )}
        {activeTab === 'sorting' && (
          <>
            <button onClick={handleRunSorting} style={styles.primaryButton} disabled={loading}>🔄 Run Sorting Algorithm</button>
            <button onClick={handleConfirmAssignments} style={styles.successButton} disabled={loading}>✅ Confirm Assignments</button>
          </>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {loading && <div style={styles.loading}>Loading...</div>}

        {/* ROOMS TAB */}
        {activeTab === 'rooms' && !loading && (
          <div>
            {bulkMode && (
              <div style={styles.bulkPanel}>
                <h3>Bulk Create Rooms</h3>
                <div style={styles.bulkForm}>
                  <input type="text" placeholder="Prefix (e.g., 'A', 'Room ')" value={bulkRoomData.prefix} onChange={(e) => setBulkRoomData({...bulkRoomData, prefix: e.target.value})} style={styles.input} />
                  <input type="number" placeholder="Start Number" value={bulkRoomData.startNumber} onChange={(e) => setBulkRoomData({...bulkRoomData, startNumber: parseInt(e.target.value)})} style={styles.smallInput} />
                  <span>to</span>
                  <input type="number" placeholder="End Number" value={bulkRoomData.endNumber} onChange={(e) => setBulkRoomData({...bulkRoomData, endNumber: parseInt(e.target.value)})} style={styles.smallInput} />
                  <input type="number" placeholder="Capacity" value={bulkRoomData.capacity} onChange={(e) => setBulkRoomData({...bulkRoomData, capacity: parseInt(e.target.value)})} style={styles.smallInput} />
                  <input type="text" placeholder="Room Type" value={bulkRoomData.roomType} onChange={(e) => setBulkRoomData({...bulkRoomData, roomType: e.target.value})} style={styles.input} />
                  <button onClick={handleBulkCreateRooms} style={styles.submitButton}>Create {bulkRoomData.endNumber - bulkRoomData.startNumber + 1} Rooms</button>
                  <button onClick={() => setBulkMode(false)} style={styles.cancelButton}>Cancel</button>
                </div>
              </div>
            )}

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : deselectAll()} /></th>
                    <th style={styles.th} onClick={() => sortRooms('roomNumber')} style={{cursor: 'pointer'}}>Room # {getSortIcon('roomNumber', roomSortField, roomSortDirection)}</th>
                    <th style={styles.th} onClick={() => sortRooms('name')} style={{cursor: 'pointer'}}>Name {getSortIcon('name', roomSortField, roomSortDirection)}</th>
                    <th style={styles.th} onClick={() => sortRooms('capacity')} style={{cursor: 'pointer'}}>Capacity {getSortIcon('capacity', roomSortField, roomSortDirection)}</th>
                    <th style={styles.th} onClick={() => sortRooms('roomType')} style={{cursor: 'pointer'}}>Type {getSortIcon('roomType', roomSortField, roomSortDirection)}</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room._id} style={styles.tableRow}>
                      <td style={styles.td}><input type="checkbox" checked={selectedRows.has(room._id)} onChange={() => toggleSelectRow(room._id)} /></td>
                      <td style={styles.td}>
                        {editingCell === `room-${room._id}-roomNumber` ? (
                          <input type="text" defaultValue={room.roomNumber} onBlur={(e) => handleUpdateRoom(room._id, 'roomNumber', e.target.value)} autoFocus style={styles.editInput} />
                        ) : (
                          <span onClick={() => setEditingCell(`room-${room._id}-roomNumber`)} style={styles.editable}>{room.roomNumber}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingCell === `room-${room._id}-name` ? (
                          <input type="text" defaultValue={room.name} onBlur={(e) => handleUpdateRoom(room._id, 'name', e.target.value)} autoFocus style={styles.editInput} />
                        ) : (
                          <span onClick={() => setEditingCell(`room-${room._id}-name`)} style={styles.editable}>{room.name}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingCell === `room-${room._id}-capacity` ? (
                          <input type="number" defaultValue={room.capacity} onBlur={(e) => handleUpdateRoom(room._id, 'capacity', parseInt(e.target.value))} autoFocus style={styles.editInput} />
                        ) : (
                          <span onClick={() => setEditingCell(`room-${room._id}-capacity`)} style={styles.editable}>{room.capacity}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingCell === `room-${room._id}-roomType` ? (
                          <input type="text" defaultValue={room.roomType} onBlur={(e) => handleUpdateRoom(room._id, 'roomType', e.target.value)} autoFocus style={styles.editInput} />
                        ) : (
                          <span onClick={() => setEditingCell(`room-${room._id}-roomType`)} style={styles.editable}>{room.roomType}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={{...styles.statusBadge, background: room.isActive ? '#10b981' : '#ef4444'}}>
                          {room.isActive ? '🟢 Available' : '🔴 Unavailable'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => toggleRoomAvailability(room._id, room.isActive)} style={{...styles.actionButton, padding: '4px 8px', fontSize: '11px'}}>
                          {room.isActive ? '🔴 Make Unavailable' : '🟢 Make Available'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WORKERS TAB */}
        {activeTab === 'workers' && !loading && (
          <div>
            {bulkMode && (
              <div style={styles.bulkPanel}>
                <h3>Bulk Create Workers</h3>
                <div style={styles.bulkForm}>
                  <textarea placeholder="Enter worker names separated by commas&#10;Example: John Smith, Jane Doe, Bob Wilson" value={bulkWorkerData.names} onChange={(e) => setBulkWorkerData({...bulkWorkerData, names: e.target.value})} style={styles.textarea} rows="3" />
                  <input type="text" placeholder="Default Specialization" value={bulkWorkerData.defaultSpecialization} onChange={(e) => setBulkWorkerData({...bulkWorkerData, defaultSpecialization: e.target.value})} style={styles.input} />
                  <button onClick={handleBulkCreateWorkers} style={styles.submitButton}>Create Workers</button>
                  <button onClick={() => setBulkMode(false)} style={styles.cancelButton}>Cancel</button>
                </div>
              </div>
            )}

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : deselectAll()} /></th>
                    <th style={styles.th} onClick={() => sortWorkers('name')} style={{cursor: 'pointer'}}>Name {getSortIcon('name', workerSortField, workerSortDirection)}</th>
                    <th style={styles.th} onClick={() => sortWorkers('specializations')} style={{cursor: 'pointer'}}>Specializations {getSortIcon('specializations', workerSortField, workerSortDirection)}</th>
                    <th style={styles.th} onClick={() => sortWorkers('workerType')} style={{cursor: 'pointer'}}>Type {getSortIcon('workerType', workerSortField, workerSortDirection)}</th>
                    <th style={styles.th}>Shift</th>
                    <th style={styles.th}>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map(worker => (
                    <tr key={worker._id} style={styles.tableRow}>
                      <td style={styles.td}><input type="checkbox" checked={selectedRows.has(worker._id)} onChange={() => toggleSelectRow(worker._id)} /></td>
                      <td style={styles.td}>
                        {editingCell === `worker-${worker._id}-name` ? (
                          <input type="text" defaultValue={worker.name} onBlur={(e) => handleUpdateWorker(worker._id, 'name', e.target.value)} autoFocus style={styles.editInput} />
                        ) : (
                          <span onClick={() => setEditingCell(`worker-${worker._id}-name`)} style={styles.editable}>{worker.name}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingCell === `worker-${worker._id}-specializations` ? (
                          <input type="text" defaultValue={worker.specializations?.join(', ')} onBlur={(e) => handleUpdateWorker(worker._id, 'specializations', e.target.value)} autoFocus style={styles.editInput} />
                        ) : (
                          <span onClick={() => setEditingCell(`worker-${worker._id}-specializations`)} style={styles.editable}>
                            {worker.specializations?.join(', ') || 'None'}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <select value={worker.workerType} onChange={(e) => handleUpdateWorker(worker._id, 'workerType', e.target.value)} style={styles.smallSelect}>
                          <option value="Regular">Regular</option>
                          <option value="Substitute">Substitute</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        <select value={worker.shiftIds?.[0] || ''} onChange={(e) => handleUpdateWorker(worker._id, 'shiftIds', e.target.value)} style={styles.smallSelect}>
                          <option value="">No Shift</option>
                          {shifts.map(shift => (
                            <option key={shift._id} value={shift._id}>{shift.name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={styles.td}>
                        <input type="checkbox" checked={worker.isAvailable} onChange={(e) => handleUpdateWorker(worker._id, 'isAvailable', e.target.checked)} style={styles.checkbox} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && !loading && (
          <div>
            <div style={styles.quickAddBar}>
              <button onClick={handleQuickAddGroup} style={styles.addButton}>+ Quick Add Group</button>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : deselectAll()} /></th>
                    <th style={styles.th} onClick={() => sortGroups('name')} style={{cursor: 'pointer'}}>Group Name {getSortIcon('name', groupSortField, groupSortDirection)}</th>
                    <th style={styles.th} onClick={() => sortGroups('peopleCount')} style={{cursor: 'pointer'}}>People {getSortIcon('peopleCount', groupSortField, groupSortDirection)}</th>
                    <th style={styles.th} onClick={() => sortGroups('requiredSkill')} style={{cursor: 'pointer'}}>Required Skill {getSortIcon('requiredSkill', groupSortField, groupSortDirection)}</th>
                    <th style={styles.th} onClick={() => sortGroups('priority')} style={{cursor: 'pointer'}}>Priority {getSortIcon('priority', groupSortField, groupSortDirection)}</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(group => (
                    <tr key={group._id} style={styles.tableRow}>
                      <td style={styles.td}><input type="checkbox" checked={selectedRows.has(group._id)} onChange={() => toggleSelectRow(group._id)} /></td>
                      <td style={styles.td}>
                        {editingCell === `group-${group._id}-name` ? (
                          <input type="text" defaultValue={group.name} onBlur={(e) => handleUpdateGroup(group._id, 'name', e.target.value)} autoFocus style={styles.editInput} />
                        ) : (
                          <span onClick={() => setEditingCell(`group-${group._id}-name`)} style={styles.editable}>{group.name}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingCell === `group-${group._id}-peopleCount` ? (
                          <input type="number" defaultValue={group.peopleCount} onBlur={(e) => handleUpdateGroup(group._id, 'peopleCount', parseInt(e.target.value))} autoFocus style={styles.editInput} />
                        ) : (
                          <span onClick={() => setEditingCell(`group-${group._id}-peopleCount`)} style={styles.editable}>{group.peopleCount}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {editingCell === `group-${group._id}-requiredSkill` ? (
                          <input type="text" defaultValue={group.requiredSkill} onBlur={(e) => handleUpdateGroup(group._id, 'requiredSkill', e.target.value)} autoFocus style={styles.editInput} />
                        ) : (
                          <span onClick={() => setEditingCell(`group-${group._id}-requiredSkill`)} style={styles.editable}>{group.requiredSkill || 'General'}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <select value={group.priority} onChange={(e) => handleUpdateGroup(group._id, 'priority', e.target.value)} style={styles.smallSelect}>
                          <option value="Urgent">🔴 Urgent</option>
                          <option value="High">🟠 High</option>
                          <option value="Normal">🟡 Normal</option>
                          <option value="Low">🟢 Low</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        <span style={{...styles.statusBadge, background: group.status === 'assigned' ? '#10b981' : '#f59e0b'}}>
                          {group.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SORTING & MAP TAB */}
        {activeTab === 'sorting' && !loading && (
          <div>
            {showMap && assignments.length > 0 ? (
              <div>
                <div style={styles.summaryStats}>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>{sortingResults?.summary?.totalGroups || 0}</div>
                    <div style={styles.statLabel}>Total Groups</div>
                  </div>
                  <div style={{...styles.statCard, background: 'rgba(16,185,129,0.1)'}}>
                    <div style={{...styles.statValue, color: '#10b981'}}>{sortingResults?.summary?.matchedGroups || 0}</div>
                    <div style={styles.statLabel}>Perfect Matches (60%+)</div>
                  </div>
                  <div style={{...styles.statCard, background: 'rgba(245,158,11,0.1)'}}>
                    <div style={{...styles.statValue, color: '#f59e0b'}}>{sortingResults?.summary?.partialMatches || 0}</div>
                    <div style={styles.statLabel}>Partial Matches (40-60%)</div>
                  </div>
                  <div style={{...styles.statCard, background: 'rgba(239,68,68,0.1)'}}>
                    <div style={{...styles.statValue, color: '#ef4444'}}>{sortingResults?.summary?.unmatched || 0}</div>
                    <div style={styles.statLabel}>Unmatched (&lt;40%)</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>{sortingResults?.summary?.averageScore || 0}%</div>
                    <div style={styles.statLabel}>Average Match Score</div>
                  </div>
                </div>

                <h3 style={styles.mapTitle}>🗺️ Room Assignment Map</h3>
                <div style={styles.mapGrid}>
                  {assignments.map((assignment, idx) => {
                    const scoreColor = getScoreColor(assignment.matchScore);
                    const hasWarning = assignment.warnings?.length > 0;
                    const isPerfectMatch = assignment.matchScore >= 80;
                    const isGoodMatch = assignment.matchScore >= 60 && assignment.matchScore < 80;
                    
                    return (
                      <div key={idx} style={{...styles.mapCard, borderLeftColor: scoreColor, background: isPerfectMatch ? 'rgba(16,185,129,0.05)' : isGoodMatch ? 'rgba(0,209,255,0.05)' : 'rgba(239,68,68,0.05)'}}>
                        <div style={styles.mapCardHeader}>
                          <span style={styles.roomNumber}>🏠 {assignment.roomNumber || assignment.roomName || 'No Room Assigned'}</span>
                          <span style={{...styles.matchScore, background: scoreColor}}>
                            {assignment.matchScore}% - {getScoreEmoji(assignment.matchScore)}
                          </span>
                        </div>
                        <div style={styles.mapCardBody}>
                          <div style={styles.mapRow}>
                            <span style={styles.mapLabel}>👥 Group:</span>
                            <span><strong>{assignment.groupName}</strong></span>
                            <span style={styles.badge}>{assignment.peopleCount} people</span>
                            <span style={{...styles.priorityBadge, background: assignment.priority === 'Urgent' ? '#ef4444' : assignment.priority === 'High' ? '#f59e0b' : '#10b981'}}>
                              {assignment.priority}
                            </span>
                          </div>
                          <div style={styles.mapRow}>
                            <span style={styles.mapLabel}>👨‍🏫 Worker:</span>
                            <span><strong>{assignment.workerName || 'Not Assigned'}</strong></span>
                            {assignment.workerSpecializations && assignment.workerSpecializations.length > 0 && (
                              <span style={styles.skillBadge}>{assignment.workerSpecializations?.join(', ')}</span>
                            )}
                          </div>
                          <div style={styles.mapRow}>
                            <span style={styles.mapLabel}>📋 Needs:</span>
                            <span>{assignment.requiredSkill || 'General'}</span>
                          </div>
                          {assignment.roomCapacity && (
                            <div style={styles.mapRow}>
                              <span style={styles.mapLabel}>🏠 Room Info:</span>
                              <span>Capacity: {assignment.roomCapacity}</span>
                              {assignment.roomCapacity >= assignment.peopleCount ? (
                                <span style={styles.goodBadge}>✅ Fits {assignment.peopleCount} people</span>
                              ) : (
                                <span style={styles.warningBadge}>⚠️ Only fits {assignment.roomCapacity} of {assignment.peopleCount} people</span>
                              )}
                            </div>
                          )}
                          {hasWarning && (
                            <div style={styles.warningBox}>
                              {assignment.warnings.map((w, i) => (
                                <div key={i} style={styles.warningText}>{w}</div>
                              ))}
                            </div>
                          )}
                          {!assignment.roomId && (
                            <div style={styles.errorBox}>
                              <div style={styles.warningText}>⚠️ No available room found for this group</div>
                            </div>
                          )}
                          {!assignment.workerId && (
                            <div style={styles.errorBox}>
                              <div style={styles.warningText}>⚠️ No available worker found for this group</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <i className="fas fa-magic" style={{ fontSize: '48px', color: '#00d1ff', marginBottom: '16px' }}></i>
                <h3>Click "Run Sorting Algorithm" to automatically match groups to rooms and workers</h3>
                <p>The system will find the best available room and worker for each group based on:</p>
                <ul style={{textAlign: 'left', marginTop: '16px', color: 'rgba(255,255,255,0.7)'}}>
                  <li>✓ Room capacity vs group size</li>
                  <li>✓ Worker skills vs group requirements</li>
                  <li>✓ Shift availability matching</li>
                  <li>✓ Priority (Urgent &gt High &gt Normal &gt Low)</li>
                  <li>✓ Room type preferences</li>
                  <li>✓ Worker type (Regular vs Substitute)</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shift Modal */}
      {showShiftModal && (
        <div style={styles.modalOverlay} onClick={() => setShowShiftModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add New Shift</h2>
            <input type="text" placeholder="Shift Name (e.g., Morning Shift)" value={newShift.name} onChange={(e) => setNewShift({...newShift, name: e.target.value})} style={styles.input} />
            <div style={styles.timeRow}>
              <input type="time" value={newShift.startTime} onChange={(e) => setNewShift({...newShift, startTime: e.target.value})} style={styles.timeInput} />
              <span>to</span>
              <input type="time" value={newShift.endTime} onChange={(e) => setNewShift({...newShift, endTime: e.target.value})} style={styles.timeInput} />
            </div>
            <input type="color" value={newShift.color} onChange={(e) => setNewShift({...newShift, color: e.target.value})} style={styles.colorInput} />
            <div style={styles.modalButtons}>
              <button onClick={() => setShowShiftModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleSaveShift} style={styles.submitButton}>Save Shift</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#0f172a',
    zIndex: 2000,
    overflowY: 'auto',
    padding: '20px',
    fontFamily: 'Inter, sans-serif'
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    zIndex: 2100,
    fontSize: '14px',
    animation: 'fadeInOut 3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  },
  closeButton: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px 16px'
  },
  deleteShiftButton: {
    padding: '6px 12px',
    background: 'rgba(239,68,68,0.2)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '12px'
  },
  shiftBar: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    padding: '16px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    flexWrap: 'wrap'
  },
  shiftSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  dateSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px'
  },
  select: {
    padding: '8px 12px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer'
  },
  dateInput: {
    padding: '8px 12px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white'
  },
  addShiftButton: {
    padding: '6px 12px',
    background: '#8b5cf6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px'
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '12px',
    flexWrap: 'wrap'
  },
  tab: {
    padding: '10px 24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s'
  },
  actionBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px'
  },
  actionButton: {
    padding: '8px 16px',
    background: 'rgba(0,209,255,0.2)',
    border: '1px solid #00d1ff',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px'
  },
  primaryButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  successButton: {
    padding: '10px 20px',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  content: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    padding: '20px',
    minHeight: '400px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'white'
  },
  bulkPanel: {
    background: 'rgba(0,209,255,0.1)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid rgba(0,209,255,0.3)'
  },
  bulkForm: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: '12px'
  },
  input: {
    padding: '10px 14px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white',
    flex: '1',
    minWidth: '150px'
  },
  textarea: {
    padding: '10px 14px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white',
    width: '100%',
    marginBottom: '12px'
  },
  smallInput: {
    padding: '10px 14px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white',
    width: '80px'
  },
  submitButton: {
    padding: '10px 20px',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '12px',
    cursor: 'pointer'
  },
  tableRow: {
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  td: {
    padding: '12px',
    color: 'white',
    fontSize: '14px'
  },
  editable: {
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'inline-block'
  },
  editInput: {
    padding: '6px 10px',
    background: '#1e293b',
    border: '1px solid #00d1ff',
    borderRadius: '6px',
    color: 'white',
    width: '100px'
  },
  smallSelect: {
    padding: '6px 10px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    display: 'inline-block'
  },
  quickAddBar: {
    marginBottom: '20px'
  },
  addButton: {
    padding: '10px 20px',
    background: '#00d1ff',
    border: 'none',
    borderRadius: '8px',
    color: '#0f172a',
    cursor: 'pointer',
    fontWeight: '600'
  },
  summaryStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#00d1ff'
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '4px'
  },
  mapTitle: {
    color: 'white',
    fontSize: '18px',
    marginBottom: '16px'
  },
  mapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '16px'
  },
  mapCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    overflow: 'hidden',
    borderLeft: '4px solid'
  },
  mapCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  roomNumber: {
    fontWeight: 'bold',
    color: '#00d1ff'
  },
  matchScore: {
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white'
  },
  mapCardBody: {
    padding: '16px'
  },
  mapRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    flexWrap: 'wrap'
  },
  mapLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    minWidth: '70px'
  },
  badge: {
    background: 'rgba(16,185,129,0.2)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    color: '#10b981'
  },
  goodBadge: {
    background: 'rgba(16,185,129,0.2)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    color: '#10b981'
  },
  warningBadge: {
    background: 'rgba(245,158,11,0.2)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    color: '#f59e0b'
  },
  priorityBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600',
    color: 'white'
  },
  skillBadge: {
    background: 'rgba(0,209,255,0.2)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    color: '#00d1ff'
  },
  warningBox: {
    marginTop: '12px',
    padding: '10px',
    background: 'rgba(239,68,68,0.1)',
    borderRadius: '8px',
    borderLeft: '3px solid #ef4444'
  },
  errorBox: {
    marginTop: '12px',
    padding: '10px',
    background: 'rgba(239,68,68,0.15)',
    borderRadius: '8px',
    borderLeft: '3px solid #ef4444'
  },
  warningText: {
    fontSize: '11px',
    color: '#f87171',
    marginTop: '4px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: 'rgba(255,255,255,0.6)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2100
  },
  modal: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '24px',
    width: '400px',
    maxWidth: '90%'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '16px'
  },
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  timeInput: {
    padding: '10px',
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white'
  },
  colorInput: {
    width: '100%',
    marginBottom: '16px',
    padding: '4px'
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  }
};

export default RoomAssignment;