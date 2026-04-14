import React, { useState, useEffect } from 'react';

const SuperAdminDashboard = ({ user, onLogout, onNavigate }) => {
  console.log('🎯 SuperAdminDashboard rendering');
  console.log('User object:', user);
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
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [usageData, setUsageData] = useState({
    employees: { current: 0, limit: 0, percentage: 0, warning: false },
    branches: { current: 0, limit: 0, percentage: 0, warning: false },
    admins: { current: 0, limit: 0, percentage: 0, warning: false },
    emails: { current: 0, limit: 0, percentage: 0, warning: false }
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
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });
  const [reportData, setReportData] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);
  
  // Quick questions for chat
  const quickQuestions = {
  en: [
    "📋 How do I create a new task?",
    "👥 How to add a new employee?",
    "🏢 How to create a branch?",
    "📊 How to generate reports?",
    "🔑 How to reset a user's password?",
    "💰 How to change subscription plan?"
  ],
  sv: [
    "📋 Hur skapar jag en ny uppgift?",
    "👥 Hur lägger jag till en ny anställd?",
    "🏢 Hur skapar jag en avdelning?",
    "📊 Hur genererar jag rapporter?",
    "🔑 Hur återställer jag lösenord?",
    "💰 Hur ändrar jag prenumerationsplan?"
  ]
};

  // Custom confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    itemName: '',
    itemId: null,
    type: ''
  });
  
  // Audit log modal
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

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

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check limits before creating employees
  const canAddEmployee = () => {
    const limit = usageData.employees?.limit;
    const current = usageData.employees?.current;
    if (limit === Infinity) return true;
    return current < limit;
  };

  // Check limits before creating branches
  const canAddBranch = () => {
    const limit = usageData.branches?.limit;
    const current = usageData.branches?.current;
    if (limit === Infinity) return true;
    return current < limit;
  };

  // Check limits before creating admins
  const canAddAdmin = () => {
    const limit = usageData.admins?.limit;
    const current = usageData.admins?.current;
    if (limit === Infinity) return true;
    return current < limit;
  };

  const showConfirmation = (title, message, onConfirm, itemId, itemName, type) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm(itemId, itemName);
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
      itemId,
      itemName,
      type
    });
  };

  const t = {
    en: {
      dashboard: 'Dashboard',
      admins: 'Admins',
      staff: 'Staff',
      branches: 'Branches',
      calendar: 'Calendar',
      roles: 'Roles',
      tasks: 'Tasks',
      requests: 'Requests',
      reports: 'Reports',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      welcome: 'Welcome',
      subscriptionOverview: 'Subscription',
      daysRemaining: 'days remaining',
      usage: 'Usage',
      employees: 'Employees',
      adminsLabel: 'Admins',
      branchesLabel: 'Branches',
      contactSales: 'Contact Sales',
      manage: 'Manage',
      search: 'Search...',
      addAdmin: 'Add Admin',
      addStaff: 'Add Staff',
      addBranch: 'Add Branch',
      addRole: 'Add Role',
      createTask: 'Create Task',
      pendingRequests: 'Pending Requests',
      activeTasks: 'active tasks',
      noData: 'No data found',
      success: 'Success',
      error: 'Error',
      subscriptionExpired: 'Your subscription has expired. Please contact your administrator.',
      subscriptionPaused: 'Your subscription is paused. Please contact support.',
      generateReport: 'Generate Report',
      exportPDF: 'Export PDF',
      exportExcel: 'Export Excel',
      attendance: 'Attendance',
      hoursWorked: 'Hours Worked',
      selectDateRange: 'Select Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      adminManagement: 'Admin Management',
      staffManagement: 'Staff Management',
      branchManagement: 'Branch Management',
      roleManagement: 'Role Management',
      taskManagement: 'Task Management',
      applicationManagement: 'Application Management',
      reportManagement: 'Report Management',
      settingsManagement: 'Settings Management',
      language: 'Language',
      swedish: 'Swedish',
      english: 'English',
      currentPlan: 'Current Plan',
      auditLogs: 'Audit Logs',
      confirmDelete: 'Confirm Delete',
      cancel: 'Cancel',
      delete: 'Delete',
      areYouSure: 'Are you sure?',
      viewAudit: 'View Audit Logs',
      close: 'Close',
      action: 'Action',
      entityType: 'Entity Type',
      user: 'User',
      timestamp: 'Timestamp',
      changes: 'Changes',
      limitWarning: 'You have reached the limit for this feature. Please upgrade your plan.',
      upgradeRequired: 'Upgrade Required'
    },
    sv: {
      dashboard: 'Instrumentpanel',
      admins: 'Administratörer',
      staff: 'Personal',
      branches: 'Avdelningar',
      calendar: 'Kalender',
      roles: 'Roller',
      tasks: 'Uppgifter',
      requests: 'Förfrågningar',
      reports: 'Rapporter',
      settings: 'Inställningar',
      profile: 'Profil',
      logout: 'Logga ut',
      welcome: 'Välkommen',
      subscriptionOverview: 'Prenumeration',
      daysRemaining: 'dagar kvar',
      usage: 'Användning',
      employees: 'Anställda',
      adminsLabel: 'Administratörer',
      branchesLabel: 'Avdelningar',
      contactSales: 'Kontakta oss',
      manage: 'Hantera',
      search: 'Sök...',
      addAdmin: 'Lägg till administratör',
      addStaff: 'Lägg till personal',
      addBranch: 'Lägg till avdelning',
      addRole: 'Lägg till roll',
      createTask: 'Skapa uppgift',
      pendingRequests: 'Väntande förfrågningar',
      activeTasks: 'aktiva uppgifter',
      noData: 'Ingen data hittades',
      success: 'Klart',
      error: 'Fel',
      subscriptionExpired: 'Din prenumeration har löpt ut. Kontakta din administratör.',
      subscriptionPaused: 'Din prenumeration är pausad. Kontakta support.',
      generateReport: 'Generera rapport',
      exportPDF: 'Exportera PDF',
      exportExcel: 'Exportera Excel',
      attendance: 'Närvaro',
      hoursWorked: 'Arbetade timmar',
      selectDateRange: 'Välj datumintervall',
      startDate: 'Startdatum',
      endDate: 'Slutdatum',
      adminManagement: 'Administratörshantering',
      staffManagement: 'Personalhantering',
      branchManagement: 'Avdelningshantering',
      roleManagement: 'Rollhantering',
      taskManagement: 'Uppgiftshantering',
      applicationManagement: 'Ansökningshantering',
      reportManagement: 'Rapporthantering',
      settingsManagement: 'Inställningshantering',
      language: 'Språk',
      swedish: 'Svenska',
      english: 'Engelska',
      currentPlan: 'Nuvarande plan',
      auditLogs: 'Granskningsloggar',
      confirmDelete: 'Bekräfta radering',
      cancel: 'Avbryt',
      delete: 'Radera',
      areYouSure: 'Är du säker?',
      viewAudit: 'Visa granskningsloggar',
      close: 'Stäng',
      action: 'Åtgärd',
      entityType: 'Enhetstyp',
      user: 'Användare',
      timestamp: 'Tidpunkt',
      changes: 'Ändringar',
      limitWarning: 'Du har nått gränsen för denna funktion. Uppgradera din plan.',
      upgradeRequired: 'Uppgradering krävs'
    }
  };

  const lang = t[language];
  const isSmall = screenWidth <= 480;

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('taskbridge_language', langCode);
    setShowLanguageDropdown(false);
    showToast(langCode === 'en' ? 'Language changed to English' : 'Språk ändrat till Svenska', 'success');
  };

  useEffect(() => {
    fetchDashboardData(true);
    fetchSubscriptionData();
    const savedLogo = localStorage.getItem('organizationLogo');
    if (savedLogo) setLogoPreview(savedLogo);
    setChatMessages([{
  text: language === 'en' 
    ? "👋 Hello! I'm your TaskBridge AI Assistant. How can I help you today?\n\nTry clicking one of the quick questions below!" 
    : "👋 Hej! Jag är din TaskBridge AI-assistent. Hur kan jag hjälpa dig idag?\n\nProva att klicka på en av snabbfrågorna nedan!",
  sender: 'ai',
  time: new Date().toLocaleTimeString(),
  showQuickQuestions: true
}]);
    const interval = setInterval(() => {
      fetchDashboardData(false);
      fetchSubscriptionData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAuditLogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoadingAudit(false);
    }
  };

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

  const generateAttendanceReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/reports/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReportData(data);
      showToast(lang.generateReport + ' ' + (language === 'en' ? 'generated!' : 'genererad!'), 'success');
    } catch (error) {
      console.error('Error generating report:', error);
      showToast(lang.generateReport + ' ' + (language === 'en' ? 'failed' : 'misslyckades'), 'error');
    }
  };

  const exportToPDF = () => {
    if (!reportData) {
      showToast(lang.generateReport + ' ' + (language === 'en' ? 'first' : 'först'), 'error');
      return;
    }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>TaskBridge Report</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { color: #00d1ff; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
        </head>
        <body>
          <h1>TaskBridge Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <pre>${JSON.stringify(reportData, null, 2)}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToExcel = () => {
    if (!reportData) {
      showToast(lang.generateReport + ' ' + (language === 'en' ? 'first' : 'först'), 'error');
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8," + JSON.stringify(reportData, null, 2);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "taskbridge_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(lang.exportExcel + ' ' + (language === 'en' ? 'exported!' : 'exporterad!'), 'success');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        localStorage.setItem('organizationLogo', reader.result);
        showToast(language === 'en' ? 'Logo uploaded successfully!' : 'Logotyp uppladdad!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
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
      if (showLoading) setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      showToast(language === 'en' ? 'New passwords do not match' : 'Lösenorden matchar inte', 'error');
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
          showToast(language === 'en' ? 'Password changed successfully!' : 'Lösenordet ändrades!', 'success');
          setShowProfileModal(false);
          setProfileData({ ...profileData, currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          const data = await response.json();
          showToast(data.message || (language === 'en' ? 'Failed to change password' : 'Kunde inte ändra lösenord'), 'error');
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast(language === 'en' ? 'Error changing password' : 'Fel vid lösenordsändring', 'error');
    }
  };

  const handleChangeEmail = async () => {
    if (changeEmailData.newEmail !== changeEmailData.confirmEmail) {
      showToast(language === 'en' ? 'Email addresses do not match' : 'E-postadresserna matchar inte', 'error');
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
        showToast(language === 'en' ? 'Email changed! Please login again.' : 'E-post ändrad! Logga in igen.', 'success');
        setTimeout(() => {
          localStorage.removeItem('token');
          onLogout();
        }, 1500);
      } else {
        const data = await response.json();
        showToast(data.message || (language === 'en' ? 'Failed to change email' : 'Kunde inte ändra e-post'), 'error');
      }
    } catch (error) {
      console.error('Error changing email:', error);
      showToast(language === 'en' ? 'Error changing email' : 'Fel vid e-poständring', 'error');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    // Check limit before creating
    if (!canAddAdmin()) {
      showToast(lang.limitWarning, 'error');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const adminData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'admin',
        branch: formData.branch || null,
        assignedBranches: formData.branch ? [formData.branch] : []
      };
      
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(language === 'en' ? 'Admin created successfully!' : 'Administratör skapad!', 'success');
        setShowCreateAdminModal(false);
        setFormData({});
        fetchDashboardData(true);
      } else {
        showToast(data.message || (language === 'en' ? 'Failed to create admin' : 'Kunde inte skapa administratör'), 'error');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      showToast(language === 'en' ? 'Error creating admin' : 'Fel vid skapande av administratör', 'error');
    }
  };

  const handleAssignBranch = async (branchId) => {
    if (!selectedAdminForBranch) return;
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
      
      const data = await response.json();
      
      if (response.ok) {
        const assignedBranch = branches.find(b => b._id === branchId);
        setSelectedAdminForBranch(prev => ({
          ...prev,
          assignedBranches: [...(prev.assignedBranches || []), assignedBranch]
        }));
        setAdmins(prevAdmins => 
          prevAdmins.map(admin => 
            admin._id === selectedAdminForBranch._id 
              ? { ...admin, assignedBranches: [...(admin.assignedBranches || []), assignedBranch] }
              : admin
          )
        );
        showToast(language === 'en' ? 'Branch assigned successfully!' : 'Avdelning tilldelad!', 'success');
        fetchDashboardData(false);
      } else {
        showToast(data.message || (language === 'en' ? 'Failed to assign branch' : 'Kunde inte tilldela avdelning'), 'error');
      }
    } catch (error) {
      console.error('Error assigning branch:', error);
      showToast(language === 'en' ? 'Error assigning branch' : 'Fel vid tilldelning av avdelning', 'error');
    }
  };

  const handleRemoveBranch = async (branchId) => {
    if (!selectedAdminForBranch) return;
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
      
      const data = await response.json();
      
      if (response.ok) {
        setSelectedAdminForBranch(prev => ({
          ...prev,
          assignedBranches: (prev.assignedBranches || []).filter(b => b._id !== branchId)
        }));
        setAdmins(prevAdmins => 
          prevAdmins.map(admin => 
            admin._id === selectedAdminForBranch._id 
              ? { ...admin, assignedBranches: (admin.assignedBranches || []).filter(b => b._id !== branchId) }
              : admin
          )
        );
        showToast(language === 'en' ? 'Branch removed successfully!' : 'Avdelning borttagen!', 'success');
        fetchDashboardData(false);
      } else {
        showToast(data.message || (language === 'en' ? 'Failed to remove branch' : 'Kunde inte ta bort avdelning'), 'error');
      }
    } catch (error) {
      console.error('Error removing branch:', error);
      showToast(language === 'en' ? 'Error removing branch' : 'Fel vid borttagning av avdelning', 'error');
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    
    // Check limit before creating
    if (!canAddEmployee()) {
      showToast(lang.limitWarning, 'error');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const employeeData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'employee',
        jobDescription: formData.jobDescription,
        branch: formData.branch || null
      };
      
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(employeeData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(language === 'en' ? 'Employee created successfully!' : 'Anställd skapad!', 'success');
        setShowCreateEmployeeModal(false);
        setFormData({});
        fetchDashboardData(true);
      } else {
        showToast(data.message || (language === 'en' ? 'Failed to create employee' : 'Kunde inte skapa anställd'), 'error');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      showToast(language === 'en' ? 'Error creating employee' : 'Fel vid skapande av anställd', 'error');
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    
    // Check limit before creating
    if (!canAddBranch()) {
      showToast(lang.limitWarning, 'error');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const branchData = {
        name: formData.name,
        address: {
          city: formData.city || '',
          street: formData.street || '',
          postalCode: formData.postalCode || '',
          country: formData.country || 'Sweden'
        }
      };
      
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(branchData)
      });
      
      if (response.ok) {
        showToast(language === 'en' ? 'Branch created successfully!' : 'Avdelning skapad!', 'success');
        setShowCreateBranchModal(false);
        setFormData({});
        fetchDashboardData(true);
      } else {
        const data = await response.json();
        showToast(data.message || (language === 'en' ? 'Failed to create branch' : 'Kunde inte skapa avdelning'), 'error');
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      showToast(language === 'en' ? 'Error creating branch' : 'Fel vid skapande av avdelning', 'error');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const jobData = {
        name: formData.name,
        description: formData.description || ''
      };
      
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/job-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });
      
      if (response.ok) {
        showToast(language === 'en' ? 'Job role created successfully!' : 'Jobbroll skapad!', 'success');
        setShowCreateJobModal(false);
        setFormData({});
        fetchDashboardData(true);
      } else {
        const data = await response.json();
        showToast(data.message || (language === 'en' ? 'Failed to create job role' : 'Kunde inte skapa jobbroll'), 'error');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      showToast(language === 'en' ? 'Error creating job role' : 'Fel vid skapande av jobbroll', 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const taskData = {
        title: formData.title,
        description: formData.description || '',
        branch: formData.branch,
        jobDescription: formData.jobDescription,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxEmployees: formData.maxEmployees || 1,
        location: formData.location || '',
        notes: formData.notes || ''
      };
      
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(language === 'en' ? 'Task created successfully!' : 'Uppgift skapad!', 'success');
        setShowCreateTaskModal(false);
        setFormData({});
        fetchDashboardData(true);
      } else {
        showToast(data.message || (language === 'en' ? 'Failed to create task' : 'Kunde inte skapa uppgift'), 'error');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showToast(language === 'en' ? 'Error creating task' : 'Fel vid skapande av uppgift', 'error');
    }
  };

  const handleResetUserPassword = async () => {
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      showToast(language === 'en' ? 'Passwords do not match' : 'Lösenorden matchar inte', 'error');
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
        showToast(language === 'en' ? `Password for ${selectedUser.name} reset!` : `Lösenord för ${selectedUser.name} återställt!`, 'success');
        setShowResetPasswordModal(false);
        setSelectedUser(null);
        setResetPasswordData({ newPassword: '', confirmPassword: '' });
        fetchDashboardData(true);
      } else {
        const data = await response.json();
        showToast(data.message || (language === 'en' ? 'Failed to reset password' : 'Kunde inte återställa lösenord'), 'error');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      showToast(language === 'en' ? 'Error resetting password' : 'Fel vid lösenordsåterställning', 'error');
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${adminId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(language === 'en' ? 'Admin deleted successfully!' : 'Administratör borttagen!', 'success');
        fetchDashboardData(true);
      } else {
        showToast(data.message || (language === 'en' ? 'Failed to delete admin' : 'Kunde inte ta bort administratör'), 'error');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      showToast(language === 'en' ? 'Error deleting admin' : 'Fel vid borttagning av administratör', 'error');
    }
  };

  const handleDeleteEmployee = async (empId, empName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${empId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(language === 'en' ? 'Employee deleted successfully!' : 'Anställd borttagen!', 'success');
        fetchDashboardData(true);
      } else {
        showToast(data.message || (language === 'en' ? 'Failed to delete employee' : 'Kunde inte ta bort anställd'), 'error');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      showToast(language === 'en' ? 'Error deleting employee' : 'Fel vid borttagning av anställd', 'error');
    }
  };

  const handleDeleteBranch = async (branchId, branchName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/branches/${branchId}?force=true`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(language === 'en' ? 'Branch deleted successfully!' : 'Avdelning borttagen!', 'success');
        fetchDashboardData(true);
      } else {
        showToast(data.message || (language === 'en' ? 'Failed to delete branch' : 'Kunde inte ta bort avdelning'), 'error');
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      showToast(language === 'en' ? 'Error deleting branch' : 'Fel vid borttagning av avdelning', 'error');
    }
  };

  const handleDeleteJob = async (jobId, jobName) => {
    const employeesWithJob = employees.filter(e => e.jobDescription?._id === jobId).length;
    
    if (employeesWithJob > 0) {
      const errorMsg = language === 'en'
        ? `Cannot delete "${jobName}" because ${employeesWithJob} employee(s) have this job role. Please reassign them first.`
        : `Kan inte radera "${jobName}" eftersom ${employeesWithJob} anställd(a) har denna jobbroll. Vänligen omplacera dem först.`;
      showToast(errorMsg, 'error');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/job-descriptions/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(language === 'en' ? 'Job role deleted successfully!' : 'Jobbroll borttagen!', 'success');
        fetchDashboardData(true);
      } else {
        showToast(data.message || (language === 'en' ? 'Failed to delete job role' : 'Kunde inte ta bort jobbroll'), 'error');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      showToast(language === 'en' ? 'Error deleting job role' : 'Fel vid borttagning av jobbroll', 'error');
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(language === 'en' ? 'Task deleted successfully!' : 'Uppgift borttagen!', 'success');
        fetchDashboardData(true);
      } else {
        showToast(data.message || (language === 'en' ? 'Failed to delete task' : 'Kunde inte ta bort uppgift'), 'error');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast(language === 'en' ? 'Error deleting task' : 'Fel vid borttagning av uppgift', 'error');
    }
  };

  const handleApproveApplication = async (appId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/applications/${appId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        showToast(language === 'en' ? 'Application approved!' : 'Ansökan godkänd!', 'success');
        fetchDashboardData(true);
        fetchSubscriptionData();
      } else {
        const data = await response.json();
        showToast(data.message || (language === 'en' ? 'Failed to approve' : 'Kunde inte godkänna'), 'error');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      showToast(language === 'en' ? 'Failed to approve' : 'Kunde inte godkänna', 'error');
    }
  };

  const handleRejectApplication = async (appId) => {
    const reason = prompt(language === 'en' ? 'Reason for rejection:' : 'Anledning till avslag:');
    if (reason === null) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/applications/${appId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        showToast(language === 'en' ? 'Application rejected!' : 'Ansökan avslagen!', 'success');
        fetchDashboardData(true);
      } else {
        const data = await response.json();
        showToast(data.message || (language === 'en' ? 'Failed to reject' : 'Kunde inte avslå'), 'error');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      showToast(language === 'en' ? 'Failed to reject' : 'Kunde inte avslå', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        localStorage.removeItem('token');
        onLogout();
      } else {
        const data = await response.json();
        showToast(data.message || (language === 'en' ? 'Failed to delete account' : 'Kunde inte radera konto'), 'error');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast(language === 'en' ? 'Failed to delete account' : 'Kunde inte radera konto', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
  };

  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      setPreviousTab(activeTab);
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    setActiveTab(previousTab);
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
    
    if (input.includes('create task') || input.includes('new task') || input.includes('skapa uppgift') || input.includes('ny uppgift')) {
      response = language === 'en' 
        ? "📋 **To create a new task:**\n\n1. Go to the **Tasks** tab\n2. Click **Create Task**\n3. Fill in the details:\n   • Title\n   • Date & Time\n   • Job Role\n   • Branch\n   • Max Employees\n4. Click **Create**\n\nThe task will be visible to employees with matching job roles."
        : "📋 **För att skapa en ny uppgift:**\n\n1. Gå till fliken **Uppgifter**\n2. Klicka på **Skapa uppgift**\n3. Fyll i detaljerna:\n   • Titel\n   • Datum & Tid\n   • Jobbroll\n   • Avdelning\n   • Max antal anställda\n4. Klicka på **Skapa**\n\nUppgiften syns för anställda med matchande jobbroll.";
    } 
    else if (input.includes('add employee') || input.includes('new employee') || input.includes('lägg till anställd') || input.includes('ny anställd')) {
      response = language === 'en'
        ? "👥 **To add a new employee:**\n\n1. Go to the **Staff** tab\n2. Click **Add Staff**\n3. Enter:\n   • Full Name\n   • Email Address\n   • Temporary Password\n   • Job Role\n   • Branch\n4. Click **Create**\n\nThe employee will receive a welcome email with login instructions."
        : "👥 **För att lägga till en ny anställd:**\n\n1. Gå till fliken **Personal**\n2. Klicka på **Lägg till personal**\n3. Fyll i:\n   • Fullständigt namn\n   • E-postadress\n   • Tillfälligt lösenord\n   • Jobbroll\n   • Avdelning\n4. Klicka på **Skapa**\n\nDen anställda får ett välkomstmail med inloggningsinstruktioner.";
    }
    else if (input.includes('add branch') || input.includes('create branch') || input.includes('lägg till avdelning') || input.includes('skapa avdelning')) {
      response = language === 'en'
        ? "🏢 **To create a new branch:**\n\n1. Go to the **Branches** tab\n2. Click **Add Branch**\n3. Enter:\n   • Branch Name\n   • City (optional)\n4. Click **Create**\n\nAfter creation, you can assign admins to manage this branch."
        : "🏢 **För att skapa en ny avdelning:**\n\n1. Gå till fliken **Avdelningar**\n2. Klicka på **Lägg till avdelning**\n3. Fyll i:\n   • Avdelningsnamn\n   • Stad (valfritt)\n4. Klicka på **Skapa**\n\nEfter skapandet kan du tilldela administratörer att hantera denna avdelning.";
    }
    else if (input.includes('report') || input.includes('generate report') || input.includes('rapport') || input.includes('generera rapport')) {
      response = language === 'en'
        ? "📊 **To generate reports:**\n\n1. Go to the **Reports** tab\n2. Click **Generate Report** for:\n   • Attendance Report\n   • Hours Worked Report\n3. Export options:\n   • Export PDF\n   • Export Excel\n\nReports help track productivity and attendance patterns."
        : "📊 **För att generera rapporter:**\n\n1. Gå till fliken **Rapporter**\n2. Klicka på **Generera rapport** för:\n   • Närvarorapport\n   • Rapport för arbetade timmar\n3. Exportalternativ:\n   • Exportera PDF\n   • Exportera Excel\n\nRapporter hjälper dig att spåra produktivitet och närvaromönster.";
    }
    else if (input.includes('reset password') || input.includes('återställ lösenord')) {
      response = language === 'en'
        ? "🔑 **To reset a user's password:**\n\n1. Go to **Staff** or **Admins** tab\n2. Find the user\n3. Click the **🔑 (key)** button\n4. Enter a new password (min 6 characters)\n5. Click **Reset Password**\n\nThe user can now log in with the new password."
        : "🔑 **För att återställa en användares lösenord:**\n\n1. Gå till fliken **Personal** eller **Administratörer**\n2. Hitta användaren\n3. Klicka på **🔑 (nyckel)** knappen\n4. Ange ett nytt lösenord (minst 6 tecken)\n5. Klicka på **Återställ lösenord**\n\nAnvändaren kan nu logga in med det nya lösenordet.";
    }
    else if (input.includes('subscription') || input.includes('plan') || input.includes('upgrade') || input.includes('prenumeration') || input.includes('uppgradera')) {
      response = language === 'en'
        ? `💰 **Current Plan:** ${subscriptionData?.plan?.toUpperCase() || 'TRIAL'}\n📅 **Days remaining:** ${subscriptionData?.daysRemaining || 0}\n\n**To change your plan:**\n1. Go to **Settings**\n2. Click on **Subscription**\n3. Select a new plan\n4. Choose duration\n5. Confirm the change\n\nContact sales@taskbridge.com for custom plans.`
        : `💰 **Nuvarande plan:** ${subscriptionData?.plan?.toUpperCase() || 'TRIAL'}\n📅 **Dagar kvar:** ${subscriptionData?.daysRemaining || 0}\n\n**För att ändra din plan:**\n1. Gå till **Inställningar**\n2. Klicka på **Prenumeration**\n3. Välj en ny plan\n4. Välj varaktighet\n5. Bekräfta ändringen\n\nKontakta sales@taskbridge.com för anpassade planer.`;
    }
    else {
      response = language === 'en'
        ? "👋 **Hello! I'm your TaskBridge AI Assistant.**\n\nI can help you with:\n\n📋 Creating tasks\n👥 Adding employees\n🏢 Managing branches\n📊 Generating reports\n🔑 Resetting passwords\n💰 Subscription plans\n\n**Try clicking one of the quick questions below!**\n\nWhat would you like to learn about?"
        : "👋 **Hej! Jag är din TaskBridge AI-assistent.**\n\nJag kan hjälpa dig med:\n\n📋 Skapa uppgifter\n👥 Lägga till anställda\n🏢 Hantera avdelningar\n📊 Generera rapporter\n🔑 Återställa lösenord\n💰 Prenumerationsplaner\n\n**Prova att klicka på en av snabbfrågorna nedan!**\n\nVad vill du lära dig om?";
    }
    
    const aiMessage = { text: response, sender: 'ai', time: new Date().toLocaleTimeString(), showQuickQuestions: !input.includes('subscription') };
    setChatMessages(prev => [...prev, aiMessage]);
    setIsAiTyping(false);
  }, 800);
};
  const handleModalClose = (setter) => (e) => {
    if (e.target === e.currentTarget) {
      setter(false);
    }
  };

  // Add to SuperAdminDashboard for session management
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (!data.success) {
            handleLogout();
          }
        } catch (err) {
          console.error('Token refresh error:', err);
        }
      }
    }, 20 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const confirmDelete = (type, id, name) => {
    let title = '';
    let message = '';
    
    switch(type) {
      case 'admin':
        title = lang.confirmDelete;
        message = `${lang.areYouSure} ${language === 'en' ? `Delete admin "${name}"?` : `Radera administratör "${name}"?`} ${language === 'en' ? 'This cannot be undone.' : 'Detta går inte att ångra.'}`;
        break;
      case 'employee':
        title = lang.confirmDelete;
        message = `${lang.areYouSure} ${language === 'en' ? `Delete employee "${name}"?` : `Radera anställd "${name}"?`} ${language === 'en' ? 'This cannot be undone.' : 'Detta går inte att ångra.'}`;
        break;
      case 'branch':
        const employeeCount = employees.filter(e => e.branch?._id === id).length;
        title = lang.confirmDelete;
        message = `${lang.areYouSure} ${language === 'en' ? `Delete branch "${name}"?` : `Radera avdelning "${name}"?`}\n\n${language === 'en' ? `This branch has ${employeeCount} employees. They will be permanently deleted!` : `Denna avdelning har ${employeeCount} anställda. De kommer att raderas permanent!`}\n\n${language === 'en' ? 'This cannot be undone.' : 'Detta går inte att ångra.'}`;
        break;
      case 'job':
        title = lang.confirmDelete;
        message = `${lang.areYouSure} ${language === 'en' ? `Delete job role "${name}"?` : `Radera jobbroll "${name}"?`} ${language === 'en' ? 'This cannot be undone.' : 'Detta går inte att ångra.'}`;
        break;
      case 'task':
        title = lang.confirmDelete;
        message = `${lang.areYouSure} ${language === 'en' ? `Delete task "${name}"?` : `Radera uppgift "${name}"?`} ${language === 'en' ? 'This cannot be undone.' : 'Detta går inte att ångra.'}`;
        break;
      default:
        return;
    }
    
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        if (type === 'admin') handleDeleteAdmin(id, name);
        if (type === 'employee') handleDeleteEmployee(id, name);
        if (type === 'branch') handleDeleteBranch(id, name);
        if (type === 'job') handleDeleteJob(id, name);
        if (type === 'task') handleDeleteTask(id, name);
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
      itemId: id,
      itemName: name,
      type
    });
  };

  if (subscriptionData?.status === 'expired' || subscriptionData?.status === 'paused') {
    return (
      <div style={styles.subscriptionBlockedContainer}>
        <div style={styles.subscriptionBlockedCard}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '64px', color: '#ef4444', marginBottom: '20px' }}></i>
          <h1 style={styles.subscriptionBlockedTitle}>
            {subscriptionData?.status === 'expired' ? lang.subscriptionExpired : lang.subscriptionPaused}
          </h1>
          <button onClick={handleLogout} style={styles.subscriptionBlockedButton}>Logout</button>
        </div>
      </div>
    );
  }

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
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          ...styles.toast,
          background: toastMessage.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {toastMessage.message}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div style={styles.modalOverlay} onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}>
          <div style={styles.confirmationModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.confirmationHeader}>
              <h3 style={styles.confirmationTitle}>{confirmationModal.title}</h3>
              <button onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })} style={styles.confirmationClose}>×</button>
            </div>
            <div style={styles.confirmationBody}>
              <p style={styles.confirmationMessage}>{confirmationModal.message}</p>
            </div>
            <div style={styles.confirmationFooter}>
              <button onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })} style={styles.cancelButton}>{lang.cancel}</button>
              <button onClick={confirmationModal.onConfirm} style={styles.confirmDeleteButton}>{lang.delete}</button>
            </div>
          </div>
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
              <h1 style={{...styles.title, fontSize: isSmall ? '18px' : '22px'}}>Super Admin Dashboard</h1>
              <span style={{...styles.userNameBadge, fontSize: isSmall ? '10px' : '11px'}}>
                <i className="fas fa-user-shield"></i> {user?.name}
              </span>
            </div>
            <p style={{...styles.subtitle, fontSize: isSmall ? '10px' : '11px'}}>Manage {user?.organization?.name || 'your organization'}</p>
          </div>
        </div>
        <div style={{...styles.headerButtons, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end'}}>
          <div style={styles.languageContainer}>
            <button onClick={() => setShowLanguageDropdown(!showLanguageDropdown)} style={{...styles.languageButton, fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 12px'}}>
              <i className="fas fa-globe"></i> {language === 'en' ? 'EN' : 'SV'}
            </button>
            {showLanguageDropdown && (
              <div style={styles.languageDropdown}>
                <button onClick={() => changeLanguage('en')} style={styles.languageOption}>🇬🇧 English</button>
                <button onClick={() => changeLanguage('sv')} style={styles.languageOption}>🇸🇪 Svenska</button>
              </div>
            )}
          </div>
          <button onClick={() => setShowProfileModal(true)} style={{...styles.profileButton, fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 12px' : '6px 14px'}}>{lang.profile}</button>
          <button onClick={handleLogout} style={{...styles.logoutButton, fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 12px' : '6px 14px'}}>{lang.logout}</button>
        </div>
      </div>

      <div style={{...styles.statsGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(100px, 1fr))'}}>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-user-tie" style={{ color: '#00d1ff' }}></i></div><div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '20px'}}>{stats.totalAdmins}</div><div style={{...styles.statLabelSmall, fontSize: isSmall ? '9px' : '10px'}}>{lang.adminsLabel}</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-users" style={{ color: '#00d1ff' }}></i></div><div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '20px'}}>{stats.totalEmployees}</div><div style={{...styles.statLabelSmall, fontSize: isSmall ? '9px' : '10px'}}>{lang.employees}</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-tasks" style={{ color: '#00d1ff' }}></i></div><div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '20px'}}>{stats.totalTasks}</div><div style={{...styles.statLabelSmall, fontSize: isSmall ? '9px' : '10px'}}>{lang.tasks}</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-store" style={{ color: '#00d1ff' }}></i></div><div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '20px'}}>{stats.totalBranches}</div><div style={{...styles.statLabelSmall, fontSize: isSmall ? '9px' : '10px'}}>{lang.branchesLabel}</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-briefcase" style={{ color: '#00d1ff' }}></i></div><div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '20px'}}>{stats.totalJobDescriptions}</div><div style={{...styles.statLabelSmall, fontSize: isSmall ? '9px' : '10px'}}>{lang.roles}</div></div>
        <div style={styles.statCard}><div style={styles.statIconSmall}><i className="fas fa-clock" style={{ color: '#00d1ff' }}></i></div><div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '20px'}}>{stats.pendingApplications}</div><div style={{...styles.statLabelSmall, fontSize: isSmall ? '9px' : '10px'}}>{lang.pendingRequests}</div></div>
      </div>

      {subscriptionData && (
        <div style={styles.subscriptionCard}>
          <div style={styles.subscriptionHeader}>
            <h3 style={styles.subscriptionTitle}>{lang.subscriptionOverview}</h3>
            <a href="mailto:georgeglor@hotmail.com" style={styles.contactSalesButton}>{lang.contactSales}</a>
          </div>
          <div style={styles.subscriptionContent}>
            <div style={styles.subscriptionPlan}>
              <span style={styles.subscriptionPlanName}>{subscriptionData.plan?.toUpperCase() || 'TRIAL'}</span>
              <span style={styles.subscriptionDays}>{subscriptionData.daysRemaining || 0} {lang.daysRemaining}</span>
            </div>
            <div style={styles.usageGrid}>
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
              <div style={styles.usageItem}>
                <div style={styles.usageHeader}>
                  <span>{lang.branchesLabel}</span>
                  <span>{usageData.branches?.current || 0}/{usageData.branches?.limit === Infinity ? '∞' : usageData.branches?.limit || 0}</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{...styles.progressFill, width: `${Math.min(usageData.branches?.percentage || 0, 100)}%`, background: usageData.branches?.percentage > 90 ? '#ef4444' : '#10b981'}}></div>
                </div>
              </div>
              <div style={styles.usageItem}>
                <div style={styles.usageHeader}>
                  <span>{lang.adminsLabel}</span>
                  <span>{usageData.admins?.current || 0}/{usageData.admins?.limit === Infinity ? '∞' : usageData.admins?.limit || 0}</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{...styles.progressFill, width: `${Math.min(usageData.admins?.percentage || 0, 100)}%`, background: usageData.admins?.percentage > 90 ? '#ef4444' : '#10b981'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{...styles.tabs, overflowX: isMobile ? 'auto' : 'visible', flexWrap: isMobile ? 'nowrap' : 'wrap', paddingBottom: isMobile ? '8px' : '10px'}}>
        <button onClick={() => handleTabChange('dashboard')} style={{...styles.tab, background: activeTab === 'dashboard' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.dashboard}</button>
        <button onClick={() => handleTabChange('admins')} style={{...styles.tab, background: activeTab === 'admins' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.admins}</button>
        <button onClick={() => handleTabChange('employees')} style={{...styles.tab, background: activeTab === 'employees' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.staff}</button>
        <button onClick={() => handleTabChange('branches')} style={{...styles.tab, background: activeTab === 'branches' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.branches}</button>
        <button onClick={() => onNavigate('calendar')} style={{...styles.tab, background: activeTab === 'calendar' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.calendar}</button>
        <button onClick={() => handleTabChange('jobs')} style={{...styles.tab, background: activeTab === 'jobs' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.roles}</button>
        <button onClick={() => handleTabChange('tasks')} style={{...styles.tab, background: activeTab === 'tasks' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.tasks}</button>
        <button onClick={() => handleTabChange('applications')} style={{...styles.tab, background: activeTab === 'applications' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.requests}</button>
        <button onClick={() => handleTabChange('reports')} style={{...styles.tab, background: activeTab === 'reports' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.reports}</button>
        <button onClick={() => handleTabChange('settings')} style={{...styles.tab, background: activeTab === 'settings' ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px'}}>{lang.settings}</button>
      </div>

      <div style={{...styles.content, padding: isSmall ? '12px' : '16px'}}>
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.welcome}, {user?.name}!</h2>
            <p style={{...styles.sectionDesc, fontSize: isSmall ? '11px' : '12px'}}>{lang.welcome}</p>
            <div style={styles.welcomeCard}>
              <i className="fas fa-chart-line" style={{ fontSize: isSmall ? '24px' : '32px', color: '#00d1ff', marginBottom: '12px' }}></i>
              <h3 style={{...styles.welcomeTitle, fontSize: isSmall ? '13px' : '14px'}}>{lang.subscriptionOverview}</h3>
              <p style={{...styles.welcomeText, fontSize: isSmall ? '11px' : '12px'}}><strong>{stats.pendingApplications}</strong> {lang.pendingRequests} | <strong>{stats.totalTasks}</strong> {lang.activeTasks}</p>
              <div style={{...styles.quickActions, flexDirection: isSmall ? 'column' : 'row'}}>
                <button onClick={() => handleTabChange('tasks')} style={styles.quickActionBtn}>+ {lang.createTask}</button>
                <button onClick={() => setShowCreateEmployeeModal(true)} style={styles.quickActionBtn}>+ {lang.addStaff}</button>
                <button onClick={() => handleTabChange('applications')} style={styles.quickActionBtn}>{lang.manage}</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
  <div>
    <div style={{...styles.sectionHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center'}}>
      <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.adminManagement}</h2>
      <button 
        onClick={() => {
          if (!canAddAdmin()) {
            showToast(lang.limitWarning, 'error');
          } else {
            setShowCreateAdminModal(true);
          }
        }} 
        style={{...styles.addButton, width: isSmall ? '100%' : 'auto', opacity: !canAddAdmin() ? 0.5 : 1}}
      >
        + {lang.addAdmin}
      </button>
    </div>
    <div style={styles.tableContainer}>
      <table style={{...styles.table, minWidth: isSmall ? '500px' : '600px'}}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Name</th>
            <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Email</th>
            {!isSmall && <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Assigned Branches</th>}
            <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Status</th>
            <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map(admin => (
            <tr key={admin._id} style={styles.tableRow}>
              <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{admin.name}</td>
              <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{isSmall ? admin.email?.substring(0, 15) + (admin.email?.length > 15 ? '...' : '') : admin.email}</td>
              {!isSmall && (
                <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>
                  <div>
                    {(admin.assignedBranches || []).slice(0, 2).map(b => (
                      <span key={b._id} style={styles.branchTag}>{b.name}</span>
                    ))}
                    {(admin.assignedBranches || []).length > 2 && <span>+{(admin.assignedBranches || []).length - 2}</span>}
                    <button onClick={() => { setSelectedAdminForBranch(admin); setShowBranchAssignmentModal(true); }} style={styles.assignBranchButton}>{lang.manage}</button>
                  </div>
                </td>
              )}
              <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}>
                <span style={{...styles.statusBadge, background: admin.isActive ? '#10b981' : '#ef4444', fontSize: isSmall ? '8px' : '9px'}}>{admin.isActive ? 'Active' : 'Inactive'}</span>
              </td>
              <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}>
                <div style={styles.actionButtons}>
                  <button onClick={() => { setSelectedUser(admin); setShowResetPasswordModal(true); }} style={{...styles.resetButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>🔑</button>
                  <button onClick={() => confirmDelete('admin', admin._id, admin.name)} style={{...styles.deleteButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>🗑️</button>
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
    <div style={{...styles.sectionHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center'}}>
      <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.staffManagement}</h2>
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
      <table style={{...styles.table, minWidth: isSmall ? '500px' : '600px'}}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Name</th>
            <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Email</th>
            {!isSmall && <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Job Role</th>}
            {!isSmall && <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Branch</th>}
            <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Status</th>
            <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map(emp => (
            <tr key={emp._id} style={styles.tableRow}>
              <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{emp.name}</td>
              <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{isSmall ? emp.email?.substring(0, 15) + (emp.email?.length > 15 ? '...' : '') : emp.email}</td>
              {!isSmall && <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{emp.jobDescription?.name || '-'}</td>}
              {!isSmall && <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{emp.branch?.name || '-'}</td>}
              <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}><span style={{...styles.statusBadge, background: emp.isActive ? '#10b981' : '#ef4444', fontSize: isSmall ? '8px' : '9px'}}>{emp.isActive ? 'Active' : 'Inactive'}</span></td>
              <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}>
                <button onClick={() => { setSelectedUser(emp); setShowResetPasswordModal(true); }} style={{...styles.resetButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>🔑</button>
                <button onClick={() => confirmDelete('employee', emp._id, emp.name)} style={{...styles.deleteButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

        {activeTab === 'branches' && (
          <div>
            <div style={{...styles.sectionHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center'}}>
              <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.branchManagement}</h2>
              <button 
                onClick={() => {
                  if (!canAddBranch()) {
                    showToast(lang.limitWarning, 'error');
                  } else {
                    setShowCreateBranchModal(true);
                  }
                }} 
                style={{...styles.addButton, width: isSmall ? '100%' : 'auto', opacity: !canAddBranch() ? 0.5 : 1}}
              >
                + {lang.addBranch}
              </button>
            </div>
            <div style={styles.tableContainer}>
              <table style={{...styles.table, minWidth: isSmall ? '400px' : '600px'}}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Name</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>City</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Staff</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Admins</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map(branch => (
                    <tr key={branch._id} style={styles.tableRow}>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{branch.name}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{branch.address?.city || '-'}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{employees.filter(e => e.branch?._id === branch._id).length}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{admins.filter(a => a.assignedBranches?.some(b => b._id === branch._id)).length}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}><button onClick={() => confirmDelete('branch', branch._id, branch.name)} style={{...styles.deleteButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>🗑️</button></td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <div style={{...styles.sectionHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center'}}>
              <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.roleManagement}</h2>
              <button onClick={() => setShowCreateJobModal(true)} style={{...styles.addButton, width: isSmall ? '100%' : 'auto'}}>+ {lang.addRole}</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={{...styles.table, minWidth: isSmall ? '400px' : '600px'}}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Role</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Description</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Staff</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobDescriptions.map(job => (
                    <tr key={job._id} style={styles.tableRow}>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{job.name}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{job.description || '-'}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{employees.filter(e => e.jobDescription?._id === job._id).length}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}><button onClick={() => confirmDelete('job', job._id, job.name)} style={{...styles.deleteButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>🗑️</button></td>
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
              <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.taskManagement}</h2>
              <button onClick={() => setShowCreateTaskModal(true)} style={{...styles.createTaskButton, width: isSmall ? '100%' : 'auto'}}>+ {lang.createTask}</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={{...styles.table, minWidth: isSmall ? '600px' : '800px'}}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Title</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Date</th>
                    {!isSmall && <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Time</th>}
                    {!isSmall && <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Role</th>}
                    {!isSmall && <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Branch</th>}
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Status</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task._id} style={styles.tableRow}>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{isSmall ? task.title?.substring(0, 15) + (task.title?.length > 15 ? '...' : '') : task.title}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{new Date(task.date).toLocaleDateString()}</td>
                      {!isSmall && <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{task.startTime} - {task.endTime}</td>}
                      {!isSmall && <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{task.jobDescription?.name || '-'}</td>}
                      {!isSmall && <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{task.branch?.name || '-'}</td>}
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}><span style={{...styles.statusBadge, background: task.status === 'open' ? '#10b981' : '#f59e0b', fontSize: isSmall ? '8px' : '9px'}}>{task.status}</span></td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}><button onClick={() => confirmDelete('task', task._id, task.title)} style={{...styles.deleteButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>🗑️</button></td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>All Applications</h2>
            <div style={styles.tableContainer}>
              <table style={{...styles.table, minWidth: isSmall ? '600px' : '800px'}}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Employee</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Task</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Date</th>
                    {!isSmall && <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Time</th>}
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Status</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Applied Date</th>
                    <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px', padding: isSmall ? '6px 4px' : '10px 8px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id} style={styles.tableRow}>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{app.employee?.name}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{isSmall ? app.task?.title?.substring(0, 15) + (app.task?.title?.length > 15 ? '...' : '') : app.task?.title}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{app.task?.date ? new Date(app.task.date).toLocaleDateString() : '-'}</td>
                      {!isSmall && <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{app.task?.startTime} - {app.task?.endTime}</td>}
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}>
                        <span style={{...styles.statusBadge, background: 
                          app.status === 'approved' ? '#10b981' : 
                          app.status === 'rejected' ? '#ef4444' : '#f59e0b', fontSize: isSmall ? '8px' : '9px'
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px', color: 'white'}}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td style={{...styles.td, fontSize: isSmall ? '11px' : '12px', padding: isSmall ? '8px 4px' : '10px 8px'}}>
                        {app.status === 'pending' && (
                          <div style={styles.actionButtons}>
                            <button onClick={() => handleApproveApplication(app._id)} style={{...styles.approveButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>✓</button>
                            <button onClick={() => handleRejectApplication(app._id)} style={{...styles.rejectButton, padding: isSmall ? '3px 6px' : '4px 8px', fontSize: isSmall ? '10px' : '12px'}}>✗</button>
                          </div>
                        )}
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
            <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.reportManagement}</h2>
            <div style={{...styles.reportsGrid, gridTemplateColumns: isSmall ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))'}}>
              <div style={styles.reportCard}>
                <i className="fas fa-chart-bar" style={{ color: '#00d1ff', fontSize: isSmall ? '24px' : '28px', marginBottom: '12px' }}></i>
                <h3 style={{color: 'white', fontSize: isSmall ? '13px' : '14px', marginBottom: '8px'}}>{lang.attendance}</h3>
                <button onClick={generateAttendanceReport} style={{...styles.reportButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.generateReport}</button>
              </div>
              <div style={styles.reportCard}>
                <i className="fas fa-clock" style={{ color: '#00d1ff', fontSize: isSmall ? '24px' : '28px', marginBottom: '12px' }}></i>
                <h3 style={{color: 'white', fontSize: isSmall ? '13px' : '14px', marginBottom: '8px'}}>{lang.hoursWorked}</h3>
                <button onClick={generateAttendanceReport} style={{...styles.reportButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.generateReport}</button>
              </div>
              <div style={styles.reportCard}>
                <i className="fas fa-file-pdf" style={{ color: '#00d1ff', fontSize: isSmall ? '24px' : '28px', marginBottom: '12px' }}></i>
                <h3 style={{color: 'white', fontSize: isSmall ? '13px' : '14px', marginBottom: '8px'}}>{lang.exportPDF}</h3>
                <button onClick={exportToPDF} style={{...styles.reportButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.exportPDF}</button>
              </div>
              <div style={styles.reportCard}>
                <i className="fas fa-file-excel" style={{ color: '#00d1ff', fontSize: isSmall ? '24px' : '28px', marginBottom: '12px' }}></i>
                <h3 style={{color: 'white', fontSize: isSmall ? '13px' : '14px', marginBottom: '8px'}}>{lang.exportExcel}</h3>
                <button onClick={exportToExcel} style={{...styles.reportButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.exportExcel}</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.settingsManagement}</h2>
            <div style={styles.settingsCard}>
              <h3 style={{color: 'white', fontSize: isSmall ? '14px' : '16px'}}>Organization Logo</h3>
              {logoPreview && <img src={logoPreview} alt="Logo" style={{...styles.logoPreview, width: isSmall ? '50px' : '60px', height: isSmall ? '50px' : '60px'}} />}
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{...styles.fileInput, fontSize: isSmall ? '10px' : '11px'}} />
              <button style={{...styles.uploadButton, fontSize: isSmall ? '11px' : '12px'}}>Upload Logo</button>
            </div>
            <div style={styles.settingsCard}>
              <h3 style={{color: 'white', fontSize: isSmall ? '14px' : '16px'}}>Subscription</h3>
              <p style={{color: 'white', fontSize: isSmall ? '13px' : '14px'}}>{lang.currentPlan}: {subscriptionData?.plan || 'Trial'}</p>
              <a href="mailto:georgeglor@hotmail.com" style={{...styles.contactLink, fontSize: isSmall ? '11px' : '12px'}}>{lang.contactSales}</a>
              <button style={{...styles.invoiceButton, fontSize: isSmall ? '11px' : '12px'}}>Invoices</button>
            </div>
            <div style={styles.settingsCard}>
              <h3 style={{color: 'white', fontSize: isSmall ? '14px' : '16px'}}>{lang.auditLogs}</h3>
              <button onClick={() => { fetchAuditLogs(); setShowAuditModal(true); }} style={{...styles.viewButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.viewAudit}</button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Modal */}
      {showAuditModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAuditModal(false)}>
          <div style={{...styles.modalLarge, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '400px' : '600px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '20px'}}>{lang.auditLogs}</h2>
            {loadingAudit ? (
              <div style={styles.loadingSpinner}></div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={{...styles.table, minWidth: isSmall ? '500px' : '600px'}}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px'}}>{lang.action}</th>
                      <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px'}}>{lang.entityType}</th>
                      <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px'}}>{lang.user}</th>
                      <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px'}}>{lang.timestamp}</th>
                      <th style={{...styles.th, fontSize: isSmall ? '10px' : '12px'}}>{lang.changes}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.slice(0, 50).map(log => (
                      <tr key={log._id} style={styles.tableRow}>
                        <td style={{...styles.td, fontSize: isSmall ? '10px' : '12px', color: 'white'}}>{log.action}</td>
                        <td style={{...styles.td, fontSize: isSmall ? '10px' : '12px', color: 'white'}}>{log.entityType}</td>
                        <td style={{...styles.td, fontSize: isSmall ? '10px' : '12px', color: 'white'}}>{log.user?.name || 'System'}</td>
                        <td style={{...styles.td, fontSize: isSmall ? '10px' : '12px', color: 'white'}}>{new Date(log.createdAt).toLocaleString()}</td>
                        <td style={{...styles.td, fontSize: isSmall ? '10px' : '12px', color: 'white'}}><pre style={{margin: 0, fontSize: isSmall ? '8px' : '10px', color: 'white'}}>{JSON.stringify(log.changes, null, 2)}</pre></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={styles.modalButtons}>
              <button onClick={() => setShowAuditModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '13px'}}>{lang.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* All modals - keep as is from original */}
      {showCreateAdminModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateAdminModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '450px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '20px'}}>{lang.addAdmin}</h2>
            <form onSubmit={handleCreateAdmin}>
              <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
              <input type="email" placeholder="Email Address" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
              <input type="password" placeholder="Temporary Password" value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
              <select value={formData.branch || ''} onChange={(e) => setFormData({...formData, branch: e.target.value})} style={{...styles.select, fontSize: isSmall ? '11px' : '13px', color: 'white'}}>
                <option value="">Select Branch (Optional)</option>
                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateAdminModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '13px'}}>Cancel</button>
                <button type="submit" style={{...styles.submitButton, fontSize: isSmall ? '11px' : '13px'}}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateEmployeeModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateEmployeeModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '450px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '20px'}}>{lang.addStaff}</h2>
            <form onSubmit={handleCreateEmployee}>
              <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
              <input type="email" placeholder="Email Address" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
              <input type="password" placeholder="Temporary Password" value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
              <select value={formData.jobDescription || ''} onChange={(e) => setFormData({...formData, jobDescription: e.target.value})} style={{...styles.select, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required>
                <option value="">Select Job Role</option>
                {jobDescriptions.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
              </select>
              <select value={formData.branch || ''} onChange={(e) => setFormData({...formData, branch: e.target.value})} style={{...styles.select, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required>
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateEmployeeModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '13px'}}>Cancel</button>
                <button type="submit" style={{...styles.submitButton, fontSize: isSmall ? '11px' : '13px'}}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateBranchModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateBranchModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '450px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '20px'}}>{lang.addBranch}</h2>
            <form onSubmit={handleCreateBranch}>
              <input type="text" placeholder="Branch Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
              <input type="text" placeholder="City" value={formData.city || ''} onChange={(e) => setFormData({...formData, city: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} />
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateBranchModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '13px'}}>Cancel</button>
                <button type="submit" style={{...styles.submitButton, fontSize: isSmall ? '11px' : '13px'}}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateJobModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateJobModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '450px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '20px'}}>{lang.addRole}</h2>
            <form onSubmit={handleCreateJob}>
              <input type="text" placeholder="Role Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
              <textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{...styles.textarea, fontSize: isSmall ? '11px' : '13px', color: 'white'}} rows="2" />
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateJobModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '13px'}}>Cancel</button>
                <button type="submit" style={{...styles.submitButton, fontSize: isSmall ? '11px' : '13px'}}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateTaskModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowCreateTaskModal)}>
          <div style={{...styles.modalLarge, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '400px' : '600px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '20px'}}>{lang.createTask}</h2>
            <form onSubmit={handleCreateTask}>
              <div style={styles.formGroup}>
                <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px'}}>Task Title *</label>
                <input type="text" placeholder="e.g., Morning Shift" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
              </div>
              <div style={styles.formGroup}>
                <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px'}}>Description</label>
                <textarea placeholder="Describe the task..." value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{...styles.textarea, fontSize: isSmall ? '11px' : '13px', color: 'white'}} rows="2" />
              </div>
              <div style={{...styles.formRow, gridTemplateColumns: isSmall ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))'}}>
                <div style={styles.formGroup}>
                  <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px'}}>Date *</label>
                  <input type="date" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px'}}>Start Time *</label>
                  <input type="time" value={formData.startTime || ''} onChange={(e) => setFormData({...formData, startTime: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px'}}>End Time *</label>
                  <input type="time" value={formData.endTime || ''} onChange={(e) => setFormData({...formData, endTime: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required />
                </div>
              </div>
              <div style={{...styles.formRow, gridTemplateColumns: isSmall ? '1fr' : 'repeat(2, 1fr)'}}>
                <div style={styles.formGroup}>
                  <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px'}}>Job Role *</label>
                  <select value={formData.jobDescription || ''} onChange={(e) => setFormData({...formData, jobDescription: e.target.value})} style={{...styles.select, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required>
                    <option value="">Select Role</option>
                    {jobDescriptions.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px'}}>Branch *</label>
                  <select value={formData.branch || ''} onChange={(e) => setFormData({...formData, branch: e.target.value})} style={{...styles.select, fontSize: isSmall ? '11px' : '13px', color: 'white'}} required>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px'}}>Max Employees</label>
                <input type="number" placeholder="1" value={formData.maxEmployees || 1} onChange={(e) => setFormData({...formData, maxEmployees: parseInt(e.target.value)})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} min="1" />
              </div>
              <div style={styles.formGroup}>
                <label style={{...styles.label, fontSize: isSmall ? '11px' : '12px'}}>Location</label>
                <input type="text" placeholder="e.g., Room 101" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} />
              </div>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateTaskModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '13px'}}>Cancel</button>
                <button type="submit" style={{...styles.submitButton, fontSize: isSmall ? '11px' : '13px'}}>{lang.createTask}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetPasswordModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowResetPasswordModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '450px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '20px'}}>Reset Password</h2>
            <p style={{color: 'white', fontSize: isSmall ? '12px' : '14px'}}>Reset password for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})</p>
            <input type="password" placeholder="New Password" value={resetPasswordData.newPassword} onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} />
            <input type="password" placeholder="Confirm Password" value={resetPasswordData.confirmPassword} onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} />
            <div style={styles.modalButtons}>
              <button type="button" onClick={() => setShowResetPasswordModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '13px'}}>Cancel</button>
              <button onClick={handleResetUserPassword} style={{...styles.submitButton, fontSize: isSmall ? '11px' : '13px'}}>Reset Password</button>
            </div>
          </div>
        </div>
      )}

      {showBranchAssignmentModal && (
        <div style={styles.modalOverlay} onClick={() => setShowBranchAssignmentModal(false)}>
          <div style={{...styles.modalLarge, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '500px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '20px'}}>Manage Branches for {selectedAdminForBranch?.name}</h2>
            <p style={{color: 'white', fontSize: isSmall ? '12px' : '14px'}}>Select branches this admin can manage:</p>
            <div style={styles.branchListContainer}>
              {branches.map(branch => (
                <div key={branch._id} style={styles.branchCheckboxItem}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedAdminForBranch?.assignedBranches?.some(b => b._id === branch._id)}
                      onChange={async (e) => {
                        if (e.target.checked) {
                          await handleAssignBranch(branch._id);
                        } else {
                          await handleRemoveBranch(branch._id);
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
              <button onClick={() => setShowBranchAssignmentModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '13px'}}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showChangeEmailModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowChangeEmailModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '450px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '20px'}}>Change Email</h2>
            <p style={{color: 'white', fontSize: isSmall ? '12px' : '14px'}}>Current email: <strong>{user?.email}</strong></p>
            <input type="email" placeholder="New Email" value={changeEmailData.newEmail} onChange={(e) => setChangeEmailData({...changeEmailData, newEmail: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} />
            <input type="email" placeholder="Confirm New Email" value={changeEmailData.confirmEmail} onChange={(e) => setChangeEmailData({...changeEmailData, confirmEmail: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} />
            <input type="password" placeholder="Current Password" value={changeEmailData.password} onChange={(e) => setChangeEmailData({...changeEmailData, password: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} />
            <div style={styles.modalButtons}>
              <button type="button" onClick={() => setShowChangeEmailModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '13px'}}>Cancel</button>
              <button onClick={handleChangeEmail} style={{...styles.submitButton, fontSize: isSmall ? '11px' : '13px'}}>Change Email</button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowProfileModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '450px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '20px'}}>Profile Settings</h2>
            <div style={styles.profileInfo}>
              <p><strong style={{color: '#00d1ff'}}>Name:</strong> <span style={{color: 'white'}}>{user?.name}</span></p>
              <p><strong style={{color: '#00d1ff'}}>Email:</strong> <span style={{color: 'white'}}>{user?.email}</span></p>
              <p><strong style={{color: '#00d1ff'}}>Role:</strong> <span style={{color: 'white'}}>Super Admin</span></p>
              <p><strong style={{color: '#00d1ff'}}>Organization:</strong> <span style={{color: 'white'}}>{user?.organization?.name}</span></p>
            </div>
            <button onClick={() => { setShowProfileModal(false); setShowChangeEmailModal(true); }} style={{...styles.changeEmailButton, fontSize: isSmall ? '11px' : '13px'}}>Change Email</button>
            <h3 style={{...styles.subTitle, fontSize: isSmall ? '13px' : '16px'}}>Change Password</h3>
            <input type="password" placeholder="Current Password" value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} />
            <input type="password" placeholder="New Password" value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} />
            <input type="password" placeholder="Confirm New Password" value={profileData.confirmPassword} onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '13px', color: 'white'}} />
            <button onClick={handleUpdateProfile} style={{...styles.submitButton, fontSize: isSmall ? '11px' : '13px'}}>Update Password</button>
            <div style={styles.dangerZone}>
              <h3 style={{ color: '#ef4444', fontSize: isSmall ? '13px' : '16px' }}>Danger Zone</h3>
              <button onClick={() => { setShowProfileModal(false); setShowDeleteAccountModal(true); }} style={{...styles.deleteAccountButton, fontSize: isSmall ? '11px' : '13px'}}>Delete My Account</button>
              <p style={{...styles.warningText, fontSize: isSmall ? '10px' : '11px'}}>⚠️ This will delete YOUR account only. Other admins can continue managing.</p>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div style={styles.modalOverlay} onClick={handleModalClose(setShowDeleteAccountModal)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '450px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '20px'}}>Delete Your Account</h2>
            <p style={{color: 'white', fontSize: isSmall ? '12px' : '14px'}}>Are you sure you want to delete your account?</p>
            <p style={{ color: '#ef4444', fontSize: isSmall ? '11px' : '13px' }}>⚠️ This action cannot be undone. Your personal data will be removed.</p>
            <p style={{color: 'white', fontSize: isSmall ? '11px' : '13px'}}>Other admins can continue managing the organization.</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteAccountModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '13px'}}>Cancel</button>
              <button onClick={handleDeleteAccount} style={{...styles.confirmDeleteButton, fontSize: isSmall ? '11px' : '13px'}}>Delete My Account</button>
            </div>
          </div>
        </div>
      )}

      <button style={{...styles.chatButton, width: isSmall ? '40px' : '45px', height: isSmall ? '40px' : '45px', fontSize: isSmall ? '16px' : '18px'}} onClick={() => setShowChat(!showChat)}>
        <i className="fas fa-robot"></i>
      </button>

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
                  <div style={{...styles.messageTime, fontSize: isSmall ? '8px' : '9px'}}>{msg.time}</div>
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

// Keep ALL original styles
const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '20px', fontFamily: 'Inter, sans-serif', position: 'relative' },
  toast: { position: 'fixed', bottom: '20px', right: '20px', color: 'white', padding: '12px 20px', borderRadius: '8px', zIndex: 2000, fontSize: '14px', animation: 'fadeInOut 3s ease', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' },
  loadingSpinner: { width: '40px', height: '40px', border: '3px solid rgba(0,209,255,0.3)', borderRadius: '50%', borderTopColor: '#00d1ff', animation: 'spin 1s linear infinite' },
  subscriptionBlockedContainer: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  subscriptionBlockedCard: { background: '#1e293b', borderRadius: '20px', padding: '40px', textAlign: 'center', maxWidth: '500px' },
  subscriptionBlockedTitle: { fontSize: '24px', color: 'white', marginBottom: '20px' },
  subscriptionBlockedButton: { padding: '12px 24px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  subscriptionCard: { background: 'rgba(0,209,255,0.1)', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(0,209,255,0.2)' },
  subscriptionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' },
  subscriptionTitle: { fontSize: '16px', fontWeight: '600', color: '#00d1ff', margin: 0 },
  contactSalesButton: { padding: '6px 12px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px', textDecoration: 'none' },
  contactLink: { padding: '6px 12px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px', textDecoration: 'none', display: 'inline-block', marginRight: '8px' },
  subscriptionContent: { display: 'flex', flexDirection: 'column', gap: '12px' },
  subscriptionPlan: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  subscriptionPlanName: { fontSize: '14px', fontWeight: 'bold', color: 'white' },
  subscriptionDays: { fontSize: '12px', color: 'rgba(255,255,255,0.7)' },
  usageGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  usageItem: { width: '100%' },
  usageHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' },
  progressBar: { height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  logoSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  orgLogo: { width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' },
  logoPlaceholder: { width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  title: { fontWeight: 'bold', color: 'white', margin: 0 },
  userNameBadge: { background: 'rgba(0,209,255,0.2)', padding: '4px 10px', borderRadius: '20px', color: '#00d1ff' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: '2px' },
  headerButtons: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  languageContainer: { position: 'relative' },
  languageButton: { background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '20px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  languageDropdown: { position: 'absolute', top: '35px', right: '0', background: '#1e293b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100, minWidth: '120px' },
  languageOption: { padding: '8px 12px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '12px' },
  profileButton: { background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '20px', color: 'white', cursor: 'pointer' },
  logoutButton: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer' },
  statsGrid: { display: 'grid', gap: '10px', marginBottom: '20px' },
  statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px', textAlign: 'center' },
  statIconSmall: { fontSize: '18px', marginBottom: '4px' },
  statValueSmall: { fontWeight: 'bold', color: 'white' },
  statLabelSmall: { color: 'rgba(255,255,255,0.6)' },
  tabs: { display: 'flex', gap: '6px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tab: { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '20px' },
  content: { background: 'rgba(255,255,255,0.03)', borderRadius: '16px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' },
  sectionTitle: { fontWeight: '600', color: 'white' },
  sectionDesc: { color: 'rgba(255,255,255,0.6)', marginBottom: '14px' },
  addButton: { background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  createTaskButton: { background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  searchInput: { padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'white', width: '100%', marginBottom: '14px' },
  tableContainer: { overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  tableHeaderRow: { borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'rgba(255,255,255,0.6)' },
  th: { padding: '10px 8px' },
  tableRow: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td: { padding: '10px 8px', color: 'white' },
  statusBadge: { padding: '2px 6px', borderRadius: '20px', fontWeight: '600', color: 'white', display: 'inline-block' },
  actionButtons: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  resetButton: { background: 'rgba(245,158,11,0.2)', border: '1px solid #f59e0b', borderRadius: '6px', padding: '4px 8px', color: '#f59e0b', cursor: 'pointer', fontSize: '12px' },
  deleteButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '6px', padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: '12px' },
  approveButton: { background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', borderRadius: '6px', padding: '4px 8px', color: '#10b981', cursor: 'pointer', fontSize: '12px' },
  rejectButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '6px', padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: '12px' },
  reportsGrid: { display: 'grid', gap: '15px', marginTop: '20px' },
  reportCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  reportButton: { marginTop: '12px', padding: '8px 16px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '12px' },
  settingsCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', marginBottom: '12px' },
  fileInput: { margin: '10px 0', padding: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', width: '100%', fontSize: '11px' },
  uploadButton: { padding: '6px 12px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  invoiceButton: { padding: '6px 12px', background: '#8b5cf6', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  viewButton: { padding: '6px 12px', background: '#3b82f6', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '24px', maxHeight: '85vh', overflowY: 'auto' },
  modalLarge: { background: '#1e293b', borderRadius: '16px', padding: '24px', maxHeight: '85vh', overflowY: 'auto' },
  confirmationModal: { background: '#1e293b', borderRadius: '16px', maxWidth: '400px', width: '90%', overflow: 'hidden' },
  confirmationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  confirmationTitle: { fontSize: '18px', fontWeight: '600', color: '#ef4444', margin: 0 },
  confirmationClose: { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' },
  confirmationBody: { padding: '20px' },
  confirmationMessage: { color: 'white', fontSize: '14px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' },
  confirmationFooter: { display: 'flex', gap: '12px', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  modalTitle: { fontWeight: '600', color: 'white', marginBottom: '20px' },
  subTitle: { fontWeight: '600', color: 'white', marginBottom: '12px', marginTop: '16px' },
  label: { color: 'rgba(255,255,255,0.8)', marginBottom: '6px', display: 'block' },
  input: { width: '100%', padding: '10px 12px', marginBottom: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 12px', marginBottom: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' },
  select: { width: '100%', padding: '10px 12px', marginBottom: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  formGroup: { marginBottom: '14px' },
  formRow: { display: 'grid', gap: '12px', marginBottom: '14px' },
  modalButtons: { display: 'flex', gap: '12px', marginTop: '20px' },
  cancelButton: { flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  submitButton: { flex: 1, padding: '10px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  confirmDeleteButton: { flex: 1, padding: '10px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  deleteAccountButton: { padding: '10px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', width: '100%', marginTop: '12px' },
  changeEmailButton: { padding: '10px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', width: '100%', marginBottom: '16px' },
  dangerZone: { marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  warningText: { fontSize: '11px', color: '#f87171', marginTop: '8px' },
  profileInfo: { background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '10px', marginBottom: '16px' },
  logoPreview: { width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', marginBottom: '10px' },
  welcomeCard: { background: 'rgba(0,209,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', marginTop: '12px' },
  welcomeTitle: { fontWeight: '600', color: 'white', marginBottom: '6px' },
  welcomeText: { color: 'rgba(255,255,255,0.7)' },
  quickActions: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' },
  quickActionBtn: { padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  branchTag: { display: 'inline-block', background: 'rgba(0,209,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', marginRight: '4px', marginBottom: '4px', color: '#00d1ff' },
  assignBranchButton: { background: 'rgba(59,130,246,0.2)', border: '1px solid #3b82f6', borderRadius: '6px', padding: '2px 8px', color: '#3b82f6', cursor: 'pointer', fontSize: '10px', marginTop: '4px' },
  branchListContainer: { maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' },
  branchCheckboxItem: { padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', color: 'white', cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  quickQuestionsContainer: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' },
  quickQuestionsHeader: { fontSize: '11px', color: '#00d1ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
  quickQuestionsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  quickQuestionButton: { background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.3)', borderRadius: '20px', padding: '6px 12px', color: '#00d1ff', fontSize: '10px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' },
  chatButton: { position: 'fixed', bottom: '20px', right: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', color: 'white', cursor: 'pointer', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chatModal: { position: 'fixed', bottom: '80px', right: '20px', width: '300px', height: '400px', background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1001 },
  chatHeader: { padding: '12px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'white' },
  chatClose: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' },
  chatMessages: { flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  chatMessage: { display: 'flex' },
  messageBubble: { maxWidth: '85%', padding: '8px 12px', borderRadius: '12px', color: 'white', lineHeight: '1.4', fontSize: '12px' },
  messageTime: { fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' },
  typingIndicator: { padding: '8px 12px', background: '#1e293b', borderRadius: '12px', width: '60px', fontSize: '11px' },
  chatInputContainer: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' },
  chatInput: { flex: 1, padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', outline: 'none', fontSize: '12px' },
  chatSend: { padding: '8px 12px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '12px' },
  };

export default SuperAdminDashboard;