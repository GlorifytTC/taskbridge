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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [importData, setImportData] = useState([]);
  const [importPreview, setImportPreview] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileColumns, setFileColumns] = useState([]);
  const [rawJsonData, setRawJsonData] = useState([]);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [columnMapping, setColumnMapping] = useState({
    name: '',
    email: '',
    specializations: '',
    workerType: '',
    available: ''
  });
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const t = {
    en: {
      title: 'Worker Management',
      subtitle: 'Manage all staff members and their specializations',
      close: '✕',
      addWorker: '+ Add Worker',
      importWorkers: '📁 Import Workers',
      bulkAvailability: 'Bulk Update Availability',
      bulkDelete: '🗑️ Bulk Delete',
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
      edit: 'Edit',
      editWorker: 'Edit Worker',
      contract: 'Contract',
      contractType: 'Contract Type',
      permanent: 'Permanent',
      temporary: 'Temporary',
      hourly: 'Hourly',
      startDate: 'Start Date',
      endDate: 'End Date',
      hourlyRate: 'Hourly Rate (SEK)',
      monthlySalary: 'Monthly Salary (SEK)',
      contractNotes: 'Contract Notes',
      addNewWorker: 'Add New Worker',
      fullName: 'Full Name',
      addSkill: 'Add',
      skillPlaceholder: 'Add Specialization (e.g., Math, Science)',
      cancel: 'Cancel',
      create: 'Create',
      save: 'Save Changes',
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
      useFirstRowAsHeader: 'Using first row as column headers',
      fileHasHeaders: 'My file has headers (first row contains column names)',
      fileNoHeaders: 'My file has NO headers (first row contains data)',
      columnOrder: 'Column Order (for files without headers):',
      selectColumn: 'Select column position',
      workerAdded: 'Worker added successfully!',
      workerUpdated: 'Worker updated successfully!',
      workerDeleted: 'Worker deleted successfully!',
      workersDeleted: '{count} workers deleted successfully!',
      availabilityUpdated: 'Availability updated successfully!',
      importCancelled: 'Import cancelled',
      confirmDelete: 'Are you sure you want to delete this worker?',
      confirmBulkDelete: 'Are you sure you want to delete {count} selected workers? This action cannot be undone.',
      noWorkersSelected: 'Please select at least one worker to delete',
      selectAll: 'Select All',
      selected: 'selected'
    },
    sv: {
      title: 'Arbetarhantering',
      subtitle: 'Hantera all personal och deras specialiseringar',
      close: '✕',
      addWorker: '+ Lägg till arbetare',
      importWorkers: '📁 Importera arbetare',
      bulkAvailability: 'Massuppdatera tillgänglighet',
      bulkDelete: '🗑️ Massradera',
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
      edit: 'Redigera',
      editWorker: 'Redigera arbetare',
      contract: 'Kontrakt',
      contractType: 'Kontraktstyp',
      permanent: 'Tillsvidare',
      temporary: 'Tidsbegränsad',
      hourly: 'Timanställd',
      startDate: 'Startdatum',
      endDate: 'Slutdatum',
      hourlyRate: 'Timlön (SEK)',
      monthlySalary: 'Månadslön (SEK)',
      contractNotes: 'Kontraktsanteckningar',
      addNewWorker: 'Lägg till ny arbetare',
      fullName: 'Fullständigt namn',
      addSkill: 'Lägg till',
      skillPlaceholder: 'Lägg till specialisering (t.ex. Matematik, Naturkunskap)',
      cancel: 'Avbryt',
      create: 'Skapa',
      save: 'Spara ändringar',
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
      useFirstRowAsHeader: 'Använder första raden som kolumnrubriker',
      fileHasHeaders: 'Min fil har rubriker (första raden innehåller kolumnnamn)',
      fileNoHeaders: 'Min fil har INGA rubriker (första raden innehåller data)',
      columnOrder: 'Kolumnordning (för filer utan rubriker):',
      selectColumn: 'Välj kolumnposition',
      workerAdded: 'Arbetare tillagd!',
      workerUpdated: 'Arbetare uppdaterad!',
      workerDeleted: 'Arbetare raderad!',
      workersDeleted: '{count} arbetare raderade!',
      availabilityUpdated: 'Tillgänglighet uppdaterad!',
      importCancelled: 'Import avbruten',
      confirmDelete: 'Är du säker på att du vill radera denna arbetare?',
      confirmBulkDelete: 'Är du säker på att du vill radera {count} markerade arbetare? Detta går inte att ångra.',
      noWorkersSelected: 'Vänligen markera minst en arbetare att radera',
      selectAll: 'Markera alla',
      selected: 'markerade'
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
      setError(lang.error);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const selectedWorkers = workers.filter(w => w.selected).map(w => w._id);
    if (selectedWorkers.length === 0) {
      showToast(lang.noWorkersSelected, 'error');
      return;
    }
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    const selectedWorkers = workers.filter(w => w.selected);
    const selectedIds = selectedWorkers.map(w => w._id);
    
    try {
      const token = localStorage.getItem('token');
      let successCount = 0;
      let errorCount = 0;
      
      for (const id of selectedIds) {
        try {
          await axios.delete(`${API_URL}/workers/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          successCount++;
        } catch (err) {
          console.error('Error deleting worker:', err);
          errorCount++;
        }
      }
      
      showToast(lang.workersDeleted.replace('{count}', successCount) + (errorCount > 0 ? ` (${errorCount} failed)` : ''), successCount > 0 ? 'success' : 'error');
      setShowBulkDeleteConfirm(false);
      fetchWorkers();
    } catch (error) {
      console.error('Error bulk deleting workers:', error);
      showToast('Error deleting workers', 'error');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImportPreview([]);
      setImportData([]);
      setFileColumns([]);
      setRawJsonData([]);
      setShowColumnMapping(false);
      setHasHeaders(true);
    }
  };

  const handleUploadAndPreview = () => {
    if (!selectedFile) {
      showToast(lang.selectFile, 'error');
      return;
    }

    showToast(lang.processing, 'info');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
        
        if (!jsonData || jsonData.length === 0) {
          showToast('File is empty', 'error');
          return;
        }
        
        setRawJsonData(jsonData);
        
        const columnCount = jsonData[0].length;
        const columnNumbers = Array.from({ length: columnCount }, (_, i) => i + 1);
        setFileColumns(columnNumbers);
        setShowColumnMapping(true);
        
        const firstRow = jsonData[0];
        const looksLikeHeaders = firstRow.some(cell => 
          String(cell).toLowerCase().match(/name|email|special|type|available|status/)
        );
        
        setHasHeaders(looksLikeHeaders);
        
        const previewRows = jsonData.slice(0, 5).map(row => ({
          name: row[0] || '?',
          email: row[1] || '?',
          specializations: row[2] ? String(row[2]).split(',').map(s => s.trim()) : [],
          workerType: 'regular',
          isAvailable: true
        }));
        setImportPreview(previewRows);
        
      } catch (error) {
        console.error('Error parsing file:', error);
        showToast('Error parsing file: ' + error.message, 'error');
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      showToast('Error reading file', 'error');
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const applyMappingAndPreview = () => {
    if (!columnMapping.name || !columnMapping.email) {
      showToast('Please map at least Name and Email columns', 'error');
      return;
    }
    
    const dataRows = hasHeaders ? rawJsonData.slice(1) : rawJsonData;
    const columnIndex = {
      name: parseInt(columnMapping.name) - 1,
      email: parseInt(columnMapping.email) - 1,
      specializations: columnMapping.specializations ? parseInt(columnMapping.specializations) - 1 : -1,
      workerType: columnMapping.workerType ? parseInt(columnMapping.workerType) - 1 : -1,
      available: columnMapping.available ? parseInt(columnMapping.available) - 1 : -1
    };
    
    const mappedData = dataRows.map(row => {
      const name = row[columnIndex.name] ? String(row[columnIndex.name]).trim() : '';
      const email = row[columnIndex.email] ? String(row[columnIndex.email]).trim().toLowerCase() : '';
      
      if (!name || !email) return null;
      
      let specializations = [];
      if (columnIndex.specializations !== -1 && row[columnIndex.specializations]) {
        specializations = String(row[columnIndex.specializations]).split(',').map(s => s.trim()).filter(s => s);
      }
      
      let workerType = 'regular';
      if (columnIndex.workerType !== -1 && row[columnIndex.workerType]) {
        const typeValue = String(row[columnIndex.workerType]).toLowerCase();
        workerType = typeValue === 'substitute' || typeValue === 'vikarie' ? 'substitute' : 'regular';
      }
      
      let isAvailable = true;
      if (columnIndex.available !== -1 && row[columnIndex.available]) {
        const availableValue = String(row[columnIndex.available]).toLowerCase();
        isAvailable = availableValue === 'yes' || availableValue === 'true' || availableValue === 'ja' || availableValue === '1';
      }
      
      return {
        name: name,
        email: email,
        specializations: specializations,
        workerType: workerType,
        isAvailable: isAvailable
      };
    }).filter(w => w !== null);
    
    setImportPreview(mappedData.slice(0, 10));
    setImportData(mappedData);
    setShowColumnMapping(false);
    
    if (mappedData.length === 0) {
      showToast('No valid workers found in file. Please check the column mapping.', 'error');
    } else {
      showToast(`Found ${mappedData.length} workers. Ready to import.`, 'success');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImportPreview([]);
    setImportData([]);
    setFileColumns([]);
    setRawJsonData([]);
    setShowColumnMapping(false);
    showToast('File cleared', 'info');
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
    showToast('Template downloaded', 'success');
  };

  const handleImportWorkers = async () => {
    if (importData.length === 0) {
      showToast(lang.selectFile, 'error');
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
      
      showToast(lang.importSuccess.replace('{count}', successCount) + (errorCount > 0 ? ` (${errorCount} failed)` : ''), successCount > 0 ? 'success' : 'error');
      
      if (successCount > 0) {
        setShowImportModal(false);
        setImportData([]);
        setImportPreview([]);
        setSelectedFile(null);
        fetchWorkers();
      }
    } catch (error) {
      console.error('Error importing workers:', error);
      showToast('Error importing workers', 'error');
    }
  };

  const handleAddWorker = async () => {
    if (!newWorker.name || !newWorker.email) {
      showToast('Please fill in name and email', 'error');
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
        showToast(lang.workerAdded, 'success');
      } else {
        showToast('Error adding worker', 'error');
      }
    } catch (error) {
      console.error('Error adding worker:', error);
      showToast('Error adding worker', 'error');
    }
  };

  const handleUpdateWorker = async () => {
    if (!editingWorker) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/workers/${editingWorker._id}`, editingWorker, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setShowEditModal(false);
        setEditingWorker(null);
        fetchWorkers();
        showToast(lang.workerUpdated, 'success');
      } else {
        showToast('Error updating worker', 'error');
      }
    } catch (error) {
      console.error('Error updating worker:', error);
      showToast('Error updating worker', 'error');
    }
  };

  const handleAddSkillToEdit = () => {
    if (skillInput && editingWorker && !editingWorker.specializations?.includes(skillInput)) {
      setEditingWorker({
        ...editingWorker,
        specializations: [...(editingWorker.specializations || []), skillInput]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkillFromEdit = (skill) => {
    if (editingWorker) {
      setEditingWorker({
        ...editingWorker,
        specializations: editingWorker.specializations.filter(s => s !== skill)
      });
    }
  };

  const handleAddSkillToNew = () => {
    if (skillInput && !newWorker.specializations.includes(skillInput)) {
      setNewWorker({
        ...newWorker,
        specializations: [...newWorker.specializations, skillInput]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkillFromNew = (skill) => {
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
      showToast(lang.availabilityUpdated, 'success');
    } catch (error) {
      console.error('Error updating worker:', error);
      showToast('Error updating worker', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang.confirmDelete)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/workers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWorkers();
      showToast(lang.workerDeleted, 'success');
    } catch (error) {
      console.error('Error deleting worker:', error);
      showToast('Error deleting worker', 'error');
    }
  };

  const handleBulkAvailability = async () => {
    const selectedWorkers = workers.filter(w => w.selected).map(w => w._id);
    if (selectedWorkers.length === 0) {
      showToast('Select at least one worker first', 'error');
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
      showToast('Availability updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating availabilities:', error);
      showToast('Error updating availabilities', 'error');
    }
  };

  const openEditModal = (worker) => {
    setEditingWorker({
      ...worker,
      contract: worker.contract || {
        type: 'permanent',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        hourlyRate: 0,
        monthlySalary: 0,
        notes: ''
      }
    });
    setShowEditModal(true);
  };

  const toggleSelectAll = () => {
    const allSelected = workers.every(w => w.selected);
    setWorkers(workers.map(w => ({ ...w, selected: !allSelected })));
  };

  const toggleSelect = (id) => {
    setWorkers(workers.map(w => w._id === id ? { ...w, selected: !w.selected } : w));
  };

  const selectedCount = workers.filter(w => w.selected).length;

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
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          borderRadius: '8px',
          background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
          color: 'white',
          zIndex: 2000,
          fontSize: '14px',
          animation: 'fadeInOut 3s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {toast.message}
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowBulkDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ color: '#ef4444' }}>⚠️ {lang.bulkDelete}</h2>
              <button className="modal-close" onClick={() => setShowBulkDeleteConfirm(false)}>×</button>
            </div>
            <div style={{ padding: '20px 0' }}>
              <p style={{ color: 'white', marginBottom: '16px' }}>
                {lang.confirmBulkDelete.replace('{count}', selectedCount)}
              </p>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>
                  ⚠️ This will permanently delete {selectedCount} worker{selectedCount !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn-danger" style={{ flex: 1 }} onClick={confirmBulkDelete}>
                {lang.delete} ({selectedCount})
              </button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowBulkDeleteConfirm(false)}>
                {lang.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <button className="btn-danger" onClick={handleBulkDelete} style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444', color: '#ef4444' }}>
              {lang.bulkDelete} {selectedCount > 0 && `(${selectedCount})`}
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

      {/* Selection info bar */}
      {selectedCount > 0 && (
        <div style={{
          background: 'rgba(0, 209, 255, 0.1)',
          borderRadius: '8px',
          padding: '8px 16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#00d1ff' }}>
            ✓ {selectedCount} {lang.selected}
          </span>
          <button 
            onClick={() => setWorkers(workers.map(w => ({ ...w, selected: false })))}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={toggleSelectAll} checked={workers.length > 0 && workers.every(w => w.selected)} />
              </th>
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary" style={{ padding: '4px 12px' }} onClick={() => openEditModal(worker)}>
                        {lang.edit}
                      </button>
                      <button className="btn-danger" style={{ padding: '4px 12px' }} onClick={() => handleDelete(worker._id)}>
                        {lang.delete}
                      </button>
                    </div>
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
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkillToNew()}
              />
              <button className="btn-secondary" onClick={handleAddSkillToNew}>{lang.addSkill}</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {newWorker.specializations.map(skill => (
                <span key={skill} className="skill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {skill}
                  <button onClick={() => handleRemoveSkillFromNew(skill)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>×</button>
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

      {/* Edit Worker Modal with Contract */}
      {showEditModal && editingWorker && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>{lang.editWorker}</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            {/* Basic Info */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#00d1ff', marginBottom: '12px', fontSize: '16px' }}>Basic Information</h3>
              <div className="form-row">
                <input
                  type="text"
                  placeholder={lang.fullName}
                  value={editingWorker.name}
                  onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                  className="form-input"
                />
                <input
                  type="email"
                  placeholder={lang.email}
                  value={editingWorker.email}
                  onChange={(e) => setEditingWorker({ ...editingWorker, email: e.target.value })}
                  className="form-input"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder={lang.skillPlaceholder}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkillToEdit()}
                />
                <button className="btn-secondary" onClick={handleAddSkillToEdit}>{lang.addSkill}</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {editingWorker.specializations?.map(skill => (
                  <span key={skill} className="skill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {skill}
                    <button onClick={() => handleRemoveSkillFromEdit(skill)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>×</button>
                  </span>
                ))}
              </div>
              
              <div className="form-row">
                <select
                  value={editingWorker.workerType}
                  onChange={(e) => setEditingWorker({ ...editingWorker, workerType: e.target.value })}
                  className="form-select"
                >
                  <option value="regular">{lang.regular}</option>
                  <option value="substitute">{lang.substitute}</option>
                </select>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingWorker.isAvailable}
                    onChange={(e) => setEditingWorker({ ...editingWorker, isAvailable: e.target.checked })}
                  />
                  {lang.available} for assignments
                </label>
              </div>
            </div>
            
            {/* Contract Information */}
            <div style={{ marginBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <h3 style={{ color: '#00d1ff', marginBottom: '12px', fontSize: '16px' }}>📄 {lang.contract}</h3>
              <div className="form-row">
                <select
                  value={editingWorker.contract?.type || 'permanent'}
                  onChange={(e) => setEditingWorker({ 
                    ...editingWorker, 
                    contract: { ...editingWorker.contract, type: e.target.value }
                  })}
                  className="form-select"
                >
                  <option value="permanent">{lang.permanent}</option>
                  <option value="temporary">{lang.temporary}</option>
                  <option value="hourly">{lang.hourly}</option>
                </select>
                <input
                  type="date"
                  placeholder={lang.startDate}
                  value={editingWorker.contract?.startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEditingWorker({ 
                    ...editingWorker, 
                    contract: { ...editingWorker.contract, startDate: e.target.value }
                  })}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <input
                  type="date"
                  placeholder={lang.endDate}
                  value={editingWorker.contract?.endDate || ''}
                  onChange={(e) => setEditingWorker({ 
                    ...editingWorker, 
                    contract: { ...editingWorker.contract, endDate: e.target.value }
                  })}
                  className="form-input"
                />
                {(editingWorker.contract?.type === 'hourly') ? (
                  <input
                    type="number"
                    placeholder={lang.hourlyRate}
                    value={editingWorker.contract?.hourlyRate || 0}
                    onChange={(e) => setEditingWorker({ 
                      ...editingWorker, 
                      contract: { ...editingWorker.contract, hourlyRate: parseInt(e.target.value) }
                    })}
                    className="form-input"
                  />
                ) : (
                  <input
                    type="number"
                    placeholder={lang.monthlySalary}
                    value={editingWorker.contract?.monthlySalary || 0}
                    onChange={(e) => setEditingWorker({ 
                      ...editingWorker, 
                      contract: { ...editingWorker.contract, monthlySalary: parseInt(e.target.value) }
                    })}
                    className="form-input"
                  />
                )}
              </div>
              <textarea
                placeholder={lang.contractNotes}
                value={editingWorker.contract?.notes || ''}
                onChange={(e) => setEditingWorker({ 
                  ...editingWorker, 
                  contract: { ...editingWorker.contract, notes: e.target.value }
                })}
                className="form-input"
                rows="3"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleUpdateWorker}>
                {lang.save}
              </button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>
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

            {showColumnMapping && fileColumns.length > 0 && (
              <div style={{
                background: 'rgba(0, 209, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid rgba(0, 209, 255, 0.3)'
              }}>
                <h3 style={{ color: '#00d1ff', marginBottom: '12px' }}>{lang.columnMapping}</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="radio"
                      checked={hasHeaders}
                      onChange={() => setHasHeaders(true)}
                    />
                    <span style={{ color: 'white' }}>{lang.fileHasHeaders}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="radio"
                      checked={!hasHeaders}
                      onChange={() => setHasHeaders(false)}
                    />
                    <span style={{ color: 'white' }}>{lang.fileNoHeaders}</span>
                  </label>
                </div>
                
                <p style={{ color: '#f59e0b', fontSize: '12px', marginBottom: '16px' }}>
                  📋 {hasHeaders ? lang.detectedColumns : lang.columnOrder} {hasHeaders ? fileColumns.join(', ') : `Columns 1-${fileColumns.length}`}
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
                      {fileColumns.map((col, idx) => (
                        <option key={idx} value={idx + 1}>
                          {hasHeaders ? col : `Column ${idx + 1}`}
                        </option>
                      ))}
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
                      {fileColumns.map((col, idx) => (
                        <option key={idx} value={idx + 1}>
                          {hasHeaders ? col : `Column ${idx + 1}`}
                        </option>
                      ))}
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
                      {fileColumns.map((col, idx) => (
                        <option key={idx} value={idx + 1}>
                          {hasHeaders ? col : `Column ${idx + 1}`}
                        </option>
                      ))}
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
                      {fileColumns.map((col, idx) => (
                        <option key={idx} value={idx + 1}>
                          {hasHeaders ? col : `Column ${idx + 1}`}
                        </option>
                      ))}
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
                      {fileColumns.map((col, idx) => (
                        <option key={idx} value={idx + 1}>
                          {hasHeaders ? col : `Column ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="btn-primary" onClick={applyMappingAndPreview} style={{ width: '100%' }}>
                  {lang.applyMapping}
                </button>
              </div>
            )}

            {importData.length > 0 && (
              <>
                <h3 style={{ color: 'white', marginBottom: '12px' }}>{lang.preview} (First {Math.min(10, importData.length)} rows)</h3>
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
                      {importData.slice(0, 10).map((worker, idx) => (
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