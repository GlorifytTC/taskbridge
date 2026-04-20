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
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileColumns, setFileColumns] = useState([]);
  const [rawJsonData, setRawJsonData] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    name: '',
    email: '',
    specializations: '',
    workerType: '',
    available: ''
  });
  const [showColumnMapping, setShowColumnMapping] = useState(false);
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
      downloadTemplate: '📥 Download Excel Template',
      chooseFile: '📂 Choose File',
      uploadAndPreview: 'Upload & Preview',
      clearFile: 'Clear',
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
      templateColumns: 'Excel Format: Name | Email | Specializations | WorkerType | Available',
      fileSelected: 'File selected: {name}',
      processing: 'Processing file...',
      columnMapping: 'Column Mapping',
      mapColumns: 'Please map your Excel columns to the required fields:',
      mapName: 'Name column:',
      mapEmail: 'Email column:',
      mapSpecializations: 'Specializations column:',
      mapWorkerType: 'Worker Type column:',
      mapAvailable: 'Available column:',
      applyMapping: 'Apply Mapping',
      detectedColumns: 'Detected columns in your file:',
      useFirstRowAsHeader: 'Using first row as column headers'
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
      downloadTemplate: '📥 Ladda ner Excel mall',
      chooseFile: '📂 Välj fil',
      uploadAndPreview: 'Ladda upp & förhandsgranska',
      clearFile: 'Rensa',
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
      templateColumns: 'Excel Format: Namn | E-post | Specialiseringar | Typ | Tillgänglig',
      fileSelected: 'Fil vald: {name}',
      processing: 'Bearbetar fil...',
      columnMapping: 'Kolumnmappning',
      mapColumns: 'Vänligen mappa dina Excel-kolumner till de obligatoriska fälten:',
      mapName: 'Namn kolumn:',
      mapEmail: 'E-post kolumn:',
      mapSpecializations: 'Specialiseringar kolumn:',
      mapWorkerType: 'Typ kolumn:',
      mapAvailable: 'Tillgänglig kolumn:',
      applyMapping: 'Tillämpa mappning',
      detectedColumns: 'Upptäckta kolumner i din fil:',
      useFirstRowAsHeader: 'Använder första raden som kolumnrubriker'
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      setSelectedFile(file);
      setImportPreview([]);
      setImportData([]);
      setFileColumns([]);
      setRawJsonData([]);
      setShowColumnMapping(false);
    }
  };

  const handleUploadAndPreview = () => {
    if (!selectedFile) {
      alert(lang.selectFile);
      return;
    }

    console.log('Processing file:', selectedFile.name);
    alert(lang.processing + ' ' + selectedFile.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON with header option
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (!jsonData || jsonData.length === 0) {
          alert('File is empty');
          return;
        }
        
        // First row contains column headers
        const headers = jsonData[0];
        console.log('Detected headers:', headers);
        setFileColumns(headers);
        
        // Convert remaining rows to objects using headers
        const rows = jsonData.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, idx) => {
            obj[header] = row[idx] || '';
          });
          return obj;
        }).filter(row => Object.values(row).some(v => v)); // Remove empty rows
        
        console.log('Parsed rows:', rows);
        console.log('Sample row:', rows[0]);
        
        setRawJsonData(rows);
        
        // Try to auto-detect column mapping based on common column names
        const autoMapping = {
          name: headers.find(h => h && ['Name', 'name', 'NAMNE', 'Namn', 'Full Name', 'fullname', 'FULLNAME', 'Worker', 'worker'].includes(String(h).trim())) || '',
          email: headers.find(h => h && ['Email', 'email', 'E-post', 'EPOST', 'mail', 'Mail', 'EMAIL'].includes(String(h).trim())) || '',
          specializations: headers.find(h => h && ['Specializations', 'specializations', 'Specialiseringar', 'Skills', 'skills', 'Kompetens', 'Subject', 'subject'].includes(String(h).trim())) || '',
          workerType: headers.find(h => h && ['WorkerType', 'workerType', 'Type', 'typ', 'worker_type', 'WORKERTYPE', 'Role', 'role'].includes(String(h).trim())) || '',
          available: headers.find(h => h && ['Available', 'available', 'Tillgänglig', 'status', 'Status', 'ACTIVE', 'Active', 'active'].includes(String(h).trim())) || ''
        };
        
        console.log('Auto mapping:', autoMapping);
        setColumnMapping(autoMapping);
        
        // If we have name and email mapped, apply automatically
        if (autoMapping.name && autoMapping.email) {
          applyMappingAndPreview(autoMapping, rows);
        } else {
          setShowColumnMapping(true);
          // Show a sample of the data for preview
          setImportPreview(rows.slice(0, 5).map(row => ({
            name: row[autoMapping.name] || '?',
            email: row[autoMapping.email] || '?',
            specializations: autoMapping.specializations ? (row[autoMapping.specializations] || '').split(',').map(s => s.trim()) : [],
            workerType: 'regular',
            isAvailable: true
          })));
        }
        
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file: ' + error.message);
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      alert('Error reading file');
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const applyMappingAndPreview = (mapping, dataRows = null) => {
    const rowsToMap = dataRows || rawJsonData;
    
    console.log('Applying mapping:', mapping);
    console.log('Rows to map:', rowsToMap.length);
    
    // Map the data to worker format
    const mappedData = rowsToMap.map(row => {
      const name = mapping.name ? row[mapping.name] : '';
      const email = mapping.email ? row[mapping.email] : '';
      
      // Skip rows without name or email
      if (!name || !email) return null;
      
      let specializations = [];
      if (mapping.specializations && row[mapping.specializations]) {
        specializations = String(row[mapping.specializations]).split(',').map(s => s.trim()).filter(s => s);
      }
      
      let workerType = 'regular';
      if (mapping.workerType && row[mapping.workerType]) {
        const typeValue = String(row[mapping.workerType]).toLowerCase();
        workerType = typeValue === 'substitute' || typeValue === 'vikarie' ? 'substitute' : 'regular';
      }
      
      let isAvailable = true;
      if (mapping.available && row[mapping.available]) {
        const availableValue = String(row[mapping.available]).toLowerCase();
        isAvailable = availableValue === 'yes' || availableValue === 'true' || availableValue === 'ja' || availableValue === '1';
      }
      
      return {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        specializations: specializations,
        workerType: workerType,
        isAvailable: isAvailable
      };
    }).filter(w => w !== null);
    
    console.log('Mapped data count:', mappedData.length);
    console.log('First mapped worker:', mappedData[0]);
    
    setImportPreview(mappedData.slice(0, 10));
    setImportData(mappedData);
    setShowColumnMapping(false);
    
    if (mappedData.length === 0) {
      alert('No valid workers found in file. Please check the column mapping.');
    } else {
      alert(`Found ${mappedData.length} workers. Click Import to add them.`);
    }
  };

  const handleApplyMapping = () => {
    if (!columnMapping.name || !columnMapping.email) {
      alert('Please map at least Name and Email columns');
      return;
    }
    applyMappingAndPreview(columnMapping);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImportPreview([]);
    setImportData([]);
    setFileColumns([]);
    setRawJsonData([]);
    setShowColumnMapping(false);
  };

  const downloadTemplate = () => {
    const template = [
      ['Name', 'Email', 'Specializations', 'WorkerType', 'Available'],
      ['John Doe', 'john@example.com', 'Math,Science', 'regular', 'Yes'],
      ['Jane Smith', 'jane@example.com', 'Physics,Chemistry', 'regular', 'Yes'],
      ['Bob Johnson', 'bob@example.com', 'Biology', 'substitute', 'No']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Workers');
    XLSX.writeFile(wb, 'worker_template.xlsx');
  };

  const handleImportWorkers = async () => {
    if (importData.length === 0) {
      alert(lang.selectFile);
      return;
    }
    
    if (!window.confirm(`Import ${importData.length} workers?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      for (const worker of importData) {
        try {
          await axios.post(`${API_URL}/workers`, worker, {
            headers: { Authorization: `Bearer ${token}` }
          });
          successCount++;
        } catch (err) {
          console.error('Error importing worker:', worker.name, err);
          errorCount++;
          errors.push(`${worker.name}: ${err.response?.data?.message || err.message}`);
        }
      }
      
      const message = lang.importSuccess.replace('{count}', successCount) + (errorCount > 0 ? `\nFailed: ${errorCount}\n${errors.slice(0, 3).join('\n')}` : '');
      alert(message);
      
      if (successCount > 0) {
        setShowImportModal(false);
        setImportData([]);
        setImportPreview([]);
        setSelectedFile(null);
        fetchWorkers();
      }
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

  const closeButtonStyles = {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '8px 16px',
    transition: 'all 0.3s ease',
    marginLeft: '16px'
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
          <button className="close-button" onClick={() => onNavigate('superadmin')} style={closeButtonStyles}>
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
          <button className="close-button" onClick={() => onNavigate('superadmin')} style={closeButtonStyles}>
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
          <button className="close-button" onClick={() => onNavigate('superadmin')} style={closeButtonStyles}>
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
              <button className="btn-secondary" onClick={downloadTemplate} style={{ marginBottom: '16px', marginRight: '12px' }}>
                {lang.downloadTemplate}
              </button>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '16px' }}>
                {lang.templateColumns}
              </p>
              
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px'
              }}>
                <label htmlFor="excel-file-input" style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginRight: '12px',
                  marginBottom: '12px'
                }}>
                  {lang.chooseFile}
                </label>
                <input
                  type="file"
                  id="excel-file-input"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button className="btn-primary" onClick={handleUploadAndPreview} style={{ marginRight: '12px', marginBottom: '12px' }}>
                  {lang.uploadAndPreview}
                </button>
                {selectedFile && (
                  <>
                    <button className="btn-secondary" onClick={clearFile} style={{ marginBottom: '12px' }}>
                      {lang.clearFile}
                    </button>
                    <p style={{ color: '#10b981', fontSize: '13px', marginTop: '12px' }}>
                      ✓ {lang.fileSelected.replace('{name}', selectedFile.name)}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Column Mapping UI */}
            {showColumnMapping && fileColumns.length > 0 && (
              <div style={{
                background: 'rgba(0, 209, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid rgba(0, 209, 255, 0.3)'
              }}>
                <h3 style={{ color: '#00d1ff', marginBottom: '12px' }}>{lang.columnMapping}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px' }}>
                  {lang.useFirstRowAsHeader}
                </p>
                <p style={{ color: '#f59e0b', fontSize: '12px', marginBottom: '16px' }}>
                  📋 {lang.detectedColumns} {fileColumns.join(', ')}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ color: 'white', fontSize: '13px', display: 'block', marginBottom: '4px' }}>{lang.mapName} *</label>
                    <select
                      value={columnMapping.name}
                      onChange={(e) => setColumnMapping({ ...columnMapping, name: e.target.value })}
                      className="form-select"
                      style={{ margin: 0 }}
                    >
                      <option value="">Select column...</option>
                      {fileColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: 'white', fontSize: '13px', display: 'block', marginBottom: '4px' }}>{lang.mapEmail} *</label>
                    <select
                      value={columnMapping.email}
                      onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                      className="form-select"
                      style={{ margin: 0 }}
                    >
                      <option value="">Select column...</option>
                      {fileColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: 'white', fontSize: '13px', display: 'block', marginBottom: '4px' }}>{lang.mapSpecializations}</label>
                    <select
                      value={columnMapping.specializations}
                      onChange={(e) => setColumnMapping({ ...columnMapping, specializations: e.target.value })}
                      className="form-select"
                      style={{ margin: 0 }}
                    >
                      <option value="">Skip</option>
                      {fileColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: 'white', fontSize: '13px', display: 'block', marginBottom: '4px' }}>{lang.mapWorkerType}</label>
                    <select
                      value={columnMapping.workerType}
                      onChange={(e) => setColumnMapping({ ...columnMapping, workerType: e.target.value })}
                      className="form-select"
                      style={{ margin: 0 }}
                    >
                      <option value="">Skip (default: regular)</option>
                      {fileColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: 'white', fontSize: '13px', display: 'block', marginBottom: '4px' }}>{lang.mapAvailable}</label>
                    <select
                      value={columnMapping.available}
                      onChange={(e) => setColumnMapping({ ...columnMapping, available: e.target.value })}
                      className="form-select"
                      style={{ margin: 0 }}
                    >
                      <option value="">Skip (default: Yes)</option>
                      {fileColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn-primary" onClick={handleApplyMapping} style={{ width: '100%' }}>
                  {lang.applyMapping}
                </button>
              </div>
            )}

            {importPreview.length > 0 && (
              <>
                <h3 style={{ color: 'white', marginBottom: '12px' }}>{lang.preview} (First {importPreview.length} rows)</h3>
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
                          <td>{worker.specializations?.join(', ') || '-'}</td>
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