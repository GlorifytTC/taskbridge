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
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupData, setNewGroupData] = useState({ name: '', peopleCount: 25, requiredSkill: 'General', priority: 'Normal' });
  const [bulkRoomData, setBulkRoomData] = useState({ startNumber: 1, endNumber: 10, capacity: 30, roomType: 'Classroom', prefix: '' });
  const [bulkWorkerData, setBulkWorkerData] = useState({ names: '', defaultSpecialization: 'General' });
  const [sortingResults, setSortingResults] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedGroupForSorting, setSelectedGroupForSorting] = useState('');
  
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

  // Toggle worker availability
  const toggleWorkerAvailability = async (workerId, currentStatus) => {
    setLoading(true);
    try {
      const worker = workers.find(w => w._id === workerId);
      const updatedWorker = { ...worker, isAvailable: !currentStatus };
      await api.put('/room-assignment/workers', { updates: [updatedWorker] });
      await fetchWorkers();
      showToast(`${worker.name} is now ${!currentStatus ? 'Available' : 'Unavailable'}`, 'success');
    } catch (error) {
      console.error('Error toggling worker availability:', error);
      showToast('Failed to update worker status', 'error');
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
  const handleAddShift = () => {
    const shiftName = prompt('Enter shift name:', 'Morning Shift');
    if (!shiftName) return;
    const startTime = prompt('Start time (e.g., 08:00):', '08:00');
    const endTime = prompt('End time (e.g., 17:00):', '17:00');
    
    setLoading(true);
    const newShiftData = { name: shiftName, startTime: startTime || '08:00', endTime: endTime || '17:00', color: '#00d1ff' };
    api.post('/room-assignment/shifts', newShiftData)
      .then(() => {
        fetchShifts();
        showToast(`Shift "${shiftName}" added`, 'success');
      })
      .catch(error => {
        console.error('Error adding shift:', error);
        showToast('Failed to add shift', 'error');
      })
      .finally(() => setLoading(false));
  };

  const handleRemoveShift = (shiftId, shiftName) => {
    setLoading(true);
    api.delete(`/room-assignment/shifts/${shiftId}`)
      .then(() => {
        fetchShifts();
        showToast(`Shift "${shiftName}" removed`, 'success');
      })
      .catch(error => {
        console.error('Error removing shift:', error);
        showToast('Failed to remove shift', 'error');
      })
      .finally(() => setLoading(false));
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
  const handleAddGroup = async () => {
    if (!newGroupData.name) {
      showToast('Please enter group name', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/room-assignment/groups', newGroupData);
      await fetchGroups();
      setShowAddGroupModal(false);
      setNewGroupData({ name: '', peopleCount: 25, requiredSkill: 'General', priority: 'Normal' });
      showToast(`Group "${newGroupData.name}" added`, 'success');
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

  // ============ SORTING ALGORITHM ============
  const handleRunSorting = async () => {
    if (!selectedGroupForSorting) {
      showToast('Please select a group to sort', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const selectedGroup = groups.find(g => g._id === selectedGroupForSorting);
      if (!selectedGroup) {
        showToast('Selected group not found', 'error');
        return;
      }
      
      let availableRooms = rooms.filter(room => room.isActive === true);
      let availableWorkers = workers.filter(worker => worker.isAvailable === true);
      
      let bestRoom = null;
      let bestWorker = null;
      let bestRoomScore = 0;
      let bestWorkerScore = 0;
      
      // Find best matching room
      for (const room of availableRooms) {
        let roomScore = 0;
        
        if (room.capacity >= selectedGroup.peopleCount) {
          roomScore += 60;
          if (room.capacity === selectedGroup.peopleCount) {
            roomScore += 10;
          }
        } else {
          roomScore += (room.capacity / selectedGroup.peopleCount) * 30;
        }
        
        if (selectedGroup.preferredRoomType && selectedGroup.preferredRoomType === room.roomType) {
          roomScore += 20;
        }
        
        if (roomScore > bestRoomScore) {
          bestRoomScore = roomScore;
          bestRoom = room;
        }
      }
      
      // Find best matching worker
      for (const worker of availableWorkers) {
        let workerScore = 0;
        
        if (selectedGroup.requiredSkill) {
          if (worker.specializations && worker.specializations.includes(selectedGroup.requiredSkill)) {
            workerScore += 70;
          } else if (worker.specializations && worker.specializations.includes('General')) {
            workerScore += 35;
          }
        } else {
          workerScore += 70;
        }
        
        if (worker.workerType === 'Regular') {
          workerScore += 20;
        } else if (worker.workerType === 'Substitute') {
          workerScore += 10;
        }
        
        if (workerScore > bestWorkerScore) {
          bestWorkerScore = workerScore;
          bestWorker = worker;
        }
      }
      
      const totalScore = (bestRoomScore + bestWorkerScore) / 2;
      const matchPercentage = Math.round(totalScore);
      
      const warnings = [];
      if (bestRoom && bestRoom.capacity < selectedGroup.peopleCount) {
        warnings.push(`⚠️ Capacity mismatch: Room ${bestRoom.roomNumber} has ${bestRoom.capacity} capacity, needs ${selectedGroup.peopleCount}`);
      }
      if (bestWorker && selectedGroup.requiredSkill && !bestWorker.specializations?.includes(selectedGroup.requiredSkill)) {
        warnings.push(`⚠️ Skill mismatch: Needs ${selectedGroup.requiredSkill}, worker has ${bestWorker.specializations?.join(', ') || 'none'}`);
      }
      if (!bestRoom) {
        warnings.push(`⚠️ No available room found for this group`);
      }
      if (!bestWorker) {
        warnings.push(`⚠️ No available worker found for this group`);
      }
      
      const newAssignment = [{
        groupId: selectedGroup._id,
        groupName: selectedGroup.name,
        peopleCount: selectedGroup.peopleCount,
        requiredSkill: selectedGroup.requiredSkill,
        priority: selectedGroup.priority,
        roomId: bestRoom?._id,
        roomName: bestRoom?.name,
        roomNumber: bestRoom?.roomNumber,
        roomCapacity: bestRoom?.capacity,
        workerId: bestWorker?._id,
        workerName: bestWorker?.name,
        workerSpecializations: bestWorker?.specializations,
        matchScore: matchPercentage,
        warnings: warnings
      }];
      
      setAssignments(newAssignment);
      setShowMap(true);
      
      setSortingResults({ 
        summary: { 
          totalGroups: 1, 
          matchedGroups: matchPercentage >= 60 && bestRoom && bestWorker ? 1 : 0,
          partialMatches: matchPercentage >= 40 && matchPercentage < 60 ? 1 : 0,
          unmatched: matchPercentage < 40 || !bestRoom || !bestWorker ? 1 : 0,
          averageScore: matchPercentage
        }, 
        data: newAssignment 
      });
      
      showToast(`Sorting complete! Match score: ${matchPercentage}%`, 'success');
      
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
        shiftId: null
      });
      
      showToast('Assignments confirmed and saved!', 'success');
      await fetchGroups();
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
          background: toastMessage.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {toastMessage.message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏢 Room Assignment System</h1>
        <button onClick={onClose} style={styles.closeButton}>✕</button>
      </div>

      {/* Date Selector */}
      <div style={styles.dateBar}>
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
            <div style={styles.sortingSelector}>
              <label style={styles.label}>Select Group to Sort:</label>
              <select value={selectedGroupForSorting} onChange={(e) => setSelectedGroupForSorting(e.target.value)} style={styles.select}>
                <option value="">-- Select a group --</option>
                {groups.filter(g => g.status !== 'assigned').map(group => (
                  <option key={group._id} value={group._id}>{group.name} ({group.peopleCount} people, {group.requiredSkill})</option>
                ))}
              </select>
            </div>
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
                    <th style={{...styles.th, cursor: 'pointer', color: 'white'}} onClick={() => sortRooms('roomNumber')}>Room # {getSortIcon('roomNumber', roomSortField, roomSortDirection)}</th>
                    <th style={{...styles.th, cursor: 'pointer', color: 'white'}} onClick={() => sortRooms('name')}>Name {getSortIcon('name', roomSortField, roomSortDirection)}</th>
                    <th style={{...styles.th, cursor: 'pointer', color: 'white'}} onClick={() => sortRooms('capacity')}>Capacity {getSortIcon('capacity', roomSortField, roomSortDirection)}</th>
                    <th style={{...styles.th, cursor: 'pointer', color: 'white'}} onClick={() => sortRooms('roomType')}>Type {getSortIcon('roomType', roomSortField, roomSortDirection)}</th>
                    <th style={{...styles.th, color: 'white'}}>Status</th>
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
                        <button 
                          onClick={() => toggleRoomAvailability(room._id, room.isActive)} 
                          style={{...styles.statusButton, background: room.isActive ? '#10b981' : '#ef4444'}}
                        >
                          {room.isActive ? '🟢 Available' : '🔴 Unavailable'}
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
                    <th style={{...styles.th, cursor: 'pointer', color: 'white'}} onClick={() => sortWorkers('name')}>Name {getSortIcon('name', workerSortField, workerSortDirection)}</th>
                    <th style={{...styles.th, cursor: 'pointer', color: 'white'}} onClick={() => sortWorkers('specializations')}>Specializations {getSortIcon('specializations', workerSortField, workerSortDirection)}</th>
                    <th style={{...styles.th, cursor: 'pointer', color: 'white'}} onClick={() => sortWorkers('workerType')}>Type {getSortIcon('workerType', workerSortField, workerSortDirection)}</th>
                    <th style={{...styles.th, color: 'white'}}>Status</th>
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
                        <button 
                          onClick={() => toggleWorkerAvailability(worker._id, worker.isAvailable)} 
                          style={{...styles.statusButton, background: worker.isAvailable ? '#10b981' : '#ef4444'}}
                        >
                          {worker.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                        </button>
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
              <button onClick={() => setShowAddGroupModal(true)} style={styles.addButton}>+ Add Group</button>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : deselectAll()} /></th>
                    <th style={{...styles.th, cursor: 'pointer', color: 'white'}} onClick={() => sortGroups('name')}>Group Name {getSortIcon('name', groupSortField, groupSortDirection)}</th>
                    <th style={{...styles.th, cursor: 'pointer', color: 'white'}} onClick={() => sortGroups('peopleCount')}>People {getSortIcon('peopleCount', groupSortField, groupSortDirection)}</th>
                    <th style={{...styles.th, cursor: 'pointer', color: 'white'}} onClick={() => sortGroups('requiredSkill')}>Required Skill {getSortIcon('requiredSkill', groupSortField, groupSortDirection)}</th>
                    <th style={{...styles.th, cursor: 'pointer', color: 'white'}} onClick={() => sortGroups('priority')}>Priority {getSortIcon('priority', groupSortField, groupSortDirection)}</th>
                    <th style={{...styles.th, color: 'white'}}>Status</th>
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
                          {group.status === 'assigned' ? '✅ Assigned' : '⏳ Pending'}
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
                    <div style={styles.statLabel}>Perfect Matches</div>
                  </div>
                  <div style={{...styles.statCard, background: 'rgba(245,158,11,0.1)'}}>
                    <div style={{...styles.statValue, color: '#f59e0b'}}>{sortingResults?.summary?.partialMatches || 0}</div>
                    <div style={styles.statLabel}>Partial Matches</div>
                  </div>
                  <div style={{...styles.statCard, background: 'rgba(239,68,68,0.1)'}}>
                    <div style={{...styles.statValue, color: '#ef4444'}}>{sortingResults?.summary?.unmatched || 0}</div>
                    <div style={styles.statLabel}>Unmatched</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statValue}>{sortingResults?.summary?.averageScore || 0}%</div>
                    <div style={styles.statLabel}>Match Score</div>
                  </div>
                </div>

                <h3 style={styles.mapTitle}>🗺️ Room Assignment Result</h3>
                <div style={styles.mapGrid}>
                  {assignments.map((assignment, idx) => {
                    const scoreColor = getScoreColor(assignment.matchScore);
                    return (
                      <div key={idx} style={{...styles.mapCard, borderLeftColor: scoreColor}}>
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
                          {assignment.warnings && assignment.warnings.length > 0 && (
                            <div style={styles.warningBox}>
                              {assignment.warnings.map((w, i) => (
                                <div key={i} style={styles.warningText}>{w}</div>
                              ))}
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
                <h3>Select a group and click "Run Sorting Algorithm" to find the best room and worker</h3>
                <p>The system will find the best available room and worker based on:</p>
                <ul style={{textAlign: 'left', marginTop: '16px', color: 'rgba(255,255,255,0.7)'}}>
                  <li>✓ Room capacity vs group size</li>
                  <li>✓ Worker skills vs group requirements</li>
                  <li>✓ Priority (Urgent → High → Normal → Low)</li>
                  <li>✓ Room type preferences</li>
                  <li>✓ Worker type (Regular vs Substitute)</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddGroupModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add New Group</h2>
            <input type="text" placeholder="Group Name" value={newGroupData.name} onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})} style={styles.input} />
            <input type="number" placeholder="Number of People" value={newGroupData.peopleCount} onChange={(e) => setNewGroupData({...newGroupData, peopleCount: parseInt(e.target.value)})} style={styles.input} />
            <input type="text" placeholder="Required Skill" value={newGroupData.requiredSkill} onChange={(e) => setNewGroupData({...newGroupData, requiredSkill: e.target.value})} style={styles.input} />
            <select value={newGroupData.priority} onChange={(e) => setNewGroupData({...newGroupData, priority: e.target.value})} style={styles.select}>
              <option value="Urgent">🔴 Urgent</option>
              <option value="High">🟠 High</option>
              <option value="Normal">🟡 Normal</option>
              <option value="Low">🟢 Low</option>
            </select>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowAddGroupModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleAddGroup} style={styles.submitButton}>Add Group</button>
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
  dateBar: {
    marginBottom: '20px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px'
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
  dateInput: {
    padding: '8px 12px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white'
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
    borderRadius: '12px',
    alignItems: 'center'
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
  sortingSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  select: {
    padding: '8px 12px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    minWidth: '200px'
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
    fontSize: '12px',
    fontWeight: '600'
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
  statusButton: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
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
  modalButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  }
};

export default RoomAssignment;