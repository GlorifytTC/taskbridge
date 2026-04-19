import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/roomAssignment.css';

const RoomManagement = ({ user, onNavigate }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState({
    startNumber: 1,
    endNumber: 10,
    prefix: '',
    capacity: 30,
    roomType: 'Classroom'
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });

  const API_URL = process.env.REACT_APP_API_URL;

  const t = {
    en: {
      title: 'Room Management',
      subtitle: 'Manage all physical spaces in your organization',
      close: '✕',
      bulkCreate: '+ Bulk Create Rooms',
      setCapacity: 'Set Capacity for Selected',
      roomNumber: 'Room #',
      roomName: 'Room Name',
      capacity: 'Capacity',
      roomType: 'Room Type',
      status: 'Status',
      available: 'Available',
      unavailable: 'Unavailable',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      createRooms: 'Create Rooms',
      startNumber: 'Start Number',
      endNumber: 'End Number',
      prefix: 'Prefix (e.g., A, Room )',
      selectRoomType: 'Select Room Type',
      classroom: 'Classroom',
      laboratory: 'Laboratory',
      medical: 'Medical',
      office: 'Office',
      factory: 'Factory',
      conference: 'Conference',
      loading: 'Loading...',
      noRooms: 'No rooms found. Click "Bulk Create Rooms" to get started.'
    },
    sv: {
      title: 'Rumshantering',
      subtitle: 'Hantera alla fysiska utrymmen i din organisation',
      close: '✕',
      bulkCreate: '+ Skapa rum i bulk',
      setCapacity: 'Ange kapacitet för valda',
      roomNumber: 'Rum #',
      roomName: 'Rumsnamn',
      capacity: 'Kapacitet',
      roomType: 'Rumstyp',
      status: 'Status',
      available: 'Tillgänglig',
      unavailable: 'Inte tillgänglig',
      actions: 'Åtgärder',
      edit: 'Redigera',
      delete: 'Radera',
      save: 'Spara',
      cancel: 'Avbryt',
      createRooms: 'Skapa rum',
      startNumber: 'Startnummer',
      endNumber: 'Slutnummer',
      prefix: 'Prefix (t.ex. A, Rum )',
      selectRoomType: 'Välj rumstyp',
      classroom: 'Klassrum',
      laboratory: 'Laboratorium',
      medical: 'Medicinskt',
      office: 'Kontor',
      factory: 'Fabrik',
      conference: 'Konferens',
      loading: 'Laddar...',
      noRooms: 'Inga rum hittades. Klicka på "Skapa rum i bulk" för att börja.'
    }
  };

  const lang = t[language];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Removed duplicate /api
      const res = await axios.get(`${API_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert('Error fetching rooms: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Removed duplicate /api
      await axios.post(`${API_URL}/rooms/bulk`, bulkData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowBulkModal(false);
      fetchRooms();
      alert('Rooms created successfully!');
    } catch (error) {
      console.error('Error bulk creating rooms:', error);
      alert('Error creating rooms: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Removed duplicate /api
      await axios.put(`${API_URL}/rooms/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      fetchRooms();
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Error updating room: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang.delete + ' this room?')) return;
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Removed duplicate /api
      await axios.delete(`${API_URL}/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Error deleting room: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleBulkCapacity = async () => {
    const newCapacity = prompt('Enter new capacity for all selected rooms:');
    if (!newCapacity) return;
    
    const selectedRooms = rooms.filter(r => r.selected).map(r => r._id);
    if (selectedRooms.length === 0) {
      alert('Select at least one room first');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Removed duplicate /api
      await axios.put(`${API_URL}/rooms/bulk/capacity`, 
        { capacity: parseInt(newCapacity), roomIds: selectedRooms },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRooms();
      alert('Capacities updated successfully!');
    } catch (error) {
      console.error('Error updating capacities:', error);
      alert('Error updating capacities: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleSelectAll = () => {
    const allSelected = rooms.every(r => r.selected);
    setRooms(rooms.map(r => ({ ...r, selected: !allSelected })));
  };

  const toggleSelect = (id) => {
    setRooms(rooms.map(r => r._id === id ? { ...r, selected: !r.selected } : r));
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
          <div>
            <h1>🏠 {lang.title}</h1>
            <p className="subtitle">{lang.subtitle}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="action-buttons">
            <button className="btn-primary" onClick={() => setShowBulkModal(true)}>
              {lang.bulkCreate}
            </button>
            <button className="btn-secondary" onClick={handleBulkCapacity}>
              {lang.setCapacity}
            </button>
          </div>
          <button 
            className="close-button" 
            onClick={() => onNavigate('superadmin')}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '8px 16px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            {lang.close}
          </button>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" onChange={toggleSelectAll} /></th>
              <th>{lang.roomNumber}</th>
              <th>{lang.roomName}</th>
              <th>{lang.capacity}</th>
              <th>{lang.roomType}</th>
              <th>{lang.status}</th>
              <th>{lang.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  {lang.noRooms}
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={room.selected || false}
                      onChange={() => toggleSelect(room._id)}
                    />
                  </td>
                  <td>
                    {editingId === room._id ? (
                      <input
                        type="text"
                        value={editData.roomNumber || room.roomNumber}
                        onChange={(e) => setEditData({ ...editData, roomNumber: e.target.value })}
                        className="form-input"
                        style={{ margin: 0, width: '100px' }}
                      />
                    ) : (
                      room.roomNumber
                    )}
                  </td>
                  <td>
                    {editingId === room._id ? (
                      <input
                        type="text"
                        value={editData.name || room.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="form-input"
                        style={{ margin: 0 }}
                      />
                    ) : (
                      room.name || '-'
                    )}
                  </td>
                  <td>
                    {editingId === room._id ? (
                      <input
                        type="number"
                        value={editData.capacity || room.capacity}
                        onChange={(e) => setEditData({ ...editData, capacity: parseInt(e.target.value) })}
                        className="form-input"
                        style={{ margin: 0, width: '80px' }}
                      />
                    ) : (
                      room.capacity
                    )}
                  </td>
                  <td>
                    {editingId === room._id ? (
                      <select
                        value={editData.type || room.type}
                        onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                        className="form-select"
                        style={{ margin: 0 }}
                      >
                        <option value="Classroom">{lang.classroom}</option>
                        <option value="Laboratory">{lang.laboratory}</option>
                        <option value="Medical">{lang.medical}</option>
                        <option value="Office">{lang.office}</option>
                        <option value="Factory">{lang.factory}</option>
                        <option value="Conference">{lang.conference}</option>
                      </select>
                    ) : (
                      <span className="badge badge-info">{room.type}</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${room.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                      {room.isAvailable ? lang.available : lang.unavailable}
                    </span>
                  </td>
                  <td>
                    {editingId === room._id ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-success" onClick={() => handleUpdate(room._id)}>{lang.save}</button>
                        <button className="btn-warning" onClick={() => setEditingId(null)}>{lang.cancel}</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" style={{ padding: '4px 12px' }} onClick={() => { setEditingId(room._id); setEditData({}); }}>{lang.edit}</button>
                        <button className="btn-danger" style={{ padding: '4px 12px' }} onClick={() => handleDelete(room._id)}>{lang.delete}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Create Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{lang.bulkCreate}</h2>
              <button className="modal-close" onClick={() => setShowBulkModal(false)}>×</button>
            </div>
            <div className="form-row">
              <input
                type="number"
                placeholder={lang.startNumber}
                value={bulkData.startNumber}
                onChange={(e) => setBulkData({ ...bulkData, startNumber: parseInt(e.target.value) })}
                className="form-input"
              />
              <input
                type="number"
                placeholder={lang.endNumber}
                value={bulkData.endNumber}
                onChange={(e) => setBulkData({ ...bulkData, endNumber: parseInt(e.target.value) })}
                className="form-input"
              />
            </div>
            <input
              type="text"
              placeholder={lang.prefix}
              value={bulkData.prefix}
              onChange={(e) => setBulkData({ ...bulkData, prefix: e.target.value })}
              className="form-input"
            />
            <div className="form-row">
              <input
                type="number"
                placeholder={lang.capacity}
                value={bulkData.capacity}
                onChange={(e) => setBulkData({ ...bulkData, capacity: parseInt(e.target.value) })}
                className="form-input"
              />
              <select
                value={bulkData.roomType}
                onChange={(e) => setBulkData({ ...bulkData, roomType: e.target.value })}
                className="form-select"
              >
                <option value="Classroom">{lang.classroom}</option>
                <option value="Laboratory">{lang.laboratory}</option>
                <option value="Medical">{lang.medical}</option>
                <option value="Office">{lang.office}</option>
                <option value="Factory">{lang.factory}</option>
                <option value="Conference">{lang.conference}</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleBulkCreate}>
                {lang.createRooms} ({bulkData.endNumber - bulkData.startNumber + 1})
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

export default RoomManagement;