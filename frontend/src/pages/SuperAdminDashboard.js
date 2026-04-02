import React, { useState, useEffect } from 'react';

  const SuperAdminDashboard = ({ user, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previousTab, setPreviousTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [showCreateBranchModal, setShowCreateBranchModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
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
    totalAdmins: 0,
    totalEmployees: 0,
    totalTasks: 0,
    totalBranches: 0,
    pendingApplications: 0,
    totalJobDescriptions: 0
  });
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showBranchAssignmentModal, setShowBranchAssignmentModal] = useState(false);
  const [selectedAdminForBranch, setSelectedAdminForBranch] = useState(null);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [assignedBranches, setAssignedBranches] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const savedLogo = localStorage.getItem('organizationLogo');
    if (savedLogo) setLogoPreview(savedLogo);
    setChatMessages([{
      text: "Hello! I'm your TaskBridge AI Assistant. I can help you manage your organization. What would you like to do?",
      sender: 'ai',
      time: new Date().toLocaleTimeString()
    }]);
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        localStorage.setItem('organizationLogo', reader.result);
        alert('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [usersRes, branchesRes, tasksRes, appsRes, jobsRes] = await Promise.all([
        fetch('https://taskbridge-production-9d91.up.railway.app/api/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://taskbridge-production-9d91.up.railway.app/api/branches', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://taskbridge-production-9d91.up.railway.app/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://taskbridge-production-9d91.up.railway.app/api/applications/pending', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://taskbridge-production-9d91.up.railway.app/api/job-descriptions', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const usersData = await usersRes.json();
      const branchesData = await branchesRes.json();
      const tasksData = await tasksRes.json();
      const appsData = await appsRes.json();
      const jobsData = await jobsRes.json();
      
      const allUsers = usersData.data || [];
      const filteredAdmins = allUsers.filter(u => u.role === 'admin' && u.email !== user?.email);
      const filteredEmployees = allUsers.filter(u => u.role === 'employee');
      
      setAdmins(filteredAdmins);
      setEmployees(filteredEmployees);
      setBranches(branchesData.data || []);
      setTasks(tasksData.data || []);
      setApplications(appsData.data || []);
      setJobDescriptions(jobsData.data || []);
      setStats({
        totalAdmins: filteredAdmins.length,
        totalEmployees: filteredEmployees.length,
        totalTasks: tasksData.data?.length || 0,
        totalBranches: branchesData.data?.length || 0,
        pendingApplications: appsData.data?.length || 0,
        totalJobDescriptions: jobsData.data?.length || 0
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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, role: 'admin' })
      });
      
      if (response.ok) {
        alert('Admin created successfully!');
        setShowCreateAdminModal(false);
        setFormData({});
        fetchDashboardData();
      } else {
        alert('Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Error creating admin');
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

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Branch created successfully!');
        setShowCreateBranchModal(false);
        setFormData({});
        fetchDashboardData();
      } else {
        alert('Failed to create branch');
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      alert('Error creating branch');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/job-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Job role created successfully!');
        setShowCreateJobModal(false);
        setFormData({});
        fetchDashboardData();
      } else {
        alert('Failed to create job role');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Error creating job role');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Task created successfully!');
        setShowCreateTaskModal(false);
        setFormData({});
        fetchDashboardData();
      } else {
        alert('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
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

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!confirm(`Delete ${adminName}? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${adminId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Failed to delete admin');
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

  const handleDeleteBranch = async (branchId, branchName) => {
    if (!confirm(`Delete ${branchName}? This affects all employees.`)) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/branches/${branchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting branch:', error);
      alert('Failed to delete branch');
    }
  };

  const handleDeleteJob = async (jobId, jobName) => {
    if (!confirm(`Delete ${jobName}? This affects employees with this role.`)) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/job-descriptions/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job role');
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
    if (!confirm('⚠️ WARNING: This will delete YOUR account only. Other admins can continue. Are you sure?')) return;
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
        response = "To add an employee:\n1. Go to Employees tab\n2. Click Add Employee\n3. Enter name, email, password\n4. Select job role and branch\n5. Click Create";
      }
      else if (input.includes('add admin')) {
        response = "To add an admin:\n1. Go to Admins tab\n2. Click Add Admin\n3. Enter details\n4. Click Create";
      }
      else if (input.includes('approve application')) {
        response = "To approve applications:\n1. Go to Applications tab\n2. Click green checkmark to approve\n3. Click red X to reject (with reason)";
      }
      else {
        response = "I can help with:\n• Creating tasks\n• Adding employees/admins\n• Managing branches\n• Approving applications\n• Generating reports\n• Resetting passwords\n\nWhat would you like to know?";
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
              <h1 style={styles.title}>Super Admin Dashboard</h1>
              <span style={styles.userNameBadge}>
                <i className="fas fa-user-shield"></i> {user?.name}
              </span>
            </div>
            <p style={styles.subtitle}>Manage {user?.organization?.name || 'your organization'}</p>
          </div>
        </div>
        <div style={styles.headerButtons}>
          <button onClick={() => setShowProfileModal(true)} style={styles.profileButton}>Profile</button>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-user-tie"></i></div><div style={styles.statValueSmall}>{stats.totalAdmins}</div><div style={styles.statLabelSmall}>Admins</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-users"></i></div><div style={styles.statValueSmall}>{stats.totalEmployees}</div><div style={styles.statLabelSmall}>Employees</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-tasks"></i></div><div style={styles.statValueSmall}>{stats.totalTasks}</div><div style={styles.statLabelSmall}>Tasks</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-store"></i></div><div style={styles.statValueSmall}>{stats.totalBranches}</div><div style={styles.statLabelSmall}>Branches</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-briefcase"></i></div><div style={styles.statValueSmall}>{stats.totalJobDescriptions}</div><div style={styles.statLabelSmall}>Job Roles</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-clock"></i></div><div style={styles.statValueSmall}>{stats.pendingApplications}</div><div style={styles.statLabelSmall}>Pending</div></div>
      </div>

      <div style={styles.tabs}>
        <button onClick={() => handleTabChange('dashboard')} style={{...styles.tab, background: activeTab === 'dashboard' ? '#00d1ff' : 'transparent'}}>Home</button>
        <button onClick={() => handleTabChange('admins')} style={{...styles.tab, background: activeTab === 'admins' ? '#00d1ff' : 'transparent'}}>Admins</button>
        <button onClick={() => handleTabChange('employees')} style={{...styles.tab, background: activeTab === 'employees' ? '#00d1ff' : 'transparent'}}>Staff</button>
        <button onClick={() => handleTabChange('branches')} style={{...styles.tab, background: activeTab === 'branches' ? '#00d1ff' : 'transparent'}}>Branches</button>
        <button onClick={() => onNavigate('calendar')} style={{...styles.tab, background: activeTab === 'calendar' ? '#00d1ff' : 'transparent'}}>Calendar</button>
        <button onClick={() => handleTabChange('jobs')} style={{...styles.tab, background: activeTab === 'jobs' ? '#00d1ff' : 'transparent'}}>Roles</button>
        <button onClick={() => handleTabChange('tasks')} style={{...styles.tab, background: activeTab === 'tasks' ? '#00d1ff' : 'transparent'}}>Tasks</button>
        <button onClick={() => handleTabChange('applications')} style={{...styles.tab, background: activeTab === 'applications' ? '#00d1ff' : 'transparent'}}>Requests</button>
        <button onClick={() => handleTabChange('reports')} style={{...styles.tab, background: activeTab === 'reports' ? '#00d1ff' : 'transparent'}}>Reports</button>
        <button onClick={() => handleTabChange('settings')} style={{...styles.tab, background: activeTab === 'settings' ? '#00d1ff' : 'transparent'}}>Settings</button>
      </div>

      <div style={styles.content}>
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={styles.sectionTitle}>Welcome, {user?.name}!</h2>
            <p style={styles.sectionDesc}>You have full control over your organization. Manage everything directly or create admins to help.</p>
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

        {activeTab === 'admins' && (
            <div>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Admin Management</h2>
                <button onClick={() => setShowCreateAdminModal(true)} style={styles.addButton}>+ Add Admin</button>
              </div>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Assigned Branches</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(admin => (
                      <tr key={admin._id} style={styles.tableRow}>
                        <td style={styles.td}>{admin.name}</td>
                        <td style={styles.td}>{admin.email}</td>
                        <td style={styles.td}>
                          <div>
                            {(admin.assignedBranches || []).map(b => (
                              <span key={b._id} style={styles.branchTag}>{b.name}</span>
                            ))}
                            <button 
                              onClick={() => {
                                setSelectedAdminForBranch(admin);
                                setShowBranchAssignmentModal(true);
                              }} 
                              style={styles.assignBranchButton}
                            >
                              Manage Branches
                            </button>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{...styles.statusBadge, background: admin.isActive ? '#10b981' : '#ef4444'}}>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button onClick={() => { setSelectedUser(admin); setShowResetPasswordModal(true); }} style={styles.resetButton}>🔑</button>
                            <button onClick={() => handleDeleteAdmin(admin._id, admin.name)} style={styles.deleteButton}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    <th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>Job Role</th><th style={styles.th}>Branch</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.filter(e => e.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
                    <tr key={emp._id} style={styles.tableRow}>
                      <td style={styles.td}>{emp.name}</td>
                      <td style={styles.td}>{emp.email}</td>
                      <td style={styles.td}>{emp.jobDescription?.name || '-'}</td>
                      <td style={styles.td}>{emp.branch?.name || '-'}</td>
                      <td style={styles.td}><span style={{...styles.statusBadge, background: emp.isActive ? '#10b981' : '#ef4444'}}>{emp.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td style={styles.td}><button onClick={() => { setSelectedUser(emp); setShowResetPasswordModal(true); }} style={styles.resetButton}>🔑</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Branches</h2>
              <button onClick={() => setShowCreateBranchModal(true)} style={styles.addButton}>+ Add Branch</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Name</th><th style={styles.th}>City</th><th style={styles.th}>Staff</th><th style={styles.th}>Admins</th><th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map(branch => (
                    <tr key={branch._id} style={styles.tableRow}>
                      <td style={styles.td}>{branch.name}</td>
                      <td style={styles.td}>{branch.address?.city || '-'}</td>
                      <td style={styles.td}>{employees.filter(e => e.branch?._id === branch._id).length}</td>
                      <td style={styles.td}>{admins.filter(a => a.branch?._id === branch._id).length}</td>
                      <td style={styles.td}><button onClick={() => handleDeleteBranch(branch._id, branch.name)} style={styles.deleteButton}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Job Roles</h2>
              <button onClick={() => setShowCreateJobModal(true)} style={styles.addButton}>+ Add Role</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Role</th><th style={styles.th}>Description</th><th style={styles.th}>Staff</th><th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobDescriptions.map(job => (
                    <tr key={job._id} style={styles.tableRow}>
                      <td style={styles.td}>{job.name}</td>
                      <td style={styles.td}>{job.description || '-'}</td>
                      <td style={styles.td}>{employees.filter(e => e.jobDescription?._id === job._id).length}</td>
                      <td style={styles.td}><button onClick={() => handleDeleteJob(job._id, job.name)} style={styles.deleteButton}>🗑️</button></td>
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
                    <th style={styles.th}>Title</th><th style={styles.th}>Date</th><th style={styles.th}>Time</th><th style={styles.th}>Role</th><th style={styles.th}>Branch</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task._id} style={styles.tableRow}>
                      <td style={styles.td}>{task.title}</td>
                      <td style={styles.td}>{new Date(task.date).toLocaleDateString()}</td>
                      <td style={styles.td}>{task.startTime} - {task.endTime}</td>
                      <td style={styles.td}>{task.jobDescription?.name || '-'}</td>
                      <td style={styles.td}>{task.branch?.name || '-'}</td>
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
                      <td style={styles.td}><div style={styles.actionButtons}><button onClick={() => handleApproveApplication(app._id)} style={styles.approveButton}>✓</button><button onClick={() => handleRejectApplication(app._id)} style={styles.rejectButton}>✗</button></div></td>
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
              <div style={styles.reportCard}><i className="fas fa-chart-bar"></i><h3 style={{color: 'white'}}>Attendance</h3><button style={styles.reportButton}>Generate</button></div>
              <div style={styles.reportCard}><i className="fas fa-clock"></i><h3 style={{color: 'white'}}>Hours Worked</h3><button style={styles.reportButton}>Generate</button></div>
              <div style={styles.reportCard}><i className="fas fa-file-pdf"></i><h3 style={{color: 'white'}}>Export PDF</h3><button style={styles.reportButton}>Export</button></div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 style={styles.sectionTitle}>Settings</h2>
            <div style={styles.settingsCard}>
              <h3>Organization Logo</h3>
              {logoPreview && <img src={logoPreview} alt="Logo" style={styles.logoPreview} />}
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={styles.fileInput} />
              <button style={styles.uploadButton}>Upload Logo</button>
            </div>
            <div style={styles.settingsCard}><h3>Subscription</h3><p>Professional - $99/month</p><button onClick={() => setShowSubscriptionModal(true)} style={styles.upgradeButton}>Upgrade</button><button style={styles.invoiceButton}>Invoices</button></div>
            <div style={styles.settingsCard}><h3>Audit Logs</h3><button style={styles.viewButton}>View Logs</button></div>
          </div>
        )}
      </div>

      {/* All Modals - Keep existing modal code */}
      {showCreateAdminModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateAdminModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add Admin</h2>
            <form onSubmit={handleCreateAdmin}>
              <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
              <input type="email" placeholder="Email Address" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} style={styles.input} required />
              <input type="password" placeholder="Temporary Password" value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} style={styles.input} required />
              <select value={formData.branch || ''} onChange={(e) => setFormData({...formData, branch: e.target.value})} style={styles.select}>
                <option value="">Select Branch (Optional)</option>
                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateAdminModal(false)} style={styles.cancelButton}>Cancel</button>
                <button type="submit" style={styles.submitButton}>Create Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateEmployeeModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateEmployeeModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add Staff</h2>
            <form onSubmit={handleCreateEmployee}>
              <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
              <input type="email" placeholder="Email Address" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} style={styles.input} required />
              <input type="password" placeholder="Temporary Password" value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} style={styles.input} required />
              <select value={formData.jobDescription || ''} onChange={(e) => setFormData({...formData, jobDescription: e.target.value})} style={styles.select} required>
                <option value="">Select Job Role</option>
                {jobDescriptions.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
              </select>
              <select value={formData.branch || ''} onChange={(e) => setFormData({...formData, branch: e.target.value})} style={styles.select} required>
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateEmployeeModal(false)} style={styles.cancelButton}>Cancel</button>
                <button type="submit" style={styles.submitButton}>Create Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateBranchModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateBranchModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add Branch</h2>
            <form onSubmit={handleCreateBranch}>
              <input type="text" placeholder="Branch Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
              <input type="text" placeholder="City" value={formData.city || ''} onChange={(e) => setFormData({...formData, city: e.target.value})} style={styles.input} />
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateBranchModal(false)} style={styles.cancelButton}>Cancel</button>
                <button type="submit" style={styles.submitButton}>Create Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateJobModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateJobModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add Job Role</h2>
            <form onSubmit={handleCreateJob}>
              <input type="text" placeholder="Role Name (e.g., Teacher, Nurse)" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
              <textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} style={styles.textarea} rows="2" />
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateJobModal(false)} style={styles.cancelButton}>Cancel</button>
                <button type="submit" style={styles.submitButton}>Create Role</button>
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
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Job Role *</label>
                  <select value={formData.jobDescription || ''} onChange={(e) => setFormData({...formData, jobDescription: e.target.value})} style={styles.select} required>
                    <option value="">Select Role</option>
                    {jobDescriptions.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Branch *</label>
                  <select value={formData.branch || ''} onChange={(e) => setFormData({...formData, branch: e.target.value})} style={styles.select} required>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Max Employees</label>
                  <input type="number" placeholder="1" value={formData.maxEmployees || 1} onChange={(e) => setFormData({...formData, maxEmployees: parseInt(e.target.value)})} style={styles.input} min="1" />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input type="text" placeholder="e.g., Room 101, Building A" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateTaskModal(false)} style={styles.cancelButton}>Cancel</button>
                <button type="submit" style={styles.submitButton}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetPasswordModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowResetPasswordModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Reset Password</h2>
            <p>Reset password for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})</p>
            <input type="password" placeholder="New Password" value={resetPasswordData.newPassword} onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder="Confirm Password" value={resetPasswordData.confirmPassword} onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})} style={styles.input} />
            <div style={styles.modalButtons}>
              <button type="button" onClick={() => setShowResetPasswordModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleResetUserPassword} style={styles.submitButton}>Reset Password</button>
            </div>
          </div>
        </div>
      )}
      {/* Branch Assignment Modal */}
            {showBranchAssignmentModal && (
              <div style={styles.modalOverlay} onClick={() => setShowBranchAssignmentModal(false)}>
                <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
                  <h2 style={styles.modalTitle}>Manage Branches for {selectedAdminForBranch?.name}</h2>
                  <p>Select branches this admin can manage:</p>
                  <div style={styles.branchListContainer}>
                    {branches.map(branch => (
                      <div key={branch._id} style={styles.branchCheckboxItem}>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={selectedAdminForBranch?.assignedBranches?.some(b => b._id === branch._id)}
                            onChange={async (e) => {
                              const isChecked = e.target.checked;
                              if (isChecked) {
                                // Assign branch
                                try {
                                  const token = localStorage.getItem('token');
                                  const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${selectedAdminForBranch._id}/assign-branch`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ branchId: branch._id })
                                  });
                                  
                                  if (response.ok) {
                                    // Update local state
                                    setSelectedAdminForBranch(prev => ({
                                      ...prev,
                                      assignedBranches: [...(prev.assignedBranches || []), branch]
                                    }));
                                    // Refresh admin list
                                    fetchDashboardData();
                                  }
                                } catch (error) {
                                  console.error('Error assigning branch:', error);
                                }
                              } else {
                                // Remove branch
                                try {
                                  const token = localStorage.getItem('token');
                                  const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${selectedAdminForBranch._id}/remove-branch`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ branchId: branch._id })
                                  });
                                  
                                  if (response.ok) {
                                    // Update local state
                                    setSelectedAdminForBranch(prev => ({
                                      ...prev,
                                      assignedBranches: (prev.assignedBranches || []).filter(b => b._id !== branch._id)
                                    }));
                                    // Refresh admin list
                                    fetchDashboardData();
                                  }
                                } catch (error) {
                                  console.error('Error removing branch:', error);
                                }
                              }
                            }}
                            style={styles.checkbox}
                          />
                          {branch.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div style={styles.modalButtons}>
                    <button onClick={() => setShowBranchAssignmentModal(false)} style={styles.cancelButton}>Close</button>
                  </div>
                </div>
              </div>
            )}
      {showChangeEmailModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowChangeEmailModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Change Email</h2>
            <p>Current email: <strong>{user?.email}</strong></p>
            <input type="email" placeholder="New Email" value={changeEmailData.newEmail} onChange={(e) => setChangeEmailData({...changeEmailData, newEmail: e.target.value})} style={styles.input} />
            <input type="email" placeholder="Confirm New Email" value={changeEmailData.confirmEmail} onChange={(e) => setChangeEmailData({...changeEmailData, confirmEmail: e.target.value})} style={styles.input} />
            <input type="password" placeholder="Current Password" value={changeEmailData.password} onChange={(e) => setChangeEmailData({...changeEmailData, password: e.target.value})} style={styles.input} />
            <div style={styles.modalButtons}>
              <button type="button" onClick={() => setShowChangeEmailModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleChangeEmail} style={styles.submitButton}>Change Email</button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowProfileModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Profile Settings</h2>
            <div style={styles.profileInfo}>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> Super Admin</p>
              <p><strong>Organization:</strong> {user?.organization?.name}</p>
            </div>
            <button onClick={() => { setShowProfileModal(false); setShowChangeEmailModal(true); }} style={styles.changeEmailButton}>Change Email</button>
            <h3 style={styles.subTitle}>Change Password</h3>
            <input type="password" placeholder="Current Password" value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder="New Password" value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder="Confirm New Password" value={profileData.confirmPassword} onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})} style={styles.input} />
            <button onClick={handleUpdateProfile} style={styles.submitButton}>Update Password</button>
            <div style={styles.dangerZone}>
              <h3 style={{ color: '#ef4444' }}>Danger Zone</h3>
              <button onClick={() => { setShowProfileModal(false); setShowDeleteAccountModal(true); }} style={styles.deleteAccountButton}>Delete My Account</button>
              <p style={styles.warningText}>⚠️ This will delete YOUR account only. Other admins can continue managing.</p>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowDeleteAccountModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Delete Your Account</h2>
            <p>Are you sure you want to delete your account?</p>
            <p style={{ color: '#ef4444' }}>⚠️ This action cannot be undone. Your personal data will be removed.</p>
            <p>Other admins can continue managing the organization.</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteAccountModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleDeleteAccount} style={styles.confirmDeleteButton}>Delete My Account</button>
            </div>
          </div>
        </div>
      )}

      {showSubscriptionModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowSubscriptionModal)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Upgrade Subscription</h2>
            <p>Choose a plan that fits your needs</p>
            <div style={styles.planOptions}>
              <div style={styles.planCard}><h3>Professional</h3><div>$99/month</div><ul><li>✓ Up to 200 employees</li><li>✓ 5 branches</li><li>✓ Advanced reports</li><li>✓ Priority support</li></ul><button style={styles.planButton}>Current Plan</button></div>
              <div style={styles.planCard}><h3>Enterprise</h3><div>$299/month</div><ul><li>✓ Unlimited employees</li><li>✓ Unlimited branches</li><li>✓ Custom reports</li><li>✓ 24/7 support</li><li>✓ API access</li></ul><button style={styles.planButton}>Upgrade</button></div>
            </div>
            <p style={styles.contactInfo}>Need a custom plan? <a href="mailto:georgeglor@hotmail.com">Contact us</a></p>
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
  branchTag: {
  display: 'inline-block',
  background: 'rgba(0,209,255,0.2)',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '10px',
  marginRight: '4px',
  marginBottom: '4px',
  color: '#00d1ff',
},
assignBranchButton: {
  background: 'rgba(59,130,246,0.2)',
  border: '1px solid #3b82f6',
  borderRadius: '6px',
  padding: '2px 8px',
  color: '#3b82f6',
  cursor: 'pointer',
  fontSize: '10px',
  marginTop: '4px',
},
branchListContainer: {
  maxHeight: '300px',
  overflowY: 'auto',
  marginBottom: '20px',
},
branchCheckboxItem: {
  padding: '8px',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
},
checkboxLabel: {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: 'white',
  cursor: 'pointer',
},
checkbox: {
  width: '16px',
  height: '16px',
  cursor: 'pointer',
},
noBranchText: {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '11px',
},
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
  actionButtons: { display: 'flex', gap: '6px' },
  resetButton: { background: 'rgba(245,158,11,0.2)', border: '1px solid #f59e0b', borderRadius: '6px', padding: '4px 8px', color: '#f59e0b', cursor: 'pointer', fontSize: '12px' },
  deleteButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '6px', padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: '12px' },
  approveButton: { background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', borderRadius: '6px', padding: '4px 8px', color: '#10b981', cursor: 'pointer', fontSize: '12px' },
  rejectButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '6px', padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: '12px' },
  reportsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' },
  reportCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: 'center' },
  reportButton: { marginTop: '10px', padding: '5px 10px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '10px' },
  settingsCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', marginBottom: '12px' },
  fileInput: { margin: '10px 0', padding: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', width: '100%', fontSize: '11px' },
  uploadButton: { padding: '6px 12px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  upgradeButton: { padding: '6px 12px', background: '#10b981', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', marginRight: '6px', fontSize: '11px' },
  invoiceButton: { padding: '6px 12px', background: '#8b5cf6', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  viewButton: { padding: '6px 12px', background: '#3b82f6', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '24px', maxWidth: '450px', width: '90%', maxHeight: '85vh', overflowY: 'auto' },
  modalLarge: { background: '#1e293b', borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '90%', maxHeight: '85vh', overflowY: 'auto' },
  modalTitle: { fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '20px' },
  subTitle: { fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '12px', marginTop: '16px' },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '6px', display: 'block' },
  input: { width: '100%', padding: '10px 12px', marginBottom: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', boxSizing: 'border-box', fontSize: '13px' },
  textarea: { width: '100%', padding: '10px 12px', marginBottom: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' },
  select: { width: '100%', padding: '10px 12px', marginBottom: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px' },
  formGroup: { marginBottom: '14px' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '14px' },
  modalButtons: { display: 'flex', gap: '12px', marginTop: '20px' },
  cancelButton: { flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px' },
  submitButton: { flex: 1, padding: '10px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px' },
  confirmDeleteButton: { flex: 1, padding: '10px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px' },
  deleteAccountButton: { padding: '10px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', width: '100%', marginTop: '12px', fontSize: '13px' },
  changeEmailButton: { padding: '10px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', width: '100%', marginBottom: '16px', fontSize: '13px' },
  dangerZone: { marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  warningText: { fontSize: '11px', color: '#f87171', marginTop: '8px' },
  profileInfo: { background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '10px', marginBottom: '16px' },
  planOptions: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  planCard: { flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', textAlign: 'center' },
  planButton: { marginTop: '12px', padding: '6px 12px', background: '#00d1ff', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  contactInfo: { textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' },
  logoPreview: { width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', marginBottom: '10px' },
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

export default SuperAdminDashboard;