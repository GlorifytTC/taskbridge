import React, { useState, useEffect } from 'react';

const SuperAdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previousTab, setPreviousTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
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
    approvedShifts: 0
  });
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [adminsRes, employeesRes, branchesRes, tasksRes, appsRes] = await Promise.all([
        fetch('https://taskbridge-production-9d91.up.railway.app/api/users?role=admin', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://taskbridge-production-9d91.up.railway.app/api/users?role=employee', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://taskbridge-production-9d91.up.railway.app/api/branches', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://taskbridge-production-9d91.up.railway.app/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://taskbridge-production-9d91.up.railway.app/api/applications/pending', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const adminsData = await adminsRes.json();
      const employeesData = await employeesRes.json();
      const branchesData = await branchesRes.json();
      const tasksData = await tasksRes.json();
      const appsData = await appsRes.json();
      
      setAdmins(adminsData.data || []);
      setEmployees(employeesData.data || []);
      setBranches(branchesData.data || []);
      setTasks(tasksData.data || []);
      setApplications(appsData.data || []);
      setStats({
        totalAdmins: adminsData.data?.length || 0,
        totalEmployees: employeesData.data?.length || 0,
        totalTasks: tasksData.data?.length || 0,
        totalBranches: branchesData.data?.length || 0,
        pendingApplications: appsData.data?.length || 0,
        approvedShifts: 0
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
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/change-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail })
      });
      
      if (response.ok) {
        alert('Email changed successfully! Please login again.');
        localStorage.removeItem('token');
        onLogout();
      } else {
        alert('Failed to change email');
      }
    } catch (error) {
      console.error('Error changing email:', error);
      alert('Error changing email');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('⚠️ WARNING: This will delete YOUR account only. Other admins can continue managing. Are you sure?')) return;
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

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });
      alert('Password reset successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${adminId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting admin:', error);
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
    }
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
    
    setTimeout(() => {
      const responses = [
        "I can help you manage employees, create tasks, or generate reports. What would you like to know?",
        "To create a new task, go to the Tasks tab and click 'Create Task'. Set date, time, and assign to a job description.",
        "You can view pending applications in the Applications tab. Approve or reject them from there.",
        "To generate a report, go to Reports tab and select the type you need. You can export to PDF or Excel.",
        "Need help with something specific? I'm here to assist you with TaskBridge features!"
      ];
      const aiMessage = { text: responses[Math.floor(Math.random() * responses.length)], sender: 'ai', time: new Date().toLocaleTimeString() };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
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
          <div style={styles.headerTop}>
            {activeTab !== 'dashboard' && (
              <button onClick={goBack} style={styles.backButton}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
            )}
            <h1 style={styles.title}>Super Admin Dashboard</h1>
          </div>
          <p style={styles.subtitle}>Manage {user?.organization?.name || 'your organization'}</p>
        </div>
        <div style={styles.headerButtons}>
          <button onClick={() => setShowProfileModal(true)} style={styles.profileButton}>
            <i className="fas fa-user-cog"></i> Profile
          </button>
          <button onClick={onLogout} style={styles.logoutButton}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statIcon}><i className="fas fa-user-tie"></i></div><div style={styles.statValue}>{stats.totalAdmins}</div><div style={styles.statLabel}>Admins</div></div>
        <div style={styles.statCard}><div style={styles.statIcon}><i className="fas fa-users"></i></div><div style={styles.statValue}>{stats.totalEmployees}</div><div style={styles.statLabel}>Employees</div></div>
        <div style={styles.statCard}><div style={styles.statIcon}><i className="fas fa-tasks"></i></div><div style={styles.statValue}>{stats.totalTasks}</div><div style={styles.statLabel}>Tasks</div></div>
        <div style={styles.statCard}><div style={styles.statIcon}><i className="fas fa-store"></i></div><div style={styles.statValue}>{stats.totalBranches}</div><div style={styles.statLabel}>Branches</div></div>
        <div style={styles.statCard}><div style={styles.statIcon}><i className="fas fa-clock"></i></div><div style={styles.statValue}>{stats.pendingApplications}</div><div style={styles.statLabel}>Pending</div></div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button onClick={() => handleTabChange('dashboard')} style={{...styles.tab, background: activeTab === 'dashboard' ? '#00d1ff' : 'transparent'}}>Dashboard</button>
        <button onClick={() => handleTabChange('admins')} style={{...styles.tab, background: activeTab === 'admins' ? '#00d1ff' : 'transparent'}}>Admins</button>
        <button onClick={() => handleTabChange('employees')} style={{...styles.tab, background: activeTab === 'employees' ? '#00d1ff' : 'transparent'}}>Employees</button>
        <button onClick={() => handleTabChange('branches')} style={{...styles.tab, background: activeTab === 'branches' ? '#00d1ff' : 'transparent'}}>Branches</button>
        <button onClick={() => handleTabChange('tasks')} style={{...styles.tab, background: activeTab === 'tasks' ? '#00d1ff' : 'transparent'}}>Tasks</button>
        <button onClick={() => handleTabChange('applications')} style={{...styles.tab, background: activeTab === 'applications' ? '#00d1ff' : 'transparent'}}>Applications</button>
        <button onClick={() => handleTabChange('reports')} style={{...styles.tab, background: activeTab === 'reports' ? '#00d1ff' : 'transparent'}}>Reports</button>
        <button onClick={() => handleTabChange('settings')} style={{...styles.tab, background: activeTab === 'settings' ? '#00d1ff' : 'transparent'}}>Settings</button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={styles.sectionTitle}>Welcome, {user?.name}!</h2>
            <p style={styles.sectionDesc}>Here's what's happening in your organization today.</p>
            <div style={styles.welcomeCard}>
              <i className="fas fa-chart-line" style={{ fontSize: '48px', color: '#00d1ff', marginBottom: '16px' }}></i>
              <h3>Quick Overview</h3>
              <p>You have {stats.pendingApplications} pending applications and {stats.totalTasks} active tasks.</p>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Admin Management</h2>
              <button onClick={() => { setFormData({}); setShowCreateModal(true); }} style={styles.addButton}><i className="fas fa-plus"></i> Add Admin</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead> <tr><th>Name</th><th>Email</th><th>Branch</th><th>Status</th><th>Actions</th></tr> </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin._id}>
                      <td><strong>{admin.name}</strong></td>
                      <td>{admin.email}</td>
                      <td>{admin.branch?.name || '-'}</td>
                      <td><span style={{...styles.statusBadge, background: admin.isActive ? '#10b981' : '#ef4444'}}>{admin.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td><div style={styles.actionButtons}><button onClick={() => handleResetPassword(admin._id)} style={styles.resetButton}><i className="fas fa-key"></i></button><button onClick={() => handleDeleteAdmin(admin._id)} style={styles.deleteButton}><i className="fas fa-trash"></i></button></div></td>
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
              <h2 style={styles.sectionTitle}>Employee Management</h2>
              <button onClick={() => { setFormData({}); setShowCreateModal(true); }} style={styles.addButton}><i className="fas fa-plus"></i> Add Employee</button>
            </div>
            <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead> <tr><th>Name</th><th>Email</th><th>Job Role</th><th>Branch</th><th>Status</th><th>Actions</th></tr> </thead>
                <tbody>
                  {employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
                    <tr key={emp._id}>
                      <td><strong>{emp.name}</strong></td>
                      <td>{emp.email}</td>
                      <td>{emp.jobDescription?.name || '-'}</td>
                      <td>{emp.branch?.name || '-'}</td>
                      <td><span style={{...styles.statusBadge, background: emp.isActive ? '#10b981' : '#ef4444'}}>{emp.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td><button onClick={() => handleResetPassword(emp._id)} style={styles.resetButton}><i className="fas fa-key"></i></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <h2 style={styles.sectionTitle}>Pending Applications</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead> <tr><th>Employee</th><th>Task</th><th>Date</th><th>Time</th><th>Applied</th><th>Actions</th></tr> </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id}>
                      <td>{app.employee?.name}</td>
                      <td>{app.task?.title}</td>
                      <td>{app.task?.date ? new Date(app.task.date).toLocaleDateString() : '-'}</td>
                      <td>{app.task?.startTime} - {app.task?.endTime}</td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td><div style={styles.actionButtons}><button onClick={() => handleApproveApplication(app._id)} style={styles.approveButton}><i className="fas fa-check"></i></button><button onClick={() => handleRejectApplication(app._id)} style={styles.rejectButton}><i className="fas fa-times"></i></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 style={styles.sectionTitle}>Reports & Analytics</h2>
            <div style={styles.reportsGrid}>
              <div style={styles.reportCard}><i className="fas fa-chart-bar"></i><h3>Attendance Report</h3><p>View daily attendance statistics</p><button style={styles.reportButton}>Generate</button></div>
              <div style={styles.reportCard}><i className="fas fa-clock"></i><h3>Hours Worked</h3><p>Track employee hours</p><button style={styles.reportButton}>Generate</button></div>
              <div style={styles.reportCard}><i className="fas fa-file-pdf"></i><h3>Export PDF</h3><p>Download reports as PDF</p><button style={styles.reportButton}>Export</button></div>
              <div style={styles.reportCard}><i className="fas fa-file-excel"></i><h3>Export Excel</h3><p>Download reports as Excel</p><button style={styles.reportButton}>Export</button></div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 style={styles.sectionTitle}>Settings</h2>
            <div style={styles.settingsCard}>
              <h3>Branding</h3>
              <p>Upload your organization logo</p>
              <input type="file" accept="image/*" style={styles.fileInput} />
              <button style={styles.uploadButton}>Upload Logo</button>
            </div>
            <div style={styles.settingsCard}>
              <h3>Subscription & Billing</h3>
              <p>Current plan: Professional - $99/month</p>
              <button onClick={() => setShowSubscriptionModal(true)} style={styles.upgradeButton}>Upgrade Plan</button>
              <button style={styles.invoiceButton}>View Invoices</button>
            </div>
            <div style={styles.settingsCard}>
              <h3>Audit Logs</h3>
              <p>View all actions performed in your organization</p>
              <button style={styles.viewButton}>View Audit Logs</button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Profile Settings</h2>
            <div style={styles.profileInfo}>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
            </div>
            <h3 style={styles.subTitle}>Change Email</h3>
            <input type="email" placeholder="New Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={styles.input} />
            <button onClick={handleChangeEmail} style={styles.submitButton}>Update Email</button>
            <h3 style={styles.subTitle}>Change Password</h3>
            <input type="password" placeholder="Current Password" value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder="New Password" value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder="Confirm New Password" value={profileData.confirmPassword} onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})} style={styles.input} />
            <button onClick={handleUpdateProfile} style={styles.submitButton}>Update Password</button>
            <div style={styles.dangerZone}>
              <h3 style={{ color: '#ef4444' }}>Danger Zone</h3>
              <button onClick={() => { setShowProfileModal(false); setShowDeleteAccountModal(true); }} style={styles.deleteAccountButton}>Delete My Account</button>
              <p style={styles.warningText}>⚠️ This will delete YOUR account only. Other admins can continue managing the organization.</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteAccountModal(false)}>
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

      {/* Upgrade Subscription Modal */}
      {showSubscriptionModal && (
        <div style={styles.modalOverlay} onClick={() => setShowSubscriptionModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Upgrade Subscription</h2>
            <p>Choose a plan that fits your needs</p>
            <div style={styles.planOptions}>
              <div style={styles.planCard}><h3>Professional</h3><div>$99/month</div><ul><li>✓ Up to 200 employees</li><li>✓ 5 branches</li><li>✓ Advanced reports</li><li>✓ Priority support</li></ul><button style={styles.selectPlanButton}>Current Plan</button></div>
              <div style={styles.planCard}><h3>Enterprise</h3><div>$299/month</div><ul><li>✓ Unlimited employees</li><li>✓ Unlimited branches</li><li>✓ Custom reports</li><li>✓ 24/7 support</li><li>✓ API access</li></ul><button style={styles.selectPlanButton}>Upgrade</button></div>
            </div>
            <p style={styles.contactInfo}>Need a custom plan? <a href="mailto:georgeglor@hotmail.com">Contact us</a></p>
          </div>
        </div>
      )}

      {/* AI Chat Button */}
      <button style={styles.chatButton} onClick={() => setShowChat(!showChat)}>
        <i className="fas fa-robot"></i>
      </button>

      {/* AI Chat Modal */}
      {showChat && (
        <div style={styles.chatModal}>
          <div style={styles.chatHeader}>
            <h3><i className="fas fa-robot"></i> TaskBridge AI Assistant</h3>
            <button onClick={() => setShowChat(false)} style={styles.chatClose}><i className="fas fa-times"></i></button>
          </div>
          <div style={styles.chatMessages}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{...styles.chatMessage, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'}}>
                <div style={{...styles.messageBubble, background: msg.sender === 'user' ? '#00d1ff' : '#1e293b'}}>{msg.text}<div style={styles.messageTime}>{msg.time}</div></div>
              </div>
            ))}
          </div>
          <div style={styles.chatInputContainer}>
            <input type="text" placeholder="Ask me anything..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()} style={styles.chatInput} />
            <button onClick={sendChatMessage} style={styles.chatSend}><i className="fas fa-paper-plane"></i></button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '80px 40px 40px', fontFamily: 'Inter, sans-serif' },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' },
  loadingSpinner: { width: '40px', height: '40px', border: '3px solid rgba(0,209,255,0.3)', borderRadius: '50%', borderTopColor: '#00d1ff', animation: 'spin 1s linear infinite' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' },
  headerTop: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' },
  backButton: { padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '14px' },
  headerButtons: { display: 'flex', gap: '12px' },
  title: { fontSize: '32px', fontWeight: 'bold', color: 'white', margin: 0 },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: '14px' },
  profileButton: { padding: '10px 24px', background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '50px', color: 'white', cursor: 'pointer' },
  logoutButton: { padding: '10px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', color: 'white', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' },
  statCard: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  statIcon: { fontSize: '28px', color: '#00d1ff', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.6)' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' },
  tab: { padding: '10px 20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50px', fontSize: '14px', transition: 'all 0.3s' },
  content: { background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' },
  sectionTitle: { fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '16px' },
  sectionDesc: { color: 'rgba(255,255,255,0.6)', marginBottom: '24px' },
  addButton: { padding: '10px 20px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' },
  searchInput: { padding: '12px 16px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', width: '100%', marginBottom: '20px', fontSize: '14px' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  statusBadge: { padding: '4px 12px', borderRadius: '50px', fontSize: '11px', fontWeight: '600', color: 'white', display: 'inline-block' },
  actionButtons: { display: 'flex', gap: '8px' },
  resetButton: { background: 'rgba(245,158,11,0.2)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '6px 10px', color: '#f59e0b', cursor: 'pointer' },
  deleteButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '8px', padding: '6px 10px', color: '#ef4444', cursor: 'pointer' },
  approveButton: { background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', borderRadius: '8px', padding: '6px 10px', color: '#10b981', cursor: 'pointer' },
  rejectButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '8px', padding: '6px 10px', color: '#ef4444', cursor: 'pointer' },
  reportsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  reportCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  reportButton: { marginTop: '16px', padding: '8px 20px', background: '#00d1ff', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  settingsCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' },
  fileInput: { margin: '16px 0', padding: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', width: '100%' },
  uploadButton: { padding: '10px 20px', background: '#00d1ff', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  upgradeButton: { padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', marginRight: '12px' },
  invoiceButton: { padding: '10px 20px', background: '#8b5cf6', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  viewButton: { padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#1e293b', borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '90%', maxHeight: '85vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' },
  modalTitle: { fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '24px' },
  subTitle: { fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '16px', marginTop: '20px' },
  input: { width: '100%', padding: '12px 16px', marginBottom: '16px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', boxSizing: 'border-box' },
  modalButtons: { display: 'flex', gap: '12px', marginTop: '8px' },
  cancelButton: { flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' },
  submitButton: { flex: 1, padding: '12px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' },
  confirmDeleteButton: { flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' },
  deleteAccountButton: { padding: '12px', background: '#ef4444', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', width: '100%', marginTop: '16px' },
  dangerZone: { marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  warningText: { fontSize: '12px', color: '#f87171', marginTop: '8px' },
  profileInfo: { background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', marginBottom: '16px' },
  planOptions: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' },
  planCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  selectPlanButton: { marginTop: '16px', padding: '8px 16px', background: '#00d1ff', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  contactInfo: { textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' },
  welcomeCard: { background: 'rgba(0,209,255,0.1)', borderRadius: '20px', padding: '40px', textAlign: 'center', marginTop: '20px', border: '1px solid rgba(0,209,255,0.3)' },
  chatButton: { position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,209,255,0.4)', zIndex: 1000 },
  chatModal: { position: 'fixed', bottom: '100px', right: '30px', width: '350px', height: '500px', background: '#0f172a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1001 },
  chatHeader: { padding: '16px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' },
  chatClose: { background: 'none', border: 'none', color: 'white', cursor: 'pointer' },
  chatMessages: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  chatMessage: { display: 'flex' },
  messageBubble: { maxWidth: '80%', padding: '10px 14px', borderRadius: '12px', color: 'white', fontSize: '13px' },
  messageTime: { fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' },
  chatInputContainer: { padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' },
  chatInput: { flex: 1, padding: '10px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', outline: 'none' },
  chatSend: { padding: '10px 16px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }
};

export default SuperAdminDashboard;