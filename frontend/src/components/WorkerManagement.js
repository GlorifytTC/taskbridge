import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/roomAssignment.css';

const WorkerManagement = ({ user, onNavigate }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    email: '',
    specializations: [],
    workerType: 'regular',
    isAvailable: true
  });
  const [skillInput, setSkillInput] = useState('');
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });

  const API_URL = process.env.REACT_APP_API_URL;

  console.log('API_URL:', API_URL);

  const t = {
    en: {
      title: 'Worker Management',
      subtitle: 'Manage all staff members and their specializations',
      close: '✕',
      addWorker: '+ Add Worker',
      bulkAvailability: 'Bulk Update Availability',
      name: 'Name',
      email: 'Email',
      specializations: 'Specializations',
      workerType: 'Type',
      status: 'Status',
      actions: 'Actions',
      available: 'Available',
      unavailable: 'Unavailable',
      regular: 'Regular',
      substitute: 'Substitute',
      delete: 'Delete',
      addNewWorker: 'Add New Worker',
      fullName: 'Full Name',
      addSkill: 'Add',
      skillPlaceholder: 'Add Specialization (e.g., Math, Science)',
      cancel: 'Cancel',
      create: 'Create',
      loading: 'Loading...',
      noWorkers: 'No workers found. Click "Add Worker" to get started.',
      error: 'Error loading workers. Please try again.'
    },
    sv: {
      title: 'Arbetarhantering',
      subtitle: 'Hantera all personal och deras specialiseringar',
      close: '✕',
      addWorker: '+ Lägg till arbetare',
      bulkAvailability: 'Massuppdatera tillgänglighet',
      name: 'Namn',
      email: 'E-post',
      specializations: 'Specialiseringar',
      workerType: 'Typ',
      status: 'Status',
      actions: 'Åtgärder',
      available: 'Tillgänglig',
      unavailable: 'Inte tillgänglig',
      regular: 'Ordinarie',
      substitute: 'Vikarie',
      delete: 'Radera',
      addNewWorker: 'Lägg till ny arbetare',
      fullName: 'Fullständigt namn',
      addSkill: 'Lägg till',
      skillPlaceholder: 'Lägg till specialisering (t.ex. Matematik, Naturkunskap)',
      cancel: 'Avbryt',
      create: 'Skapa',
      loading: 'Laddar...',
      noWorkers: 'Inga arbetare hittades. Klicka på "Lägg till arbetare" för att börja.',
      error: 'Fel vid laddning av arbetare. Försök igen.'
    }
  };

  const lang = t[language];

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching workers from:', `${API_URL}/workers`);
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.error('No token found!');
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      
      const res = await axios.get(`${API_URL}/workers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response status:', res.status);
      console.log('Response data:', res.data);
      
      if (res.data && res.data.data) {
        setWorkers(res.data.data);
      } else {
        setWorkers([]);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = async () => {
    if (!newWorker.name || !newWorker.email) {
      alert('Please fill in name and email');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/workers`, newWorker, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewWorker({ name: '', email: '', specializations: [], workerType: 'regular', isAvailable: true });
      fetchWorkers();
      alert('Worker added successfully!');
    } catch (error) {
      console.error('Error adding worker:', error);
      alert('Error adding worker: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddSkill = () => {
    if (skillInput && !newWorker.specializations.includes(skillInput)) {
      setNewWorker({
        ...newWorker,
        specializations: [...newWorker.specializations, skillInput]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setNewWorker({
      ...newWorker,
      specializations: newWorker.specializations.filter(s => s !== skill)
    });
  };

  const handleToggleAvailability = async (workerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/workers/${workerId}`, 
        { isAvailable: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchWorkers();
    } catch (error) {
      console.error('Error updating worker:', error);
      alert('Error updating worker: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang.delete + ' this worker?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/workers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
      alert('Error deleting worker: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleBulkAvailability = async () => {
    const selectedWorkers = workers.filter(w => w.selected).map(w => w._id);
    if (selectedWorkers.length === 0) {
      alert('Select at least one worker first');
      return;
    }
    
    const newStatus = confirm('Set selected workers as available? Click OK for Available, Cancel for Unavailable');
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/workers/bulk/availability`,
        { workerIds: selectedWorkers, isAvailable: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchWorkers();
      alert('Availability updated successfully!');
    } catch (error) {
      console.error('Error updating availabilities:', error);
      alert('Error updating availabilities: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleSelectAll = () => {
    const allSelected = workers.every(w => w.selected);
    setWorkers(workers.map(w => ({ ...w, selected: !allSelected })));
  };

  const toggleSelect = (id) => {
    setWorkers(workers.map(w => w._id === id ? { ...w, selected: !w.selected } : w));
  };

  // Show error state
  if (error) {
    return (
      <div className="room-assignment-container">
        <div className="header">
          <div className="header-left">
            <div>
              <h1>👥 {lang.title}</h1>
              <p className="subtitle">{lang.subtitle}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                padding: '8px 16px'
              }}
            >
              {lang.close}
            </button>
          </div>
        </div>
        <div className="data-table">
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            <p>❌ {lang.error}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{error}</p>
            <button className="btn-primary" onClick={fetchWorkers} style={{ marginTop: '16px' }}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="room-assignment-container">
        <div className="header">
          <div className="header-left">
            <div>
              <h1>👥 {lang.title}</h1>
              <p className="subtitle">{lang.subtitle}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                padding: '8px 16px'
              }}
            >
              {lang.close}
            </button>
          </div>
        </div>
        <div className="loading-spinner">{lang.loading}</div>
      </div>
    );
  }

  return (
    <div className="room-assignment-container">
      <div className="header">
        <div className="header-left">
          <div>
            <h1>👥 {lang.title}</h1>
            <p className="subtitle">{lang.subtitle}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleBulkAvailability}>
              {lang.bulkAvailability}
            </button>
            <button className="btn-secondary" onClick={() => setShowAddModal(true)}>
              {lang.addWorker}
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
              <th>{lang.name}</th>
              <th>{lang.email}</th>
              <th>{lang.specializations}</th>
              <th>{lang.workerType}</th>
              <th>{lang.status}</th>
              <th>{lang.actions}</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  {lang.noWorkers}
                </td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={worker.selected || false}
                      onChange={() => toggleSelect(worker._id)}
                    />
                  </td>
                  <td>{worker.name}</td>
                  <td>{worker.email}</td>
                  <td>
                      {worker.specializations && worker.specializations.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                  </td>
                  <td>
                    <span className={`badge ${worker.workerType === 'regular' ? 'badge-success' : 'badge-warning'}`}>
                      {worker.workerType === 'regular' ? lang.regular : lang.substitute}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleAvailability(worker._id, worker.isAvailable)}
                      className={`badge ${worker.isAvailable ? 'badge-success' : 'badge-danger'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {worker.isAvailable ? lang.available : lang.unavailable}
                    </button>
                  </td>
                  <td>
                    <button className="btn-danger" style={{ padding: '4px 12px' }} onClick={() => handleDelete(worker._id)}>
                      {lang.delete}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{lang.addNewWorker}</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <input
              type="text"
              placeholder={lang.fullName}
              value={newWorker.name}
              onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
              className="form-input"
            />
            <input
              type="email"
              placeholder={lang.email}
              value={newWorker.email}
              onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
              className="form-input"
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder={lang.skillPlaceholder}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <button className="btn-secondary" onClick={handleAddSkill}>{lang.addSkill}</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {newWorker.specializations.map(skill => (
                <span key={skill} className="skill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>×</button>
                </span>
              ))}
            </div>
            <select
              value={newWorker.workerType}
              onChange={(e) => setNewWorker({ ...newWorker, workerType: e.target.value })}
              className="form-select"
            >
              <option value="regular">{lang.regular}</option>
              <option value="substitute">{lang.substitute}</option>
            </select>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newWorker.isAvailable}
                onChange={(e) => setNewWorker({ ...newWorker, isAvailable: e.target.checked })}
              />
              {lang.available} for assignments
            </label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddWorker}>
                {lang.create}
              </button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                {lang.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;