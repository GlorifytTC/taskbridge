import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomAssignment = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('rooms');
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

  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  // Fetch all data
  const fetchRooms = async () => {
    try {
      const res = await api.get('/room-assignment/rooms');
      setRooms(res.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/room-assignment/workers');
      setWorkers(res.data.data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/room-assignment/groups');
      setGroups(res.data.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await api.get('/room-assignment/shifts');
      setShifts(res.data.data || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchWorkers();
    fetchGroups();
    fetchShifts();
  }, []);

  // ============ SHIFT FUNCTIONS ============
  const handleSaveShift = async () => {
    if (!newShift.name) {
      alert('Please enter shift name');
      return;
    }
    setLoading(true);
    try {
      await api.post('/room-assignment/shifts', newShift);
      await fetchShifts();
      setShowShiftModal(false);
      setNewShift({ name: '', startTime: '08:00', endTime: '17:00', color: '#00d1ff' });
      alert('Shift saved successfully');
    } catch (error) {
      console.error('Error saving shift:', error);
      alert('Failed to save shift');
    }
    setLoading(false);
  };

  const handleDeleteShift = async (shiftId) => {
    if (!window.confirm('Delete this shift? It will be removed from all workers.')) return;
    setLoading(true);
    try {
      await api.delete(`/room-assignment/shifts/${shiftId}`);
      await fetchShifts();
      alert('Shift deleted');
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert('Failed to delete shift');
    }
    setLoading(false);
  };

  // ============ ROOM FUNCTIONS ============
  const handleBulkCreateRooms = async () => {
    if (bulkRoomData.startNumber > bulkRoomData.endNumber) {
      alert('Start number must be less than end number');
      return;
    }
    setLoading(true);
    try {
      await api.post('/room-assignment/rooms/bulk', bulkRoomData);
      await fetchRooms();
      setBulkMode(false);
      setBulkRoomData({ startNumber: 1, endNumber: 10, capacity: 30, roomType: 'Classroom', prefix: '' });
      alert(`Created rooms ${bulkRoomData.startNumber} to ${bulkRoomData.endNumber}`);
    } catch (error) {
      console.error('Error creating rooms:', error);
      alert('Failed to create rooms');
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
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Failed to update room');
    }
  };

  const handleDeleteRooms = async () => {
    if (selectedRows.size === 0) {
      alert('No rooms selected');
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.size} room(s)? This cannot be undone.`)) return;
    
    setLoading(true);
    try {
      await api.delete('/room-assignment/rooms', { data: { ids: Array.from(selectedRows) } });
      await fetchRooms();
      setSelectedRows(new Set());
      alert('Rooms deleted');
    } catch (error) {
      console.error('Error deleting rooms:', error);
      alert('Failed to delete rooms');
    }
    setLoading(false);
  };

  // ============ WORKER FUNCTIONS ============
  const handleBulkCreateWorkers = async () => {
    if (!bulkWorkerData.names) {
      alert('Enter worker names separated by commas');
      return;
    }
    setLoading(true);
    try {
      await api.post('/room-assignment/workers/bulk', bulkWorkerData);
      await fetchWorkers();
      setBulkMode(false);
      setBulkWorkerData({ names: '', defaultSpecialization: 'General' });
      alert('Workers added successfully');
    } catch (error) {
      console.error('Error creating workers:', error);
      alert('Failed to create workers');
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
    } catch (error) {
      console.error('Error updating worker:', error);
      alert('Failed to update worker');
    }
  };

  const handleDeleteWorkers = async () => {
    if (selectedRows.size === 0) {
      alert('No workers selected');
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.size} worker(s)? This cannot be undone.`)) return;
    
    setLoading(true);
    try {
      await api.delete('/room-assignment/workers', { data: { ids: Array.from(selectedRows) } });
      await fetchWorkers();
      setSelectedRows(new Set());
      alert('Workers deleted');
    } catch (error) {
      console.error('Error deleting workers:', error);
      alert('Failed to delete workers');
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
      alert(`Group "${name}" added`);
    } catch (error) {
      console.error('Error adding group:', error);
      alert('Failed to add group');
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
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Failed to update group');
    }
  };

  const handleDeleteGroups = async () => {
    if (selectedRows.size === 0) {
      alert('No groups selected');
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.size} group(s)? This cannot be undone.`)) return;
    
    setLoading(true);
    try {
      await api.delete('/room-assignment/groups', { data: { ids: Array.from(selectedRows) } });
      await fetchGroups();
      setSelectedRows(new Set());
      alert('Groups deleted');
    } catch (error) {
      console.error('Error deleting groups:', error);
      alert('Failed to delete groups');
    }
    setLoading(false);
  };

  // ============ SORTING FUNCTIONS ============
  const handleRunSorting = async () => {
    setLoading(true);
    try {
      const res = await api.post('/room-assignment/sort', {
        shiftId: selectedShift || null,
        date: selectedDate
      });
      setSortingResults(res.data);
      setAssignments(res.data.data || []);
      setShowMap(true);
      alert(`Sorting complete! ${res.data.summary?.matchedGroups || 0} groups matched`);
    } catch (error) {
      console.error('Error running sorting:', error);
      alert('Failed to run sorting');
    }
    setLoading(false);
  };

  const handleConfirmAssignments = async () => {
    if (!assignments.length) {
      alert('No assignments to confirm. Run sorting first.');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/room-assignment/confirm', {
        assignments,
        date: selectedDate,
        shiftId: selectedShift || null
      });
      alert('Assignments confirmed and saved!');
    } catch (error) {
      console.error('Error confirming assignments:', error);
      alert('Failed to confirm assignments');
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

  // Get status color based on match score
  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={styles.container}>
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
            {/* Bulk Add Mode */}
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

            {/* Rooms Table */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : deselectAll()} /></th>
                    <th style={styles.th}>Room #</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Capacity</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Status</th>
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
                          {room.isActive ? 'Active' : 'Inactive'}
                        </span>
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
            {/* Bulk Add Mode */}
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

            {/* Workers Table */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : deselectAll()} /></th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Specializations</th>
                    <th style={styles.th}>Type</th>
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
            {/* Add Group Button */}
            <div style={styles.quickAddBar}>
              <button onClick={handleQuickAddGroup} style={styles.addButton}>+ Quick Add Group</button>
            </div>

            {/* Groups Table */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : deselectAll()} /></th>
                    <th style={styles.th}>Group Name</th>
                    <th style={styles.th}>People</th>
                    <th style={styles.th}>Required Skill</th>
                    <th style={styles.th}>Priority</th>
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
                {/* Summary Stats */}
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
                </div>

                {/* Map View */}
                <h3 style={styles.mapTitle}>🗺️ Room Assignment Map</h3>
                <div style={styles.mapGrid}>
                  {assignments.map((assignment, idx) => {
                    const scoreColor = getScoreColor(assignment.matchScore);
                    const hasWarning = assignment.warnings?.length > 0;
                    
                    return (
                      <div key={idx} style={{...styles.mapCard, borderLeftColor: scoreColor}}>
                        <div style={styles.mapCardHeader}>
                          <span style={styles.roomNumber}>🏠 {assignment.roomNumber || assignment.roomName || 'Room'}</span>
                          <span style={{...styles.matchScore, background: scoreColor}}>{assignment.matchScore}%</span>
                        </div>
                        <div style={styles.mapCardBody}>
                          <div style={styles.mapRow}>
                            <span style={styles.mapLabel}>👥 Group:</span>
                            <span>{assignment.groupName}</span>
                            <span style={styles.badge}>{assignment.peopleCount} people</span>
                          </div>
                          <div style={styles.mapRow}>
                            <span style={styles.mapLabel}>👨‍🏫 Worker:</span>
                            <span><strong>{assignment.workerName || 'Not Assigned'}</strong></span>
                            {assignment.workerSpecializations && (
                              <span style={styles.skillBadge}>{assignment.workerSpecializations?.join(', ')}</span>
                            )}
                          </div>
                          <div style={styles.mapRow}>
                            <span style={styles.mapLabel}>📋 Needs:</span>
                            <span>{assignment.requiredSkill || 'General'}</span>
                          </div>
                          {hasWarning && (
                            <div style={styles.warningBox}>
                              {assignment.warnings.map((w, i) => (
                                <div key={i} style={styles.warningText}>⚠️ {w}</div>
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
                <h3>Click "Run Sorting Algorithm" to automatically match groups to rooms and workers</h3>
                <p>The system will find the best available room and worker for each group based on skills, capacity, and availability.</p>
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
    paddingBottom: '12px'
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
    fontSize: '12px'
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
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