import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/roomAssignment.css';

const GroupManagement = ({ user, onNavigate }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    peopleCount: 1,
    requiredSkill: '',
    priority: 'medium',
    preferredRoomType: '',
    startTime: '09:00',
    endTime: '17:00',
    notes: ''
  });
  const [bulkGroups, setBulkGroups] = useState([
    { name: '', peopleCount: 1, requiredSkill: '', priority: 'medium' }
  ]);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });

  const t = {
    en: {
      title: 'Group Management',
      subtitle: 'Create groups that need to be placed in rooms',
      back: 'X',
      addGroup: '+ Add Group',
      bulkAdd: '+ Bulk Add Groups',
      groupName: 'Group Name',
      people: 'People',
      requiredSkill: 'Required Skill',
      priority: 'Priority',
      time: 'Time',
      status: 'Status',
      assignedTo: 'Assigned To',
      actions: 'Actions',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      pending: 'Pending',
      assigned: 'Assigned',
      completed: 'Completed',
      delete: 'Delete',
      addNewGroup: 'Add New Group',
      peopleCount: 'Number of People',
      selectPriority: 'Select Priority',
      preferredRoom: 'Preferred Room Type (Optional)',
      startTime: 'Start Time',
      endTime: 'End Time',
      notes: 'Notes (Optional)',
      cancel: 'Cancel',
      create: 'Create',
      bulkAddTitle: 'Bulk Add Groups',
      addRow: '+ Add Row',
      loading: 'Loading...',
      noGroups: 'No groups found. Click "Add Group" to get started.'
    },
    sv: {
      title: 'Grupphantering',
      subtitle: 'Skapa grupper som behöver placeras i rum',
      back: 'X',
      addGroup: '+ Lägg till grupp',
      bulkAdd: '+ Lägg till grupper i bulk',
      groupName: 'Gruppnamn',
      people: 'Personer',
      requiredSkill: 'Erforderlig kompetens',
      priority: 'Prioritet',
      time: 'Tid',
      status: 'Status',
      assignedTo: 'Tilldelad till',
      actions: 'Åtgärder',
      low: 'Låg',
      medium: 'Medel',
      high: 'Hög',
      urgent: 'Brådskande',
      pending: 'Väntande',
      assigned: 'Tilldelad',
      completed: 'Slutförd',
      delete: 'Radera',
      addNewGroup: 'Lägg till ny grupp',
      peopleCount: 'Antal personer',
      selectPriority: 'Välj prioritet',
      preferredRoom: 'Önskad rumstyp (Valfritt)',
      startTime: 'Starttid',
      endTime: 'Sluttid',
      notes: 'Anteckningar (Valfritt)',
      cancel: 'Avbryt',
      create: 'Skapa',
      bulkAddTitle: 'Lägg till grupper i bulk',
      addRow: '+ Lägg till rad',
      loading: 'Laddar...',
      noGroups: 'Inga grupper hittades. Klicka på "Lägg till grupp" för att börja.'
    }
  };

  const lang = t[language];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroup.name || !newGroup.requiredSkill) {
      alert('Please fill in group name and required skill');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/groups`, newGroup, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewGroup({ name: '', peopleCount: 1, requiredSkill: '', priority: 'medium', preferredRoomType: '', startTime: '09:00', endTime: '17:00', notes: '' });
      fetchGroups();
    } catch (error) {
      console.error('Error adding group:', error);
      alert('Error adding group');
    }
  };

  const handleBulkAdd = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/groups/bulk`, 
        { groups: bulkGroups.filter(g => g.name) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowBulkModal(false);
      setBulkGroups([{ name: '', peopleCount: 1, requiredSkill: '', priority: 'medium' }]);
      fetchGroups();
    } catch (error) {
      console.error('Error bulk adding groups:', error);
      alert('Error adding groups');
    }
  };

  const addBulkRow = () => {
    setBulkGroups([...bulkGroups, { name: '', peopleCount: 1, requiredSkill: '', priority: 'medium' }]);
  };

  const updateBulkRow = (index, field, value) => {
    const updated = [...bulkGroups];
    updated[index][field] = value;
    setBulkGroups(updated);
  };

  const removeBulkRow = (index) => {
    setBulkGroups(bulkGroups.filter((_, i) => i !== index));
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang.delete + ' this group?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'badge-danger';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const getPriorityText = (priority) => {
    switch(priority) {
      case 'urgent': return lang.urgent;
      case 'high': return lang.high;
      case 'medium': return lang.medium;
      default: return lang.low;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'assigned': return 'badge-success';
      case 'completed': return 'badge-info';
      default: return 'badge-warning';
    }
  };

  if (loading) {
    return (
      <div className="room-assignment-container">
        <div className="loading-spinner">{lang.loading}</div>
      </div>
    );
  }

  return (
    <div className="room-assignment-container">
      <div className="header">
        <div className="header-left">
          <button className="back-button" onClick={() => onNavigate('superadmin')}>
            ← {lang.back}
          </button>
          <div>
            <h1>📋 {lang.title}</h1>
            <p className="subtitle">{lang.subtitle}</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-primary" onClick={() => setShowBulkModal(true)}>
            {lang.bulkAdd}
          </button>
          <button className="btn-secondary" onClick={() => setShowAddModal(true)}>
            {lang.addGroup}
          </button>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>{lang.groupName}</th>
              <th>{lang.people}</th>
              <th>{lang.requiredSkill}</th>
              <th>{lang.priority}</th>
              <th>{lang.time}</th>
              <th>{lang.status}</th>
              <th>{lang.assignedTo}</th>
              <th>{lang.actions}</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  {lang.noGroups}
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr key={group._id}>
                  <td>{group.name}</td>
                  <td>{group.peopleCount}</td>
                  <td><span className="skill-tag">{group.requiredSkill}</span></td>
                  <td><span className={`badge ${getPriorityColor(group.priority)}`}>{getPriorityText(group.priority)}</span></td>
                  <td>{group.startTime} - {group.endTime}</td>
                  <td><span className={`badge ${getStatusColor(group.status)}`}>{group.status || lang.pending}</span></td>
                  <td>
                    {group.assignedRoom ? (
                      <span className="badge badge-success">
                        {group.assignedRoom.roomNumber} / {group.assignedWorker?.name || '-'}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <button className="btn-danger" style={{ padding: '4px 12px' }} onClick={() => handleDelete(group._id)}>
                      {lang.delete}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Single Group Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{lang.addNewGroup}</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <input
              type="text"
              placeholder={lang.groupName}
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              className="form-input"
            />
            <input
              type="number"
              placeholder={lang.peopleCount}
              value={newGroup.peopleCount}
              onChange={(e) => setNewGroup({ ...newGroup, peopleCount: parseInt(e.target.value) })}
              className="form-input"
            />
            <input
              type="text"
              placeholder={lang.requiredSkill}
              value={newGroup.requiredSkill}
              onChange={(e) => setNewGroup({ ...newGroup, requiredSkill: e.target.value })}
              className="form-input"
            />
            <select
              value={newGroup.priority}
              onChange={(e) => setNewGroup({ ...newGroup, priority: e.target.value })}
              className="form-select"
            >
              <option value="low">{lang.low}</option>
              <option value="medium">{lang.medium}</option>
              <option value="high">{lang.high}</option>
              <option value="urgent">{lang.urgent}</option>
            </select>
            <input
              type="text"
              placeholder={lang.preferredRoom}
              value={newGroup.preferredRoomType}
              onChange={(e) => setNewGroup({ ...newGroup, preferredRoomType: e.target.value })}
              className="form-input"
            />
            <div className="form-row">
              <input
                type="time"
                value={newGroup.startTime}
                onChange={(e) => setNewGroup({ ...newGroup, startTime: e.target.value })}
                className="form-input"
              />
              <input
                type="time"
                value={newGroup.endTime}
                onChange={(e) => setNewGroup({ ...newGroup, endTime: e.target.value })}
                className="form-input"
              />
            </div>
            <textarea
              placeholder={lang.notes}
              value={newGroup.notes}
              onChange={(e) => setNewGroup({ ...newGroup, notes: e.target.value })}
              className="form-input"
              rows="2"
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddGroup}>
                {lang.create}
              </button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                {lang.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Groups Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{lang.bulkAddTitle}</h2>
              <button className="modal-close" onClick={() => setShowBulkModal(false)}>×</button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {bulkGroups.map((group, idx) => (
                <div key={idx} className="form-row" style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder={lang.groupName}
                    value={group.name}
                    onChange={(e) => updateBulkRow(idx, 'name', e.target.value)}
                    className="form-input"
                    style={{ margin: 0 }}
                  />
                  <input
                    type="number"
                    placeholder={lang.people}
                    value={group.peopleCount}
                    onChange={(e) => updateBulkRow(idx, 'peopleCount', parseInt(e.target.value))}
                    className="form-input"
                    style={{ margin: 0, width: '80px' }}
                  />
                  <input
                    type="text"
                    placeholder={lang.requiredSkill}
                    value={group.requiredSkill}
                    onChange={(e) => updateBulkRow(idx, 'requiredSkill', e.target.value)}
                    className="form-input"
                    style={{ margin: 0 }}
                  />
                  <select
                    value={group.priority}
                    onChange={(e) => updateBulkRow(idx, 'priority', e.target.value)}
                    className="form-select"
                    style={{ margin: 0, width: '100px' }}
                  >
                    <option value="low">{lang.low}</option>
                    <option value="medium">{lang.medium}</option>
                    <option value="high">{lang.high}</option>
                    <option value="urgent">{lang.urgent}</option>
                  </select>
                  <button className="btn-danger" onClick={() => removeBulkRow(idx)} style={{ padding: '8px 12px' }}>✕</button>
                </div>
              ))}
            </div>
            <button className="btn-secondary" onClick={addBulkRow} style={{ marginTop: '12px', width: '100%' }}>
              {lang.addRow}
            </button>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleBulkAdd}>
                {lang.create} ({bulkGroups.filter(g => g.name).length})
              </button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowBulkModal(false)}>
                {lang.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement;