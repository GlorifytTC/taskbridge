import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ user, onLogout, onNavigate }) => {
  const [assignedBranchIds, setAssignedBranchIds] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previousTab, setPreviousTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [changeEmailData, setChangeEmailData] = useState({ newEmail: '', confirmEmail: '', password: '' });
  const [logoPreview, setLogoPreview] = useState(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    pendingApplications: 0,
    approvedShifts: 0
  });
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const showMessage = (text, type = 'success') => {
    alert(text);
  };

  useEffect(() => {
    fetchDashboardData();
    const savedLogo = localStorage.getItem('organizationLogo');
    if (savedLogo) setLogoPreview(savedLogo);
    setChatMessages([{
      text: "Hello! I'm your TaskBridge AI Assistant. I can help you manage employees, tasks, and shifts. What would you like to do?",
      sender: 'ai',
      time: new Date().toLocaleTimeString()
    }]);
  }, []);

  const fetchDashboardData = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    console.log('=== ADMIN DASHBOARD DEBUG ===');
    
    // Get admin's assigned branches
    const adminRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const adminData = await adminRes.json();
    console.log('Admin user data:', adminData);
    
    const fetchedAssignedBranchIds = adminData.user.assignedBranches?.map(b => b._id) || [];
    console.log('Assigned branch IDs:', fetchedAssignedBranchIds);
    setAssignedBranchIds(fetchedAssignedBranchIds);
    
    if (fetchedAssignedBranchIds.length === 0) {
      console.log('No branches assigned, showing empty data');
      setTasks([]);
      setEmployees([]);
      setApplications([]);
      setStats({
        totalEmployees: 0,
        totalTasks: 0,
        pendingApplications: 0,
        approvedShifts: 0
      });
      setLoading(false);
      return;
    }
    
    // Fetch tasks from assigned branches only
    const tasksUrl = `https://taskbridge-production-9d91.up.railway.app/api/tasks?branches=${fetchedAssignedBranchIds.join(',')}`;
    console.log('Fetching tasks from:', tasksUrl);
    
    const tasksRes = await fetch(tasksUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const tasksData = await tasksRes.json();
    console.log('Tasks data:', tasksData);
    
    // Fetch employees from assigned branches only
    const employeesUrl = `https://taskbridge-production-9d91.up.railway.app/api/users?role=employee&branches=${fetchedAssignedBranchIds.join(',')}`;
    console.log('Fetching employees from:', employeesUrl);
    
    const employeesRes = await fetch(employeesUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const employeesData = await employeesRes.json();
    console.log('Employees data:', employeesData);
    
    // Fetch pending applications for tasks in assigned branches
    const appsUrl = `https://taskbridge-production-9d91.up.railway.app/api/applications/pending?branches=${fetchedAssignedBranchIds.join(',')}`;
    console.log('Fetching applications from:', appsUrl);
    
    const appsRes = await fetch(appsUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const appsData = await appsRes.json();
    console.log('Applications data:', appsData);
    
    // Fetch job descriptions
    const jobsRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/job-descriptions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const jobsData = await jobsRes.json();
    console.log('Job descriptions data:', jobsData);
    
    // Fetch branches
    const branchesRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/branches', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const branchesData = await branchesRes.json();
    console.log('Branches data:', branchesData);
    
    setTasks(tasksData.data || []);
    setEmployees(employeesData.data || []);
    setApplications(appsData.data || []);
    setJobDescriptions(jobsData.data || []);
    setBranches(branchesData.data || []);
    setStats({
      totalEmployees: employeesData.data?.length || 0,
      totalTasks: tasksData.data?.length || 0,
      pendingApplications: appsData.data?.length || 0,
      approvedShifts: 0
    });
    
    console.log('Stats updated:', {
      totalEmployees: employeesData.data?.length || 0,
      totalTasks: tasksData.data?.length || 0,
      pendingApplications: appsData.data?.length || 0
    });
    
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};

  const handleUpdateProfile = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (profileData.newPassword) {
        const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: profileData.currentPassword,
            newPassword: profileData.newPassword
          })
        });
        
        if (response.ok) {
          alert('Password changed successfully!');
          setShowProfileModal(false);
          setProfileData({ ...profileData, currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          alert('Failed to change password');
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };

  const handleChangeEmail = async () => {
    if (changeEmailData.newEmail !== changeEmailData.confirmEmail) {
      alert('Email addresses do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/change-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          email: changeEmailData.newEmail,
          password: changeEmailData.password 
        })
      });
      
      if (response.ok) {
        alert('Email changed successfully! Please login again.');
        localStorage.removeItem('token');
        onLogout();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to change email');
      }
    } catch (error) {
      console.error('Error changing email:', error);
      alert('Error changing email');
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, role: 'employee' })
      });
      
      if (response.ok) {
        alert('Employee created successfully!');
        setShowCreateEmployeeModal(false);
        setFormData({});
        fetchDashboardData();
      } else {
        alert('Failed to create employee');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Error creating employee');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (!assignedBranchIds.includes(formData.branch)) {
        showMessage('You can only create tasks in your assigned branches', 'error');
        return;
      }
      
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        showMessage('Task created successfully!', 'success');
        setShowCreateTaskModal(false);
        setFormData({});
        fetchDashboardData();
      } else {
        showMessage('Failed to create task', 'error');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showMessage('Error creating task', 'error');
    }
  };

  const handleResetUserPassword = async () => {
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${selectedUser._id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: resetPasswordData.newPassword })
      });
      
      if (response.ok) {
        alert(`Password for ${selectedUser.name} has been reset!`);
        setShowResetPasswordModal(false);
        setSelectedUser(null);
        setResetPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        alert('Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password');
    }
  };

  const handleDeleteEmployee = async (empId, empName) => {
    if (!confirm(`Delete ${empName}? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${empId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!confirm(`Delete "${taskTitle}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const handleApproveApplication = async (appId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/applications/${appId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve');
    }
  };

  const handleRejectApplication = async (appId) => {
    const reason = prompt('Reason for rejection:');
    if (reason === null) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/applications/${appId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('⚠️ WARNING: This will delete YOUR account only. Are you sure?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      onLogout();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
  };

  const goBack = () => {
    setActiveTab(previousTab);
  };

  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      setPreviousTab(activeTab);
      setActiveTab(tab);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { text: chatInput, sender: 'user', time: new Date().toLocaleTimeString() };
    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');
    setIsAiTyping(true);
    
    setTimeout(() => {
      const input = chatInput.toLowerCase();
      let response = "";
      
      if (input.includes('create task') || input.includes('new task')) {
        response = "To create a task:\n1. Go to Tasks tab\n2. Click Create Task\n3. Fill in title, date, time, job role\n4. Set max employees\n5. Click Create";
      } 
      else if (input.includes('add employee')) {
        response = "To add an employee:\n1. Go to Staff tab\n2. Click Add Staff\n3. Enter name, email, password\n4. Select job role\n5. Click Create";
      }
      else if (input.includes('approve application')) {
        response = "To approve applications:\n1. Go to Requests tab\n2. Click green checkmark to approve\n3. Click red X to reject (with reason)";
      }
      else {
        response = "I can help with:\n• Creating tasks\n• Adding employees\n• Approving applications\n• Managing shifts\n• Resetting passwords\n\nWhat would you like to know?";
      }
      
      const aiMessage = { text: response, sender: 'ai', time: new Date().toLocaleTimeString() };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsAiTyping(false);
    }, 800);
  };

  const handleModalClose = (setter) => (e) => {
    if (e.target === e.currentTarget) {
      setter(false);
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
      <div style={styles.header}>
        <div style={styles.logoSection}>
          {logoPreview ? (
            <img src={logoPreview} alt="Organization Logo" style={styles.orgLogo} />
          ) : (
            <div style={styles.logoPlaceholder}>
              <i className="fas fa-building"></i>
            </div>
          )}
          <div>
            <div style={styles.titleRow}>
              <h1 style={styles.title}>Admin Dashboard</h1>
              <span style={styles.userNameBadge}>
                <i className="fas fa-user-tie"></i> {user?.name}
              </span>
            </div>
            <p style={styles.subtitle}>Manage {user?.organization?.name || 'your branch'}</p>
          </div>
        </div>
        <div style={styles.headerButtons}>
          <button onClick={() => setShowProfileModal(true)} style={styles.profileButton}>Profile</button>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-users"></i></div><div style={styles.statValueSmall}>{stats.totalEmployees}</div><div style={styles.statLabelSmall}>Employees</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-tasks"></i></div><div style={styles.statValueSmall}>{stats.totalTasks}</div><div style={styles.statLabelSmall}>Tasks</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-clock"></i></div><div style={styles.statValueSmall}>{stats.pendingApplications}</div><div style={styles.statLabelSmall}>Pending Requests</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-check-circle"></i></div><div style={styles.statValueSmall}>{stats.approvedShifts}</div><div style={styles.statLabelSmall}>Approved Shifts</div></div>
      </div>

      <div style={styles.tabs}>
        <button onClick={() => handleTabChange('dashboard')} style={{...styles.tab, background: activeTab === 'dashboard' ? '#00d1ff' : 'transparent'}}>Home</button>
        <button onClick={() => handleTabChange('employees')} style={{...styles.tab, background: activeTab === 'employees' ? '#00d1ff' : 'transparent'}}>Staff</button>
        <button onClick={() => handleTabChange('tasks')} style={{...styles.tab, background: activeTab === 'tasks' ? '#00d1ff' : 'transparent'}}>Tasks</button>
        <button onClick={() => handleTabChange('applications')} style={{...styles.tab, background: activeTab === 'applications' ? '#00d1ff' : 'transparent'}}>Requests</button>
        <button onClick={() => onNavigate('calendar')} style={{...styles.tab, background: activeTab === 'calendar' ? '#00d1ff' : 'transparent'}}>Calendar</button>
        <button onClick={() => handleTabChange('reports')} style={{...styles.tab, background: activeTab === 'reports' ? '#00d1ff' : 'transparent'}}>Reports</button>
      </div>

      <div style={styles.content}>
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={styles.sectionTitle}>Welcome, {user?.name}!</h2>
            <p style={styles.sectionDesc}>Manage your team and shifts efficiently.</p>
            <div style={styles.welcomeCard}>
              <i className="fas fa-chart-line" style={{ fontSize: '32px', color: '#00d1ff', marginBottom: '12px' }}></i>
              <h3 style={styles.welcomeTitle}>Quick Overview</h3>
              <p style={styles.welcomeText}><strong>{stats.pendingApplications}</strong> pending requests | <strong>{stats.totalTasks}</strong> active tasks</p>
              <div style={styles.quickActions}>
                <button onClick={() => handleTabChange('tasks')} style={styles.quickActionBtn}>+ Create Task</button>
                <button onClick={() => setShowCreateEmployeeModal(true)} style={styles.quickActionBtn}>+ Add Staff</button>
                <button onClick={() => handleTabChange('applications')} style={styles.quickActionBtn}>Review Requests</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
  <div>
    <div style={styles.sectionHeader}>
      <h2 style={styles.sectionTitle}>Staff Management</h2>
      <button onClick={() => setShowCreateEmployeeModal(true)} style={styles.addButton}>+ Add Staff</button>
    </div>
    <input type="text" placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Job Role</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.filter(e => e.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
            <tr key={emp._id} style={styles.tableRow}>
              <td style={styles.td}>{emp.name}</td>
              <td style={styles.td}>{emp.email}</td>
              <td style={styles.td}>{emp.jobDescription?.name || '-'}</td>
              <td style={styles.td}><span style={{...styles.statusBadge, background: emp.isActive ? '#10b981' : '#ef4444'}}>{emp.isActive ? 'Active' : 'Inactive'}</span></td>
              <td style={styles.td}>
                <button onClick={() => { setSelectedUser(emp); setShowResetPasswordModal(true); }} style={styles.resetButton}>🔑</button>
                <button onClick={() => handleDeleteEmployee(emp._id, emp.name)} style={styles.deleteButton}>🗑️</button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

        {activeTab === 'tasks' && (
          <div>
            <div style={styles.taskHeader}>
              <h2 style={styles.sectionTitle}>Tasks</h2>
              <button onClick={() => setShowCreateTaskModal(true)} style={styles.createTaskButton}>+ Create Task</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Title</th><th style={styles.th}>Date</th><th style={styles.th}>Time</th><th style={styles.th}>Role</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task._id} style={styles.tableRow}>
                      <td style={styles.td}>{task.title}</td>
                      <td style={styles.td}>{new Date(task.date).toLocaleDateString()}</td>
                      <td style={styles.td}>{task.startTime} - {task.endTime}</td>
                      <td style={styles.td}>{task.jobDescription?.name || '-'}</td>
                      <td style={styles.td}><span style={{...styles.statusBadge, background: task.status === 'open' ? '#10b981' : '#f59e0b'}}>{task.status}</span></td>
                      <td style={styles.td}><button onClick={() => handleDeleteTask(task._id, task.title)} style={styles.deleteButton}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <h2 style={styles.sectionTitle}>Pending Requests</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Staff</th><th style={styles.th}>Task</th><th style={styles.th}>Date</th><th style={styles.th}>Time</th><th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id} style={styles.tableRow}>
                      <td style={styles.td}>{app.employee?.name}</td>
                      <td style={styles.td}>{app.task?.title}</td>
                      <td style={styles.td}>{app.task?.date ? new Date(app.task.date).toLocaleDateString() : '-'}</td>
                      <td style={styles.td}>{app.task?.startTime} - {app.task?.endTime}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleApproveApplication(app._id)} style={styles.approveButton}>✓</button>
                        <button onClick={() => handleRejectApplication(app._id)} style={styles.rejectButton}>✗</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 style={styles.sectionTitle}>Reports</h2>
            <div style={styles.reportsGrid}>
              <div style={styles.reportCard}><i className="fas fa-chart-bar"></i><h3>Attendance</h3><button style={styles.reportButton}>Generate</button></div>
              <div style={styles.reportCard}><i className="fas fa-clock"></i><h3>Hours Worked</h3><button style={styles.reportButton}>Generate</button></div>
              <div style={styles.reportCard}><i className="fas fa-file-pdf"></i><h3>Export PDF</h3><button style={styles.reportButton}>Export</button></div>
            </div>
          </div>
        )}
      </div>

      {showCreateEmployeeModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateEmployeeModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add Staff</h2>
            <form onSubmit={handleCreateEmployee}>
              <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
              <input type="email" placeholder="Email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} style={styles.input} required />
              <input type="password" placeholder="Temporary Password" value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} style={styles.input} required />
              <select value={formData.jobDescription || ''} onChange={(e) => setFormData({...formData, jobDescription: e.target.value})} style={styles.select} required>
                <option value="">Select Job Role</option>
                {jobDescriptions.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
              </select>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateEmployeeModal(false)} style={styles.cancelButton}>Cancel</button>
                <button type="submit" style={styles.submitButton}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateTaskModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateTaskModal)}>
          <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Task Title *</label>
                <input type="text" placeholder="e.g., Morning Shift" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea placeholder="Describe the task..." value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} style={styles.textarea} rows="2" />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date *</label>
                  <input type="date" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Time *</label>
                  <input type="time" value={formData.startTime || ''} onChange={(e) => setFormData({...formData, startTime: e.target.value})} style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Time *</label>
                  <input type="time" value={formData.endTime || ''} onChange={(e) => setFormData({...formData, endTime: e.target.value})} style={styles.input} required />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Branch *</label>
                <select value={formData.branch || ''} onChange={(e) => setFormData({...formData, branch: e.target.value})} style={styles.select} required>
                  <option value="">Select Branch</option>
                  {branches.filter(b => assignedBranchIds.includes(b._id)).map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Job Role *</label>
                  <select value={formData.jobDescription || ''} onChange={(e) => setFormData({...formData, jobDescription: e.target.value})} style={styles.select} required>
                    <option value="">Select Role</option>
                    {jobDescriptions.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Max Employees</label>
                  <input type="number" placeholder="1" value={formData.maxEmployees || 1} onChange={(e) => setFormData({...formData, maxEmployees: parseInt(e.target.value)})} style={styles.input} min="1" />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input type="text" placeholder="e.g., Room 101" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} style={styles.input} />
              </div>
              
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateTaskModal(false)} style={styles.cancelButton}>Cancel</button>
                <button type="submit" style={styles.submitButton}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowProfileModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Profile Settings</h2>
            <p><strong>{user?.name}</strong> ({user?.email})</p>
            <button onClick={() => { setShowProfileModal(false); setShowChangeEmailModal(true); }} style={styles.changeEmailButton}>Change Email</button>
            <h3 style={styles.subTitle}>Change Password</h3>
            <input type="password" placeholder="Current Password" value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder="New Password" value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder="Confirm" value={profileData.confirmPassword} onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})} style={styles.input} />
            <button onClick={handleUpdateProfile} style={styles.submitButton}>Update Password</button>
            <div style={styles.dangerZone}><h3 style={{color:'#ef4444'}}>Danger Zone</h3><button onClick={() => { setShowProfileModal(false); setShowDeleteAccountModal(true); }} style={styles.deleteAccountButton}>Delete My Account</button></div>
          </div>
        </div>
      )}

      {showChangeEmailModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowChangeEmailModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Change Email</h2>
            <p>Current: {user?.email}</p>
            <input type="email" placeholder="New Email" value={changeEmailData.newEmail} onChange={(e) => setChangeEmailData({...changeEmailData, newEmail: e.target.value})} style={styles.input} />
            <input type="email" placeholder="Confirm" value={changeEmailData.confirmEmail} onChange={(e) => setChangeEmailData({...changeEmailData, confirmEmail: e.target.value})} style={styles.input} />
            <input type="password" placeholder="Current Password" value={changeEmailData.password} onChange={(e) => setChangeEmailData({...changeEmailData, password: e.target.value})} style={styles.input} />
            <div style={styles.modalButtons}><button onClick={() => setShowChangeEmailModal(false)} style={styles.cancelButton}>Cancel</button><button onClick={handleChangeEmail} style={styles.submitButton}>Change</button></div>
          </div>
        </div>
      )}

      {showResetPasswordModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowResetPasswordModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Reset Password</h2>
            <p>For: {selectedUser?.name}</p>
            <input type="password" placeholder="New Password" value={resetPasswordData.newPassword} onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder="Confirm" value={resetPasswordData.confirmPassword} onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})} style={styles.input} />
            <div style={styles.modalButtons}><button onClick={() => setShowResetPasswordModal(false)} style={styles.cancelButton}>Cancel</button><button onClick={handleResetUserPassword} style={styles.submitButton}>Reset</button></div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowDeleteAccountModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Delete Account</h2>
            <p>Are you sure? This cannot be undone.</p>
            <div style={styles.modalButtons}><button onClick={() => setShowDeleteAccountModal(false)} style={styles.cancelButton}>Cancel</button><button onClick={handleDeleteAccount} style={styles.confirmDeleteButton}>Delete</button></div>
          </div>
        </div>
      )}

      <button style={styles.chatButton} onClick={() => setShowChat(!showChat)}>
        <i className="fas fa-robot"></i>
      </button>

      {showChat && (
        <div style={styles.chatModal}>
          <div style={styles.chatHeader}>
            <span><i className="fas fa-robot"></i> AI Assistant</span>
            <button onClick={() => setShowChat(false)} style={styles.chatClose}>✕</button>
          </div>
          <div style={styles.chatMessages}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{...styles.chatMessage, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'}}>
                <div style={{...styles.messageBubble, background: msg.sender === 'user' ? '#00d1ff' : '#1e293b'}}>
                  {msg.sender === 'ai' && <i className="fas fa-robot"></i>} {msg.text}
                  <div style={styles.messageTime}>{msg.time}</div>
                </div>
              </div>
            ))}
            {isAiTyping && <div style={styles.typingIndicator}>AI is typing...</div>}
          </div>
          <div style={styles.chatInputContainer}>
            <input type="text" placeholder="Ask me..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()} style={styles.chatInput} />
            <button onClick={sendChatMessage} style={styles.chatSend}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '20px', fontFamily: 'Inter, sans-serif' },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' },
  loadingSpinner: { width: '40px', height: '40px', border: '3px solid rgba(0,209,255,0.3)', borderRadius: '50%', borderTopColor: '#00d1ff', animation: 'spin 1s linear infinite' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  logoSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  orgLogo: { width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' },
  logoPlaceholder: { width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  title: { fontSize: '22px', fontWeight: 'bold', color: 'white', margin: 0 },
  userNameBadge: { background: 'rgba(0,209,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', color: '#00d1ff' },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: '2px' },
  headerButtons: { display: 'flex', gap: '8px' },
  profileButton: { padding: '6px 14px', background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  logoutButton: { padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '20px' },
  statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px', textAlign: 'center' },
  statIconSmall: { fontSize: '18px', color: '#00d1ff', marginBottom: '4px' },
  statValueSmall: { fontSize: '20px', fontWeight: 'bold', color: 'white' },
  statLabelSmall: { fontSize: '10px', color: 'rgba(255,255,255,0.6)' },
  tabs: { display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' },
  tab: { padding: '6px 14px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '20px', fontSize: '11px' },
  content: { background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: 'white' },
  sectionDesc: { color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '14px' },
  addButton: { padding: '6px 14px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  createTaskButton: { padding: '6px 14px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  searchInput: { padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'white', width: '100%', marginBottom: '14px', fontSize: '12px' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  tableHeaderRow: { borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'rgba(255,255,255,0.6)' },
  th: { padding: '10px 8px' },
  tableRow: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td: { padding: '10px 8px', color: 'white' },
  statusBadge: { padding: '2px 6px', borderRadius: '20px', fontSize: '9px', fontWeight: '600', color: 'white', display: 'inline-block' },
  resetButton: { background: 'rgba(245,158,11,0.2)', border: '1px solid #f59e0b', borderRadius: '6px', padding: '4px 8px', color: '#f59e0b', cursor: 'pointer', fontSize: '12px', marginRight: '4px' },
  deleteButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '6px', padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: '12px' },
  approveButton: { background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', borderRadius: '6px', padding: '4px 8px', color: '#10b981', cursor: 'pointer', fontSize: '12px', marginRight: '4px' },
  rejectButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '6px', padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: '12px' },
  reportsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' },
  reportCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: 'center' },
  reportButton: { marginTop: '10px', padding: '5px 10px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '10px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '20px', maxWidth: '400px', width: '90%', maxHeight: '80vh', overflowY: 'auto' },
  modalLarge: { background: '#1e293b', borderRadius: '16px', padding: '20px', maxWidth: '550px', width: '90%', maxHeight: '85vh', overflowY: 'auto' },
  modalTitle: { fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '16px' },
  subTitle: { fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '12px', marginTop: '16px' },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '4px', display: 'block' },
  input: { width: '100%', padding: '8px 10px', marginBottom: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', boxSizing: 'border-box', fontSize: '12px' },
  textarea: { width: '100%', padding: '8px 10px', marginBottom: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '12px', resize: 'vertical' },
  select: { width: '100%', padding: '8px 10px', marginBottom: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '12px' },
  formGroup: { marginBottom: '12px' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '12px' },
  modalButtons: { display: 'flex', gap: '10px', marginTop: '16px' },
  cancelButton: { flex: 1, padding: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '12px' },
  submitButton: { flex: 1, padding: '8px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '12px' },
  confirmDeleteButton: { flex: 1, padding: '8px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '12px' },
  deleteAccountButton: { padding: '8px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', width: '100%', marginTop: '10px', fontSize: '12px' },
  changeEmailButton: { padding: '8px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', width: '100%', marginBottom: '12px', fontSize: '12px' },
  dangerZone: { marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  welcomeCard: { background: 'rgba(0,209,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', marginTop: '12px' },
  welcomeTitle: { fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '6px' },
  welcomeText: { fontSize: '12px', color: 'rgba(255,255,255,0.7)' },
  quickActions: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' },
  quickActionBtn: { padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  chatButton: { position: 'fixed', bottom: '20px', right: '20px', width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', zIndex: 1000 },
  chatModal: { position: 'fixed', bottom: '80px', right: '20px', width: '280px', height: '400px', background: '#0f172a', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1001 },
  chatHeader: { padding: '10px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' },
  chatClose: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' },
  chatMessages: { flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' },
  chatMessage: { display: 'flex' },
  messageBubble: { maxWidth: '85%', padding: '6px 10px', borderRadius: '12px', color: 'white', fontSize: '11px', lineHeight: '1.4' },
  messageTime: { fontSize: '8px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' },
  typingIndicator: { padding: '6px 10px', background: '#1e293b', borderRadius: '12px', width: '50px', fontSize: '10px' },
  chatInputContainer: { padding: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '6px' },
  chatInput: { flex: 1, padding: '6px 10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', outline: 'none', fontSize: '11px' },
  chatSend: { padding: '6px 10px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '12px' }
};

export default AdminDashboard;