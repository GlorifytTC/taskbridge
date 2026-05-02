import React, { useState, useEffect, useRef, useCallback } from 'react';

const SuperAdminDashboard = ({ user, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('taskbridge_activeTab') || 'dashboard';
  });
  const [previousTab, setPreviousTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
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
  const [hasRoomAccess, setHasRoomAccess] = useState(false);
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [showBranchAssignmentModal, setShowBranchAssignmentModal] = useState(false);
  const [selectedAdminForBranch, setSelectedAdminForBranch] = useState(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });
  const [reportData, setReportData] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);
  const [reportFilters, setReportFilters] = useState({
    branch: 'all',
    jobRole: 'all',
    employee: 'all',
    dateRange: 'month',
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [showReportFilters, setShowReportFilters] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    itemName: '',
    itemId: null,
    type: ''
  });
  const [subscriptionBlocked, setSubscriptionBlocked] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editAdminData, setEditAdminData] = useState({});
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editEmployeeData, setEditEmployeeData] = useState({});
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [editBranchData, setEditBranchData] = useState({});
  const [editingJobId, setEditingJobId] = useState(null);
  const [editJobData, setEditJobData] = useState({});
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskData, setEditTaskData] = useState({});

  // KEY FIX: Always store refs for ALL rows, not just editing ones
  const adminRowRefs = useRef({});
  const employeeRowRefs = useRef({});
  const branchRowRefs = useRef({});
  const jobRowRefs = useRef({});
  const taskRowRefs = useRef({});

  // Prevents modal from closing when user drags text selection out of modal
  const mouseDownInsideModal = useRef(false);

  // Use refs to track current editing IDs without stale closure issues
  const editingAdminIdRef = useRef(null);
  const editingEmployeeIdRef = useRef(null);
  const editingBranchIdRef = useRef(null);
  const editingJobIdRef = useRef(null);
  const editingTaskIdRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => { editingAdminIdRef.current = editingAdminId; }, [editingAdminId]);
  useEffect(() => { editingEmployeeIdRef.current = editingEmployeeId; }, [editingEmployeeId]);
  useEffect(() => { editingBranchIdRef.current = editingBranchId; }, [editingBranchId]);
  useEffect(() => { editingJobIdRef.current = editingJobId; }, [editingJobId]);
  useEffect(() => { editingTaskIdRef.current = editingTaskId; }, [editingTaskId]);

  const resetEditingStates = useCallback(() => {
    setEditingAdminId(null);
    setEditAdminData({});
    setEditingEmployeeId(null);
    setEditEmployeeData({});
    setEditingBranchId(null);
    setEditBranchData({});
    setEditingJobId(null);
    setEditJobData({});
    setEditingTaskId(null);
    setEditTaskData({});
  }, []);

  // Single stable mousedown handler using refs — never needs to be re-registered
  useEffect(() => {
    const handleClickOutside = (event) => {
      const id = editingAdminIdRef.current;
      if (id && adminRowRefs.current[id] && !adminRowRefs.current[id].contains(event.target)) {
        setEditingAdminId(null);
        setEditAdminData({});
      }

      const eid = editingEmployeeIdRef.current;
      if (eid && employeeRowRefs.current[eid] && !employeeRowRefs.current[eid].contains(event.target)) {
        setEditingEmployeeId(null);
        setEditEmployeeData({});
      }

      const bid = editingBranchIdRef.current;
      if (bid && branchRowRefs.current[bid] && !branchRowRefs.current[bid].contains(event.target)) {
        setEditingBranchId(null);
        setEditBranchData({});
      }

      const jid = editingJobIdRef.current;
      if (jid && jobRowRefs.current[jid] && !jobRowRefs.current[jid].contains(event.target)) {
        setEditingJobId(null);
        setEditJobData({});
      }

      const tid = editingTaskIdRef.current;
      if (tid && taskRowRefs.current[tid] && !taskRowRefs.current[tid].contains(event.target)) {
        setEditingTaskId(null);
        setEditTaskData({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchEmployeesForFilter = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/users?role=employee', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAvailableEmployees(data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const generateAttendanceReport = async () => {
    setGeneratingReport(true);
    try {
      const token = localStorage.getItem('token');
      let url = 'https://taskbridge-production-9d91.up.railway.app/api/reports/attendance?';
      if (reportFilters.branch !== 'all') url += `branch=${reportFilters.branch}&`;
      if (reportFilters.jobRole !== 'all') url += `jobRole=${reportFilters.jobRole}&`;
      if (reportFilters.employee !== 'all') url += `employee=${reportFilters.employee}&`;
      if (reportFilters.dateRange === 'custom') {
        url += `startDate=${reportFilters.startDate}&endDate=${reportFilters.endDate}&`;
      } else {
        url += `range=${reportFilters.dateRange}&`;
      }
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setReportData(data);
      showToast(lang.generateReport + ' ' + (language === 'en' ? 'generated!' : 'genererad!'), 'success');
    } catch (error) {
      console.error('Error generating report:', error);
      showToast(lang.generateReport + ' ' + (language === 'en' ? 'failed' : 'misslyckades'), 'error');
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportToPDF = () => {
    if (!reportData) { showToast(lang.generateReport + ' ' + (language === 'en' ? 'first' : 'först'), 'error'); return; }
    const printWindow = window.open('', '_blank');
    const reportDate = new Date().toLocaleString();
    printWindow.document.write(`<html><head><title>TaskBridge Report</title><style>body{font-family:Arial,sans-serif;padding:20px}h1{color:#00d1ff}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:10px}th{background:#00d1ff;color:white}@media print{.no-print{display:none}}</style></head><body><h1>TaskBridge Report</h1><p>Generated: ${reportDate}</p><pre>${JSON.stringify(reportData, null, 2)}</pre><div class="no-print"><button onclick="window.print()" style="padding:10px 20px;background:#00d1ff;color:white;border:none;border-radius:5px;cursor:pointer">Print</button></div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToExcel = () => {
    if (!reportData) { showToast(lang.generateReport + ' ' + (language === 'en' ? 'first' : 'först'), 'error'); return; }
    let csvContent = "Report Generated: " + new Date().toLocaleString() + "\n\n" + JSON.stringify(reportData, null, 2);
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `taskbridge_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(lang.exportExcel + ' ' + (language === 'en' ? 'exported!' : 'exporterad!'), 'success');
  };

  const checkRoomAccess = useCallback(() => {
    const plan = subscriptionData?.plan?.toLowerCase();
    const hasAccess = ['business', 'enterprise', 'corporate'].includes(plan);
    setHasRoomAccess(hasAccess);
    return hasAccess;
  }, [subscriptionData]);

  const fetchAuditLogsEnhanced = async () => {
    setLoadingAudit(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/audit-logs?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const sanitizedLogs = (data.data || []).map(log => {
          const sanitized = { ...log };
          if (sanitized.changes) {
            ['password', 'newPassword', 'currentPassword', 'oldPassword'].forEach(k => delete sanitized.changes[k]);
            delete sanitized.ipAddress;
            delete sanitized.userAgent;
          }
          return sanitized;
        });
        setAuditLogs(sanitizedLogs);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      const w = window.innerWidth;
      setScreenWidth(w);
      setIsMobile(w <= 768);
      setIsTablet(w > 768 && w <= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    fetchEmployeesForFilter();
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const canAddEmployee = () => {
    const { limit, current } = usageData.employees || {};
    return limit === Infinity || current < limit;
  };
  const canAddBranch = () => {
    const { limit, current } = usageData.branches || {};
    return limit === Infinity || current < limit;
  };
  const canAddAdmin = () => {
    const { limit, current } = usageData.admins || {};
    return limit === Infinity || current < limit;
  };

  const t = {
    en: {
      dashboard: 'Dashboard', admins: 'Admins', staff: 'Staff', branches: 'Branches',
      calendar: 'Calendar', roles: 'Roles', tasks: 'Tasks', requests: 'Requests',
      reports: 'Reports', settings: 'Settings', profile: 'Profile', logout: 'Logout',
      welcome: 'Welcome', subscriptionOverview: 'Subscription', daysRemaining: 'days remaining',
      usage: 'Usage', employees: 'Employees', adminsLabel: 'Admins', branchesLabel: 'Branches',
      contactSales: 'Contact Sales', manage: 'Manage', search: 'Search...',
      addAdmin: 'Add Admin', addStaff: 'Add Staff', addBranch: 'Add Branch',
      addRole: 'Add Role', createTask: 'Create Task', pendingRequests: 'Pending Requests',
      activeTasks: 'active tasks', noData: 'No data found', success: 'Success', error: 'Error',
      subscriptionExpired: 'Your subscription has expired. Please contact your administrator.',
      subscriptionPaused: 'Your subscription is paused. Please contact support.',
      generateReport: 'Generate Report', exportPDF: 'Export PDF', exportExcel: 'Export Excel',
      attendance: 'Attendance', hoursWorked: 'Hours Worked', selectDateRange: 'Select Date Range',
      startDate: 'Start Date', endDate: 'End Date', adminManagement: 'Admin Management',
      staffManagement: 'Staff Management', branchManagement: 'Branch Management',
      roleManagement: 'Role Management', taskManagement: 'Task Management',
      reportManagement: 'Report Management', settingsManagement: 'Settings Management',
      language: 'Language', swedish: 'Swedish', english: 'English', currentPlan: 'Current Plan',
      auditLogs: 'Audit Logs', confirmDelete: 'Confirm Delete', cancel: 'Cancel', delete: 'Delete',
      areYouSure: 'Are you sure?', viewAudit: 'View Audit Logs', close: 'Close',
      action: 'Action', entityType: 'Entity Type', user: 'User', timestamp: 'Timestamp',
      changes: 'Changes', limitWarning: 'You have reached the limit for this feature. Please upgrade your plan.',
      upgradeRequired: 'Upgrade Required', premiumFeatures: 'Premium Features',
      roomAssignmentDesc: 'Advanced room and shift assignment system. Automatically match groups to available rooms and workers based on skills, capacity, and availability.',
      accessRoomAssignment: 'Access Room Assignment',
      billing: 'Billing'
    },
    sv: {
      dashboard: 'Instrumentpanel', admins: 'Administratörer', staff: 'Personal',
      branches: 'Avdelningar', calendar: 'Kalender', roles: 'Roller', tasks: 'Uppgifter',
      requests: 'Förfrågningar', reports: 'Rapporter', settings: 'Inställningar',
      profile: 'Profil', logout: 'Logga ut', welcome: 'Välkommen',
      subscriptionOverview: 'Prenumeration', daysRemaining: 'dagar kvar', usage: 'Användning',
      employees: 'Anställda', adminsLabel: 'Administratörer', branchesLabel: 'Avdelningar',
      contactSales: 'Kontakta oss', manage: 'Hantera', search: 'Sök...',
      addAdmin: 'Lägg till administratör', addStaff: 'Lägg till personal',
      addBranch: 'Lägg till avdelning', addRole: 'Lägg till roll', createTask: 'Skapa uppgift',
      pendingRequests: 'Väntande förfrågningar', activeTasks: 'aktiva uppgifter',
      noData: 'Ingen data hittades', success: 'Klart', error: 'Fel',
      subscriptionExpired: 'Din prenumeration har löpt ut. Kontakta din administratör.',
      subscriptionPaused: 'Din prenumeration är pausad. Kontakta support.',
      generateReport: 'Generera rapport', exportPDF: 'Exportera PDF', exportExcel: 'Exportera Excel',
      attendance: 'Närvaro', hoursWorked: 'Arbetade timmar', selectDateRange: 'Välj datumintervall',
      startDate: 'Startdatum', endDate: 'Slutdatum', adminManagement: 'Administratörshantering',
      staffManagement: 'Personalhantering', branchManagement: 'Avdelningshantering',
      roleManagement: 'Rollhantering', taskManagement: 'Uppgiftshantering',
      reportManagement: 'Rapporthantering', settingsManagement: 'Inställningshantering',
      language: 'Språk', swedish: 'Svenska', english: 'Engelska', currentPlan: 'Nuvarande plan',
      auditLogs: 'Granskningsloggar', confirmDelete: 'Bekräfta radering', cancel: 'Avbryt',
      delete: 'Radera', areYouSure: 'Är du säker?', viewAudit: 'Visa granskningsloggar',
      close: 'Stäng', action: 'Åtgärd', entityType: 'Enhetstyp', user: 'Användare',
      timestamp: 'Tidpunkt', changes: 'Ändringar',
      limitWarning: 'Du har nått gränsen för denna funktion. Uppgradera din plan.',
      upgradeRequired: 'Uppgradering krävs', premiumFeatures: 'Premiumfunktioner',
      roomAssignmentDesc: 'Avancerat system för rums- och skifttilldelning.',
      accessRoomAssignment: 'Öppna Rumsplacering',
      billing: 'Fakturering'
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const allTasks = tasksData.data || [];
      const filteredTasks = allTasks.filter(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate >= today;
      });
      setAdmins(filteredAdmins);
      setEmployees(filteredEmployees);
      setBranches(branchesData.data || []);
      setTasks(filteredTasks);
      setApplications(appsData.data || []);
      setJobDescriptions(jobsData.data || []);
      setStats({
        totalAdmins: filteredAdmins.length,
        totalEmployees: filteredEmployees.length,
        totalTasks: filteredTasks.length,
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

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/subscriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSubscriptionData(data.data);
        if (data.data.usage) setUsageData(data.data.usage);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  useEffect(() => {
    if (subscriptionData) checkRoomAccess();
  }, [subscriptionData, checkRoomAccess]);

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
  }, [language]);

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
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ currentPassword: profileData.currentPassword, newPassword: profileData.newPassword })
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: changeEmailData.newEmail, password: changeEmailData.password })
      });
      if (response.ok) {
        showToast(language === 'en' ? 'Email changed! Please login again.' : 'E-post ändrad! Logga in igen.', 'success');
        setTimeout(() => { localStorage.removeItem('token'); onLogout(); }, 1500);
      } else {
        const data = await response.json();
        showToast(data.message || (language === 'en' ? 'Failed to change email' : 'Kunde inte ändra e-post'), 'error');
      }
    } catch (error) {
      showToast(language === 'en' ? 'Error changing email' : 'Fel vid e-poständring', 'error');
    }
  };
  
  // Check if subscription is active - BLOCK ACCESS IF EXPIRED
  const checkSubscriptionAccess = useCallback(() => {
    if (!subscriptionData) return true;
    
    const isExpired = subscriptionData.status === 'expired' || 
                      subscriptionData.status === 'paused' ||
                      (subscriptionData.endDate && new Date(subscriptionData.endDate) < new Date());
    const isActive = subscriptionData.status === 'active' || subscriptionData.status === 'trial';
    
    if (isExpired && !isActive) {
      setSubscriptionBlocked(true);
      return false;
    }
    setSubscriptionBlocked(false);
    return true;
  }, [subscriptionData]);

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/subscriptions/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setInvoices(data.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  // Change subscription plan
  const handleChangeSubscriptionPlan = async () => {
    if (!selectedPlan) {
      showToast('Please select a plan', 'error');
      return;
    }
    
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/subscriptions/plan', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedPlan,
          duration: selectedDuration
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(`Plan changed to ${selectedPlan.toUpperCase()}!`, 'success');
        setShowPaymentModal(false);
        setSelectedPlan(null);
        fetchSubscriptionData();
        fetchDashboardData(false);
      } else {
        showToast(data.message || 'Failed to change plan', 'error');
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      showToast('Error changing plan', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Cancel subscription at end of period
const handleCancelSubscription = async () => {
  if (!confirm('Are you sure you want to cancel your subscription? You will lose access after your billing period ends.')) return;
  
  try {
    const token = localStorage.getItem('token');
    const orgId = user?.organization?._id;
    
    if (!orgId) {
      showToast('Organization ID not found', 'error');
      return;
    }
    
    // ✅ Use the organization route, NOT subscription route
    const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${orgId}/cancel-subscription`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast(data.message || 'Subscription cancelled successfully', 'success');
      fetchSubscriptionData(); // Refresh subscription data
    } else {
      showToast(data.message || 'Failed to cancel subscription', 'error');
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    showToast('Error cancelling subscription', 'error');
  }
};
  // Calculate total with VAT (25%)
  const calculateTotalWithVAT = (plan, duration) => {
    const planPrices = {
      basic: 399, standard: 799, pro: 1299,
      business: 2499, enterprise: 4999, corporate: 9999
    };
    let total = (planPrices[plan] || 0) * duration;
    if (duration >= 3) total = total * 0.95;
    if (duration >= 6) total = total * 0.9;
    if (duration >= 12) total = total * 0.85;
    return Math.round(total);
  };

  const calculateVAT = (plan, duration) => {
    return Math.round(calculateTotalWithVAT(plan, duration) * 0.25);
  };
const handleChangePlan = async (plan, duration) => {
  try {
    const token = localStorage.getItem('token');
    const orgId = user?.organization?._id;
    
    console.log('Organization ID:', orgId);
    
    if (!orgId) {
      showToast('Organization ID not found', 'error');
      return;
    }
    
    // ✅ FIX: Include the orgId in the URL
    const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/subscriptions/${orgId}/plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan, duration })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast(`Plan changed to ${plan} successfully!`, 'success');
      fetchSubscriptionData();
      setShowPlanModal(false);
    } else {
      showToast(data.message || 'Failed to change plan', 'error');
    }
  } catch (error) {
    console.error('Error changing plan:', error);
    showToast('Error changing plan', 'error');
  }
};
  // Check subscription status periodically
  useEffect(() => {
    if (subscriptionData) {
      checkSubscriptionAccess();
    }
  }, [subscriptionData, checkSubscriptionAccess]);

  // Fetch invoices when needed
  useEffect(() => {
    if (activeTab === 'billing') {
      fetchInvoices();
    }
  }, [activeTab]);

  // Edit helpers
  const startEditAdmin = (admin) => {
    setEditingAdminId(admin._id);
    setEditAdminData({ name: admin.name, email: admin.email, isActive: admin.isActive });
  };
  const cancelEditAdmin = () => { setEditingAdminId(null); setEditAdminData({}); };
  const saveEditAdmin = async (adminId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${adminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editAdminData)
      });
      if (response.ok) {
        showToast(language === 'en' ? 'Admin updated!' : 'Administratör uppdaterad!', 'success');
        setEditingAdminId(null); setEditAdminData({}); fetchDashboardData(false);
      } else {
        const data = await response.json();
        showToast(data.message || 'Error updating admin', 'error');
      }
    } catch (error) { showToast('Error updating admin', 'error'); }
  };

  const startEditEmployee = (emp) => {
    setEditingEmployeeId(emp._id);
    setEditEmployeeData({ name: emp.name, email: emp.email, isActive: emp.isActive });
  };
  const cancelEditEmployee = () => { setEditingEmployeeId(null); setEditEmployeeData({}); };
  const saveEditEmployee = async (empId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${empId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editEmployeeData)
      });
      if (response.ok) {
        showToast(language === 'en' ? 'Employee updated!' : 'Anställd uppdaterad!', 'success');
        setEditingEmployeeId(null); setEditEmployeeData({}); fetchDashboardData(false);
      } else {
        const data = await response.json();
        showToast(data.message || 'Error updating employee', 'error');
      }
    } catch (error) { showToast('Error updating employee', 'error'); }
  };

  const startEditBranch = (branch) => {
    setEditingBranchId(branch._id);
    setEditBranchData({ name: branch.name, 'address.city': branch.address?.city || '' });
  };
  const cancelEditBranch = () => { setEditingBranchId(null); setEditBranchData({}); };
  const saveEditBranch = async (branchId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/branches/${branchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: editBranchData.name, address: { city: editBranchData['address.city'] } })
      });
      if (response.ok) {
        showToast(language === 'en' ? 'Branch updated!' : 'Avdelning uppdaterad!', 'success');
        setEditingBranchId(null); setEditBranchData({}); fetchDashboardData(false);
      } else {
        const data = await response.json();
        showToast(data.message || 'Error updating branch', 'error');
      }
    } catch (error) { showToast('Error updating branch', 'error'); }
  };

  const startEditJob = (job) => {
    setEditingJobId(job._id);
    setEditJobData({ name: job.name, description: job.description || '' });
  };
  const cancelEditJob = () => { setEditingJobId(null); setEditJobData({}); };
  const saveEditJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/job-descriptions/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editJobData)
      });
      if (response.ok) {
        showToast(language === 'en' ? 'Job role updated!' : 'Jobbroll uppdaterad!', 'success');
        setEditingJobId(null); setEditJobData({}); fetchDashboardData(false);
      } else {
        const data = await response.json();
        showToast(data.message || 'Error updating job role', 'error');
      }
    } catch (error) { showToast('Error updating job role', 'error'); }
  };

  const startEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditTaskData({
      title: task.title, description: task.description || '',
      date: task.date?.split('T')[0] || '', startTime: task.startTime,
      endTime: task.endTime, maxEmployees: task.maxEmployees,
      location: task.location || '', status: task.status
    });
  };
  const cancelEditTask = () => { setEditingTaskId(null); setEditTaskData({}); };
  const saveEditTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editTaskData)
      });
      if (response.ok) {
        showToast(language === 'en' ? 'Task updated!' : 'Uppgift uppdaterad!', 'success');
        setEditingTaskId(null); setEditTaskData({}); fetchDashboardData(false);
      } else {
        const data = await response.json();
        showToast(data.message || 'Error updating task', 'error');
      }
    } catch (error) { showToast('Error updating task', 'error'); }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!canAddAdmin()) { showToast(lang.limitWarning, 'error'); return; }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, role: 'admin', branch: formData.branch || null, assignedBranches: formData.branch ? [formData.branch] : [] })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(language === 'en' ? 'Admin created successfully!' : 'Administratör skapad!', 'success');
        setShowCreateAdminModal(false); setFormData({}); fetchDashboardData(true);
      } else { showToast(data.message || 'Failed to create admin', 'error'); }
    } catch (error) { showToast('Error creating admin', 'error'); }
  };

  const handleAssignBranch = async (branchId) => {
    if (!selectedAdminForBranch) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${selectedAdminForBranch._id}/assign-branch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ branchId })
      });
      const data = await response.json();
      if (response.ok) {
        const assignedBranch = branches.find(b => b._id === branchId);
        setSelectedAdminForBranch(prev => ({ ...prev, assignedBranches: [...(prev.assignedBranches || []), assignedBranch] }));
        setAdmins(prev => prev.map(a => a._id === selectedAdminForBranch._id ? { ...a, assignedBranches: [...(a.assignedBranches || []), assignedBranch] } : a));
        showToast(language === 'en' ? 'Branch assigned!' : 'Avdelning tilldelad!', 'success');
        fetchDashboardData(false);
      } else { showToast(data.message || 'Failed to assign branch', 'error'); }
    } catch (error) { showToast('Error assigning branch', 'error'); }
  };

  const handleRemoveBranch = async (branchId) => {
    if (!selectedAdminForBranch) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${selectedAdminForBranch._id}/remove-branch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ branchId })
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedAdminForBranch(prev => ({ ...prev, assignedBranches: (prev.assignedBranches || []).filter(b => b._id !== branchId) }));
        setAdmins(prev => prev.map(a => a._id === selectedAdminForBranch._id ? { ...a, assignedBranches: (a.assignedBranches || []).filter(b => b._id !== branchId) } : a));
        showToast(language === 'en' ? 'Branch removed!' : 'Avdelning borttagen!', 'success');
        fetchDashboardData(false);
      } else { showToast(data.message || 'Failed to remove branch', 'error'); }
    } catch (error) { showToast('Error removing branch', 'error'); }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!canAddEmployee()) { showToast(lang.limitWarning, 'error'); return; }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, role: 'employee', jobDescription: formData.jobDescription, branch: formData.branch || null })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(language === 'en' ? 'Employee created!' : 'Anställd skapad!', 'success');
        setShowCreateEmployeeModal(false); setFormData({}); fetchDashboardData(true);
      } else { showToast(data.message || 'Failed to create employee', 'error'); }
    } catch (error) { showToast('Error creating employee', 'error'); }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!canAddBranch()) { showToast(lang.limitWarning, 'error'); return; }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name, address: { city: formData.city || '', street: formData.street || '', postalCode: formData.postalCode || '', country: formData.country || 'Sweden' } })
      });
      if (response.ok) {
        showToast(language === 'en' ? 'Branch created!' : 'Avdelning skapad!', 'success');
        setShowCreateBranchModal(false); setFormData({}); fetchDashboardData(true);
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to create branch', 'error');
      }
    } catch (error) { showToast('Error creating branch', 'error'); }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/job-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name, description: formData.description || '' })
      });
      if (response.ok) {
        showToast(language === 'en' ? 'Job role created!' : 'Jobbroll skapad!', 'success');
        setShowCreateJobModal(false); setFormData({}); fetchDashboardData(true);
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to create job role', 'error');
      }
    } catch (error) { showToast('Error creating job role', 'error'); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: formData.title, description: formData.description || '', branch: formData.branch, jobDescription: formData.jobDescription, date: formData.date, startTime: formData.startTime, endTime: formData.endTime, maxEmployees: formData.maxEmployees || 1, location: formData.location || '', notes: formData.notes || '' })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(language === 'en' ? 'Task created!' : 'Uppgift skapad!', 'success');
        setShowCreateTaskModal(false); setFormData({}); fetchDashboardData(true);
      } else { showToast(data.message || 'Failed to create task', 'error'); }
    } catch (error) { showToast('Error creating task', 'error'); }
  };

  const handleResetUserPassword = async () => {
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      showToast(language === 'en' ? 'Passwords do not match' : 'Lösenorden matchar inte', 'error'); return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${selectedUser._id}/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password: resetPasswordData.newPassword })
      });
      if (response.ok) {
        showToast(language === 'en' ? `Password for ${selectedUser.name} reset!` : `Lösenord för ${selectedUser.name} återställt!`, 'success');
        setShowResetPasswordModal(false); setSelectedUser(null); setResetPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to reset password', 'error');
      }
    } catch (error) { showToast('Error resetting password', 'error'); }
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${adminId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { showToast(language === 'en' ? 'Admin deleted!' : 'Administratör borttagen!', 'success'); fetchDashboardData(true); }
      else { const data = await response.json(); showToast(data.message || 'Failed to delete admin', 'error'); }
    } catch (error) { showToast('Error deleting admin', 'error'); }
  };

  const handleDeleteEmployee = async (empId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${empId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (response.ok) { showToast(language === 'en' ? 'Employee deleted!' : 'Anställd borttagen!', 'success'); fetchDashboardData(true); }
      else { const data = await response.json(); showToast(data.message || 'Failed to delete employee', 'error'); }
    } catch (error) { showToast('Error deleting employee', 'error'); }
  };

  const handleDeleteBranch = async (branchId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/branches/${branchId}?force=true`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (response.ok) { showToast(language === 'en' ? 'Branch deleted!' : 'Avdelning borttagen!', 'success'); fetchDashboardData(true); }
      else { const data = await response.json(); showToast(data.message || 'Failed to delete branch', 'error'); }
    } catch (error) { showToast('Error deleting branch', 'error'); }
  };
  
  // Mount effect
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔄 SuperAdminDashboard mounted, token exists:', !!token);
    
    if (!token) {
      console.error('❌ No token in SuperAdminDashboard, redirecting to login');
      onLogout();
      return;
    }
    
    const timer = setTimeout(() => {
      fetchDashboardData(true);
      fetchSubscriptionData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleDeleteJob = async (jobId, jobName) => {
    const employeesWithJob = employees.filter(e => e.jobDescription?._id === jobId).length;
    if (employeesWithJob > 0) { showToast(language === 'en' ? `Cannot delete "${jobName}" - ${employeesWithJob} employee(s) have this role.` : `Kan inte radera "${jobName}" - ${employeesWithJob} anställd(a) har denna roll.`, 'error'); return; }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/job-descriptions/${jobId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { showToast(language === 'en' ? 'Job role deleted!' : 'Jobbroll borttagen!', 'success'); fetchDashboardData(true); }
      else { const data = await response.json(); showToast(data.message || 'Failed to delete job role', 'error'); }
    } catch (error) { showToast('Error deleting job role', 'error'); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/tasks/${taskId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { showToast(language === 'en' ? 'Task deleted!' : 'Uppgift borttagen!', 'success'); fetchDashboardData(true); }
      else { const data = await response.json(); showToast(data.message || 'Failed to delete task', 'error'); }
    } catch (error) { showToast('Error deleting task', 'error'); }
  };

  const handleApproveApplication = async (appId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/applications/${appId}/approve`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { showToast(language === 'en' ? 'Application approved!' : 'Ansökan godkänd!', 'success'); fetchDashboardData(true); fetchSubscriptionData(); }
      else { const data = await response.json(); showToast(data.message || 'Failed to approve', 'error'); }
    } catch (error) { showToast('Failed to approve', 'error'); }
  };

  const handleRejectApplication = async (appId) => {
    const reason = prompt(language === 'en' ? 'Reason for rejection:' : 'Anledning till avslag:');
    if (reason === null) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/applications/${appId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reason })
      });
      if (response.ok) { showToast(language === 'en' ? 'Application rejected!' : 'Ansökan avslagen!', 'success'); fetchDashboardData(true); }
      else { const data = await response.json(); showToast(data.message || 'Failed to reject', 'error'); }
    } catch (error) { showToast('Failed to reject', 'error'); }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if user has active subscription with remaining days
      if (subscriptionData && subscriptionData.daysRemaining > 0 && subscriptionData.status === 'active') {
        const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/schedule-deletion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 
            scheduledDate: subscriptionData.endDate,
            reason: 'User requested deletion at subscription end'
          })
        });
        
        const data = await response.json();
        if (response.ok) {
          showToast(`Account scheduled for deletion on ${new Date(subscriptionData.endDate).toLocaleDateString()}. You can cancel this request until then.`, 'info');
          setShowDeleteAccountModal(false);
        } else {
          showToast(data.message || 'Failed to schedule deletion', 'error');
        }
      } else {
        const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/account', { 
          method: 'DELETE', 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (response.ok) { 
          localStorage.removeItem('token'); 
          onLogout(); 
        } else { 
          const data = await response.json(); 
          showToast(data.message || 'Failed to delete account', 'error'); 
        }
      }
    } catch (error) { 
      showToast('Failed to delete account', 'error'); 
    }
  };

  const handleCancelDeletionRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/cancel-deletion', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        showToast('Deletion request cancelled. Your account will remain active.', 'success');
        fetchDashboardData(false);
      } else {
        showToast('Failed to cancel deletion request', 'error');
      }
    } catch (error) {
      showToast('Error cancelling deletion request', 'error');
    }
  };

  const handleLogout = () => { localStorage.removeItem('token'); if (onLogout) onLogout(); };

  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      resetEditingStates();
      setPreviousTab(activeTab);
      setActiveTab(tab);
      localStorage.setItem('taskbridge_activeTab', tab);
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
        response = language === 'en' ? "📋 **To create a new task:**\n\n1. Go to the **Tasks** tab\n2. Click **Create Task**\n3. Fill in the details\n4. Click **Create**" : "📋 **För att skapa en ny uppgift:**\n\n1. Gå till fliken **Uppgifter**\n2. Klicka på **Skapa uppgift**\n3. Fyll i detaljerna\n4. Klicka på **Skapa**";
      } else if (input.includes('add employee') || input.includes('new employee')) {
        response = language === 'en' ? "👥 **To add a new employee:**\n\n1. Go to the **Staff** tab\n2. Click **Add Staff**\n3. Enter details and click **Create**" : "👥 **För att lägga till en ny anställd:**\n\n1. Gå till fliken **Personal**\n2. Klicka på **Lägg till personal**\n3. Fyll i och klicka **Skapa**";
      } else if (input.includes('subscription') || input.includes('plan')) {
        response = language === 'en' ? `💰 **Current Plan:** ${subscriptionData?.plan?.toUpperCase() || 'TRIAL'}\n📅 **Days remaining:** ${subscriptionData?.daysRemaining || 0}` : `💰 **Nuvarande plan:** ${subscriptionData?.plan?.toUpperCase() || 'TRIAL'}\n📅 **Dagar kvar:** ${subscriptionData?.daysRemaining || 0}`;
      } else if (input.includes('branch') || input.includes('create branch') || input.includes('avdelning')) {
        response = language === 'en' ? "🏢 **To create a branch:**\n\n1. Go to the **Branches** tab\n2. Click **Add Branch**\n3. Enter branch name and city\n4. Click **Create**" : "🏢 **För att skapa en avdelning:**\n\n1. Gå till fliken **Avdelningar**\n2. Klicka på **Lägg till avdelning**\n3. Fyll i avdelningsnamn och stad\n4. Klicka på **Skapa**";
      } else if (input.includes('report') || input.includes('generate report') || input.includes('rapport')) {
        response = language === 'en' ? "📊 **To generate reports:**\n\n1. Go to the **Reports** tab\n2. Select your filters (branch, role, employee, date range)\n3. Click **Generate Report**\n4. Export as PDF or Excel if needed" : "📊 **För att generera rapporter:**\n\n1. Gå till fliken **Rapporter**\n2. Välj dina filter (avdelning, roll, anställd, datumintervall)\n3. Klicka på **Generera rapport**\n4. Exportera som PDF eller Excel vid behov";
      } else if (input.includes('reset password') || input.includes('lösenord')) {
        response = language === 'en' ? "🔑 **To reset a user's password:**\n\n1. Go to **Admins** or **Staff** tab\n2. Find the user\n3. Click the **🔑** button next to their name\n4. Enter and confirm the new password\n5. Click **Reset Password**" : "🔑 **För att återställa en användares lösenord:**\n\n1. Gå till fliken **Administratörer** eller **Personal**\n2. Hitta användaren\n3. Klicka på **🔑** knappen bredvid deras namn\n4. Ange och bekräfta det nya lösenordet\n5. Klicka på **Återställ lösenord**";
      } else if (input.includes('change plan') || input.includes('subscription plan') || input.includes('uppgradera')) {
        response = language === 'en' ? "💰 **To change subscription plan:**\n\n1. Click on the **Billing** tab\n2. View available plans (Basic to Corporate)\n3. Click **Upgrade to [Plan Name]**\n4. Select duration (1, 3, 6, or 12 months)\n5. Confirm payment" : "💰 **För att ändra prenumerationsplan:**\n\n1. Klicka på fliken **Fakturering**\n2. Visa tillgängliga planer (Basic till Corporate)\n3. Klicka på **Uppgradera till [Plan-namn]**\n4. Välj varaktighet (1, 3, 6 eller 12 månader)\n5. Bekräfta betalning";
      } else if (input.includes('cancel') || input.includes('avbryt')) {
        response = language === 'en' ? "❌ **To cancel subscription:**\n\n1. Go to the **Billing** tab\n2. Click **Cancel Subscription**\n3. Confirm cancellation\n4. You'll keep access until the end of your billing period" : "❌ **För att avbryta prenumeration:**\n\n1. Gå till fliken **Fakturering**\n2. Klicka på **Avbryt prenumeration**\n3. Bekräfta avbokning\n4. Du behåller åtkomst till slutet av faktureringsperioden";
      } else {
        response = language === 'en' ? "👋 **Hello! I'm your TaskBridge AI Assistant.**\n\nI can help you with:\n• Creating tasks\n• Adding employees\n• Managing branches\n• Generating reports\n• Resetting passwords\n• Changing subscription plans\n• Cancelling subscriptions\n\n**Try clicking one of the quick questions below!**" : "👋 **Hej! Jag är din TaskBridge AI-assistent.**\n\nJag kan hjälpa dig med:\n• Skapa uppgifter\n• Lägga till anställda\n• Hantera avdelningar\n• Generera rapporter\n• Återställa lösenord\n• Ändra prenumerationsplaner\n• Avbryta prenumerationer\n\n**Prova att klicka på en av snabbfrågorna nedan!**";
      }
      setChatMessages(prev => [...prev, { text: response, sender: 'ai', time: new Date().toLocaleTimeString() }]);
      setIsAiTyping(false);
    }, 800);
  };

  const handleOverlayMouseDown = (e) => {
    mouseDownInsideModal.current = e.target !== e.currentTarget;
  };

  const handleModalClose = (setter) => (e) => {
    if (e.target === e.currentTarget && !mouseDownInsideModal.current) {
      setter(false);
    }
    mouseDownInsideModal.current = false;
  };

  const confirmDelete = (type, id, name) => {
    const en = language === 'en';
    const messages = {
      admin: `${lang.areYouSure} ${en ? `Delete admin "${name}"?` : `Radera administratör "${name}"?`} ${en ? 'This cannot be undone.' : 'Detta går inte att ångra.'}`,
      employee: `${lang.areYouSure} ${en ? `Delete employee "${name}"?` : `Radera anställd "${name}"?`} ${en ? 'This cannot be undone.' : 'Detta går inte att ångra.'}`,
      branch: (() => { const ec = employees.filter(e => e.branch?._id === id).length; return `${lang.areYouSure} ${en ? `Delete branch "${name}"?` : `Radera avdelning "${name}"?`}\n\n${en ? `${ec} employees will be deleted!` : `${ec} anställda kommer att raderas!`}\n\n${en ? 'This cannot be undone.' : 'Detta går inte att ångra.'}`; })(),
      job: `${lang.areYouSure} ${en ? `Delete job role "${name}"?` : `Radera jobbroll "${name}"?`} ${en ? 'This cannot be undone.' : 'Detta går inte att ångra.'}`,
      task: `${lang.areYouSure} ${en ? `Delete task "${name}"?` : `Radera uppgift "${name}"?`} ${en ? 'This cannot be undone.' : 'Detta går inte att ångra.'}`
    };
    const handlers = { admin: handleDeleteAdmin, employee: handleDeleteEmployee, branch: handleDeleteBranch, job: handleDeleteJob, task: handleDeleteTask };
    setConfirmationModal({
      isOpen: true, title: lang.confirmDelete, message: messages[type],
      onConfirm: () => { handlers[type](id, name); setConfirmationModal(prev => ({ ...prev, isOpen: false })); },
      itemId: id, itemName: name, type
    });
  };

  if (subscriptionData?.status === 'expired' || subscriptionData?.status === 'paused') {
    return (
      <div style={styles.subscriptionBlockedContainer}>
        <div style={styles.subscriptionBlockedCard}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '64px', color: '#ef4444', marginBottom: '20px' }}></i>
          <h1 style={styles.subscriptionBlockedTitle}>{subscriptionData?.status === 'expired' ? lang.subscriptionExpired : lang.subscriptionPaused}</h1>
          <button onClick={handleLogout} style={styles.subscriptionBlockedButton}>Logout</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={styles.loadingContainer}><div style={styles.loadingSpinner}></div></div>;
  }

  const filteredEmployees = employees.filter(e => e.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={styles.container}>
      {toastMessage && (
        <div style={{ ...styles.toast, background: toastMessage.type === 'success' ? '#10b981' : toastMessage.type === 'info' ? '#3b82f6' : '#ef4444' }}>
          {toastMessage.message}
        </div>
      )}

      {confirmationModal.isOpen && (
        <div style={styles.modalOverlay} onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}>
          <div style={styles.confirmationModal} onClick={e => e.stopPropagation()}>
            <div style={styles.confirmationHeader}>
              <h3 style={styles.confirmationTitle}>{confirmationModal.title}</h3>
              <button onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))} style={styles.confirmationClose}>×</button>
            </div>
            <div style={styles.confirmationBody}>
              <p style={styles.confirmationMessage}>{confirmationModal.message}</p>
            </div>
            <div style={styles.confirmationFooter}>
              <button onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))} style={styles.cancelButton}>{lang.cancel}</button>
              <button onClick={confirmationModal.onConfirm} style={styles.confirmDeleteButton}>{lang.delete}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ ...styles.header, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center' }}>
        <div style={styles.logoSection}>
          {logoPreview ? <img src={logoPreview} alt="Logo" style={styles.orgLogo} /> : <div style={styles.logoPlaceholder}><i className="fas fa-building"></i></div>}
          <div>
            <div style={styles.titleRow}>
              <h1 style={{ ...styles.title, fontSize: isSmall ? '18px' : '22px' }}>Super Admin Dashboard</h1>
              <span style={{ ...styles.userNameBadge, fontSize: isSmall ? '10px' : '11px' }}><i className="fas fa-user-shield"></i> {user?.name}</span>
            </div>
            <p style={{ ...styles.subtitle, fontSize: isSmall ? '10px' : '11px' }}>Manage {user?.organization?.name || 'your organization'}</p>
          </div>
        </div>
        <div style={{ ...styles.headerButtons, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          <div style={styles.languageContainer}>
            <button onClick={() => setShowLanguageDropdown(!showLanguageDropdown)} style={{ ...styles.languageButton, fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 12px' }}>
              <i className="fas fa-globe"></i> {language === 'en' ? 'EN' : 'SV'}
            </button>
            {showLanguageDropdown && (
              <div style={styles.languageDropdown}>
                <button onClick={() => changeLanguage('en')} style={styles.languageOption}>🇬🇧 English</button>
                <button onClick={() => changeLanguage('sv')} style={styles.languageOption}>🇸🇪 Svenska</button>
              </div>
            )}
          </div>
          <button onClick={() => setShowProfileModal(true)} style={{ ...styles.profileButton, fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 12px' : '6px 14px' }}>{lang.profile}</button>
          <button onClick={handleLogout} style={{ ...styles.logoutButton, fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 12px' : '6px 14px' }}>{lang.logout}</button>
        </div>
      </div>

      <div style={{ ...styles.statsGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : (isTablet ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(100px, 1fr))') }}>
        {[
          { icon: 'fa-user-tie', value: stats.totalAdmins, label: lang.adminsLabel },
          { icon: 'fa-users', value: stats.totalEmployees, label: lang.employees },
          { icon: 'fa-tasks', value: stats.totalTasks, label: lang.tasks },
          { icon: 'fa-store', value: stats.totalBranches, label: lang.branchesLabel },
          { icon: 'fa-briefcase', value: stats.totalJobDescriptions, label: lang.roles },
          { icon: 'fa-clock', value: stats.pendingApplications, label: lang.pendingRequests },
        ].map((s, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statIconSmall}><i className={`fas ${s.icon}`} style={{ color: '#00d1ff' }}></i></div>
            <div style={{ ...styles.statValueSmall, fontSize: isSmall ? '18px' : '20px' }}>{s.value}</div>
            <div style={{ ...styles.statLabelSmall, fontSize: isSmall ? '9px' : '10px' }}>{s.label}</div>
          </div>
        ))}
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
              {[
                { label: lang.employees, data: usageData.employees },
                { label: lang.branchesLabel, data: usageData.branches },
                { label: lang.adminsLabel, data: usageData.admins },
              ].map((u, i) => (
                <div key={i} style={styles.usageItem}>
                  <div style={styles.usageHeader}>
                    <span>{u.label}</span>
                    <span>{u.data?.current || 0}/{u.data?.limit === Infinity ? '∞' : u.data?.limit || 0}</span>
                    {u.data?.percentage > 90 && u.data?.limit !== Infinity && <span style={{ color: '#ef4444', fontSize: '10px' }}>⚠️ Near limit</span>}
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${Math.min(u.data?.percentage || 0, 100)}%`, background: u.data?.percentage > 90 ? '#ef4444' : '#10b981' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ ...styles.tabs, overflowX: isMobile ? 'auto' : 'visible', flexWrap: isMobile ? 'nowrap' : 'wrap', paddingBottom: isMobile ? '8px' : '10px' }}>
        {[
          { key: 'dashboard', label: lang.dashboard },
          { key: 'admins', label: lang.admins },
          { key: 'employees', label: lang.staff },
          { key: 'branches', label: lang.branches },
          { key: 'calendar', label: lang.calendar, navigate: true },
          { key: 'jobs', label: lang.roles },
          { key: 'tasks', label: lang.tasks },
          { key: 'applications', label: lang.requests },
          { key: 'reports', label: lang.reports },
          { key: 'settings', label: lang.settings },
          { key: 'billing', label: lang.billing },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => tab.navigate ? onNavigate('calendar') : handleTabChange(tab.key)}
            style={{ ...styles.tab, background: activeTab === tab.key ? '#00d1ff' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px', minHeight: '44px' }}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => handleTabChange('premium')}
          style={{ ...styles.tab, background: activeTab === 'premium' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'transparent', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 14px', border: activeTab !== 'premium' ? '1px solid rgba(245,158,11,0.3)' : 'none', minHeight: '44px' }}
        >
          ⭐ Premium
        </button>
      </div>

      <div style={{ ...styles.content, padding: isSmall ? '12px' : '16px' }}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px' }}>{lang.welcome}, {user?.name}!</h2>
            <div style={styles.welcomeCard}>
              <i className="fas fa-chart-line" style={{ fontSize: isSmall ? '24px' : '32px', color: '#00d1ff', marginBottom: '12px' }}></i>
              <h3 style={{ ...styles.welcomeTitle, fontSize: isSmall ? '13px' : '14px' }}>{lang.subscriptionOverview}</h3>
              <p style={{ ...styles.welcomeText, fontSize: isSmall ? '11px' : '12px' }}><strong>{stats.pendingApplications}</strong> {lang.pendingRequests} | <strong>{stats.totalTasks}</strong> {lang.activeTasks}</p>
              <div style={{ ...styles.quickActions, flexDirection: isSmall ? 'column' : 'row' }}>
                <button onClick={() => handleTabChange('tasks')} style={{ ...styles.quickActionBtn, minHeight: '44px', padding: '12px 20px' }}>+ {lang.createTask}</button>
                <button onClick={() => setShowCreateEmployeeModal(true)} style={{ ...styles.quickActionBtn, minHeight: '44px', padding: '12px 20px' }}>+ {lang.addStaff}</button>
                <button onClick={() => handleTabChange('applications')} style={{ ...styles.quickActionBtn, minHeight: '44px', padding: '12px 20px' }}>{lang.manage}</button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div style={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <h2 style={styles.modalTitle}>Cancel Subscription</h2>
              <p style={{ color: 'white', marginBottom: '16px' }}>
                Are you sure you want to cancel your subscription?
              </p>
              <p style={{ color: '#f59e0b', marginBottom: '16px', fontSize: '14px' }}>
                ⚠️ You will continue to have access until {subscriptionData?.endDate ? new Date(subscriptionData.endDate).toLocaleDateString() : 'the end of your billing period'}
              </p>
              <div style={styles.modalButtons}>
                <button onClick={() => setShowCancelModal(false)} style={styles.cancelButton}>
                  Keep Subscription
                </button>
                <button onClick={handleCancelSubscription} style={styles.confirmDeleteButton}>
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admins Table */}
        {activeTab === 'admins' && (
          <div>
            <div style={{ ...styles.sectionHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center' }}>
              <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px' }}>{lang.adminManagement}</h2>
              <button onClick={() => { if (!canAddAdmin()) { showToast(lang.limitWarning, 'error'); } else { setShowCreateAdminModal(true); } }}
                style={{ ...styles.addButton, width: isSmall ? '100%' : 'auto', opacity: !canAddAdmin() ? 0.5 : 1, minHeight: '44px', padding: '12px 20px', fontSize: '14px' }}>
                + {lang.addAdmin}
              </button>
            </div>
            <div style={styles.tableContainer}>
              <table style={{ ...styles.table, minWidth: isSmall ? '500px' : '600px' }}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Name</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Email</th>
                    {!isSmall && <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Branches</th>}
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Status</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr
                      key={admin._id}
                      ref={el => { adminRowRefs.current[admin._id] = el; }}
                      style={styles.tableRow}
                    >
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>
                        {editingAdminId === admin._id
                          ? <input type="text" value={editAdminData.name ?? admin.name} onChange={e => setEditAdminData(p => ({ ...p, name: e.target.value }))} style={styles.inlineInput} autoFocus />
                          : admin.name}
                      </td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>
                        {editingAdminId === admin._id
                          ? <input type="email" value={editAdminData.email ?? admin.email} onChange={e => setEditAdminData(p => ({ ...p, email: e.target.value }))} style={styles.inlineInput} />
                          : (isSmall ? admin.email?.substring(0, 15) + (admin.email?.length > 15 ? '...' : '') : admin.email)}
                      </td>
                      {!isSmall && (
                        <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>
                          {(admin.assignedBranches || []).slice(0, 2).map(b => <span key={b._id} style={styles.branchTag}>{b.name}</span>)}
                          {(admin.assignedBranches || []).length > 2 && <span>+{(admin.assignedBranches || []).length - 2}</span>}
                          <button onClick={() => { setSelectedAdminForBranch(admin); setShowBranchAssignmentModal(true); }} style={{ ...styles.assignBranchButton, minHeight: '32px' }}>{lang.manage}</button>
                        </td>
                      )}
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px' }}>
                        {editingAdminId === admin._id
                          ? <select value={String(editAdminData.isActive ?? admin.isActive)} onChange={e => setEditAdminData(p => ({ ...p, isActive: e.target.value === 'true' }))} style={styles.inlineSelect}>
                            <option value="true">Active</option><option value="false">Inactive</option>
                          </select>
                          : <span style={{ ...styles.statusBadge, background: admin.isActive ? '#10b981' : '#ef4444', fontSize: isSmall ? '8px' : '9px' }}>{admin.isActive ? 'Active' : 'Inactive'}</span>}
                      </td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px' }}>
                        {editingAdminId === admin._id
                          ? <div style={styles.actionButtons}>
                            <button type="button" onClick={() => saveEditAdmin(admin._id)} style={{ ...styles.saveButton, minHeight: '36px' }}>💾</button>
                            <button type="button" onClick={cancelEditAdmin} style={{ ...styles.cancelBtnSmall, minHeight: '36px' }}>✕</button>
                          </div>
                          : <div style={styles.actionButtons}>
                            <button onClick={() => startEditAdmin(admin)} style={{ ...styles.editButton, minHeight: '36px' }}>✏️</button>
                            <button onClick={() => { setSelectedUser(admin); setShowResetPasswordModal(true); }} style={{ ...styles.resetButton, minHeight: '36px' }}>🔑</button>
                            <button onClick={() => confirmDelete('admin', admin._id, admin.name)} style={{ ...styles.deleteButton, minHeight: '36px' }}>🗑️</button>
                          </div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employees Table */}
        {activeTab === 'employees' && (
          <div>
            <div style={{ ...styles.sectionHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center' }}>
              <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px' }}>{lang.staffManagement}</h2>
              <button onClick={() => { if (!canAddEmployee()) { showToast(lang.limitWarning, 'error'); } else { setShowCreateEmployeeModal(true); } }}
                style={{ ...styles.addButton, width: isSmall ? '100%' : 'auto', opacity: !canAddEmployee() ? 0.5 : 1, minHeight: '44px', padding: '12px 20px', fontSize: '14px' }}>
                + {lang.addStaff}
              </button>
            </div>
            <input type="text" placeholder={lang.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...styles.searchInput, fontSize: isSmall ? '11px' : '12px', minHeight: '44px' }} />
            <div style={styles.tableContainer}>
              <table style={{ ...styles.table, minWidth: isSmall ? '500px' : '600px' }}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Name</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Email</th>
                    {!isSmall && <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Job Role</th>}
                    {!isSmall && <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Branch</th>}
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Status</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr
                      key={emp._id}
                      ref={el => { employeeRowRefs.current[emp._id] = el; }}
                      style={styles.tableRow}
                    >
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>
                        {editingEmployeeId === emp._id
                          ? <input type="text" value={editEmployeeData.name ?? emp.name} onChange={e => setEditEmployeeData(p => ({ ...p, name: e.target.value }))} style={styles.inlineInput} autoFocus />
                          : emp.name}
                      </td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>
                        {editingEmployeeId === emp._id
                          ? <input type="email" value={editEmployeeData.email ?? emp.email} onChange={e => setEditEmployeeData(p => ({ ...p, email: e.target.value }))} style={styles.inlineInput} />
                          : (isSmall ? emp.email?.substring(0, 15) + (emp.email?.length > 15 ? '...' : '') : emp.email)}
                      </td>
                      {!isSmall && <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{emp.jobDescription?.name || '-'}</td>}
                      {!isSmall && <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{emp.branch?.name || '-'}</td>}
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px' }}>
                        {editingEmployeeId === emp._id
                          ? <select value={String(editEmployeeData.isActive ?? emp.isActive)} onChange={e => setEditEmployeeData(p => ({ ...p, isActive: e.target.value === 'true' }))} style={styles.inlineSelect}>
                            <option value="true">Active</option><option value="false">Inactive</option>
                          </select>
                          : <span style={{ ...styles.statusBadge, background: emp.isActive ? '#10b981' : '#ef4444', fontSize: isSmall ? '8px' : '9px' }}>{emp.isActive ? 'Active' : 'Inactive'}</span>}
                      </td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px' }}>
                        {editingEmployeeId === emp._id
                          ? <div style={styles.actionButtons}>
                            <button type="button" onClick={() => saveEditEmployee(emp._id)} style={{ ...styles.saveButton, minHeight: '36px' }}>💾</button>
                            <button type="button" onClick={cancelEditEmployee} style={{ ...styles.cancelBtnSmall, minHeight: '36px' }}>✕</button>
                          </div>
                          : <div style={styles.actionButtons}>
                            <button onClick={() => startEditEmployee(emp)} style={{ ...styles.editButton, minHeight: '36px' }}>✏️</button>
                            <button onClick={() => { setSelectedUser(emp); setShowResetPasswordModal(true); }} style={{ ...styles.resetButton, minHeight: '36px' }}>🔑</button>
                            <button onClick={() => confirmDelete('employee', emp._id, emp.name)} style={{ ...styles.deleteButton, minHeight: '36px' }}>🗑️</button>
                          </div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Branches Table */}
        {activeTab === 'branches' && (
          <div>
            <div style={{ ...styles.sectionHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center' }}>
              <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px' }}>{lang.branchManagement}</h2>
              <button onClick={() => { if (!canAddBranch()) { showToast(lang.limitWarning, 'error'); } else { setShowCreateBranchModal(true); } }}
                style={{ ...styles.addButton, width: isSmall ? '100%' : 'auto', opacity: !canAddBranch() ? 0.5 : 1, minHeight: '44px', padding: '12px 20px', fontSize: '14px' }}>
                + {lang.addBranch}
              </button>
            </div>
            <div style={styles.tableContainer}>
              <table style={{ ...styles.table, minWidth: isSmall ? '400px' : '600px' }}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Name</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>City</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Staff</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Admins</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map(branch => (
                    <tr
                      key={branch._id}
                      ref={el => { branchRowRefs.current[branch._id] = el; }}
                      style={styles.tableRow}
                    >
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>
                        {editingBranchId === branch._id
                          ? <input type="text" value={editBranchData.name ?? branch.name} onChange={e => setEditBranchData(p => ({ ...p, name: e.target.value }))} style={styles.inlineInput} autoFocus />
                          : branch.name}
                      </td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>
                        {editingBranchId === branch._id
                          ? <input type="text" value={editBranchData['address.city'] ?? branch.address?.city ?? ''} onChange={e => setEditBranchData(p => ({ ...p, 'address.city': e.target.value }))} style={styles.inlineInput} />
                          : (branch.address?.city || '-')}
                      </td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{employees.filter(e => e.branch?._id === branch._id).length}</td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{admins.filter(a => a.assignedBranches?.some(b => b._id === branch._id)).length}</td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px' }}>
                        {editingBranchId === branch._id
                          ? <div style={styles.actionButtons}>
                            <button type="button" onClick={() => saveEditBranch(branch._id)} style={{ ...styles.saveButton, minHeight: '36px' }}>💾</button>
                            <button type="button" onClick={cancelEditBranch} style={{ ...styles.cancelBtnSmall, minHeight: '36px' }}>✕</button>
                          </div>
                          : <div style={styles.actionButtons}>
                            <button onClick={() => startEditBranch(branch)} style={{ ...styles.editButton, minHeight: '36px' }}>✏️</button>
                            <button onClick={() => confirmDelete('branch', branch._id, branch.name)} style={{ ...styles.deleteButton, minHeight: '36px' }}>🗑️</button>
                          </div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Jobs Table */}
        {activeTab === 'jobs' && (
          <div>
            <div style={{ ...styles.sectionHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center' }}>
              <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px' }}>{lang.roleManagement}</h2>
              <button onClick={() => setShowCreateJobModal(true)} style={{ ...styles.addButton, width: isSmall ? '100%' : 'auto', minHeight: '44px', padding: '12px 20px', fontSize: '14px' }}>+ {lang.addRole}</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={{ ...styles.table, minWidth: isSmall ? '400px' : '600px' }}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Role</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Description</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Staff</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobDescriptions.map(job => (
                    <tr
                      key={job._id}
                      ref={el => { jobRowRefs.current[job._id] = el; }}
                      style={styles.tableRow}
                    >
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>
                        {editingJobId === job._id
                          ? <input type="text" value={editJobData.name ?? job.name} onChange={e => setEditJobData(p => ({ ...p, name: e.target.value }))} style={styles.inlineInput} autoFocus />
                          : job.name}
                      </td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>
                        {editingJobId === job._id
                          ? <textarea value={editJobData.description ?? job.description ?? ''} onChange={e => setEditJobData(p => ({ ...p, description: e.target.value }))} style={styles.inlineTextarea} rows="1" />
                          : (job.description || '-')}
                      </td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{employees.filter(e => e.jobDescription?._id === job._id).length}</td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px' }}>
                        {editingJobId === job._id
                          ? <div style={styles.actionButtons}>
                            <button type="button" onClick={() => saveEditJob(job._id)} style={{ ...styles.saveButton, minHeight: '36px' }}>💾</button>
                            <button type="button" onClick={cancelEditJob} style={{ ...styles.cancelBtnSmall, minHeight: '36px' }}>✕</button>
                          </div>
                          : <div style={styles.actionButtons}>
                            <button onClick={() => startEditJob(job)} style={{ ...styles.editButton, minHeight: '36px' }}>✏️</button>
                            <button onClick={() => confirmDelete('job', job._id, job.name)} style={{ ...styles.deleteButton, minHeight: '36px' }}>🗑️</button>
                          </div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tasks Table */}
        {activeTab === 'tasks' && (
          <div>
            <div style={{ ...styles.sectionHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center' }}>
              <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px' }}>{lang.taskManagement}</h2>
              <button onClick={() => setShowCreateTaskModal(true)} style={{ ...styles.addButton, width: isSmall ? '100%' : 'auto', minHeight: '44px', padding: '12px 20px', fontSize: '14px' }}>+ {lang.createTask}</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={{ ...styles.table, minWidth: isSmall ? '600px' : '800px' }}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Title</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Date</th>
                    {!isSmall && <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Time</th>}
                    {!isSmall && <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Role</th>}
                    {!isSmall && <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Branch</th>}
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Status</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr
                      key={task._id}
                      ref={el => { taskRowRefs.current[task._id] = el; }}
                      style={styles.tableRow}
                    >
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>
                        {editingTaskId === task._id
                          ? <input type="text" value={editTaskData.title ?? task.title} onChange={e => setEditTaskData(p => ({ ...p, title: e.target.value }))} style={styles.inlineInput} autoFocus />
                          : (isSmall ? task.title?.substring(0, 15) + (task.title?.length > 15 ? '...' : '') : task.title)}
                      </td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>
                        {editingTaskId === task._id
                          ? <input type="date" value={editTaskData.date ?? task.date?.split('T')[0]} onChange={e => setEditTaskData(p => ({ ...p, date: e.target.value }))} style={styles.inlineInput} />
                          : new Date(task.date).toLocaleDateString()}
                      </td>
                      {!isSmall && <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{task.startTime} - {task.endTime}</td>}
                      {!isSmall && <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{task.jobDescription?.name || '-'}</td>}
                      {!isSmall && <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{task.branch?.name || '-'}</td>}
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px' }}>
                        {editingTaskId === task._id
                          ? <select value={editTaskData.status ?? task.status} onChange={e => setEditTaskData(p => ({ ...p, status: e.target.value }))} style={styles.inlineSelect}>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                            <option value="in-progress">In Progress</option>
                          </select>
                          : <span style={{ ...styles.statusBadge, background: task.status === 'open' ? '#10b981' : '#f59e0b', fontSize: isSmall ? '8px' : '9px' }}>{task.status}</span>}
                      </td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px' }}>
                        {editingTaskId === task._id
                          ? <div style={styles.actionButtons}>
                            <button type="button" onClick={() => saveEditTask(task._id)} style={{ ...styles.saveButton, minHeight: '36px' }}>💾</button>
                            <button type="button" onClick={cancelEditTask} style={{ ...styles.cancelBtnSmall, minHeight: '36px' }}>✕</button>
                          </div>
                          : <div style={styles.actionButtons}>
                            <button onClick={() => startEditTask(task)} style={{ ...styles.editButton, minHeight: '36px' }}>✏️</button>
                            <button onClick={() => confirmDelete('task', task._id, task.title)} style={{ ...styles.deleteButton, minHeight: '36px' }}>🗑️</button>
                          </div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px' }}>All Applications</h2>
            <div style={styles.tableContainer}>
              <table style={{ ...styles.table, minWidth: isSmall ? '600px' : '800px' }}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Employee</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Task</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Date</th>
                    {!isSmall && <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Time</th>}
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Status</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Applied</th>
                    <th style={{ ...styles.th, fontSize: isSmall ? '10px' : '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id} style={styles.tableRow}>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{app.employee?.name}</td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{isSmall ? app.task?.title?.substring(0, 15) + (app.task?.title?.length > 15 ? '...' : '') : app.task?.title}</td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{app.task?.date ? new Date(app.task.date).toLocaleDateString() : '-'}</td>
                      {!isSmall && <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{app.task?.startTime} - {app.task?.endTime}</td>}
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px' }}>
                        <span style={{ ...styles.statusBadge, background: app.status === 'approved' ? '#10b981' : app.status === 'rejected' ? '#ef4444' : '#f59e0b', fontSize: isSmall ? '8px' : '9px' }}>{app.status}</span>
                      </td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px', color: 'white' }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td style={{ ...styles.td, fontSize: isSmall ? '11px' : '12px' }}>
                        {app.status === 'pending' && (
                          <div style={styles.actionButtons}>
                            <button onClick={() => handleApproveApplication(app._id)} style={{ ...styles.approveButton, minHeight: '36px' }}>✓</button>
                            <button onClick={() => handleRejectApplication(app._id)} style={{ ...styles.rejectButton, minHeight: '36px' }}>✗</button>
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

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px' }}>{lang.reportManagement}</h2>
            <div style={styles.reportFiltersCard}>
              <div style={styles.reportFiltersHeader}>
                <h3 style={{ color: 'white', fontSize: '14px', margin: 0 }}><i className="fas fa-filter"></i> {language === 'en' ? 'Report Filters' : 'Rapportfilter'}</h3>
                <button onClick={() => setShowReportFilters(!showReportFilters)} style={{ ...styles.filterToggleButton, minHeight: '44px' }}>{showReportFilters ? '▲' : '▼'}</button>
              </div>
              {showReportFilters && (
                <div style={styles.reportFiltersBody}>
                  <div style={styles.filterRow}>
                    {[
                      { label: lang.branches, key: 'branch', options: branches.map(b => ({ value: b._id, label: b.name })), allLabel: language === 'en' ? 'All Branches' : 'Alla Avdelningar' },
                      { label: lang.roles, key: 'jobRole', options: jobDescriptions.map(j => ({ value: j._id, label: j.name })), allLabel: language === 'en' ? 'All Roles' : 'Alla Roller' },
                      { label: lang.employees, key: 'employee', options: availableEmployees.map(e => ({ value: e._id, label: e.name })), allLabel: language === 'en' ? 'All Employees' : 'Alla Anställda' },
                    ].map(f => (
                      <div key={f.key} style={styles.filterGroup}>
                        <label style={styles.filterLabel}>{f.label}:</label>
                        <select value={reportFilters[f.key]} onChange={e => setReportFilters(p => ({ ...p, [f.key]: e.target.value }))} style={styles.filterSelect}>
                          <option value="all">{f.allLabel}</option>
                          {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    ))}
                    <div style={styles.filterGroup}>
                      <label style={styles.filterLabel}>{language === 'en' ? 'Date Range' : 'Datumintervall'}:</label>
                      <select value={reportFilters.dateRange} onChange={e => setReportFilters(p => ({ ...p, dateRange: e.target.value }))} style={styles.filterSelect}>
                        {['today', 'week', 'month', 'quarter', 'year', 'custom'].map(v => (
                          <option key={v} value={v}>{language === 'en' ? v.charAt(0).toUpperCase() + v.slice(1) : v}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {reportFilters.dateRange === 'custom' && (
                    <div style={styles.customDateRange}>
                      <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>{lang.startDate}:</label>
                        <input type="date" value={reportFilters.startDate} onChange={e => setReportFilters(p => ({ ...p, startDate: e.target.value }))} style={styles.filterInput} />
                      </div>
                      <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>{lang.endDate}:</label>
                        <input type="date" value={reportFilters.endDate} onChange={e => setReportFilters(p => ({ ...p, endDate: e.target.value }))} style={styles.filterInput} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ ...styles.reportsGrid, gridTemplateColumns: isSmall ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))') }}>
              {[
                { icon: 'fa-chart-bar', title: lang.attendance, desc: language === 'en' ? 'Employee attendance summary' : 'Sammanfattning av närvaro', action: generateAttendanceReport, label: lang.generateReport, disabled: generatingReport },
                { icon: 'fa-clock', title: lang.hoursWorked, desc: language === 'en' ? 'Total hours worked summary' : 'Sammanfattning av arbetade timmar', action: generateAttendanceReport, label: lang.generateReport, disabled: false },
                { icon: 'fa-file-pdf', title: lang.exportPDF, desc: language === 'en' ? 'Export report as PDF' : 'Exportera rapport som PDF', action: exportToPDF, label: lang.exportPDF, disabled: false },
                { icon: 'fa-file-excel', title: lang.exportExcel, desc: language === 'en' ? 'Export report as CSV' : 'Exportera rapport som CSV', action: exportToExcel, label: lang.exportExcel, disabled: false },
              ].map((card, i) => (
                <div key={i} style={styles.reportCard}>
                  <i className={`fas ${card.icon}`} style={{ color: '#00d1ff', fontSize: isSmall ? '28px' : '32px', marginBottom: '12px' }}></i>
                  <h3 style={{ color: 'white', fontSize: isSmall ? '14px' : '16px', marginBottom: '8px' }}>{card.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '12px' }}>{card.desc}</p>
                  <button onClick={card.action} disabled={card.disabled} style={{ ...styles.reportButton, opacity: card.disabled ? 0.7 : 1, minHeight: '44px' }}>{card.label}</button>
                </div>
              ))}
            </div>
            {reportData && (
              <div style={styles.reportPreview}>
                <div style={styles.reportPreviewHeader}>
                  <h3 style={{ color: 'white', margin: 0 }}><i className="fas fa-chart-line"></i> {language === 'en' ? 'Report Preview' : 'Förhandsgranskning'}</h3>
                  <button onClick={() => setReportData(null)} style={{ ...styles.clearReportButton, minHeight: '36px' }}>✕</button>
                </div>
                <div style={styles.reportPreviewContent}>
                  <pre style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{JSON.stringify(reportData, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px' }}>{lang.settingsManagement}</h2>
            <div style={styles.settingsCard}>
              <h3 style={{ color: 'white', fontSize: isSmall ? '14px' : '16px' }}>Organization Logo</h3>
              {logoPreview && <img src={logoPreview} alt="Logo" style={{ ...styles.logoPreview, width: isSmall ? '50px' : '60px', height: isSmall ? '50px' : '60px' }} />}
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ ...styles.fileInput, minHeight: '44px' }} />
            </div>
            <div style={styles.settingsCard}>
              <h3 style={{ color: 'white', fontSize: isSmall ? '14px' : '16px' }}>Subscription</h3>
              <p style={{ color: 'white', fontSize: isSmall ? '13px' : '14px' }}>{lang.currentPlan}: {subscriptionData?.plan || 'Trial'}</p>
              <a href="mailto:georgeglor@hotmail.com" style={{ ...styles.contactSalesButton, display: 'inline-block', marginRight: '8px', minHeight: '44px', lineHeight: '44px' }}>{lang.contactSales}</a>
            </div>
            <div style={styles.settingsCard}>
              <h3 style={{ color: 'white', fontSize: isSmall ? '14px' : '16px' }}>{lang.auditLogs}</h3>
              <button onClick={() => { fetchAuditLogsEnhanced(); setShowAuditModal(true); }} style={{ ...styles.viewButton, minHeight: '44px', padding: '12px 20px' }}>
                <i className="fas fa-history"></i> {lang.viewAudit}
              </button>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div>
            <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>
              💳 Billing & Subscription
            </h2>
            
            {/* Current Subscription Card */}
            <div style={styles.currentSubscriptionCard}>
              <h3 style={styles.cardTitle}>Current Plan</h3>
              <div style={styles.currentPlanInfo}>
                <div>
                  <span style={styles.planNameBadge}>
                    {subscriptionData?.plan?.toUpperCase() || 'TRIAL'}
                  </span>
                  <span style={styles.planPriceDisplay}>
                    {subscriptionData?.price?.monthlyPrice || 0} SEK/month
                  </span>
                </div>
                <div style={styles.planDetailsGrid}>
                  <div>📅 Days left: <strong>{subscriptionData?.daysRemaining || 0}</strong></div>
                  <div>👥 Employees: <strong>{usageData.employees?.current || 0}/{subscriptionData?.features?.maxEmployees || 10}</strong></div>
                  <div>🏢 Branches: <strong>{usageData.branches?.current || 0}/{subscriptionData?.features?.maxBranches || 2}</strong></div>
                  <div>📧 Emails/month: <strong>{usageData.emails?.current || 0}/{subscriptionData?.features?.maxEmailsPerMonth || 50}</strong></div>
                </div>
                {subscriptionData?.autoRenew && (
                  <div style={styles.autoRenewBadge}>✅ Auto-renewal enabled</div>
                )}
                {subscriptionData?.status === 'expired' && (
                  <div style={styles.expiredWarning}>⚠️ Your subscription has expired! Please upgrade to continue using TaskBridge.</div>
                )}
                
                {/* Cancel Subscription Button - FIXED POSITION */}
                {subscriptionData?.status === 'active' && (
                  <button 
                    onClick={() => setShowCancelModal(true)} 
                    style={styles.cancelSubscriptionButton}
                    disabled={cancellingSubscription}
                  >
                    {cancellingSubscription ? 'Processing...' : '❌ Cancel Subscription'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Available Plans */}
            <h3 style={{...styles.sectionTitle, fontSize: '18px', marginTop: '24px'}}>📊 Available Plans</h3>
            <div style={styles.plansGrid}>
              {[
                { id: 'basic', name: 'Basic', price: 399, employees: 25, branches: 3, emails: 200, admins: 2, color: '#6b7280' },
                { id: 'standard', name: 'Standard', price: 799, employees: 50, branches: 5, emails: 400, admins: 3, color: '#10b981' },
                { id: 'pro', name: 'Pro', price: 1299, employees: 100, branches: 8, emails: 700, admins: 5, color: '#3b82f6' },
                { id: 'business', name: 'Business', price: 2499, employees: 250, branches: 15, emails: 2000, admins: 10, color: '#f59e0b' },
                { id: 'enterprise', name: 'Enterprise', price: 4999, employees: 500, branches: 30, emails: 5000, admins: 20, color: '#ec4899' },
                { id: 'corporate', name: 'Corporate', price: 9999, employees: 1000, branches: 60, emails: 12000, admins: 50, color: '#8b5cf6' }
              ].map(plan => (
                <div key={plan.id} style={{...styles.planCard, borderTop: `4px solid ${plan.color}`}}>
                  <h4 style={styles.planCardTitle}>{plan.name}</h4>
                  <div style={styles.planCardPrice}>{plan.price}<span>SEK/month</span></div>
                  <ul style={styles.planCardFeatures}>
                    <li>👥 Up to {plan.employees} employees</li>
                    <li>🏢 Up to {plan.branches} branches</li>
                    <li>📧 {plan.emails} emails/month</li>
                    <li>👔 Up to {plan.admins} admins</li>
                  </ul>
                  <button 
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setSelectedDuration(1);
                      setShowPaymentModal(true);
                    }}
                    style={styles.upgradePlanButton}
                    disabled={subscriptionData?.plan === plan.id}
                  >
                    {subscriptionData?.plan === plan.id ? '✓ Current Plan' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Invoice History */}
            {invoices.length > 0 && (
              <div style={styles.invoiceSection}>
                <h3 style={{...styles.sectionTitle, fontSize: '18px'}}>📄 Invoice History</h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>VAT (25%)</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv._id} style={styles.tableRow}>
                          <td style={styles.td}>{inv.invoiceNumber}</td>
                          <td style={styles.td}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                          <td style={styles.td}>{inv.amount} SEK</td>
                          <td style={styles.td}>{inv.vat?.amount || 0} SEK</td>
                          <td style={styles.td}><strong>{inv.totalAmount} SEK</strong></td>
                          <td style={styles.td}><span style={styles.paidBadge}>✓ Paid</span></td>
                          <td style={styles.td}>
                            <button style={styles.downloadInvoiceButton} onClick={() => window.open(inv.pdfUrl)}>
                              📄 PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Contact Sales */}
            <div style={styles.contactSalesCard}>
              <i className="fas fa-headset"></i>
              <div>
                <h4>Need a custom plan?</h4>
                <p>Contact our sales team for enterprise pricing and custom features</p>
              </div>
              <a href="mailto:sales@taskbridge.com" style={styles.contactSalesLink}>Contact Sales →</a>
            </div>
          </div>
        )}

        {/* Premium Tab */}
        {activeTab === 'premium' && (
          <div>
            <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px' }}>⭐ {lang.premiumFeatures}</h2>
            <div style={styles.premiumCard}>
              <div style={styles.premiumIcon}><i className="fas fa-door-open"></i></div>
              <div style={styles.premiumContent}>
                <h3 style={styles.premiumTitle}>Room Assignment System</h3>
                <p style={styles.premiumDesc}>{lang.roomAssignmentDesc}</p>
                <div style={styles.premiumFeatures}>
                  {['📋 Bulk Room Creation', '👥 Worker Management', '🎯 Smart Matching', '🗺️ Visual Map', '📊 Printable Reports', '🔄 Shift Management'].map(f => (
                    <span key={f} style={styles.premiumFeatureBadge}>{f}</span>
                  ))}
                </div>
                <div style={styles.premiumActions}>
                  {hasRoomAccess
                    ? <button onClick={() => onNavigate('room-assignment')} style={{ ...styles.premiumButton, minHeight: '48px' }}>⭐ {lang.accessRoomAssignment}</button>
                    : <>
                      <button disabled style={{ ...styles.upgradeButton, opacity: 0.6, cursor: 'not-allowed', minHeight: '48px' }}>🔒 {lang.accessRoomAssignment} - {lang.upgradeRequired}</button>
                      <button onClick={() => window.open('mailto:sales@taskbridge.com')} style={{ ...styles.upgradeButton, minHeight: '48px' }}>💎 Upgrade to Premium</button>
                    </>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedPlan && (
        <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Confirm Plan Change</h2>
            
            <div style={styles.paymentSummaryCard}>
              <p><strong>📋 Plan:</strong> {selectedPlan?.toUpperCase()}</p>
              <p><strong>⏱️ Duration:</strong> {selectedDuration} month(s)</p>
              <div style={styles.priceBreakdown}>
                <p>Subtotal: {calculateTotalWithVAT(selectedPlan, selectedDuration)} SEK</p>
                <p>VAT (25%): {calculateVAT(selectedPlan, selectedDuration)} SEK</p>
                <p style={styles.totalAmount}>Total: {calculateTotalWithVAT(selectedPlan, selectedDuration) + calculateVAT(selectedPlan, selectedDuration)} SEK</p>
              </div>
              
              <div style={styles.durationSelector}>
                <label>Select Duration:</label>
                <div style={styles.durationButtons}>
                  {[1, 3, 6, 12].map(d => (
                    <button 
                      key={d}
                      onClick={() => setSelectedDuration(d)}
                      style={{
                        ...styles.durationButton,
                        background: selectedDuration === d ? '#00d1ff' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      {d} {d === 1 ? 'month' : 'months'}
                      {d >= 3 && <span style={styles.discountBadge}>-{d === 3 ? 5 : d === 6 ? 10 : 15}%</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowPaymentModal(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button 
                onClick={handleChangeSubscriptionPlan} 
                style={styles.confirmPaymentButton}
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION BLOCKED OVERLAY */}
      {subscriptionBlocked && (
        <div style={styles.subscriptionBlockedOverlay}>
          <div style={styles.subscriptionBlockedModal}>
            <i className="fas fa-lock" style={{ fontSize: '64px', color: '#ef4444', marginBottom: '20px' }}></i>
            <h2 style={{ color: 'white', marginBottom: '16px' }}>Subscription Required</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '24px', textAlign: 'center' }}>
              Your subscription has {subscriptionData?.status === 'expired' ? 'expired' : 'been paused'}.<br />
              Please upgrade your plan to continue using TaskBridge features.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => handleTabChange('billing')} style={styles.upgradeNowButton}>
                💳 Upgrade Now
              </button>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}
      {showAuditModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAuditModal(false)}>
          <div style={{ ...styles.modalLarge, width: isMobile ? '95%' : '800px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ ...styles.modalTitle, fontSize: isSmall ? '16px' : '20px' }}><i className="fas fa-history"></i> {lang.auditLogs}</h2>
            {loadingAudit ? <div style={styles.loadingSpinner}></div> : auditLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
                {language === 'en' ? 'No audit logs found' : 'Inga granskningsloggar hittades'}
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={{ ...styles.table, minWidth: '600px' }}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>{lang.action}</th><th style={styles.th}>{lang.entityType}</th>
                      <th style={styles.th}>{lang.user}</th><th style={styles.th}>{lang.timestamp}</th>
                      <th style={styles.th}>{lang.changes}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log._id} style={styles.tableRow}>
                        <td style={{ ...styles.td, color: 'white' }}>
                          <span style={{ ...styles.statusBadge, background: log.action === 'create' ? '#10b981' : log.action === 'update' ? '#3b82f6' : log.action === 'delete' ? '#ef4444' : '#6b7280' }}>{log.action}</span>
                        </td>
                        <td style={{ ...styles.td, color: 'white' }}>{log.entityType}</td>
                        <td style={{ ...styles.td, color: 'white' }}>{log.user?.name || 'System'}</td>
                        <td style={{ ...styles.td, color: 'white' }}>{new Date(log.createdAt).toLocaleString()}</td>
                        <td style={{ ...styles.td, color: 'white' }}>
                          <pre style={{ margin: 0, fontSize: '10px', maxWidth: '200px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{JSON.stringify(log.changes, null, 2)}</pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={styles.modalButtons}><button onClick={() => setShowAuditModal(false)} style={{ ...styles.cancelButton, minHeight: '44px' }}>{lang.close}</button></div>
          </div>
        </div>
      )}

      {showCreateAdminModal && (
        <div style={styles.modalOverlay} onMouseDown={handleOverlayMouseDown} onClick={handleModalClose(setShowCreateAdminModal)}>
          <div style={{ ...styles.modal, width: isMobile ? '95%' : '450px' }} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.addAdmin}</h2>
            <form onSubmit={handleCreateAdmin}>
              <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required />
              <input type="email" placeholder="Email Address" value={formData.email || ''} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required />
              <input type="password" placeholder="Temporary Password" value={formData.password || ''} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required />
              <select value={formData.branch || ''} onChange={e => setFormData(p => ({ ...p, branch: e.target.value }))} style={{ ...styles.select, color: 'white', minHeight: '44px' }}>
                <option value="">Select Branch (Optional)</option>
                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateAdminModal(false)} style={{ ...styles.cancelButton, minHeight: '44px' }}>Cancel</button>
                <button type="submit" style={{ ...styles.submitButton, minHeight: '44px' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateEmployeeModal && (
        <div style={styles.modalOverlay} onMouseDown={handleOverlayMouseDown} onClick={handleModalClose(setShowCreateEmployeeModal)}>
          <div style={{ ...styles.modal, width: isMobile ? '95%' : '450px' }} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.addStaff}</h2>
            <form onSubmit={handleCreateEmployee}>
              <input type="text" placeholder="Full Name" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required />
              <input type="email" placeholder="Email Address" value={formData.email || ''} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required />
              <input type="password" placeholder="Temporary Password" value={formData.password || ''} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required />
              <select value={formData.jobDescription || ''} onChange={e => setFormData(p => ({ ...p, jobDescription: e.target.value }))} style={{ ...styles.select, color: 'white', minHeight: '44px' }} required>
                <option value="">Select Job Role</option>
                {jobDescriptions.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
              </select>
              <select value={formData.branch || ''} onChange={e => setFormData(p => ({ ...p, branch: e.target.value }))} style={{ ...styles.select, color: 'white', minHeight: '44px' }} required>
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateEmployeeModal(false)} style={{ ...styles.cancelButton, minHeight: '44px' }}>Cancel</button>
                <button type="submit" style={{ ...styles.submitButton, minHeight: '44px' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateBranchModal && (
        <div style={styles.modalOverlay} onMouseDown={handleOverlayMouseDown} onClick={handleModalClose(setShowCreateBranchModal)}>
          <div style={{ ...styles.modal, width: isMobile ? '95%' : '450px' }} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.addBranch}</h2>
            <form onSubmit={handleCreateBranch}>
              <input type="text" placeholder="Branch Name" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required />
              <input type="text" placeholder="City" value={formData.city || ''} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} />
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateBranchModal(false)} style={{ ...styles.cancelButton, minHeight: '44px' }}>Cancel</button>
                <button type="submit" style={{ ...styles.submitButton, minHeight: '44px' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateJobModal && (
        <div style={styles.modalOverlay} onMouseDown={handleOverlayMouseDown} onClick={handleModalClose(setShowCreateJobModal)}>
          <div style={{ ...styles.modal, width: isMobile ? '95%' : '450px' }} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.addRole}</h2>
            <form onSubmit={handleCreateJob}>
              <input type="text" placeholder="Role Name" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required />
              <textarea placeholder="Description" value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} style={{ ...styles.textarea, color: 'white', minHeight: '80px' }} rows="2" />
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateJobModal(false)} style={{ ...styles.cancelButton, minHeight: '44px' }}>Cancel</button>
                <button type="submit" style={{ ...styles.submitButton, minHeight: '44px' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateTaskModal && (
        <div style={styles.modalOverlay} onMouseDown={handleOverlayMouseDown} onClick={handleModalClose(setShowCreateTaskModal)}>
          <div style={{ ...styles.modalLarge, width: isMobile ? '95%' : '600px' }} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.createTask}</h2>
            <form onSubmit={handleCreateTask}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Task Title *</label>
                <input type="text" placeholder="e.g., Morning Shift" value={formData.title || ''} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea placeholder="Describe the task..." value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} style={{ ...styles.textarea, color: 'white', minHeight: '80px' }} rows="2" />
              </div>
              <div style={{ ...styles.formRow, gridTemplateColumns: isSmall ? '1fr' : 'repeat(3, 1fr)' }}>
                <div style={styles.formGroup}><label style={styles.label}>Date *</label><input type="date" value={formData.date || ''} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>Start Time *</label><input type="time" value={formData.startTime || ''} onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>End Time *</label><input type="time" value={formData.endTime || ''} onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} required /></div>
              </div>
              <div style={{ ...styles.formRow, gridTemplateColumns: isSmall ? '1fr' : 'repeat(2, 1fr)' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Job Role *</label>
                  <select value={formData.jobDescription || ''} onChange={e => setFormData(p => ({ ...p, jobDescription: e.target.value }))} style={{ ...styles.select, color: 'white', minHeight: '44px' }} required>
                    <option value="">Select Role</option>
                    {jobDescriptions.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Branch *</label>
                  <select value={formData.branch || ''} onChange={e => setFormData(p => ({ ...p, branch: e.target.value }))} style={{ ...styles.select, color: 'white', minHeight: '44px' }} required>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}><label style={styles.label}>Max Employees</label><input type="number" value={formData.maxEmployees || 1} onChange={e => setFormData(p => ({ ...p, maxEmployees: parseInt(e.target.value) }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} min="1" /></div>
              <div style={styles.formGroup}><label style={styles.label}>Location</label><input type="text" placeholder="e.g., Room 101" value={formData.location || ''} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} /></div>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateTaskModal(false)} style={{ ...styles.cancelButton, minHeight: '44px' }}>Cancel</button>
                <button type="submit" style={{ ...styles.submitButton, minHeight: '44px' }}>{lang.createTask}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetPasswordModal && (
        <div style={styles.modalOverlay} onMouseDown={handleOverlayMouseDown} onClick={handleModalClose(setShowResetPasswordModal)}>
          <div style={{ ...styles.modal, width: isMobile ? '95%' : '450px' }} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Reset Password</h2>
            <p style={{ color: 'white' }}>Reset password for <strong>{selectedUser?.name}</strong></p>
            <input type="password" placeholder="New Password" value={resetPasswordData.newPassword} onChange={e => setResetPasswordData(p => ({ ...p, newPassword: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} />
            <input type="password" placeholder="Confirm Password" value={resetPasswordData.confirmPassword} onChange={e => setResetPasswordData(p => ({ ...p, confirmPassword: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} />
            <div style={styles.modalButtons}>
              <button type="button" onClick={() => setShowResetPasswordModal(false)} style={{ ...styles.cancelButton, minHeight: '44px' }}>Cancel</button>
              <button onClick={handleResetUserPassword} style={{ ...styles.submitButton, minHeight: '44px' }}>Reset Password</button>
            </div>
          </div>
        </div>
      )}

      {showBranchAssignmentModal && (
        <div style={styles.modalOverlay} onClick={() => setShowBranchAssignmentModal(false)}>
          <div style={{ ...styles.modalLarge, width: isMobile ? '95%' : '500px' }} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Manage Branches for {selectedAdminForBranch?.name}</h2>
            <div style={styles.branchListContainer}>
              {branches.map(branch => (
                <div key={branch._id} style={styles.branchCheckboxItem}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" checked={selectedAdminForBranch?.assignedBranches?.some(b => b._id === branch._id)} onChange={async e => { if (e.target.checked) await handleAssignBranch(branch._id); else await handleRemoveBranch(branch._id); }} style={styles.checkbox} />
                    {branch.name}
                  </label>
                </div>
              ))}
            </div>
            <div style={styles.modalButtons}><button onClick={() => setShowBranchAssignmentModal(false)} style={{ ...styles.cancelButton, minHeight: '44px' }}>Close</button></div>
          </div>
        </div>
      )}

      {showChangeEmailModal && (
        <div style={styles.modalOverlay} onMouseDown={handleOverlayMouseDown} onClick={handleModalClose(setShowChangeEmailModal)}>
          <div style={{ ...styles.modal, width: isMobile ? '95%' : '450px' }} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Change Email</h2>
            <p style={{ color: 'white' }}>Current: <strong>{user?.email}</strong></p>
            <input type="email" placeholder="New Email" value={changeEmailData.newEmail} onChange={e => setChangeEmailData(p => ({ ...p, newEmail: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} />
            <input type="email" placeholder="Confirm New Email" value={changeEmailData.confirmEmail} onChange={e => setChangeEmailData(p => ({ ...p, confirmEmail: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} />
            <input type="password" placeholder="Current Password" value={changeEmailData.password} onChange={e => setChangeEmailData(p => ({ ...p, password: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} />
            <div style={styles.modalButtons}>
              <button type="button" onClick={() => setShowChangeEmailModal(false)} style={{ ...styles.cancelButton, minHeight: '44px' }}>Cancel</button>
              <button onClick={handleChangeEmail} style={{ ...styles.submitButton, minHeight: '44px' }}>Change Email</button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div style={styles.modalOverlay} onMouseDown={handleOverlayMouseDown} onClick={handleModalClose(setShowProfileModal)}>
          <div style={{ ...styles.modal, width: isMobile ? '95%' : '450px' }} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Profile Settings</h2>
            <div style={styles.profileInfo}>
              <p><strong style={{ color: '#00d1ff' }}>Name:</strong> <span style={{ color: 'white' }}>{user?.name}</span></p>
              <p><strong style={{ color: '#00d1ff' }}>Email:</strong> <span style={{ color: 'white' }}>{user?.email}</span></p>
              <p><strong style={{ color: '#00d1ff' }}>Role:</strong> <span style={{ color: 'white' }}>Super Admin</span></p>
              <p><strong style={{ color: '#00d1ff' }}>Organization:</strong> <span style={{ color: 'white' }}>{user?.organization?.name}</span></p>
            </div>
            <button onClick={() => { setShowProfileModal(false); setShowChangeEmailModal(true); }} style={{ ...styles.changeEmailButton, minHeight: '44px' }}>Change Email</button>
            <h3 style={styles.subTitle}>Change Password</h3>
            <input type="password" placeholder="Current Password" value={profileData.currentPassword} onChange={e => setProfileData(p => ({ ...p, currentPassword: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} />
            <input type="password" placeholder="New Password" value={profileData.newPassword} onChange={e => setProfileData(p => ({ ...p, newPassword: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} />
            <input type="password" placeholder="Confirm New Password" value={profileData.confirmPassword} onChange={e => setProfileData(p => ({ ...p, confirmPassword: e.target.value }))} style={{ ...styles.input, color: 'white', minHeight: '44px' }} />
            <button onClick={handleUpdateProfile} style={{ ...styles.submitButton, minHeight: '44px' }}>Update Password</button>
            
            {/* Cancel Deletion Request Button */}
            <button onClick={handleCancelDeletionRequest} style={{ ...styles.cancelButton, marginTop: '12px', width: '100%' }}>
              Cancel Deletion Request
            </button>
            
            <div style={styles.dangerZone}>
              <h3 style={{ color: '#ef4444' }}>Danger Zone</h3>
              <button onClick={() => { setShowProfileModal(false); setShowDeleteAccountModal(true); }} style={{ ...styles.deleteAccountButton, minHeight: '44px' }}>Delete My Account</button>
              <p style={styles.warningText}>⚠️ This will delete YOUR account only.</p>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div style={styles.modalOverlay} onMouseDown={handleOverlayMouseDown} onClick={handleModalClose(setShowDeleteAccountModal)}>
          <div style={{ ...styles.modal, width: isMobile ? '95%' : '450px' }} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Delete Your Account</h2>
            <p style={{ color: 'white' }}>Are you sure you want to delete your account?</p>
            <p style={{ color: '#ef4444' }}>⚠️ This action cannot be undone.</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteAccountModal(false)} style={{ ...styles.cancelButton, minHeight: '44px' }}>Cancel</button>
              <button onClick={handleDeleteAccount} style={{ ...styles.confirmDeleteButton, minHeight: '44px' }}>Delete My Account</button>
            </div>
          </div>
        </div>
      )}

      <button style={{ ...styles.chatButton, width: isSmall ? '48px' : '50px', height: isSmall ? '48px' : '50px' }} onClick={() => setShowChat(!showChat)}>
        <i className="fas fa-robot"></i>
      </button>

      {showChat && (
        <div style={{ ...styles.chatModal, width: isMobile ? '90vw' : '400px', height: isMobile ? '70vh' : '580px', bottom: isMobile ? '75px' : '85px', right: isMobile ? '5vw' : '25px' }}>
          <div style={styles.chatHeader}>
            <span><i className="fas fa-robot" style={{ color: '#00d1ff' }}></i> TaskBridge AI Assistant</span>
            <button onClick={() => setShowChat(false)} style={{ ...styles.chatClose, minHeight: '36px' }}>✕</button>
          </div>
          <div style={styles.chatMessages}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ ...styles.chatMessage, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ ...styles.messageBubble, background: msg.sender === 'user' ? '#00d1ff' : '#1e293b', maxWidth: '85%' }}>
                  {msg.sender === 'ai' && <i className="fas fa-robot" style={{ fontSize: '12px', marginRight: '6px', color: '#00d1ff' }}></i>}
                  <div style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', fontSize: isSmall ? '12px' : '13px', lineHeight: '1.5' }}>{msg.text}</div>
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
          <div style={styles.quickQuestionsContainer}>
            <div style={styles.quickQuestionsHeader}><i className="fas fa-lightbulb"></i> {language === 'en' ? 'Quick Questions' : 'Snabbfrågor'}</div>
            <div style={styles.quickQuestionsGrid}>
              {quickQuestions[language].map((q, idx) => (
                <button key={idx} onClick={() => sendChatMessage(q)} style={{ ...styles.quickQuestionButton, minHeight: '36px' }}>{q}</button>
              ))}
            </div>
          </div>
          <div style={styles.chatInputContainer}>
            <input type="text" placeholder={language === 'en' ? "Ask me anything..." : "Fråga mig vad som helst..."} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChatMessage()} style={{ ...styles.chatInput, minHeight: '44px' }} />
            <button onClick={() => sendChatMessage()} style={{ ...styles.chatSend, minHeight: '44px' }}><i className="fas fa-paper-plane"></i></button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '20px', fontFamily: 'Inter, sans-serif', position: 'relative' },
  toast: { position: 'fixed', bottom: '20px', right: '20px', color: 'white', padding: '12px 20px', borderRadius: '8px', zIndex: 2000, fontSize: '14px', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
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
  tabs: { display: 'flex', gap: '6px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  tab: { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '20px', whiteSpace: 'nowrap' },
  content: { background: 'rgba(255,255,255,0.03)', borderRadius: '16px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' },
  sectionTitle: { fontWeight: '600', color: 'white', margin: 0 },
  sectionDesc: { color: 'rgba(255,255,255,0.6)', marginBottom: '14px' },
  addButton: { background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' },
  searchInput: { padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'white', width: '100%', marginBottom: '14px', boxSizing: 'border-box' },
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
  editButton: { background: 'rgba(59,130,246,0.2)', border: '1px solid #3b82f6', borderRadius: '6px', padding: '4px 8px', color: '#3b82f6', cursor: 'pointer', fontSize: '12px' },
  saveButton: { background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', borderRadius: '6px', padding: '4px 8px', color: '#10b981', cursor: 'pointer', fontSize: '12px' },
  cancelBtnSmall: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '6px', padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: '12px' },
  inlineInput: { background: '#0f172a', border: '1px solid #00d1ff', borderRadius: '4px', padding: '4px 8px', color: 'white', fontSize: '12px', width: '100%', minWidth: '80px', boxSizing: 'border-box' },
  inlineSelect: { background: '#0f172a', border: '1px solid #00d1ff', borderRadius: '4px', padding: '4px 8px', color: 'white', fontSize: '12px', cursor: 'pointer' },
  inlineTextarea: { background: '#0f172a', border: '1px solid #00d1ff', borderRadius: '4px', padding: '4px 8px', color: 'white', fontSize: '12px', width: '100%', resize: 'vertical', boxSizing: 'border-box' },
  branchTag: { display: 'inline-block', background: 'rgba(0,209,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', marginRight: '4px', marginBottom: '4px', color: '#00d1ff' },
  assignBranchButton: { background: 'rgba(59,130,246,0.2)', border: '1px solid #3b82f6', borderRadius: '6px', padding: '2px 8px', color: '#3b82f6', cursor: 'pointer', fontSize: '10px', marginTop: '4px' },
  reportsGrid: { display: 'grid', gap: '15px', marginTop: '20px' },
  reportCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  reportButton: { marginTop: '12px', padding: '8px 16px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '12px' },
  settingsCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', marginBottom: '12px' },
  fileInput: { margin: '10px 0', padding: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', width: '100%', fontSize: '11px', boxSizing: 'border-box' },
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
  branchListContainer: { maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' },
  branchCheckboxItem: { padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', color: 'white', cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  reportFiltersCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' },
  reportFiltersHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,209,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  reportFiltersBody: { padding: '16px' },
  customDateRange: { display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' },
  filterInput: { padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', fontSize: '13px', width: '150px' },
  reportPreview: { marginTop: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' },
  reportPreviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,209,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  clearReportButton: { background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: '6px', padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: '12px' },
  reportPreviewContent: { padding: '16px', maxHeight: '400px', overflowY: 'auto' },
  filterToggleButton: { background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', padding: '4px 8px', color: 'white', cursor: 'pointer', fontSize: '12px' },
  filterRow: { display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' },
  filterLabel: { color: 'rgba(255,255,255,0.7)', fontSize: '12px' },
  filterSelect: { padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px' },
  quickQuestionsContainer: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' },
  quickQuestionsHeader: { fontSize: '11px', color: '#00d1ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
  quickQuestionsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  quickQuestionButton: { background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.3)', borderRadius: '20px', padding: '6px 12px', color: '#00d1ff', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' },
  chatButton: { position: 'fixed', bottom: '20px', right: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', color: 'white', cursor: 'pointer', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  chatModal: { position: 'fixed', background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1001 },
  chatHeader: { padding: '14px 16px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: '600', color: 'white' },
  chatClose: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', padding: '4px 8px', borderRadius: '8px' },
  chatMessages: { flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '180px' },
  chatMessage: { display: 'flex' },
  messageBubble: { padding: '10px 14px', borderRadius: '16px', color: 'white', lineHeight: '1.5', wordWrap: 'break-word', whiteSpace: 'pre-wrap' },
  messageTime: { fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '5px', textAlign: 'right' },
  typingIndicator: { padding: '10px 14px', background: '#1e293b', borderRadius: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content' },
  chatInputContainer: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)' },
  chatInput: { flex: 1, padding: '10px 14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '25px', color: 'white', outline: 'none', fontSize: '13px' },
  chatSend: { padding: '8px 16px', background: '#00d1ff', border: 'none', borderRadius: '25px', color: 'white', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  premiumCard: { background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.05))', borderRadius: '16px', padding: '24px', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '20px' },
  premiumIcon: { width: '60px', height: '60px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'white' },
  premiumContent: { flex: 1, minWidth: '250px' },
  premiumTitle: { fontSize: '20px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px' },
  premiumDesc: { color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' },
  premiumFeatures: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' },
  premiumFeatureBadge: { background: 'rgba(245,158,11,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
  premiumActions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' },
  premiumButton: { padding: '10px 20px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
  upgradeButton: { padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid #f59e0b', borderRadius: '8px', color: '#f59e0b', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
  currentSubscriptionCard: {
    background: 'rgba(0,209,255,0.1)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '24px',
    border: '1px solid rgba(0,209,255,0.2)'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#00d1ff',
    marginBottom: '16px'
  },
  currentPlanInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  planNameBadge: {
    background: '#00d1ff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    display: 'inline-block',
    marginRight: '12px'
  },
  planPriceDisplay: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#10b981'
  },
  planDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)'
  },
  autoRenewBadge: {
    background: 'rgba(16,185,129,0.2)',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#10b981',
    display: 'inline-block',
    width: 'fit-content'
  },
  expiredWarning: {
    background: 'rgba(239,68,68,0.2)',
    padding: '12px',
    borderRadius: '8px',
    color: '#f87171',
    fontSize: '14px',
    border: '1px solid #ef4444'
  },
  plansGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  planCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'transform 0.2s'
  },
  planCardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '8px'
  },
  planCardPrice: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#00d1ff',
    marginBottom: '16px'
  },
  planCardFeatures: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '20px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)'
  },
  upgradePlanButton: {
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '500'
  },
  invoiceSection: {
    marginTop: '24px'
  },
  paidBadge: {
    background: '#10b981',
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    color: 'white'
  },
  downloadInvoiceButton: {
    background: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 10px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '11px'
  },
  contactSalesCard: {
    background: 'rgba(245,158,11,0.1)',
    borderRadius: '16px',
    padding: '20px',
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    border: '1px solid rgba(245,158,11,0.3)'
  },
  contactSalesLink: {
    background: '#f59e0b',
    padding: '10px 20px',
    borderRadius: '8px',
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500'
  },
  paymentSummaryCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  },
  priceBreakdown: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.1)'
  },
  totalAmount: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: '8px'
  },
  durationSelector: {
    marginTop: '16px'
  },
  durationButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
    flexWrap: 'wrap'
  },
  durationButton: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    position: 'relative'
  },
  discountBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#10b981',
    padding: '2px 4px',
    borderRadius: '4px',
    fontSize: '8px'
  },
  confirmPaymentButton: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '500'
  },
  subscriptionBlockedOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(10px)'
  },
  subscriptionBlockedModal: {
    background: '#1e293b',
    borderRadius: '24px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '450px',
    width: '90%',
    border: '1px solid rgba(239,68,68,0.3)'
  },
  upgradeNowButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '500'
  },
  cancelSubscriptionButton: {
    marginTop: '12px',
    padding: '10px 16px',
    background: 'rgba(239,68,68,0.2)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  }
};

export default SuperAdminDashboard;