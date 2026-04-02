import { useState, useEffect } from 'react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    branch: '',
    jobDescription: '',
    date: '',
    startTime: '',
    endTime: '',
    maxEmployees: 1,
    location: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchJobDescriptions();
    fetchBranches();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTasks(data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/job-descriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setJobDescriptions(data.data || []);
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
    }
  };

  const fetchBranches = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/branches', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setAvailableBranches(data.data || []);
  } catch (error) {
    console.error('Error fetching branches:', error);
  }
};

const handleAssignBranch = async (branchId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${selectedAdminForBranch._id}/assign-branch`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ branchId })
    });
    
    if (response.ok) {
      // Refresh admin list to show updated branches
      fetchDashboardData();
      alert('Branch assigned successfully!');
    } else {
      alert('Failed to assign branch');
    }
  } catch (error) {
    console.error('Error assigning branch:', error);
    alert('Failed to assign branch');
  }
};

const handleRemoveBranch = async (branchId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${selectedAdminForBranch._id}/remove-branch`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ branchId })
    });
    
    if (response.ok) {
      // Refresh admin list to show updated branches
      fetchDashboardData();
      alert('Branch removed successfully!');
    } else {
      alert('Failed to remove branch');
    }
  } catch (error) {
    console.error('Error removing branch:', error);
    alert('Failed to remove branch');
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingTask 
        ? `https://taskbridge-production-9d91.up.railway.app/api/tasks/${editingTask._id}`
        : 'https://taskbridge-production-9d91.up.railway.app/api/tasks';
      
      const response = await fetch(url, {
        method: editingTask ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchTasks();
        setShowModal(false);
        setEditingTask(null);
        setFormData({
          title: '', description: '', branch: '', jobDescription: '',
          date: '', startTime: '', endTime: '', maxEmployees: 1, location: ''
        });
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };
  

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return '#10b981';
      case 'filled': return '#f59e0b';
      case 'completed': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Tasks Management</h1>
          <p style={styles.subtitle}>Create and manage shifts for your organization</p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.createButton}>
          <i className="fas fa-plus"></i> Create Task
        </button>
      </div>

      {/* Tasks Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableHeaderCell}>Title</th>
              <th style={styles.tableHeaderCell}>Date</th>
              <th style={styles.tableHeaderCell}>Time</th>
              <th style={styles.tableHeaderCell}>Branch</th>
              <th style={styles.tableHeaderCell}>Role</th>
              <th style={styles.tableHeaderCell}>Employees</th>
              <th style={styles.tableHeaderCell}>Status</th>
              <th style={styles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id} style={styles.tableRow}>
                <td style={styles.tableRowCell}><strong>{task.title}</strong><br/><span style={styles.taskDesc}>{task.description?.substring(0, 50)}</span></td>
                <td style={styles.tableRowCell}>{new Date(task.date).toLocaleDateString()}</td>
                <td style={styles.tableRowCell}>{task.startTime} - {task.endTime}</td>
                <td style={styles.tableRowCell}>{task.branch?.name || '-'}</td>
                <td style={styles.tableRowCell}>{task.jobDescription?.name || '-'}</td>
                <td style={styles.tableRowCell}>{task.currentEmployees || 0}/{task.maxEmployees}</td>
                <td style={styles.tableRowCell}>
                  <span style={{...styles.statusBadge, backgroundColor: getStatusColor(task.status)}}>
                    {task.status}
                  </span>
                </td>
                <td style={styles.tableRowCell}>
                  <div style={styles.actionButtons}>
                    <button onClick={() => {
                      setEditingTask(task);
                      setFormData({
                        title: task.title,
                        description: task.description || '',
                        branch: task.branch?._id || '',
                        jobDescription: task.jobDescription?._id || '',
                        date: task.date.split('T')[0],
                        startTime: task.startTime,
                        endTime: task.endTime,
                        maxEmployees: task.maxEmployees,
                        location: task.location || ''
                      });
                      setShowModal(true);
                    }} style={styles.editButton}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(task._id)} style={styles.deleteButton}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                placeholder="Task Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={styles.input}
                required
              />
              
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={styles.textarea}
                rows="3"
              />
              
              <select
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                style={styles.select}
                required
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>{branch.name}</option>
                ))}
              </select>
              
              <select
                value={formData.jobDescription}
                onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
                style={styles.select}
                required
              >
                <option value="">Select Job Role</option>
                {jobDescriptions.map(jd => (
                  <option key={jd._id} value={jd._id}>{jd.name}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                style={styles.input}
                required
              />
              
              <div style={styles.timeRow}>
                <input
                  type="time"
                  placeholder="Start Time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  style={{...styles.input, flex: 1}}
                  required
                />
                <input
                  type="time"
                  placeholder="End Time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  style={{...styles.input, flex: 1}}
                  required
                />
              </div>
              
              <input
                type="number"
                placeholder="Max Employees"
                value={formData.maxEmployees}
                onChange={(e) => setFormData({...formData, maxEmployees: parseInt(e.target.value)})}
                style={styles.input}
                min="1"
              />
              
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                style={styles.input}
              />
              
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    padding: '80px 40px 40px',
    fontFamily: 'Inter, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0f172a',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(0, 209, 255, 0.3)',
    borderRadius: '50%',
    borderTopColor: '#00d1ff',
    animation: 'spin 1s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
  },
  createButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  tableContainer: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '20px',
    overflowX: 'auto',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'left',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  tableHeaderCell: {
    padding: '16px 12px',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: '14px',
  },
  tableRowCell: {
    padding: '16px 12px',
  },
  taskDesc: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    display: 'inline-block',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    background: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#3b82f6',
    cursor: 'pointer',
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#ef4444',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1e293b',
    borderRadius: '24px',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
  },
  select: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
  },
  timeRow: {
    display: 'flex',
    gap: '12px',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '500',
  },
};

// Add animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  input:focus, textarea:focus, select:focus {
    border-color: #00d1ff !important;
    box-shadow: 0 0 0 2px rgba(0, 209, 255, 0.2);
  }
`;
document.head.appendChild(styleSheet);

export default Tasks;