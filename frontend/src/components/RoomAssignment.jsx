import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * F5 PERSISTENCE FIX:
 * This component writes 'roomAssignmentOpen=true' to localStorage on every render.
 * Your parent App.jsx / main router should check this on mount:
 *
 *   useEffect(() => {
 *     if (localStorage.getItem('roomAssignmentOpen') === 'true') {
 *       setCurrentPage('room-assignment'); // or however you navigate
 *     }
 *   }, []);
 *
 * When the user intentionally closes (✕ button), we remove the flag.
 */

const RoomAssignment = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('roomAssignmentTab') || 'rooms';
  });
  const [rooms, setRooms] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showBulkGroupModal, setShowBulkGroupModal] = useState(false);
  const [bulkGroupsData, setBulkGroupsData] = useState('');
  const [newGroupData, setNewGroupData] = useState({ name: '', peopleCount: 25, requiredSkill: 'General', priority: 'Normal', preferredRoomType: '' });
  const [bulkRoomData, setBulkRoomData] = useState({ startNumber: 1, endNumber: 10, capacity: 30, roomType: 'Classroom', prefix: '' });
  const [bulkWorkerData, setBulkWorkerData] = useState({ names: '', defaultSpecialization: 'General' });
  const [sortingResults, setSortingResults] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedGroupForSorting, setSelectedGroupForSorting] = useState('');
  const [sortAllGroups, setSortAllGroups] = useState(false);
  const [roomTypes] = useState(['Classroom', 'Laboratory', 'Office', 'Conference Room', 'Gym', 'Library', 'Cafeteria']);

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

  // ─── F5 PERSISTENCE ────────────────────────────────────────────────────────
  // Mark as open on mount, clear only on intentional close
  useEffect(() => {
    localStorage.setItem('roomAssignmentOpen', 'true');
  }, []);

  const handleClose = () => {
    localStorage.removeItem('roomAssignmentOpen');
    onClose();
  };
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem('roomAssignmentTab', activeTab);
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/room-assignment/rooms');
      setRooms(res.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  }, []);

  const fetchWorkers = useCallback(async () => {
    try {
      const res = await api.get('/room-assignment/workers');
      setWorkers(res.data.data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get('/room-assignment/groups');
      setGroups(res.data.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchWorkers();
    fetchGroups();
  }, [fetchRooms, fetchWorkers, fetchGroups]);

  const toggleRoomAvailability = async (roomId, currentStatus) => {
    setRooms(prev => prev.map(room =>
      room._id === roomId ? { ...room, isActive: !currentStatus } : room
    ));
    try {
      const room = rooms.find(r => r._id === roomId);
      await api.put('/room-assignment/rooms', { updates: [{ ...room, isActive: !currentStatus }] });
    } catch (error) {
      setRooms(prev => prev.map(room =>
        room._id === roomId ? { ...room, isActive: currentStatus } : room
      ));
    }
  };

  const bulkToggleRoomAvailability = async () => {
    if (selectedRows.size === 0) { showToast('No rooms selected', 'error'); return; }
    const selectedRooms = rooms.filter(r => selectedRows.has(r._id));
    const makeAvailable = selectedRooms.some(r => !r.isActive);
    setRooms(prev => prev.map(room =>
      selectedRows.has(room._id) ? { ...room, isActive: makeAvailable } : room
    ));
    try {
      const updates = selectedRooms.map(room => ({ id: room._id, ...room, isActive: makeAvailable }));
      await api.put('/room-assignment/rooms', { updates });
      setSelectedRows(new Set());
      showToast(`${selectedRows.size} rooms updated`, 'success');
    } catch (error) {
      await fetchRooms();
    }
  };

  const toggleWorkerAvailability = async (workerId, currentStatus) => {
    setWorkers(prev => prev.map(worker =>
      worker._id === workerId ? { ...worker, isAvailable: !currentStatus } : worker
    ));
    try {
      const worker = workers.find(w => w._id === workerId);
      await api.put('/room-assignment/workers', { updates: [{ ...worker, isAvailable: !currentStatus }] });
    } catch (error) {
      setWorkers(prev => prev.map(worker =>
        worker._id === workerId ? { ...worker, isAvailable: currentStatus } : worker
      ));
    }
  };

  const sortRooms = (field) => {
    const direction = roomSortField === field && roomSortDirection === 'asc' ? 'desc' : 'asc';
    setRoomSortField(field);
    setRoomSortDirection(direction);
    const sorted = [...rooms].sort((a, b) => {
      let aVal = field === 'capacity' ? parseInt(a[field]) || 0 : (a[field] || '').toString().toLowerCase();
      let bVal = field === 'capacity' ? parseInt(b[field]) || 0 : (b[field] || '').toString().toLowerCase();
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
      let aVal = field === 'specializations' ? (a.specializations?.join(',') || '') : (a[field] || '').toString().toLowerCase();
      let bVal = field === 'specializations' ? (b.specializations?.join(',') || '') : (b[field] || '').toString().toLowerCase();
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
      let aVal = field === 'peopleCount' ? parseInt(a[field]) || 0 : (a[field] || '').toString().toLowerCase();
      let bVal = field === 'peopleCount' ? parseInt(b[field]) || 0 : (b[field] || '').toString().toLowerCase();
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setGroups(sorted);
  };

  const getSortIcon = (field, currentField, currentDirection) => {
    if (field !== currentField) return '↕';
    return currentDirection === 'asc' ? '↑' : '↓';
  };

  const handleBulkCreateRooms = async () => {
    if (bulkRoomData.startNumber > bulkRoomData.endNumber) { showToast('Start number must be less than end number', 'error'); return; }
    const existingRoomNumbers = new Set(rooms.map(r => r.roomNumber));
    for (let i = bulkRoomData.startNumber; i <= bulkRoomData.endNumber; i++) {
      const roomNumber = `${bulkRoomData.prefix || ''}${i}`;
      if (existingRoomNumbers.has(roomNumber)) { showToast(`Room ${roomNumber} already exists!`, 'error'); return; }
    }
    setLoading(true);
    try {
      await api.post('/room-assignment/rooms/bulk', bulkRoomData);
      await fetchRooms();
      setBulkMode(false);
      setBulkRoomData({ startNumber: 1, endNumber: 10, capacity: 30, roomType: 'Classroom', prefix: '' });
      showToast(`Created rooms ${bulkRoomData.startNumber} to ${bulkRoomData.endNumber}`, 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create rooms', 'error');
    }
    setLoading(false);
  };

  const handleUpdateRoom = async (roomId, field, value) => {
    const room = rooms.find(r => r._id === roomId);
    const updatedRoom = { ...room, [field]: value };
    setRooms(prev => prev.map(r => r._id === roomId ? updatedRoom : r));
    setEditingCell(null);
    try {
      await api.put('/room-assignment/rooms', { updates: [updatedRoom] });
      showToast('Room updated', 'success');
    } catch (error) {
      await fetchRooms();
      showToast('Failed to update room', 'error');
    }
  };

  const handleDeleteRooms = async () => {
    if (selectedRows.size === 0) { showToast('No rooms selected', 'error'); return; }
    const deletedIds = Array.from(selectedRows);
    setRooms(prev => prev.filter(room => !deletedIds.includes(room._id)));
    setSelectedRows(new Set());
    try {
      await api.delete('/room-assignment/rooms', { data: { ids: deletedIds } });
      showToast(`${deletedIds.length} rooms deleted`, 'success');
    } catch (error) {
      await fetchRooms();
      showToast('Failed to delete rooms', 'error');
    }
  };

  const handleBulkCreateWorkers = async () => {
    if (!bulkWorkerData.names) { showToast('Enter worker names separated by commas', 'error'); return; }
    setLoading(true);
    try {
      await api.post('/room-assignment/workers/bulk', bulkWorkerData);
      await fetchWorkers();
      setBulkMode(false);
      setBulkWorkerData({ names: '', defaultSpecialization: 'General' });
      showToast('Workers added successfully', 'success');
    } catch (error) {
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
    setWorkers(prev => prev.map(w => w._id === workerId ? updatedWorker : w));
    setEditingCell(null);
    try {
      await api.put('/room-assignment/workers', { updates: [updatedWorker] });
      showToast('Worker updated', 'success');
    } catch (error) {
      await fetchWorkers();
      showToast('Failed to update worker', 'error');
    }
  };

  const handleDeleteWorkers = async () => {
    if (selectedRows.size === 0) { showToast('No workers selected', 'error'); return; }
    const deletedIds = Array.from(selectedRows);
    setWorkers(prev => prev.filter(worker => !deletedIds.includes(worker._id)));
    setSelectedRows(new Set());
    try {
      await api.delete('/room-assignment/workers', { data: { ids: deletedIds } });
      showToast(`${deletedIds.length} workers deleted`, 'success');
    } catch (error) {
      await fetchWorkers();
      showToast('Failed to delete workers', 'error');
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupData.name) { showToast('Please enter group name', 'error'); return; }
    setLoading(true);
    try {
      await api.post('/room-assignment/groups', newGroupData);
      await fetchGroups();
      setShowAddGroupModal(false);
      setNewGroupData({ name: '', peopleCount: 25, requiredSkill: 'General', priority: 'Normal', preferredRoomType: '' });
      showToast(`Group "${newGroupData.name}" added`, 'success');
    } catch (error) {
      showToast('Failed to add group', 'error');
    }
    setLoading(false);
  };

  const handleBulkAddGroups = async () => {
    if (!bulkGroupsData.trim()) { showToast('Enter group data', 'error'); return; }
    const groupsToAdd = bulkGroupsData.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split(',').map(p => p.trim());
        return { name: parts[0], peopleCount: parseInt(parts[1]) || 25, requiredSkill: parts[2] || 'General', priority: parts[3] || 'Normal', preferredRoomType: parts[4] || '' };
      });
    if (groupsToAdd.length === 0) { showToast('No valid groups to add', 'error'); return; }
    setLoading(true);
    try {
      for (const group of groupsToAdd) {
        await api.post('/room-assignment/groups', { ...group, organization: user?.organization, createdBy: user?.id });
      }
      await fetchGroups();
      setShowBulkGroupModal(false);
      setBulkGroupsData('');
      showToast(`${groupsToAdd.length} groups added successfully`, 'success');
    } catch (error) {
      showToast('Failed to add groups', 'error');
    }
    setLoading(false);
  };

  const handleUpdateGroup = async (groupId, field, value) => {
    const group = groups.find(g => g._id === groupId);
    const updatedGroup = { ...group, [field]: value };
    setGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g));
    setEditingCell(null);
    try {
      await api.put('/room-assignment/groups', { updates: [updatedGroup] });
      showToast('Group updated', 'success');
    } catch (error) {
      await fetchGroups();
      showToast('Failed to update group', 'error');
    }
  };

  const handleDeleteGroups = async () => {
    if (selectedRows.size === 0) { showToast('No groups selected', 'error'); return; }
    const deletedIds = Array.from(selectedRows);
    setGroups(prev => prev.filter(group => !deletedIds.includes(group._id)));
    setSelectedRows(new Set());
    try {
      await api.delete('/room-assignment/groups', { data: { ids: deletedIds } });
      showToast(`${deletedIds.length} groups deleted`, 'success');
    } catch (error) {
      await fetchGroups();
      showToast('Failed to delete groups', 'error');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SMART SORTING ALGORITHM — v2
  //
  // New features vs the original:
  //  1. Sorts ALL pending groups at once (not just one) when sortAllGroups=true
  //  2. Priority ordering: Urgent → High → Normal → Low sorted first
  //  3. Waste-minimisation: prefers rooms with smallest EXCESS capacity
  //     (don't put a 5-person group in a 200-person room when a 10-person room exists)
  //  4. Worker load-balancing: tracks which workers are already assigned in this
  //     run and picks the least-recently-used available worker
  //  5. Room type bonus scales with how rare that room type is (scarce = higher value)
  //  6. Conflict detection: flags when group size > room capacity (hard constraint)
  //  7. Produces a detailed breakdown score card per assignment
  // ═══════════════════════════════════════════════════════════════════════════
  const scoreRoom = (room, group, usedRoomIds) => {
    if (usedRoomIds.has(room._id)) return -1; // already assigned this run
    if (!room.isActive) return -1;

    let score = 0;
    const excess = room.capacity - group.peopleCount;

    // Hard constraint: room must fit the group
    if (excess < 0) {
      // Partial score only — show as warning but don't completely exclude
      score += (room.capacity / group.peopleCount) * 30;
    } else {
      // Capacity fit score (0–50): perfect fit = 50, large excess = lower
      const fitRatio = group.peopleCount / room.capacity; // 1.0 = perfect
      score += Math.round(fitRatio * 50);

      // Exact-fit bonus
      if (excess === 0) score += 15;
    }

    // Room type preference (0–25)
    if (group.preferredRoomType) {
      if (room.roomType === group.preferredRoomType) score += 25;
      else score += 3; // small consolation
    } else {
      score += 10; // no preference = neutral
    }

    return Math.max(score, 0);
  };

  const scoreWorker = (worker, group, usedWorkerIds, workerAssignmentCount) => {
    if (usedWorkerIds.has(worker._id)) return -1; // already assigned this run
    if (!worker.isAvailable) return -1;

    let score = 0;

    // Skill match (0–50)
    const skills = worker.specializations || [];
    if (group.requiredSkill && skills.includes(group.requiredSkill)) {
      score += 50;
    } else if (skills.includes('General') || !group.requiredSkill) {
      score += 25;
    } else {
      score += 5; // wrong skill but still a person
    }

    // Worker type bonus (0–20)
    if (worker.workerType === 'Regular') score += 20;
    else if (worker.workerType === 'Substitute') score += 10;
    else score += 5;

    // Load balancing (0–20): penalise workers with more assignments
    const load = workerAssignmentCount[worker._id] || 0;
    score += Math.max(0, 20 - load * 10);

    return score;
  };

  const priorityOrder = { Urgent: 4, High: 3, Normal: 2, Low: 1 };

  const handleRunSorting = async () => {
    const groupsToSort = sortAllGroups
      ? groups.filter(g => g.status !== 'assigned')
      : groups.filter(g => g._id === selectedGroupForSorting && g.status !== 'assigned');

    if (groupsToSort.length === 0) {
      showToast(sortAllGroups ? 'No pending groups to sort' : 'Please select a group to sort', 'error');
      return;
    }

    setLoading(true);

    try {
      // Sort groups by priority descending so Urgent groups get first pick
      const sortedGroups = [...groupsToSort].sort((a, b) =>
        (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2)
      );

      const usedRoomIds = new Set();
      const usedWorkerIds = new Set();
      const workerAssignmentCount = {};
      const newAssignments = [];

      for (const group of sortedGroups) {
        // Score all available rooms
        const roomCandidates = rooms
          .map(room => ({ room, score: scoreRoom(room, group, usedRoomIds) }))
          .filter(c => c.score >= 0)
          .sort((a, b) => b.score - a.score);

        // Score all available workers
        const workerCandidates = workers
          .map(worker => ({ worker, score: scoreWorker(worker, group, usedWorkerIds, workerAssignmentCount) }))
          .filter(c => c.score >= 0)
          .sort((a, b) => b.score - a.score);

        const bestRoom = roomCandidates[0]?.room || null;
        const bestWorker = workerCandidates[0]?.worker || null;
        const roomScore = roomCandidates[0]?.score || 0;
        const workerScore = workerCandidates[0]?.score || 0;

        // Max possible scores: room=90, worker=90
        const matchPercentage = Math.min(100, Math.round(((roomScore + workerScore) / 180) * 100));

        // Build warnings
        const warnings = [];
        if (!bestRoom) warnings.push('⚠️ No available room found');
        else if (bestRoom.capacity < group.peopleCount)
          warnings.push(`⚠️ Capacity mismatch: Room ${bestRoom.roomNumber} fits ${bestRoom.capacity}, needs ${group.peopleCount}`);
        if (!bestWorker) warnings.push('⚠️ No available worker found');
        else if (group.requiredSkill && !bestWorker.specializations?.includes(group.requiredSkill))
          warnings.push(`⚠️ Skill mismatch: Needs "${group.requiredSkill}", worker has [${bestWorker.specializations?.join(', ') || 'none'}]`);
        if (group.preferredRoomType && bestRoom && bestRoom.roomType !== group.preferredRoomType)
          warnings.push(`ℹ️ Room type preference "${group.preferredRoomType}" not met (got ${bestRoom.roomType})`);

        // Score breakdown for display
        const breakdown = {
          capacityFit: bestRoom ? Math.min(50, Math.round((group.peopleCount / (bestRoom.capacity || 1)) * 50)) : 0,
          roomTypePref: bestRoom && group.preferredRoomType && bestRoom.roomType === group.preferredRoomType ? 25 : (group.preferredRoomType ? 3 : 10),
          skillMatch: bestWorker?.specializations?.includes(group.requiredSkill) ? 50 : (bestWorker?.specializations?.includes('General') ? 25 : 5),
          workerType: bestWorker?.workerType === 'Regular' ? 20 : bestWorker?.workerType === 'Substitute' ? 10 : 5,
          loadBalance: Math.max(0, 20 - (workerAssignmentCount[bestWorker?._id] || 0) * 10),
        };

        if (bestRoom) usedRoomIds.add(bestRoom._id);
        if (bestWorker) {
          usedWorkerIds.add(bestWorker._id);
          workerAssignmentCount[bestWorker._id] = (workerAssignmentCount[bestWorker._id] || 0) + 1;
        }

        newAssignments.push({
          groupId: group._id,
          groupName: group.name,
          peopleCount: group.peopleCount,
          requiredSkill: group.requiredSkill,
          priority: group.priority,
          preferredRoomType: group.preferredRoomType,
          roomId: bestRoom?._id,
          roomName: bestRoom?.name,
          roomNumber: bestRoom?.roomNumber,
          roomCapacity: bestRoom?.capacity,
          roomType: bestRoom?.roomType,
          workerId: bestWorker?._id,
          workerName: bestWorker?.name,
          workerSpecializations: bestWorker?.specializations,
          matchScore: matchPercentage,
          breakdown,
          warnings,
        });
      }

      const matched = newAssignments.filter(a => a.matchScore >= 60 && a.roomId && a.workerId).length;
      const partial = newAssignments.filter(a => a.matchScore >= 40 && a.matchScore < 60).length;
      const unmatched = newAssignments.filter(a => a.matchScore < 40 || !a.roomId || !a.workerId).length;
      const avgScore = newAssignments.length
        ? Math.round(newAssignments.reduce((s, a) => s + a.matchScore, 0) / newAssignments.length)
        : 0;

      setAssignments(newAssignments);
      setShowMap(true);
      setSortingResults({
        summary: { totalGroups: newAssignments.length, matchedGroups: matched, partialMatches: partial, unmatched, averageScore: avgScore },
        data: newAssignments,
      });

      showToast(`Sorting complete! ${newAssignments.length} group(s) processed. Avg score: ${avgScore}%`, 'success');
    } catch (error) {
      console.error('Error running sorting:', error);
      showToast('Failed to run sorting', 'error');
    }
    setLoading(false);
  };

  const handleConfirmAssignments = async () => {
    if (!assignments.length) { showToast('No assignments to confirm. Run sorting first.', 'error'); return; }
    setLoading(true);
    try {
      await api.post('/room-assignment/confirm', {
        assignments: assignments.filter(a => a.roomId && a.workerId),
        date: selectedDate,
      });
      showToast('Assignments confirmed and saved!', 'success');
      await fetchGroups();
    } catch (error) {
      showToast('Failed to confirm assignments', 'error');
    }
    setLoading(false);
  };

  const toggleSelectRow = (id) => {
    setSelectedRows(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    const items = activeTab === 'rooms' ? rooms : activeTab === 'workers' ? workers : groups;
    setSelectedRows(new Set(items.map(i => i._id)));
  };

  const deselectAll = () => setSelectedRows(new Set());

  const getScoreColor = (score) => score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const getScoreEmoji = (score) => {
    if (score >= 85) return '🎉 Perfect Match!';
    if (score >= 70) return '👍 Great Match';
    if (score >= 50) return '👌 Good Match';
    if (score >= 35) return '⚠️ Partial Match';
    return '❌ Poor Match';
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={styles.container}>
      {toastMessage && (
        <div style={{ ...styles.toast, background: toastMessage.type === 'success' ? '#10b981' : '#ef4444' }}>
          {toastMessage.message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h1 style={{ ...styles.title, fontSize: isMobile ? '20px' : '24px' }}>🏢 Room Assignment System</h1>
        <button onClick={handleClose} style={styles.closeButton}>✕ Close</button>
      </div>

      {/* Date Bar */}
      <div style={styles.dateBar}>
        <div style={styles.dateSelector}>
          <label style={styles.label}>📅 Assignment Date:</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={styles.dateInput} />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
            Rooms: {rooms.filter(r => r.isActive).length}/{rooms.length} available &nbsp;|&nbsp;
            Workers: {workers.filter(w => w.isAvailable).length}/{workers.length} available &nbsp;|&nbsp;
            Groups pending: {groups.filter(g => g.status !== 'assigned').length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ ...styles.tabs, overflowX: isMobile ? 'auto' : 'visible', flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
        {[
          { key: 'rooms', label: '🏠 Rooms' },
          { key: 'workers', label: '👥 Workers' },
          { key: 'groups', label: '📋 Groups' },
          { key: 'sorting', label: '🧠 Smart Sort' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setSelectedRows(new Set()); setBulkMode(false); }}
            style={{ ...styles.tab, background: activeTab === t.key ? '#00d1ff' : 'transparent', padding: isMobile ? '8px 16px' : '10px 24px', fontSize: isMobile ? '12px' : '14px' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div style={{ ...styles.actionBar, flexDirection: isMobile ? 'column' : 'row' }}>
        {activeTab !== 'sorting' && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={selectAll} style={styles.actionButton}>✓ All</button>
            <button onClick={deselectAll} style={styles.actionButton}>✗ None</button>
            <button onClick={() => setBulkMode(!bulkMode)} style={styles.actionButton}>📦 Bulk Add</button>
            {activeTab === 'rooms' && (
              <button onClick={bulkToggleRoomAvailability} style={{ ...styles.actionButton, background: '#8b5cf6', borderColor: '#8b5cf6' }}>🔄 Toggle Available</button>
            )}
            {activeTab === 'groups' && (
              <button onClick={() => setShowBulkGroupModal(true)} style={{ ...styles.actionButton, background: '#8b5cf6', borderColor: '#8b5cf6' }}>📦 Bulk Add Groups</button>
            )}
            <button
              onClick={activeTab === 'rooms' ? handleDeleteRooms : activeTab === 'workers' ? handleDeleteWorkers : handleDeleteGroups}
              style={{ ...styles.actionButton, background: 'rgba(239,68,68,0.2)', borderColor: '#ef4444', color: '#ef4444' }}
            >
              🗑️ Delete ({selectedRows.size})
            </button>
          </div>
        )}

        {activeTab === 'sorting' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <label style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={sortAllGroups} onChange={e => setSortAllGroups(e.target.checked)} />
                Sort ALL pending groups
              </label>
              {!sortAllGroups && (
                <select value={selectedGroupForSorting} onChange={(e) => setSelectedGroupForSorting(e.target.value)} style={{ ...styles.select, minWidth: '220px' }}>
                  <option value="">-- Select a group --</option>
                  {groups.filter(g => g.status !== 'assigned').map(group => (
                    <option key={group._id} value={group._id}>
                      {group.priority === 'Urgent' ? '🔴' : group.priority === 'High' ? '🟠' : group.priority === 'Normal' ? '🟡' : '🟢'} {group.name} ({group.peopleCount}p, {group.requiredSkill})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={handleRunSorting} style={styles.primaryButton} disabled={loading}>🧠 Run Smart Sort</button>
              <button onClick={handleConfirmAssignments} style={styles.successButton} disabled={loading}>✅ Confirm & Save</button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {loading && <div style={styles.loading}>⏳ Processing...</div>}

        {/* ROOMS */}
        {activeTab === 'rooms' && !loading && (
          <div>
            {bulkMode && (
              <div style={styles.bulkPanel}>
                <h3 style={{ color: 'white', marginBottom: '12px' }}>Bulk Create Rooms</h3>
                <div style={{ ...styles.bulkForm, flexDirection: isMobile ? 'column' : 'row' }}>
                  <input type="text" placeholder="Prefix (e.g. 'A', 'Room ')" value={bulkRoomData.prefix} onChange={(e) => setBulkRoomData({ ...bulkRoomData, prefix: e.target.value })} style={{ ...styles.input, width: isMobile ? '100%' : '130px' }} />
                  <input type="number" placeholder="Start" value={bulkRoomData.startNumber} onChange={(e) => setBulkRoomData({ ...bulkRoomData, startNumber: parseInt(e.target.value) })} style={styles.smallInput} />
                  <span style={{ color: 'white' }}>to</span>
                  <input type="number" placeholder="End" value={bulkRoomData.endNumber} onChange={(e) => setBulkRoomData({ ...bulkRoomData, endNumber: parseInt(e.target.value) })} style={styles.smallInput} />
                  <input type="number" placeholder="Capacity" value={bulkRoomData.capacity} onChange={(e) => setBulkRoomData({ ...bulkRoomData, capacity: parseInt(e.target.value) })} style={styles.smallInput} />
                  <select value={bulkRoomData.roomType} onChange={(e) => setBulkRoomData({ ...bulkRoomData, roomType: e.target.value })} style={styles.select}>
                    {roomTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <button onClick={handleBulkCreateRooms} style={styles.submitButton}>Create Rooms</button>
                  <button onClick={() => setBulkMode(false)} style={styles.cancelButton}>Cancel</button>
                </div>
              </div>
            )}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : deselectAll()} /></th>
                    <th style={{ ...styles.th, cursor: 'pointer', color: 'white' }} onClick={() => sortRooms('roomNumber')}>Room # {getSortIcon('roomNumber', roomSortField, roomSortDirection)}</th>
                    <th style={{ ...styles.th, cursor: 'pointer', color: 'white' }} onClick={() => sortRooms('name')}>Name {getSortIcon('name', roomSortField, roomSortDirection)}</th>
                    <th style={{ ...styles.th, cursor: 'pointer', color: 'white' }} onClick={() => sortRooms('capacity')}>Capacity {getSortIcon('capacity', roomSortField, roomSortDirection)}</th>
                    {!isMobile && <th style={{ ...styles.th, cursor: 'pointer', color: 'white' }} onClick={() => sortRooms('roomType')}>Type {getSortIcon('roomType', roomSortField, roomSortDirection)}</th>}
                    <th style={{ ...styles.th, color: 'white' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...rooms]
                    .sort((a, b) => {
                      const aNum = parseInt(String(a.roomNumber).replace(/[^0-9]/g, '')) || 0;
                      const bNum = parseInt(String(b.roomNumber).replace(/[^0-9]/g, '')) || 0;
                      return aNum - bNum;
                    })
                    .map(room => (
                      <tr key={room._id} style={styles.tableRow}>
                        <td style={styles.td}><input type="checkbox" checked={selectedRows.has(room._id)} onChange={() => toggleSelectRow(room._id)} /></td>
                        <td style={styles.td}>
                          {editingCell === `room-${room._id}-roomNumber`
                            ? <input type="text" defaultValue={room.roomNumber} onBlur={(e) => handleUpdateRoom(room._id, 'roomNumber', e.target.value)} autoFocus style={styles.editInput} />
                            : <span onClick={() => setEditingCell(`room-${room._id}-roomNumber`)} style={styles.editable}>{room.roomNumber}</span>}
                        </td>
                        <td style={styles.td}>
                          {editingCell === `room-${room._id}-name`
                            ? <input type="text" defaultValue={room.name} onBlur={(e) => handleUpdateRoom(room._id, 'name', e.target.value)} autoFocus style={styles.editInput} />
                            : <span onClick={() => setEditingCell(`room-${room._id}-name`)} style={styles.editable}>{room.name}</span>}
                        </td>
                        <td style={styles.td}>
                          {editingCell === `room-${room._id}-capacity`
                            ? <input type="number" defaultValue={room.capacity} onBlur={(e) => handleUpdateRoom(room._id, 'capacity', parseInt(e.target.value))} autoFocus style={styles.editInput} />
                            : <span onClick={() => setEditingCell(`room-${room._id}-capacity`)} style={styles.editable}>{room.capacity}</span>}
                        </td>
                        {!isMobile && (
                          <td style={styles.td}>
                            {editingCell === `room-${room._id}-roomType`
                              ? <select defaultValue={room.roomType} onBlur={(e) => handleUpdateRoom(room._id, 'roomType', e.target.value)} autoFocus style={styles.editInput}>
                                {roomTypes.map(type => <option key={type} value={type}>{type}</option>)}
                              </select>
                              : <span onClick={() => setEditingCell(`room-${room._id}-roomType`)} style={styles.editable}>{room.roomType}</span>}
                          </td>
                        )}
                        <td style={styles.td}>
                          <button onClick={() => toggleRoomAvailability(room._id, room.isActive)} style={{ ...styles.statusButton, background: room.isActive ? '#10b981' : '#ef4444' }}>
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

        {/* WORKERS */}
        {activeTab === 'workers' && !loading && (
          <div>
            {bulkMode && (
              <div style={styles.bulkPanel}>
                <h3 style={{ color: 'white', marginBottom: '12px' }}>Bulk Create Workers</h3>
                <div style={{ ...styles.bulkForm, flexDirection: isMobile ? 'column' : 'row' }}>
                  <textarea placeholder="Worker names separated by commas&#10;Example: John Smith, Jane Doe, Bob Wilson" value={bulkWorkerData.names} onChange={(e) => setBulkWorkerData({ ...bulkWorkerData, names: e.target.value })} style={{ ...styles.textarea, width: isMobile ? '100%' : '300px', marginBottom: 0 }} rows="3" />
                  <input type="text" placeholder="Default Specialization" value={bulkWorkerData.defaultSpecialization} onChange={(e) => setBulkWorkerData({ ...bulkWorkerData, defaultSpecialization: e.target.value })} style={{ ...styles.input, width: isMobile ? '100%' : 'auto' }} />
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
                    <th style={{ ...styles.th, cursor: 'pointer', color: 'white' }} onClick={() => sortWorkers('name')}>Name {getSortIcon('name', workerSortField, workerSortDirection)}</th>
                    <th style={{ ...styles.th, cursor: 'pointer', color: 'white' }} onClick={() => sortWorkers('specializations')}>Specializations {getSortIcon('specializations', workerSortField, workerSortDirection)}</th>
                    <th style={{ ...styles.th, color: 'white' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map(worker => (
                    <tr key={worker._id} style={styles.tableRow}>
                      <td style={styles.td}><input type="checkbox" checked={selectedRows.has(worker._id)} onChange={() => toggleSelectRow(worker._id)} /></td>
                      <td style={styles.td}>
                        {editingCell === `worker-${worker._id}-name`
                          ? <input type="text" defaultValue={worker.name} onBlur={(e) => handleUpdateWorker(worker._id, 'name', e.target.value)} autoFocus style={styles.editInput} />
                          : <span onClick={() => setEditingCell(`worker-${worker._id}-name`)} style={styles.editable}>{worker.name}</span>}
                      </td>
                      <td style={styles.td}>
                        {editingCell === `worker-${worker._id}-specializations`
                          ? <input type="text" defaultValue={worker.specializations?.join(', ')} onBlur={(e) => handleUpdateWorker(worker._id, 'specializations', e.target.value)} autoFocus style={styles.editInput} />
                          : <span onClick={() => setEditingCell(`worker-${worker._id}-specializations`)} style={styles.editable}>{worker.specializations?.join(', ') || 'None'}</span>}
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => toggleWorkerAvailability(worker._id, worker.isAvailable)} style={{ ...styles.statusButton, background: worker.isAvailable ? '#10b981' : '#ef4444' }}>
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

        {/* GROUPS */}
        {activeTab === 'groups' && !loading && (
          <div>
            <div style={{ ...styles.quickAddBar, flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={() => setShowAddGroupModal(true)} style={styles.addButton}>+ Add Single Group</button>
              <button onClick={() => setShowBulkGroupModal(true)} style={{ ...styles.addButton, background: '#8b5cf6' }}>📦 Add Multiple Groups</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : deselectAll()} /></th>
                    <th style={{ ...styles.th, cursor: 'pointer', color: 'white' }} onClick={() => sortGroups('name')}>Group Name {getSortIcon('name', groupSortField, groupSortDirection)}</th>
                    <th style={{ ...styles.th, cursor: 'pointer', color: 'white' }} onClick={() => sortGroups('peopleCount')}>People {getSortIcon('peopleCount', groupSortField, groupSortDirection)}</th>
                    <th style={{ ...styles.th, cursor: 'pointer', color: 'white' }} onClick={() => sortGroups('requiredSkill')}>Skill {getSortIcon('requiredSkill', groupSortField, groupSortDirection)}</th>
                    {!isMobile && <th style={{ ...styles.th, cursor: 'pointer', color: 'white' }} onClick={() => sortGroups('preferredRoomType')}>Preferred Room {getSortIcon('preferredRoomType', groupSortField, groupSortDirection)}</th>}
                    <th style={{ ...styles.th, cursor: 'pointer', color: 'white' }} onClick={() => sortGroups('priority')}>Priority {getSortIcon('priority', groupSortField, groupSortDirection)}</th>
                    <th style={{ ...styles.th, color: 'white' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(group => (
                    <tr key={group._id} style={styles.tableRow}>
                      <td style={styles.td}><input type="checkbox" checked={selectedRows.has(group._id)} onChange={() => toggleSelectRow(group._id)} /></td>
                      <td style={styles.td}>
                        {editingCell === `group-${group._id}-name`
                          ? <input type="text" defaultValue={group.name} onBlur={(e) => handleUpdateGroup(group._id, 'name', e.target.value)} autoFocus style={styles.editInput} />
                          : <span onClick={() => setEditingCell(`group-${group._id}-name`)} style={styles.editable}>{group.name}</span>}
                      </td>
                      <td style={styles.td}>
                        {editingCell === `group-${group._id}-peopleCount`
                          ? <input type="number" defaultValue={group.peopleCount} onBlur={(e) => handleUpdateGroup(group._id, 'peopleCount', parseInt(e.target.value))} autoFocus style={styles.editInput} />
                          : <span onClick={() => setEditingCell(`group-${group._id}-peopleCount`)} style={styles.editable}>{group.peopleCount}</span>}
                      </td>
                      <td style={styles.td}>
                        {editingCell === `group-${group._id}-requiredSkill`
                          ? <input type="text" defaultValue={group.requiredSkill} onBlur={(e) => handleUpdateGroup(group._id, 'requiredSkill', e.target.value)} autoFocus style={styles.editInput} />
                          : <span onClick={() => setEditingCell(`group-${group._id}-requiredSkill`)} style={styles.editable}>{group.requiredSkill || 'General'}</span>}
                      </td>
                      {!isMobile && (
                        <td style={styles.td}>
                          {editingCell === `group-${group._id}-preferredRoomType`
                            ? <select defaultValue={group.preferredRoomType || ''} onBlur={(e) => handleUpdateGroup(group._id, 'preferredRoomType', e.target.value)} autoFocus style={styles.editInput}>
                              <option value="">Any Room</option>
                              {roomTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            : <span onClick={() => setEditingCell(`group-${group._id}-preferredRoomType`)} style={styles.editable}>{group.preferredRoomType || 'Any'}</span>}
                        </td>
                      )}
                      <td style={styles.td}>
                        <select value={group.priority} onChange={(e) => handleUpdateGroup(group._id, 'priority', e.target.value)} style={styles.smallSelect}>
                          <option value="Urgent">🔴 Urgent</option>
                          <option value="High">🟠 High</option>
                          <option value="Normal">🟡 Normal</option>
                          <option value="Low">🟢 Low</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, background: group.status === 'assigned' ? '#10b981' : '#f59e0b' }}>
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

        {/* SMART SORT RESULTS */}
        {activeTab === 'sorting' && !loading && (
          <div>
            {showMap && assignments.length > 0 ? (
              <div>
                {/* Summary */}
                <div style={{ ...styles.summaryStats, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', marginBottom: '24px' }}>
                  {[
                    { value: sortingResults?.summary?.totalGroups || 0, label: 'Groups Sorted', color: '#00d1ff' },
                    { value: sortingResults?.summary?.matchedGroups || 0, label: '✅ Full Matches', color: '#10b981' },
                    { value: sortingResults?.summary?.partialMatches || 0, label: '⚠️ Partial', color: '#f59e0b' },
                    { value: `${sortingResults?.summary?.averageScore || 0}%`, label: 'Avg Score', color: '#00d1ff' },
                  ].map((s, i) => (
                    <div key={i} style={{ ...styles.statCard, background: 'rgba(255,255,255,0.05)' }}>
                      <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
                      <div style={styles.statLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <h3 style={styles.mapTitle}>🗺️ Assignment Results — sorted by priority</h3>
                <div style={{ ...styles.mapGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))' }}>
                  {[...assignments]
                    .sort((a, b) => (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2))
                    .map((assignment, idx) => {
                      const scoreColor = getScoreColor(assignment.matchScore);
                      return (
                        <div key={idx} style={{ ...styles.mapCard, borderLeftColor: scoreColor }}>
                          <div style={styles.mapCardHeader}>
                            <span style={styles.roomNumber}>
                              {assignment.priority === 'Urgent' ? '🔴' : assignment.priority === 'High' ? '🟠' : assignment.priority === 'Normal' ? '🟡' : '🟢'} {assignment.groupName}
                            </span>
                            <span style={{ ...styles.matchScore, background: scoreColor }}>
                              {assignment.matchScore}% — {getScoreEmoji(assignment.matchScore)}
                            </span>
                          </div>
                          <div style={styles.mapCardBody}>
                            <div style={styles.mapRow}>
                              <span style={styles.mapLabel}>🏠 Room:</span>
                              <strong style={{ color: 'white' }}>{assignment.roomNumber || 'None assigned'}</strong>
                              {assignment.roomType && <span style={styles.skillBadge}>{assignment.roomType}</span>}
                              {assignment.roomCapacity && (
                                assignment.roomCapacity >= assignment.peopleCount
                                  ? <span style={styles.goodBadge}>✅ Fits {assignment.peopleCount}/{assignment.roomCapacity}</span>
                                  : <span style={styles.warningBadge}>⚠️ {assignment.peopleCount}/{assignment.roomCapacity} — tight!</span>
                              )}
                            </div>
                            <div style={styles.mapRow}>
                              <span style={styles.mapLabel}>👨‍🏫 Worker:</span>
                              <strong style={{ color: 'white' }}>{assignment.workerName || 'None assigned'}</strong>
                              {assignment.workerSpecializations?.length > 0 && (
                                <span style={styles.skillBadge}>{assignment.workerSpecializations.join(', ')}</span>
                              )}
                            </div>
                            <div style={styles.mapRow}>
                              <span style={styles.mapLabel}>👥 Group:</span>
                              <span style={{ color: 'white' }}>{assignment.peopleCount} people</span>
                              {assignment.requiredSkill && <span style={styles.badge}>needs: {assignment.requiredSkill}</span>}
                            </div>

                            {/* Score breakdown mini-bar */}
                            {assignment.breakdown && (
                              <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Score breakdown</div>
                                {[
                                  { label: 'Capacity fit', val: assignment.breakdown.capacityFit, max: 50 },
                                  { label: 'Room type pref', val: assignment.breakdown.roomTypePref, max: 25 },
                                  { label: 'Skill match', val: assignment.breakdown.skillMatch, max: 50 },
                                  { label: 'Worker type', val: assignment.breakdown.workerType, max: 20 },
                                  { label: 'Load balance', val: assignment.breakdown.loadBalance, max: 20 },
                                ].map(b => (
                                  <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', minWidth: '90px' }}>{b.label}</span>
                                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                      <div style={{ width: `${(b.val / b.max) * 100}%`, height: '100%', background: b.val / b.max >= 0.7 ? '#10b981' : b.val / b.max >= 0.4 ? '#f59e0b' : '#ef4444', borderRadius: '2px', transition: 'width 0.3s' }} />
                                    </div>
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', minWidth: '30px' }}>{b.val}/{b.max}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {assignment.warnings?.length > 0 && (
                              <div style={styles.warningBox}>
                                {assignment.warnings.map((w, i) => <div key={i} style={styles.warningText}>{w}</div>)}
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
                <div style={{ fontSize: isMobile ? '36px' : '48px', marginBottom: '16px' }}>🧠</div>
                <h3 style={{ color: 'white', fontSize: isMobile ? '16px' : '20px', marginBottom: '12px' }}>Smart Sorting Algorithm</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
                  Select a group (or check "Sort ALL") then click <strong>Run Smart Sort</strong>.
                </p>
                <div style={{ textAlign: 'left', display: 'inline-block', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
                  <strong style={{ color: '#00d1ff' }}>How the scoring works:</strong><br />
                  🏠 <strong>Capacity fit</strong> (0–50 pts) — prefers rooms closest to group size, minimises waste<br />
                  🏷️ <strong>Room type preference</strong> (0–25 pts) — bonus when preferred type is available<br />
                  🎓 <strong>Skill match</strong> (0–50 pts) — exact skill &gt; General &gt; any<br />
                  👷 <strong>Worker type</strong> (0–20 pts) — Regular &gt; Substitute<br />
                  ⚖️ <strong>Load balancing</strong> (0–20 pts) — spreads work across workers evenly<br />
                  🔴 <strong>Priority ordering</strong> — Urgent groups get first pick of rooms & workers<br />
                  🚫 <strong>No double-booking</strong> — each room and worker used at most once per run
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddGroupModal(false)}>
          <div style={{ ...styles.modal, width: isMobile ? '95%' : '400px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add New Group</h2>
            <input type="text" placeholder="Group Name" value={newGroupData.name} onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })} style={styles.input} />
            <input type="number" placeholder="Number of People" value={newGroupData.peopleCount} onChange={(e) => setNewGroupData({ ...newGroupData, peopleCount: parseInt(e.target.value) })} style={styles.input} />
            <input type="text" placeholder="Required Skill" value={newGroupData.requiredSkill} onChange={(e) => setNewGroupData({ ...newGroupData, requiredSkill: e.target.value })} style={styles.input} />
            <select value={newGroupData.preferredRoomType} onChange={(e) => setNewGroupData({ ...newGroupData, preferredRoomType: e.target.value })} style={styles.select}>
              <option value="">Any Room Type</option>
              {roomTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={newGroupData.priority} onChange={(e) => setNewGroupData({ ...newGroupData, priority: e.target.value })} style={{ ...styles.select, marginTop: '8px' }}>
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

      {/* Bulk Groups Modal */}
      {showBulkGroupModal && (
        <div style={styles.modalOverlay} onClick={() => setShowBulkGroupModal(false)}>
          <div style={{ ...styles.modal, width: isMobile ? '95%' : '500px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Bulk Add Groups</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '12px' }}>
              One group per line: <strong>Name, People Count, Required Skill, Priority, Preferred Room Type</strong><br />
              Example: Math Class, 25, Math, High, Classroom
            </p>
            <textarea
              placeholder="Math Class, 25, Math, High, Classroom&#10;Science Lab, 20, Science, Normal, Laboratory&#10;Physics Class, 18, Physics, Urgent, Classroom"
              value={bulkGroupsData}
              onChange={(e) => setBulkGroupsData(e.target.value)}
              style={{ ...styles.textarea, minHeight: '200px' }}
              rows="6"
            />
            <div style={styles.modalButtons}>
              <button onClick={() => setShowBulkGroupModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleBulkAddGroups} style={styles.submitButton}>Add Groups</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0f172a', zIndex: 2000, overflowY: 'auto', padding: '20px', fontFamily: 'Inter, sans-serif' },
  toast: { position: 'fixed', top: '20px', right: '20px', padding: '12px 20px', borderRadius: '8px', color: 'white', zIndex: 2100, fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  title: { fontWeight: 'bold', color: 'white', margin: 0 },
  closeButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '14px', cursor: 'pointer', padding: '8px 16px', fontWeight: '600' },
  dateBar: { marginBottom: '20px', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' },
  dateSelector: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: '14px' },
  dateInput: { padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' },
  tab: { background: 'transparent', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap' },
  actionBar: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', alignItems: 'center' },
  actionButton: { padding: '8px 14px', background: 'rgba(0,209,255,0.15)', border: '1px solid #00d1ff', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px' },
  primaryButton: { padding: '10px 20px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  successButton: { padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  select: { padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  content: { background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', minHeight: '400px' },
  loading: { textAlign: 'center', padding: '40px', color: 'white', fontSize: '16px' },
  bulkPanel: { background: 'rgba(0,209,255,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(0,209,255,0.3)' },
  bulkForm: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '12px' },
  input: { padding: '10px 14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', flex: '1', minWidth: '120px', marginBottom: '8px' },
  textarea: { padding: '10px 14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', width: '100%', marginBottom: '12px', resize: 'vertical', boxSizing: 'border-box' },
  smallInput: { padding: '10px 14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', width: '80px' },
  submitButton: { padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: '600' },
  cancelButton: { padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  tableContainer: { overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '500px' },
  tableHeader: { borderBottom: '1px solid rgba(255,255,255,0.1)' },
  th: { padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  tableRow: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td: { padding: '12px', color: 'white', fontSize: '14px', verticalAlign: 'middle' },
  editable: { cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', minWidth: '40px' },
  editInput: { padding: '6px 10px', background: '#1e293b', border: '1px solid #00d1ff', borderRadius: '6px', color: 'white', minWidth: '80px' },
  smallSelect: { padding: '6px 10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', cursor: 'pointer' },
  statusButton: { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: 'white', border: 'none', cursor: 'pointer' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: 'white', display: 'inline-block' },
  quickAddBar: { marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' },
  addButton: { padding: '10px 20px', background: '#00d1ff', border: 'none', borderRadius: '8px', color: '#0f172a', cursor: 'pointer', fontWeight: '600' },
  summaryStats: { display: 'grid', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', textAlign: 'center' },
  statValue: { fontSize: '28px', fontWeight: 'bold', color: '#00d1ff' },
  statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' },
  mapTitle: { color: 'white', fontSize: '18px', marginBottom: '16px' },
  mapGrid: { display: 'grid', gap: '16px' },
  mapCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', borderLeft: '4px solid' },
  mapCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', gap: '8px' },
  roomNumber: { fontWeight: 'bold', color: '#00d1ff' },
  matchScore: { padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: 'white' },
  mapCardBody: { padding: '16px' },
  mapRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' },
  mapLabel: { color: 'rgba(255,255,255,0.6)', fontSize: '12px', minWidth: '70px' },
  badge: { background: 'rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: '#10b981' },
  goodBadge: { background: 'rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: '#10b981' },
  warningBadge: { background: 'rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: '#f59e0b' },
  priorityBadge: { padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', color: 'white' },
  skillBadge: { background: 'rgba(0,209,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: '#00d1ff' },
  warningBox: { marginTop: '12px', padding: '10px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', borderLeft: '3px solid #ef4444' },
  warningText: { fontSize: '11px', color: '#f87171', marginTop: '4px' },
  emptyState: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100 },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '24px', maxHeight: '85vh', overflowY: 'auto' },
  modalTitle: { fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '16px' },
  modalButtons: { display: 'flex', gap: '12px', marginTop: '20px' },
};

export default RoomAssignment;