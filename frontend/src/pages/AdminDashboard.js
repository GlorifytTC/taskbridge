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
  const [isMobile, setIsMobile] = useState(false);
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
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);
  const [toast, setToast] = useState(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [usageData, setUsageData] = useState({
    employees: { current: 0, limit: 0, percentage: 0, warning: false }
  });


const quickQuestions = {
  en: [
    "📋 How do I create a new task?",
    "👥 How to add a new employee?",
    "🏢 How to manage branches?",
    "📊 How to generate reports?",
    "🔑 How to reset a user's password?",
    "✅ How to approve applications?"
  ],
  sv: [
    "📋 Hur skapar jag en ny uppgift?",
    "👥 Hur lägger jag till en ny anställd?",
    "🏢 Hur hanterar jag avdelningar?",
    "📊 Hur genererar jag rapporter?",
    "🔑 Hur återställer jag lösenord?",
    "✅ Hur godkänner jag ansökningar?"
  ]
};

  const t = {
    en: {
      dashboard: 'Dashboard',
      staff: 'Staff',
      tasks: 'Tasks',
      requests: 'Requests',
      reports: 'Reports',
      calendar: 'Calendar',
      profile: 'Profile',
      logout: 'Logout',
      welcome: 'Welcome',
      addStaff: 'Add Staff',
      addTask: 'Create Task',
      search: 'Search...',
      pendingRequests: 'Pending Requests',
      activeTasks: 'active tasks',
      employees: 'Employees',
      name: 'Name',
      email: 'Email',
      jobRole: 'Job Role',
      status: 'Status',
      actions: 'Actions',
      resetPassword: 'Reset Password',
      delete: 'Delete',
      title: 'Title',
      date: 'Date',
      time: 'Time',
      approve: 'Approve',
      reject: 'Reject',
      staffMember: 'Staff',
      task: 'Task',
      appliedDate: 'Applied Date',
      generateReport: 'Generate Report',
      exportPDF: 'Export PDF',
      attendance: 'Attendance',
      hoursWorked: 'Hours Worked',
      limitWarning: 'You have reached the limit for employees. Please contact your super admin to upgrade.',
      currentPlan: 'Current Plan',
      daysRemaining: 'days remaining',
      usage: 'Usage'
    },
    sv: {
      dashboard: 'Instrumentpanel',
      staff: 'Personal',
      tasks: 'Uppgifter',
      requests: 'Förfrågningar',
      reports: 'Rapporter',
      calendar: 'Kalender',
      profile: 'Profil',
      logout: 'Logga ut',
      welcome: 'Välkommen',
      addStaff: 'Lägg till personal',
      addTask: 'Skapa uppgift',
      search: 'Sök...',
      pendingRequests: 'Väntande förfrågningar',
      activeTasks: 'aktiva uppgifter',
      employees: 'Anställda',
      name: 'Namn',
      email: 'E-post',
      jobRole: 'Jobbroll',
      status: 'Status',
      actions: 'Åtgärder',
      resetPassword: 'Återställ lösenord',
      delete: 'Radera',
      title: 'Titel',
      date: 'Datum',
      time: 'Tid',
      approve: 'Godkänn',
      reject: 'Avslå',
      staffMember: 'Personal',
      task: 'Uppgift',
      appliedDate: 'Ansökningsdatum',
      generateReport: 'Generera rapport',
      exportPDF: 'Exportera PDF',
      attendance: 'Närvaro',
      hoursWorked: 'Arbetade timmar',
      limitWarning: 'Du har nått gränsen för anställda. Kontakta din superadmin för att uppgradera.',
      currentPlan: 'Nuvarande plan',
      daysRemaining: 'dagar kvar',
      usage: 'Användning'
    }
  };

  const lang = t[language];

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('taskbridge_language', langCode);
    setShowLanguageDropdown(false);
    showToast(langCode === 'en' ? 'Language changed to English' : 'Språk ändrat till Svenska', 'success');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check limit before creating employee
  const canAddEmployee = () => {
    const limit = usageData.employees?.limit;
    const current = usageData.employees?.current;
    if (limit === Infinity) return true;
    return current < limit;
  };

  useEffect(() => {
    const checkMobile = () => {
      const w = window.innerWidth;
      setScreenWidth(w);
      setIsMobile(w <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchSubscriptionData();
    const savedLogo = localStorage.getItem('organizationLogo');
    if (savedLogo) setLogoPreview(savedLogo);
    setChatMessages([{
      text: language === 'en' 
        ? "👋 Hello! I'm your TaskBridge AI Assistant. How can I help you today?" 
        : "👋 Hej! Jag är din TaskBridge AI-assistent. Hur kan jag hjälpa dig idag?",
      sender: 'ai',
      time: new Date().toLocaleTimeString(),
      showQuickQuestions: true
    }]);
  }, [language]);

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/subscriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSubscriptionData(data.data);
        if (data.data.usage) {
          setUsageData(data.data.usage);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const adminRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const adminData = await adminRes.json();
      
      const fetchedAssignedBranchIds = adminData.user.assignedBranches?.map(b => b._id) || [];
      setAssignedBranchIds(fetchedAssignedBranchIds);
      
      if (fetchedAssignedBranchIds.length === 0) {
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
      
      const tasksUrl = `https://taskbridge-production-9d91.up.railway.app/api/tasks?branches=${fetchedAssignedBranchIds.join(',')}`;
      const tasksRes = await fetch(tasksUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      const tasksData = await tasksRes.json();
      
      const employeesUrl = `https://taskbridge-production-9d91.up.railway.app/api/users?role=employee&branches=${fetchedAssignedBranchIds.join(',')}`;
      const employeesRes = await fetch(employeesUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      const employeesData = await employeesRes.json();
      
      const appsUrl = `https://taskbridge-production-9d91.up.railway.app/api/applications/pending?branches=${fetchedAssignedBranchIds.join(',')}`;
      const appsRes = await fetch(appsUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      const appsData = await appsRes.json();
      
      const jobsRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/job-descriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const jobsData = await jobsRes.json();
      
      const branchesRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/branches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const branchesData = await branchesRes.json();
      
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
      
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      showToast('New passwords do not match', 'error');
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
          showToast('Password changed successfully!', 'success');
          setShowProfileModal(false);
          setProfileData({ ...profileData, currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          showToast('Failed to change password', 'error');
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Error changing password', 'error');
    }
  };

  const handleChangeEmail = async () => {
    if (changeEmailData.newEmail !== changeEmailData.confirmEmail) {
      showToast('Email addresses do not match', 'error');
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
        showToast('Email changed successfully! Please login again.', 'success');
        setTimeout(() => {
          localStorage.removeItem('token');
          onLogout();
        }, 1500);
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to change email', 'error');
      }
    } catch (error) {
      console.error('Error changing email:', error);
      showToast('Error changing email', 'error');
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    
    if (!canAddEmployee()) {
      showToast(lang.limitWarning, 'error');
      return;
    }
    
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
        showToast('Employee created successfully!', 'success');
        setShowCreateEmployeeModal(false);
        setFormData({});
        fetchDashboardData();
        fetchSubscriptionData();
      } else {
        showToast('Failed to create employee', 'error');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      showToast('Error creating employee', 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (!assignedBranchIds.includes(formData.branch)) {
        showToast('You can only create tasks in your assigned branches', 'error');
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
        showToast('Task created successfully!', 'success');
        setShowCreateTaskModal(false);
        setFormData({});
        fetchDashboardData();
      } else {
        showToast('Failed to create task', 'error');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('Error creating task', 'error');
    }
  };

  const handleResetUserPassword = async () => {
    if (!selectedUser) return;
    
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    if (resetPasswordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
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
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(`Password for ${selectedUser.name} reset!`, 'success');
        setShowResetPasswordModal(false);
        setSelectedUser(null);
        setResetPasswordData({ newPassword: '', confirmPassword: '' });
        fetchDashboardData();
      } else {
        showToast(data.message || 'Failed to reset password', 'error');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      showToast('Error resetting password', 'error');
    }
  };

  const handleDeleteEmployee = async (empId, empName) => {
    if (!window.confirm(`Delete ${empName}? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${empId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToast('Employee deleted successfully!', 'success');
      fetchDashboardData();
      fetchSubscriptionData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      showToast('Failed to delete employee', 'error');
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Delete "${taskTitle}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToast('Task deleted successfully!', 'success');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Failed to delete task', 'error');
    }
  };

  const handleApproveApplication = async (appId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/applications/${appId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToast('Application approved!', 'success');
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving application:', error);
      showToast('Failed to approve', 'error');
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
      showToast('Application rejected', 'success');
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting application:', error);
      showToast('Failed to reject', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('⚠️ WARNING: This will delete YOUR account only. Are you sure?')) return;
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
      showToast('Failed to delete account', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
  };

  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const sendChatMessage = async (message = null) => {
  const userMessageText = message || chatInput;
  if (!userMessageText.trim()) return;
  
  const userMessage = { text: userMessageText, sender: 'user', time: new Date().toLocaleTimeString() };
  setChatMessages([...chatMessages, userMessage]);
  setChatInput('');
  setIsAiTyping(true);
  
  setTimeout(() => {
    const input = userMessageText.toLowerCase();
    let response = "";
    
    if (input.includes('create task') || input.includes('new task') || input.includes('skapa uppgift')) {
      response = language === 'en' 
        ? "📋 **To create a new task:**\n\n1. Go to the **Tasks** tab\n2. Click **Create Task**\n3. Fill in the details:\n   • Title\n   • Date & Time\n   • Job Role\n   • Branch\n   • Max Employees\n4. Click **Create**"
        : "📋 **För att skapa en ny uppgift:**\n\n1. Gå till fliken **Uppgifter**\n2. Klicka på **Skapa uppgift**\n3. Fyll i detaljerna:\n   • Titel\n   • Datum & Tid\n   • Jobbroll\n   • Avdelning\n   • Max antal anställda\n4. Klicka på **Skapa**";
    } 
    else if (input.includes('add employee') || input.includes('new employee') || input.includes('lägg till anställd')) {
      response = language === 'en'
        ? "👥 **To add a new employee:**\n\n1. Go to the **Staff** tab\n2. Click **Add Staff**\n3. Enter:\n   • Full Name\n   • Email Address\n   • Temporary Password\n   • Job Role\n   • Branch\n4. Click **Create**"
        : "👥 **För att lägga till en ny anställd:**\n\n1. Gå till fliken **Personal**\n2. Klicka på **Lägg till personal**\n3. Fyll i:\n   • Fullständigt namn\n   • E-postadress\n   • Tillfälligt lösenord\n   • Jobbroll\n   • Avdelning\n4. Klicka på **Skapa**";
    }
    else if (input.includes('approve application') || input.includes('godkänn ansökan')) {
      response = language === 'en'
        ? "✅ **To approve applications:**\n\n1. Go to the **Requests** tab\n2. Find pending applications\n3. Click the **✓ (green check)** to approve\n4. Click the **✗ (red X)** to reject\n\nYou can also add a rejection reason."
        : "✅ **För att godkänna ansökningar:**\n\n1. Gå till fliken **Förfrågningar**\n2. Hitta väntande ansökningar\n3. Klicka på **✓ (grön bock)** för att godkänna\n4. Klicka på **✗ (rött X)** för att avslå\n\nDu kan också lägga till en anledning vid avslag.";
    }
    else {
      response = language === 'en'
        ? "👋 **Hello! I'm your TaskBridge AI Assistant.**\n\nI can help you with:\n\n📋 Creating tasks\n👥 Adding employees\n✅ Approving applications\n📊 Generating reports\n🔑 Resetting passwords\n\nWhat would you like to learn about?"
        : "👋 **Hej! Jag är din TaskBridge AI-assistent.**\n\nJag kan hjälpa dig med:\n\n📋 Skapa uppgifter\n👥 Lägga till anställda\n✅ Godkänna ansökningar\n📊 Generera rapporter\n🔑 Återställa lösenord\n\nVad vill du lära dig om?";
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

  const isSmall = screenWidth <= 480;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  }

  const filteredEmployees = employees.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {toast && (
        <div style={{...styles.toast, background: toast.type === 'success' ? '#10b981' : '#ef4444'}}>
          {toast.message}
        </div>
      )}

      <div style={{...styles.header, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center'}}>
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
              <h1 style={{...styles.title, fontSize: isSmall ? '18px' : '22px'}}>Admin Dashboard</h1>
              <span style={styles.userNameBadge}>
                <i className="fas fa-user-tie"></i> {user?.name}
              </span>
            </div>
            <p style={{...styles.subtitle, fontSize: isSmall ? '10px' : '11px'}}>Manage {user?.organization?.name || 'your branch'}</p>
          </div>
        </div>
        <div style={{...styles.headerButtons, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end'}}>
          <div style={styles.languageContainer}>
            <button onClick={() => setShowLanguageDropdown(!showLanguageDropdown)} style={styles.languageButton}>
              <i className="fas fa-globe"></i> {language === 'en' ? 'EN' : 'SV'}
            </button>
            {showLanguageDropdown && (
              <div style={styles.languageDropdown}>
                <button onClick={() => changeLanguage('en')} style={styles.languageOption}>🇬🇧 English</button>
                <button onClick={() => changeLanguage('sv')} style={styles.languageOption}>🇸🇪 Svenska</button>
              </div>
            )}
          </div>
          <button onClick={() => setShowProfileModal(true)} style={styles.profileButton}>Profile</button>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </div>

      {subscriptionData && (
        <div style={styles.subscriptionCard}>
          <div style={styles.subscriptionHeader}>
            <h3 style={styles.subscriptionTitle}>{lang.currentPlan}: {subscriptionData.plan?.toUpperCase() || 'TRIAL'}</h3>
            <span style={styles.subscriptionDays}>{subscriptionData.daysRemaining || 0} {lang.daysRemaining}</span>
          </div>
          <div style={styles.usageItem}>
            <div style={styles.usageHeader}>
              <span>{lang.employees}</span>
              <span>{usageData.employees?.current || 0}/{usageData.employees?.limit === Infinity ? '∞' : usageData.employees?.limit || 0}</span>
              {usageData.employees?.percentage > 90 && usageData.employees?.limit !== Infinity && (
                <span style={{ color: '#ef4444', fontSize: '10px' }}>⚠️ Near limit</span>
              )}
            </div>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${Math.min(usageData.employees?.percentage || 0, 100)}%`, background: usageData.employees?.percentage > 90 ? '#ef4444' : '#10b981'}}></div>
            </div>
          </div>
        </div>
      )}

      <div style={{...styles.statsGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(100px, 1fr))'}}>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-users"></i></div><div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '20px'}}>{stats.totalEmployees}</div><div style={styles.statLabelSmall}>{lang.employees}</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-tasks"></i></div><div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '20px'}}>{stats.totalTasks}</div><div style={styles.statLabelSmall}>{lang.tasks}</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-clock"></i></div><div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '20px'}}>{stats.pendingApplications}</div><div style={styles.statLabelSmall}>{lang.pendingRequests}</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-check-circle"></i></div><div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '20px'}}>{stats.approvedShifts}</div><div style={styles.statLabelSmall}>Approved</div></div>
      </div>

      <div style={{...styles.tabs, overflowX: isMobile ? 'auto' : 'visible', flexWrap: isMobile ? 'nowrap' : 'wrap', paddingBottom: isMobile ? '8px' : '10px'}}>
        <button onClick={() => handleTabChange('dashboard')} style={{...styles.tab, background: activeTab === 'dashboard' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.dashboard}</button>
        <button onClick={() => handleTabChange('employees')} style={{...styles.tab, background: activeTab === 'employees' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.staff}</button>
        <button onClick={() => handleTabChange('tasks')} style={{...styles.tab, background: activeTab === 'tasks' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.tasks}</button>
        <button onClick={() => handleTabChange('applications')} style={{...styles.tab, background: activeTab === 'applications' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.requests}</button>
        <button onClick={() => onNavigate('calendar')} style={{...styles.tab, background: activeTab === 'calendar' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.calendar}</button>
        <button onClick={() => handleTabChange('reports')} style={{...styles.tab, background: activeTab === 'reports' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.reports}</button>
      </div>

      <div style={{...styles.content, padding: isSmall ? '12px' : '16px'}}>
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.welcome}, {user?.name}!</h2>
            <p style={{...styles.sectionDesc, fontSize: isSmall ? '11px' : '12px'}}>Manage your team and shifts efficiently.</p>
            <div style={styles.welcomeCard}>
              <i className="fas fa-chart-line" style={{ fontSize: isSmall ? '24px' : '32px', color: '#00d1ff', marginBottom: '12px' }}></i>
              <h3 style={{...styles.welcomeTitle, fontSize: isSmall ? '13px' : '14px'}}>Quick Overview</h3>
              <p style={{...styles.welcomeText, fontSize: isSmall ? '11px' : '12px'}}><strong>{stats.pendingApplications}</strong> {lang.pendingRequests} | <strong>{stats.totalTasks}</strong> {lang.activeTasks}</p>
              <div style={{...styles.quickActions, flexDirection: isSmall ? 'column' : 'row'}}>
                <button onClick={() => handleTabChange('tasks')} style={styles.quickActionBtn}>+ {lang.addTask}</button>
                <button onClick={() => setShowCreateEmployeeModal(true)} style={styles.quickActionBtn}>+ {lang.addStaff}</button>
                <button onClick={() => handleTabChange('applications')} style={styles.quickActionBtn}>Review Requests</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div>
            <div style={{...styles.sectionHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center'}}>
              <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.staff}</h2>
              <button 
                onClick={() => {
                  if (!canAddEmployee()) {
                    showToast(lang.limitWarning, 'error');
                  } else {
                    setShowCreateEmployeeModal(true);
                  }
                }} 
                style={{...styles.addButton, width: isSmall ? '100%' : 'auto', opacity: !canAddEmployee() ? 0.5 : 1}}
              >
                + {lang.addStaff}
              </button>
            </div>
            <input type="text" placeholder={lang.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{...styles.searchInput, fontSize: isSmall ? '11px' : '12px'}} />
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.name}</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.email}</th>
                    {!isSmall && <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.jobRole}</th>}
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.status}</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr key={emp._id} style={styles.tableRow}>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{emp.name}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{isSmall ? emp.email?.substring(0, 15) + (emp.email?.length > 15 ? '...' : '') : emp.email}</td>
                      {!isSmall && <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{emp.jobDescription?.name || '-'}</td>}
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}><span style={{...styles.statusBadge, background: emp.isActive ? '#10b981' : '#ef4444', fontSize: isSmall ? '8px' : '9px'}}>{emp.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}>
                        <button onClick={() => { setSelectedUser(emp); setShowResetPasswordModal(true); }} style={{...styles.resetButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>🔑</button>
                        <button onClick={() => handleDeleteEmployee(emp._id, emp.name)} style={{...styles.deleteButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>🗑️</button>
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
            <div style={{...styles.taskHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center'}}>
              <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.tasks}</h2>
              <button onClick={() => setShowCreateTaskModal(true)} style={{...styles.createTaskButton, width: isSmall ? '100%' : 'auto'}}>+ {lang.addTask}</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.title}</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.date}</th>
                    {!isSmall && <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.time}</th>}
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.status}</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task._id} style={styles.tableRow}>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{isSmall ? task.title?.substring(0, 15) + (task.title?.length > 15 ? '...' : '') : task.title}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{new Date(task.date).toLocaleDateString()}</td>
                      {!isSmall && <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{task.startTime} - {task.endTime}</td>}
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}><span style={{...styles.statusBadge, background: task.status === 'open' ? '#10b981' : '#f59e0b', fontSize: isSmall ? '8px' : '9px'}}>{task.status}</span></td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}><button onClick={() => handleDeleteTask(task._id, task.title)} style={{...styles.deleteButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.pendingRequests}</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.staffMember}</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.task}</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.date}</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>{lang.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id} style={styles.tableRow}>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{app.employee?.name}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{isSmall ? app.task?.title?.substring(0, 15) + (app.task?.title?.length > 15 ? '...' : '') : app.task?.title}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{app.task?.date ? new Date(app.task.date).toLocaleDateString() : '-'}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}>
                        <button onClick={() => handleApproveApplication(app._id)} style={{...styles.approveButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>✓</button>
                        <button onClick={() => handleRejectApplication(app._id)} style={{...styles.rejectButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>✗</button>
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
            <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.reports}</h2>
            <div style={{...styles.reportsGrid, gridTemplateColumns: isSmall ? '1fr' : 'repeat(auto-fit, minmax(130px, 1fr))'}}>
              <div style={styles.reportCard}><i className="fas fa-chart-bar"></i><h3 style={{fontSize: isSmall ? '12px' : '14px', color: 'white'}}>{lang.attendance}</h3><button style={styles.reportButton}>{lang.generateReport}</button></div>
              <div style={styles.reportCard}><i className="fas fa-clock"></i><h3 style={{fontSize: isSmall ? '12px' : '14px', color: 'white'}}>{lang.hoursWorked}</h3><button style={styles.reportButton}>{lang.generateReport}</button></div>
              <div style={styles.reportCard}><i className="fas fa-file-pdf"></i><h3 style={{fontSize: isSmall ? '12px' : '14px', color: 'white'}}>{lang.exportPDF}</h3><button style={styles.reportButton}>{lang.exportPDF}</button></div>
            </div>
          </div>
        )}
      </div>

      {/* All modals - keep as is */}
      {showCreateEmployeeModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateEmployeeModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '400px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '18px', color: 'white'}}>{lang.addStaff}</h2>
            <form onSubmit={handleCreateEmployee}>
              <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} required />
              <input type="email" placeholder="Email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} required />
              <input type="password" placeholder="Temporary Password" value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} required />
              <select value={formData.jobDescription || ''} onChange={(e) => setFormData({...formData, jobDescription: e.target.value})} style={{...styles.select, fontSize: isSmall ? '11px' : '12px', color: 'white'}} required>
                <option value="">Select Job Role</option>
                {jobDescriptions.map(j => <option key={j._id} value={j._id} style={{color: 'white'}}>{j.name}</option>)}
              </select>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateEmployeeModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '12px'}}>Cancel</button>
                <button type="submit" style={{...styles.submitButton, fontSize: isSmall ? '11px' : '12px'}}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateTaskModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateTaskModal)}>
          <div style={{...styles.modalLarge, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '400px' : '550px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '18px', color: 'white'}}>{lang.addTask}</h2>
            <form onSubmit={handleCreateTask}>
              <div style={styles.formGroup}>
                <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px', color: 'white'}}>Task Title *</label>
                <input type="text" placeholder="e.g., Morning Shift" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} required />
              </div>
              <div style={styles.formGroup}>
                <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px', color: 'white'}}>Description</label>
                <textarea placeholder="Describe the task..." value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{...styles.textarea, fontSize: isSmall ? '11px' : '12px', color: 'white'}} rows="2" />
              </div>
              <div style={{...styles.formRow, gridTemplateColumns: isSmall ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))'}}>
                <div style={styles.formGroup}>
                  <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px', color: 'white'}}>Date *</label>
                  <input type="date" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px', color: 'white'}}>Start Time *</label>
                  <input type="time" value={formData.startTime || ''} onChange={(e) => setFormData({...formData, startTime: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px', color: 'white'}}>End Time *</label>
                  <input type="time" value={formData.endTime || ''} onChange={(e) => setFormData({...formData, endTime: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} required />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px', color: 'white'}}>Branch *</label>
                <select value={formData.branch || ''} onChange={(e) => setFormData({...formData, branch: e.target.value})} style={{...styles.select, fontSize: isSmall ? '11px' : '12px', color: 'white'}} required>
                  <option value="">Select Branch</option>
                  {branches.filter(b => assignedBranchIds.includes(b._id)).map(b => <option key={b._id} value={b._id} style={{color: 'white'}}>{b.name}</option>)}
                </select>
              </div>
              
              <div style={{...styles.formRow, gridTemplateColumns: isSmall ? '1fr' : 'repeat(2, 1fr)'}}>
                <div style={styles.formGroup}>
                  <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px', color: 'white'}}>Job Role *</label>
                  <select value={formData.jobDescription || ''} onChange={(e) => setFormData({...formData, jobDescription: e.target.value})} style={{...styles.select, fontSize: isSmall ? '11px' : '12px', color: 'white'}} required>
                    <option value="">Select Role</option>
                    {jobDescriptions.map(j => <option key={j._id} value={j._id} style={{color: 'white'}}>{j.name}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px', color: 'white'}}>Max Employees</label>
                  <input type="number" placeholder="1" value={formData.maxEmployees || 1} onChange={(e) => setFormData({...formData, maxEmployees: parseInt(e.target.value)})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} min="1" />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px', color: 'white'}}>Location</label>
                <input type="text" placeholder="e.g., Room 101" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
              </div>
              
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateTaskModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '12px'}}>Cancel</button>
                <button type="submit" style={{...styles.submitButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.addTask}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowProfileModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '400px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '18px', color: 'white'}}>Profile Settings</h2>
            <p style={{fontSize: isSmall ? '12px' : '14px', color: 'white'}}><strong>{user?.name}</strong> ({user?.email})</p>
            <button onClick={() => { setShowProfileModal(false); setShowChangeEmailModal(true); }} style={{...styles.changeEmailButton, fontSize: isSmall ? '11px' : '12px'}}>Change Email</button>
            <h3 style={{...styles.subTitle, fontSize: isSmall ? '13px' : '14px', color: 'white'}}>Change Password</h3>
            <input type="password" placeholder="Current Password" value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
            <input type="password" placeholder="New Password" value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
            <input type="password" placeholder="Confirm" value={profileData.confirmPassword} onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
            <button onClick={handleUpdateProfile} style={{...styles.submitButton, fontSize: isSmall ? '11px' : '12px'}}>Update Password</button>
            <div style={styles.dangerZone}><h3 style={{color:'#ef4444', fontSize: isSmall ? '13px' : '14px'}}>Danger Zone</h3><button onClick={() => { setShowProfileModal(false); setShowDeleteAccountModal(true); }} style={{...styles.deleteAccountButton, fontSize: isSmall ? '11px' : '12px'}}>Delete My Account</button></div>
          </div>
        </div>
      )}

      {showChangeEmailModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowChangeEmailModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '400px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '18px', color: 'white'}}>Change Email</h2>
            <p style={{fontSize: isSmall ? '12px' : '14px', color: 'white'}}>Current: {user?.email}</p>
            <input type="email" placeholder="New Email" value={changeEmailData.newEmail} onChange={(e) => setChangeEmailData({...changeEmailData, newEmail: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
            <input type="email" placeholder="Confirm" value={changeEmailData.confirmEmail} onChange={(e) => setChangeEmailData({...changeEmailData, confirmEmail: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
            <input type="password" placeholder="Current Password" value={changeEmailData.password} onChange={(e) => setChangeEmailData({...changeEmailData, password: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
            <div style={styles.modalButtons}><button onClick={() => setShowChangeEmailModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '12px'}}>Cancel</button><button onClick={handleChangeEmail} style={{...styles.submitButton, fontSize: isSmall ? '11px' : '12px'}}>Change</button></div>
          </div>
        </div>
      )}

      {showResetPasswordModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowResetPasswordModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '400px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '18px', color: 'white'}}>{lang.resetPassword}</h2>
            <p style={{fontSize: isSmall ? '12px' : '14px', color: 'white'}}>For: {selectedUser?.name}</p>
            <input type="password" placeholder="New Password" value={resetPasswordData.newPassword} onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
            <input type="password" placeholder="Confirm" value={resetPasswordData.confirmPassword} onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
            <div style={styles.modalButtons}><button onClick={() => setShowResetPasswordModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '12px'}}>Cancel</button><button onClick={handleResetUserPassword} style={{...styles.submitButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.resetPassword}</button></div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowDeleteAccountModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '400px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '18px', color: 'white'}}>Delete Account</h2>
            <p style={{fontSize: isSmall ? '12px' : '14px', color: 'white'}}>Are you sure? This cannot be undone.</p>
            <div style={styles.modalButtons}><button onClick={() => setShowDeleteAccountModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '12px'}}>Cancel</button><button onClick={handleDeleteAccount} style={{...styles.confirmDeleteButton, fontSize: isSmall ? '11px' : '12px'}}>Delete</button></div>
          </div>
        </div>
      )}

      {/* Chat Button */}
<button style={{...styles.chatButton, width: isSmall ? '40px' : '45px', height: isSmall ? '40px' : '45px', fontSize: isSmall ? '16px' : '18px'}} onClick={() => setShowChat(!showChat)}>
  <i className="fas fa-robot"></i>
</button>

{/* Chat Modal */}
{showChat && (
  <div style={{...styles.chatModal, width: isSmall ? '90vw' : '380px', maxWidth: '90vw', height: isSmall ? '70vh' : '550px', bottom: isSmall ? '70px' : '80px', right: isSmall ? '10px' : '20px'}}>
    <div style={styles.chatHeader}>
      <span><i className="fas fa-robot" style={{ color: '#00d1ff' }}></i> TaskBridge AI Assistant</span>
      <button onClick={() => setShowChat(false)} style={styles.chatClose}>✕</button>
    </div>
    <div style={styles.chatMessages}>
      {chatMessages.map((msg, i) => (
        <div key={i} style={{...styles.chatMessage, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'}}>
          <div style={{...styles.messageBubble, background: msg.sender === 'user' ? '#00d1ff' : '#1e293b', maxWidth: '85%'}}>
            {msg.sender === 'ai' && <i className="fas fa-robot" style={{ fontSize: '12px', marginRight: '6px', color: '#00d1ff' }}></i>}
            <div style={{ whiteSpace: 'pre-line', fontSize: isSmall ? '11px' : '12px', lineHeight: '1.5' }}>{msg.text}</div>
            <div style={styles.messageTime}>{msg.time}</div>
          </div>
        </div>
      ))}
      {isAiTyping && (
        <div style={styles.typingIndicator}>
          <i className="fas fa-robot" style={{ fontSize: '11px', marginRight: '6px' }}></i>
          {language === 'en' ? 'AI is thinking...' : 'AI tänker...'}
        </div>
      )}
    </div>
    
    {/* Quick Questions */}
    {chatMessages.length < 2 && (
      <div style={styles.quickQuestionsContainer}>
        <div style={styles.quickQuestionsHeader}>
          <i className="fas fa-lightbulb"></i> {language === 'en' ? 'Quick Questions' : 'Snabbfrågor'}
        </div>
        <div style={styles.quickQuestionsGrid}>
          {quickQuestions[language].map((q, idx) => (
            <button key={idx} onClick={() => sendChatMessage(q)} style={styles.quickQuestionButton}>
              {q}
            </button>
          ))}
        </div>
      </div>
    )}
    
    <div style={styles.chatInputContainer}>
      <input
        type="text"
        placeholder={language === 'en' ? "Ask me anything..." : "Fråga mig vad som helst..."}
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
        style={styles.chatInput}
      />
      <button onClick={() => sendChatMessage()} style={styles.chatSend}>
        <i className="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
)}

      {showChat && (
        <div style={{...styles.chatModal, width: isSmall ? '320px' : '380px', height: isSmall ? '500px' : '550px', bottom: isSmall ? '70px' : '80px', right: isSmall ? '10px' : '20px'}}>
          <div style={styles.chatHeader}>
            <span><i className="fas fa-robot" style={{ color: '#00d1ff' }}></i> TaskBridge AI Assistant</span>
            <button onClick={() => setShowChat(false)} style={styles.chatClose}>✕</button>
          </div>
          <div style={styles.chatMessages}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{...styles.chatMessage, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'}}>
                <div style={{...styles.messageBubble, background: msg.sender === 'user' ? '#00d1ff' : '#1e293b', maxWidth: '85%'}}>
                  {msg.sender === 'ai' && <i className="fas fa-robot" style={{ fontSize: '12px', marginRight: '6px', color: '#00d1ff' }}></i>}
                  <div style={{ whiteSpace: 'pre-line', fontSize: isSmall ? '11px' : '12px', lineHeight: '1.5' }}>{msg.text}</div>
                  <div style={styles.messageTime}>{msg.time}</div>
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div style={styles.typingIndicator}>
                <i className="fas fa-robot" style={{ fontSize: '11px', marginRight: '6px' }}></i>
                {language === 'en' ? 'AI is thinking...' : 'AI tänker...'}
              </div>
            )}
          </div>
          
          {/* Quick Questions */}
          {chatMessages.length < 3 && (
            <div style={styles.quickQuestionsContainer}>
              <div style={styles.quickQuestionsHeader}>
                <i className="fas fa-lightbulb"></i> {language === 'en' ? 'Quick Questions' : 'Snabbfrågor'}
              </div>
              <div style={styles.quickQuestionsGrid}>
                {quickQuestions[language].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendChatMessage(q)}
                    style={styles.quickQuestionButton}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div style={styles.chatInputContainer}>
            <input
              type="text"
              placeholder={language === 'en' ? "Ask me anything..." : "Fråga mig vad som helst..."}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              style={{...styles.chatInput, fontSize: isSmall ? '10px' : '12px', color: 'white'}}
            />
            <button onClick={() => sendChatMessage()} style={styles.chatSend}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '20px', fontFamily: 'Inter, sans-serif', position: 'relative' },
  toast: { position: 'fixed', top: '20px', right: '20px', padding: '12px 20px', borderRadius: '8px', color: 'white', zIndex: 2000, fontSize: '14px', animation: 'fadeInOut 3s ease' },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' },
  loadingSpinner: { width: '40px', height: '40px', border: '3px solid rgba(0,209,255,0.3)', borderRadius: '50%', borderTopColor: '#00d1ff', animation: 'spin 1s linear infinite' },
  languageContainer: { position: 'relative' },
  languageButton: { padding: '6px 12px', background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' },
  languageDropdown: { position: 'absolute', top: '35px', right: '0', background: '#1e293b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100, minWidth: '120px' },
  languageOption: { padding: '8px 12px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '12px' },
  subscriptionCard: { background: 'rgba(0,209,255,0.1)', borderRadius: '12px', padding: '12px', marginBottom: '16px', border: '1px solid rgba(0,209,255,0.2)' },
  subscriptionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  subscriptionTitle: { fontSize: '13px', fontWeight: '600', color: '#00d1ff', margin: 0 },
  subscriptionDays: { fontSize: '11px', color: 'rgba(255,255,255,0.7)' },
  usageItem: { marginTop: '8px' },
  usageHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' },
  progressBar: { height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  logoSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  orgLogo: { width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' },
  logoPlaceholder: { width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  title: { fontWeight: 'bold', color: 'white', margin: 0 },
  userNameBadge: { background: 'rgba(0,209,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', color: '#00d1ff' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: '2px' },
  headerButtons: { display: 'flex', gap: '8px', alignItems: 'center' },
  profileButton: { padding: '6px 14px', background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  logoutButton: { padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  statsGrid: { display: 'grid', gap: '10px', marginBottom: '20px' },
  statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px', textAlign: 'center' },
  statIconSmall: { fontSize: '18px', color: '#00d1ff', marginBottom: '4px' },
  statValueSmall: { fontWeight: 'bold', color: 'white' },
  statLabelSmall: { fontSize: '10px', color: 'rgba(255,255,255,0.6)' },
  tabs: { display: 'flex', gap: '6px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tab: { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '20px' },
  content: { background: 'rgba(255,255,255,0.03)', borderRadius: '16px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' },
  sectionTitle: { fontWeight: '600', color: 'white' },
  sectionDesc: { color: 'rgba(255,255,255,0.6)', marginBottom: '14px' },
  addButton: { padding: '6px 14px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  createTaskButton: { padding: '6px 14px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  searchInput: { padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'white', width: '100%', marginBottom: '14px' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeaderRow: { borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'rgba(255,255,255,0.6)' },
  th: { padding: '10px 8px' },
  tableRow: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td: { padding: '10px 8px', color: 'white' },
  statusBadge: { padding: '2px 6px', borderRadius: '20px', fontWeight: '600', color: 'white', display: 'inline-block' },
  resetButton: { background: 'rgba(245,158,11,0.2)', border: '1px solid #f59e0b', borderRadius: '6px', padding: '4px 8px', color: '#f59e0b', cursor: 'pointer', marginRight: '4px' },
  deleteButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '6px', padding: '4px 8px', color: '#ef4444', cursor: 'pointer' },
  approveButton: { background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', borderRadius: '6px', padding: '4px 8px', color: '#10b981', cursor: 'pointer', marginRight: '4px' },
  rejectButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '6px', padding: '4px 8px', color: '#ef4444', cursor: 'pointer' },
  reportsGrid: { display: 'grid', gap: '10px' },
  reportCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: 'center' },
  reportButton: { marginTop: '10px', padding: '5px 10px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '10px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '20px', maxHeight: '80vh', overflowY: 'auto' },
  modalLarge: { background: '#1e293b', borderRadius: '16px', padding: '20px', maxHeight: '85vh', overflowY: 'auto' },
  modalTitle: { fontWeight: '600', color: 'white', marginBottom: '16px' },
  subTitle: { fontWeight: '600', color: 'white', marginBottom: '12px', marginTop: '16px' },
  label: { color: 'rgba(255,255,255,0.8)', marginBottom: '4px', display: 'block' },
  input: { width: '100%', padding: '8px 10px', marginBottom: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px 10px', marginBottom: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' },
  select: { width: '100%', padding: '8px 10px', marginBottom: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  formGroup: { marginBottom: '12px' },
  formRow: { display: 'grid', gap: '10px', marginBottom: '12px' },
  modalButtons: { display: 'flex', gap: '10px', marginTop: '16px' },
  cancelButton: { flex: 1, padding: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  submitButton: { flex: 1, padding: '8px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  confirmDeleteButton: { flex: 1, padding: '8px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  deleteAccountButton: { padding: '8px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', width: '100%', marginTop: '10px' },
  changeEmailButton: { padding: '8px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', width: '100%', marginBottom: '12px' },
  dangerZone: { marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  welcomeCard: { background: 'rgba(0,209,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', marginTop: '12px' },
  welcomeTitle: { fontWeight: '600', color: 'white', marginBottom: '6px' },
  welcomeText: { color: 'rgba(255,255,255,0.7)' },
  quickActions: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' },
  quickActionBtn: { padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  quickQuestionsContainer: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' },
  quickQuestionsHeader: { fontSize: '11px', color: '#00d1ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
  quickQuestionsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  quickQuestionButton: { background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.3)', borderRadius: '20px', padding: '6px 12px', color: '#00d1ff', fontSize: '10px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' },
  chatButton: { position: 'fixed', bottom: '20px', right: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', color: 'white', cursor: 'pointer', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
chatModal: { position: 'fixed', bottom: '80px', right: '20px', background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1001 },
chatHeader: { padding: '12px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'white' },
chatClose: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' },
chatMessages: { flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
chatMessage: { display: 'flex' },
messageBubble: { maxWidth: '85%', padding: '8px 12px', borderRadius: '12px', color: 'white', fontSize: '12px', lineHeight: '1.4' },
messageTime: { fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' },
typingIndicator: { padding: '8px 12px', background: '#1e293b', borderRadius: '12px', width: '80px', fontSize: '11px' },
quickQuestionsContainer: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' },
quickQuestionsHeader: { fontSize: '11px', color: '#00d1ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
quickQuestionsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
quickQuestionButton: { background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.3)', borderRadius: '20px', padding: '6px 12px', color: '#00d1ff', fontSize: '10px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' },
chatInputContainer: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' },
chatInput: { flex: 1, padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', outline: 'none' },
chatSend: { padding: '8px 12px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }
};

export default AdminDashboard;