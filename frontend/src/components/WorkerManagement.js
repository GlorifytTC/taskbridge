import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import '../styles/roomAssignment.css';

const WorkerManagement = ({ user, onNavigate }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importPreview, setImportPreview] = useState([]);
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

  const API_URL = process.env.REACT_APP_API_URL || 'https://taskbridge-production-9d91.up.railway.app/api';

  const t = {
    en: {
      title: 'Worker Management',
      subtitle: 'Manage all staff members and their specializations',
      close: '✕',
      addWorker: '+ Add Worker',
      importWorkers: '📁 Import Workers',
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
      importWorkersTitle: 'Import Workers from File',
      downloadTemplate: 'Download Template',
      uploadFile: 'Upload Excel/CSV File',
      dragDrop: 'Drag and drop or click to upload',
      preview: 'Preview',
      import: 'Import',
      fullName: 'Full Name',
      addSkill: 'Add',
      skillPlaceholder: 'Add Specialization (e.g., Math, Science)',
      cancel: 'Cancel',
      create: 'Create',
      loading: 'Loading...',
      noWorkers: 'No workers found. Click "Add Worker" or "Import Workers" to get started.',
      error: 'Error loading workers. Please try again.',
      selectFile: 'Please select a file first',
      importSuccess: 'Successfully imported {count} workers',
      templateColumns: 'Excel Format: Name | Email | Specializations | WorkerType | Available'
    },
    sv: {
      title: 'Arbetarhantering',
      subtitle: 'Hantera all personal och deras specialiseringar',
      close: '✕',
      addWorker: '+ Lägg till arbetare',
      importWorkers: '📁 Importera arbetare',
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
      importWorkersTitle: 'Importera arbetare från fil',
      downloadTemplate: 'Ladda ner mall',
      uploadFile: 'Ladda upp Excel/CSV fil',
      dragDrop: 'Dra och släpp eller klicka för att ladda upp',
      preview: 'Förhandsgranska',
      import: 'Importera',
      fullName: 'Fullständigt namn',
      addSkill: 'Lägg till',
      skillPlaceholder: 'Lägg till specialisering (t.ex. Matematik, Naturkunskap)',
      cancel: 'Avbryt',
      create: 'Skapa',
      loading: 'Laddar...',
      noWorkers: 'Inga arbetare hittades. Klicka på "Lägg till arbetare" eller "Importera arbetare" för att börja.',
      error: 'Fel vid laddning av arbetare. Försök igen.',
      selectFile: 'Vänligen välj en fil först',
      importSuccess: '{count} arbetare importerades',
      templateColumns: 'Excel Format: Namn | E-post | Specialiseringar | Typ | Tillgänglig'
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
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`${API_URL}/workers`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      if (response.data && response.data.success) {
        setWorkers(response.data.data || []);
      } else {
        setWorkers([]);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
      let errorMessage = lang.error;
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection.';
      } else if (err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else {
        errorMessage = err.message || lang.error;
      }
      
      setError(errorMessage);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      // Map the data to worker format
      const mappedData = jsonData.map(row => ({
        name: row.Name || row.name || '',
        email: row.Email || row.email || '',
        specializations: row.Specializations || row.specializations ? 
          (row.Specializations || row.specializations).split(',').map(s => s.trim()) : [],
        workerType: (row.WorkerType || row.workerType || 'regular').toLowerCase(),
        isAvailable: (row.Available || row.available) === 'Yes' || (row.Available || row.available) === true
      })).filter(w => w.name && w.email);
      
      setImportPreview(mappedData.slice(0, 10));
      setImportData(mappedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      { Name: 'John Doe', Email: 'john@example.com', Specializations: 'Math,Science', WorkerType: 'regular', Available: 'Yes' },
      { Name: 'Jane Smith', Email: 'jane@example.com', Specializations: 'Physics,Chemistry', WorkerType: 'regular', Available: 'Yes' },
      { Name: 'Bob Johnson', Email: 'bob@example.com', Specializations: 'Biology', WorkerType: 'substitute', Available: 'No' }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Workers');
    XLSX.writeFile(wb, 'worker_template.xlsx');
  };

  const handleImportWorkers = async () => {
    if (importData.length === 0) {
      alert(lang.selectFile);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      let successCount = 0;
      let errorCount = 0;
      
      for (const worker of importData) {
        try {
          await axios.post(`${API_URL}/workers`, worker, {
            headers: { Authorization: `Bearer ${token}` }
          });
          successCount++;
        } catch (err) {
          console.error('Error importing worker:', worker.name, err);
          errorCount++;
        }
      }
      
      alert(lang.importSuccess.replace('{count}', successCount) + (errorCount > 0 ? ` (${errorCount} failed)` : ''));
      setShowImportModal(false);
      setImportData([]);
      setImportPreview([]);
      fetchWorkers();
    } catch (error) {
      console.error('Error importing workers:', error);
      alert('Error importing workers: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddWorker = async () => {
    if (!newWorker.name || !newWorker.email) {
      alert('Please fill in name and email');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/workers`, newWorker, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setShowAddModal(false);
        setNewWorker({ name: '', email: '', specializations: [], workerType: 'regular', isAvailable: true });
        fetchWorkers();
        alert('Worker added successfully!');
      } else {
        alert('Error adding worker: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding worker:', error);
      alert('Error adding worker: ' + (error.response?.data?.message || error.message));
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
      alert('Error updating worker: ' + (error.response?.data?.message || error.message));
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
      alert('Error deleting worker: ' + (error.response?.data?.message || error.message));
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
      alert('Error updating availabilities: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleSelectAll = () => {
    const allSelected = workers.every(w => w.selected);
    setWorkers(workers.map(w => ({ ...w, selected: !allSelected })));
  };

  const toggleSelect = (id) => {
    setWorkers(workers.map(w => w._id === id ? { ...w, selected: !w.selected } : w));
  };

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
          <button className="close-button" onClick={() => onNavigate('superadmin')}>
            {lang.close}
          </button>
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
          <button className="close-button" onClick={() => onNavigate('superadmin')}>
            {lang.close}
          </button>
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
            <button className="btn-primary" onClick={() => setShowImportModal(true)} style={{ background: '#8b5cf6' }}>
              {lang.importWorkers}
            </button>
            <button className="btn-secondary" onClick={() => setShowAddModal(true)}>
              {lang.addWorker}
            </button>
          </div>
          <button className="close-button" onClick={() => onNavigate('superadmin')}>
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

      {/* Import Workers Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{lang.importWorkersTitle}</h2>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>×</button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <button className="btn-secondary" onClick={downloadTemplate} style={{ marginBottom: '16px' }}>
                📥 {lang.downloadTemplate}
              </button>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '16px' }}>
                {lang.templateColumns}
              </p>
              
              <div style={{
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)'
              }}>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                  <p style={{ color: 'white', marginBottom: '8px' }}>{lang.uploadFile}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{lang.dragDrop}</p>
                </label>
              </div>
            </div>

            {importPreview.length > 0 && (
              <>
                <h3 style={{ color: 'white', marginBottom: '12px' }}>{lang.preview} (First 10 rows)</h3>
                <div className="data-table" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table style={{ fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>{lang.name}</th>
                        <th>{lang.email}</th>
                        <th>{lang.specializations}</th>
                        <th>{lang.workerType}</th>
                        <th>{lang.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((worker, idx) => (
                        <tr key={idx}>
                          <td>{worker.name}</td>
                          <td>{worker.email}</td>
                          <td>{worker.specializations?.join(', ')}</td>
                          <td>
                            <span className={`badge ${worker.workerType === 'regular' ? 'badge-success' : 'badge-warning'}`}>
                              {worker.workerType === 'regular' ? lang.regular : lang.substitute}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${worker.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                              {worker.isAvailable ? lang.available : lang.unavailable}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={handleImportWorkers}>
                    {lang.import} ({importData.length} workers)
                  </button>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowImportModal(false)}>
                    {lang.cancel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;