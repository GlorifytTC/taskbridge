import React, { useState, useEffect } from 'react';

const MasterDashboard = ({ onLogout, onNavigate }) => {
  const [organizations, setOrganizations] = useState([]);
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    totalTasks: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    trialExpiring: 0,
    pendingOrganizations: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDays, setExtendDays] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('trial');
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedOrgUsers, setSelectedOrgUsers] = useState([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'superadmin'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showToast, setShowToast] = useState(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCustomPlanModal, setShowCustomPlanModal] = useState(false);
  const [customPlanData, setCustomPlanData] = useState({
    maxEmployees: 100,
    maxBranches: 10,
    maxEmails: 5000,
    maxAdmins: 10,
    price: 0,
    name: 'Custom Plan'
  });
  
  // Track which organization is being edited
  const [editingOrgId, setEditingOrgId] = useState(null);
  const [editOrgData, setEditOrgData] = useState({});

  const planPrices = {
    trial: { price: 0, name: 'Trial', maxEmployees: 10, maxBranches: 2, maxEmails: 50, maxAdmins: 1 },
    basic: { price: 399, name: 'Basic', maxEmployees: 25, maxBranches: 3, maxEmails: 200, maxAdmins: 2 },
    standard: { price: 799, name: 'Standard', maxEmployees: 50, maxBranches: 5, maxEmails: 400, maxAdmins: 3 },
    pro: { price: 1299, name: 'Pro', maxEmployees: 100, maxBranches: 8, maxEmails: 700, maxAdmins: 5 },
    business: { price: 2499, name: 'Business', maxEmployees: 250, maxBranches: 15, maxEmails: 2000, maxAdmins: 10 },
    enterprise: { price: 4999, name: 'Enterprise', maxEmployees: 500, maxBranches: 30, maxEmails: 5000, maxAdmins: 20 },
    corporate: { price: 9999, name: 'Corporate', maxEmployees: 1000, maxBranches: 60, maxEmails: 12000, maxAdmins: 50 },
    custom: { price: 0, name: 'Custom', maxEmployees: 5000, maxBranches: 200, maxEmails: 50000, maxAdmins: 200 }
  };

  const t = {
    en: {
      masterDashboard: 'Master Dashboard',
      systemOverview: 'System overview and organization management',
      logout: 'Logout',
      totalOrganizations: 'Total Organizations',
      totalUsers: 'Total Users',
      totalTasks: 'Total Tasks',
      monthlyRevenue: 'Monthly Revenue',
      activeSubscriptions: 'Active Subscriptions',
      trialsExpiring: 'Trials Expiring Soon',
      newOrganization: 'New Organization',
      searchOrgs: 'Search organizations...',
      allStatus: 'All Status',
      active: 'Active',
      paused: 'Paused',
      trial: 'Trial',
      organization: 'Organization',
      contact: 'Contact',
      plan: 'Plan',
      status: 'Status',
      users: 'Users',
      tasks: 'Tasks',
      subscription: 'Subscription',
      actions: 'Actions',
      extendSubscription: 'Extend Subscription',
      pause: 'Pause',
      resume: 'Resume',
      changePlan: 'Change Plan',
      delete: 'Delete',
      daysLeft: 'days left',
      createOrganization: 'Create New Organization',
      orgName: 'Organization Name',
      email: 'Email',
      phone: 'Phone',
      selectPlan: 'Select Plan',
      trialDays: 'Trial Days',
      cancel: 'Cancel',
      create: 'Create',
      extend: 'Extend',
      days: 'days',
      changeTo: 'Change to',
      manageUsers: 'Manage Users',
      addUser: 'Add User',
      resetPassword: 'Reset Password',
      deleteOrganization: 'Delete Organization',
      deleteWarning: 'This action cannot be undone. All data will be permanently removed.',
      deleteForever: 'Delete Forever',
      close: 'Close',
      fullName: 'Full Name',
      password: 'Password',
      role: 'Role',
      superAdmin: 'Super Admin',
      admin: 'Admin',
      createUser: 'Create User',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      contactSales: 'Contact Sales',
      currentPlan: 'Current Plan',
      upgradePlan: 'Upgrade Plan',
      language: 'Language',
      swedish: 'Svenska',
      english: 'English',
      edit: 'Edit',
      save: 'Save'
    },
    sv: {
      masterDashboard: 'Master Dashboard',
      systemOverview: 'Systemöversikt och organisationshantering',
      logout: 'Logga ut',
      totalOrganizations: 'Totalt Organisationer',
      totalUsers: 'Totalt Användare',
      totalTasks: 'Totalt Uppgifter',
      monthlyRevenue: 'Månadsintäkter',
      activeSubscriptions: 'Aktiva Prenumerationer',
      trialsExpiring: 'Prova-på som går ut snart',
      newOrganization: 'Ny Organisation',
      searchOrgs: 'Sök organisationer...',
      allStatus: 'Alla Status',
      active: 'Aktiv',
      paused: 'Pausad',
      trial: 'Prova-på',
      organization: 'Organisation',
      contact: 'Kontakt',
      plan: 'Plan',
      status: 'Status',
      users: 'Användare',
      tasks: 'Uppgifter',
      subscription: 'Prenumeration',
      actions: 'Åtgärder',
      extendSubscription: 'Förläng Prenumeration',
      pause: 'Pausa',
      resume: 'Återuppta',
      changePlan: 'Byt Plan',
      delete: 'Radera',
      daysLeft: 'dagar kvar',
      createOrganization: 'Skapa Ny Organisation',
      orgName: 'Organisationsnamn',
      email: 'E-post',
      phone: 'Telefon',
      selectPlan: 'Välj Plan',
      trialDays: 'Prova-på Dagar',
      cancel: 'Avbryt',
      create: 'Skapa',
      extend: 'Förläng',
      days: 'dagar',
      changeTo: 'Byt till',
      manageUsers: 'Hantera Användare',
      addUser: 'Lägg till Användare',
      resetPassword: 'Återställ Lösenord',
      deleteOrganization: 'Radera Organisation',
      deleteWarning: 'Denna åtgärd kan inte ångras. All data kommer att raderas permanent.',
      deleteForever: 'Radera För Alltid',
      close: 'Stäng',
      fullName: 'Fullständigt Namn',
      password: 'Lösenord',
      role: 'Roll',
      superAdmin: 'Super Admin',
      admin: 'Admin',
      createUser: 'Skapa Användare',
      newPassword: 'Nytt Lösenord',
      confirmPassword: 'Bekräfta Lösenord',
      contactSales: 'Kontakta oss',
      currentPlan: 'Nuvarande Plan',
      upgradePlan: 'Uppgradera Plan',
      language: 'Språk',
      swedish: 'Svenska',
      english: 'Engelska',
      edit: 'Redigera',
      save: 'Spara'
    }
  };

  const lang = t[language];

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('taskbridge_language', langCode);
    setShowLanguageDropdown(false);
  };

  const showToastMessage = (message, type = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const orgRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/organizations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!orgRes.ok) {
        throw new Error(`HTTP ${orgRes.status}`);
      }
      
      const orgData = await orgRes.json();
      
      if (orgData.success && orgData.data) {
        const orgs = orgData.data || [];
        setOrganizations(orgs);
        
        const activeSubs = orgs.filter(o => o.subscription?.status === 'active').length;
        const trialExpiring = orgs.filter(o => {
          if (o.subscription?.status === 'trial' && o.subscription?.endDate) {
            const daysLeft = Math.ceil((new Date(o.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));
            return daysLeft <= 7 && daysLeft > 0;
          }
          return false;
        }).length;
        
        const monthlyRevenue = orgs.reduce((sum, org) => {
          const planPrice = planPrices[org.subscription?.plan]?.price || 0;
          return sum + planPrice;
        }, 0);
        
        setStats({
          totalOrganizations: orgs.length,
          totalUsers: orgs.reduce((sum, org) => sum + (org.userCount || 0), 0),
          totalTasks: orgs.reduce((sum, org) => sum + (org.taskCount || 0), 0),
          monthlyRevenue: monthlyRevenue,
          activeSubscriptions: activeSubs,
          trialExpiring: trialExpiring,
          pendingOrganizations: orgs.filter(o => o.status === 'pending').length
        });
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  // Organization edit handlers
  const startEditOrg = (org) => {
    setEditingOrgId(org._id);
    setEditOrgData({
      name: org.name,
      email: org.email,
      phone: org.phone || '',
      isActive: org.isActive
    });
  };

  const cancelEditOrg = () => {
    setEditingOrgId(null);
    setEditOrgData({});
  };

  const saveEditOrg = async (orgId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${orgId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editOrgData)
      });
      
      if (response.ok) {
        showToastMessage(language === 'en' ? 'Organization updated!' : 'Organisation uppdaterad!', 'success');
        setEditingOrgId(null);
        setEditOrgData({});
        fetchDashboardData();
      } else {
        const data = await response.json();
        showToastMessage(data.message || 'Error updating organization', 'error');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      showToastMessage('Error updating organization', 'error');
    }
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newOrg = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      adminName: formData.get('adminName'),
      subscriptionPlan: formData.get('plan'),
      trialDays: parseInt(formData.get('trialDays')) || 14
    };
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newOrg)
      });
      
      if (response.ok) {
        showToastMessage(lang.create, 'success');
        fetchDashboardData();
        setShowOrgModal(false);
      } else {
        const errorData = await response.json();
        showToastMessage(errorData.message || 'Error creating organization', 'error');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      showToastMessage('Error creating organization', 'error');
    }
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

  const fetchOrganizationUsers = async (orgId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching users for org:', orgId);
      
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${orgId}/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        if (data.users && Array.isArray(data.users)) {
          setSelectedOrgUsers(data.users);
        } else if (data.data && Array.isArray(data.data)) {
          setSelectedOrgUsers(data.data);
        } else if (Array.isArray(data)) {
          setSelectedOrgUsers(data);
        } else {
          setSelectedOrgUsers([]);
          console.warn('Unexpected data structure:', data);
        }
      } else {
        console.error('Failed to fetch users:', data.message);
        setSelectedOrgUsers([]);
        showToastMessage(data.message || 'Failed to load users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setSelectedOrgUsers([]);
      showToastMessage('Error loading users', 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${selectedOrg._id}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUserData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToastMessage('User created successfully', 'success');
        setShowCreateUserModal(false);
        setNewUserData({ name: '', email: '', password: '', role: 'superadmin' });
        await fetchOrganizationUsers(selectedOrg._id);
      } else {
        showToastMessage(data.message || 'Error creating user', 'error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showToastMessage('Error creating user', 'error');
    }
  };

  const handleResetUserPassword = async () => {
    if (!selectedUser) return;
    
    if (!newPassword || newPassword.length < 6) {
      showToastMessage('Password must be at least 6 characters', 'error');
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
        body: JSON.stringify({ 
          password: newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToastMessage('Password reset successfully', 'success');
        setShowResetPasswordModal(false);
        setSelectedUser(null);
        setNewPassword('');
      } else {
        showToastMessage(data.message || 'Failed to reset password', 'error');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      showToastMessage('Error resetting password', 'error');
    }
  };

  const handleDeleteUser = async (userId, userRole, userName) => {
    if (userRole === 'master') {
      showToastMessage('Cannot delete master user', 'error');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToastMessage('User deleted successfully', 'success');
        fetchOrganizationUsers(selectedOrg._id);
      } else {
        showToastMessage(data.message || 'Error deleting user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToastMessage('Error deleting user', 'error');
    }
  };

  const handleExtendSubscription = async () => {
    if (!selectedOrg) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${selectedOrg._id}/extend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ days: extendDays })
      });
      showToastMessage(`${lang.extend} ${extendDays} ${lang.days}`, 'success');
      setShowExtendModal(false);
      setSelectedOrg(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error extending subscription:', error);
      showToastMessage('Error extending subscription', 'error');
    }
  };

  const handleChangePlanCustom = async (customData) => {
    if (!selectedOrg) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${selectedOrg._id}/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          plan: 'custom',
          duration: selectedDuration,
          customFeatures: {
            maxEmployees: customData.maxEmployees,
            maxBranches: customData.maxBranches,
            maxEmailsPerMonth: customData.maxEmails,
            maxAdmins: customData.maxAdmins,
            price: customData.price
          }
        })
      });
      
      if (response.ok) {
        showToastMessage(`Custom plan applied: ${customData.price} SEK/month`, 'success');
        setShowPlanModal(false);
        setSelectedOrg(null);
        fetchDashboardData();
      } else {
        const error = await response.json();
        showToastMessage(error.message || 'Error applying custom plan', 'error');
      }
    } catch (error) {
      console.error('Error applying custom plan:', error);
      showToastMessage('Error applying custom plan', 'error');
    }
  };

  const handlePauseOrg = async (orgId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${orgId}/pause`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToastMessage(lang.pause, 'success');
      fetchDashboardData();
    } catch (error) {
      console.error('Error pausing organization:', error);
      showToastMessage('Error pausing organization', 'error');
    }
  };

  const handleResumeOrg = async (orgId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${orgId}/resume`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToastMessage(lang.resume, 'success');
      fetchDashboardData();
    } catch (error) {
      console.error('Error resuming organization:', error);
      showToastMessage('Error resuming organization', 'error');
    }
  };

  const handleDeleteOrg = async () => {
    if (!selectedOrg) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${selectedOrg._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToastMessage(lang.deleteOrganization, 'success');
      setShowDeleteConfirm(false);
      setSelectedOrg(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting organization:', error);
      showToastMessage('Error deleting organization', 'error');
    }
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return 'N/A';
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    return `${days} ${lang.daysLeft}`;
  };

  const getPlanDisplayName = (plan) => {
    const names = {
      trial: 'Trial',
      basic: 'Basic',
      standard: 'Standard',
      pro: 'Pro',
      business: 'Business',
      enterprise: 'Enterprise',
      corporate: 'Corporate',
      custom: 'Custom'
    };
    return names[plan] || plan;
  };

  const getPlanPrice = (plan, months) => {
    const price = planPrices[plan]?.price || 0;
    let total = price * months;
    if (months >= 3) total = total * 0.95;
    if (months >= 6) total = total * 0.9;
    if (months >= 12) total = total * 0.85;
    return Math.round(total);
  };

  const filteredOrgs = (organizations || []).filter(org => {
    if (!org) return false;
    const matchesSearch = (org.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                          (org.email || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                          (filterStatus === 'active' && org.isActive) ||
                          (filterStatus === 'paused' && !org.isActive) ||
                          (filterStatus === 'trial' && org.subscription?.status === 'trial');
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {showToast && (
        <div style={{...styles.toast, background: showToast.type === 'success' ? '#10b981' : '#ef4444'}}>
          {showToast.message}
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{lang.masterDashboard}</h1>
          <p style={styles.subtitle}>{lang.systemOverview}</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.languageContainer}>
            <button onClick={() => setShowLanguageDropdown(!showLanguageDropdown)} style={styles.languageButton}>
              <i className="fas fa-globe"></i> {language === 'en' ? 'EN' : 'SV'}
            </button>
            {showLanguageDropdown && (
              <div style={styles.languageDropdown}>
                <button onClick={() => changeLanguage('en')} style={styles.languageOption}>🇬🇧 {lang.english}</button>
                <button onClick={() => changeLanguage('sv')} style={styles.languageOption}>🇸🇪 {lang.swedish}</button>
              </div>
            )}
          </div>
          <button onClick={onLogout} style={styles.logoutButton}>
            <i className="fas fa-sign-out-alt"></i> {lang.logout}
          </button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-building"></i></div>
          <div style={styles.statValue}>{stats.totalOrganizations}</div>
          <div style={styles.statLabel}>{lang.totalOrganizations}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-users"></i></div>
          <div style={styles.statValue}>{stats.totalUsers}</div>
          <div style={styles.statLabel}>{lang.totalUsers}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-tasks"></i></div>
          <div style={styles.statValue}>{stats.totalTasks}</div>
          <div style={styles.statLabel}>{lang.totalTasks}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-dollar-sign"></i></div>
          <div style={styles.statValue}>{stats.monthlyRevenue.toLocaleString()} SEK</div>
          <div style={styles.statLabel}>{lang.monthlyRevenue}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-check-circle"></i></div>
          <div style={styles.statValue}>{stats.activeSubscriptions}</div>
          <div style={styles.statLabel}>{lang.activeSubscriptions}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-exclamation-triangle"></i></div>
          <div style={styles.statValue}>{stats.trialExpiring}</div>
          <div style={styles.statLabel}>{lang.trialsExpiring}</div>
        </div>
      </div>

      <div style={styles.actionsBar}>
        <button onClick={() => setShowOrgModal(true)} style={styles.addButton}>
          <i className="fas fa-plus"></i> {lang.newOrganization}
        </button>
        <div style={styles.searchFilter}>
          <input
            type="text"
            placeholder={lang.searchOrgs}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">{lang.allStatus}</option>
            <option value="active">{lang.active}</option>
            <option value="paused">{lang.paused}</option>
            <option value="trial">{lang.trial}</option>
          </select>
        </div>
      </div>

      <div style={styles.tableContainer}>
  {!filteredOrgs || filteredOrgs.length === 0 ? (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
      <i className="fas fa-building" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
      No organizations found. Click "New Organization" to create one.
    </div>
  ) : (
    <table style={styles.table}>
      <thead>
        <tr style={styles.tableHeader}>
          <th style={styles.th}>{lang.organization}</th>
          <th style={styles.th}>{lang.contact}</th>
          <th style={styles.th}>{lang.plan}</th>
          <th style={styles.th}>{lang.status}</th>
          <th style={styles.th}>{lang.users}</th>
          <th style={styles.th}>{lang.tasks}</th>
          <th style={styles.th}>{lang.subscription}</th>
          <th style={styles.th}>{lang.actions}</th>
         </tr>
      </thead>
      <tbody>
        {filteredOrgs && filteredOrgs.map((org) => (
          <tr key={org._id} style={styles.tableRow}>
            <td style={styles.td}>
              {editingOrgId === org._id ? (
                <input
                  type="text"
                  value={editOrgData.name || org.name}
                  onChange={(e) => setEditOrgData({...editOrgData, name: e.target.value})}
                  style={styles.inlineInput}
                  autoFocus
                />
              ) : (
                <strong>{org.name || 'N/A'}</strong>
              )}
              <div style={styles.orgDetails}>{org.address?.city && `${org.address.city}`}</div>
              <button 
                onClick={() => {
                  setSelectedOrg(org);
                  fetchOrganizationUsers(org._id);
                  setShowUsersModal(true);
                }}
                style={styles.usersButton}
                title={lang.manageUsers}
              >
                <i className="fas fa-users-cog"></i>
              </button>
            </td>
            <td style={styles.td}>
              {editingOrgId === org._id ? (
                <>
                  <input
                    type="email"
                    value={editOrgData.email || org.email}
                    onChange={(e) => setEditOrgData({...editOrgData, email: e.target.value})}
                    style={styles.inlineInput}
                    placeholder="Email"
                  />
                  <input
                    type="tel"
                    value={editOrgData.phone || org.phone || ''}
                    onChange={(e) => setEditOrgData({...editOrgData, phone: e.target.value})}
                    style={{...styles.inlineInput, marginTop: '4px'}}
                    placeholder="Phone"
                  />
                </>
              ) : (
                <>
                  <div>{org.email || 'N/A'}</div>
                  <div style={styles.orgDetails}>{org.phone || 'N/A'}</div>
                </>
              )}
            </td>
            <td style={styles.td}>
              <span style={{
                ...styles.planBadge,
                background: org.subscription?.plan === 'corporate' ? '#ec4899' :
                            org.subscription?.plan === 'enterprise' ? '#ec4899' :
                            org.subscription?.plan === 'business' ? '#f59e0b' :
                            org.subscription?.plan === 'pro' ? '#3b82f6' :
                            org.subscription?.plan === 'standard' ? '#10b981' : 
                            org.subscription?.plan === 'basic' ? '#6b7280' : '#8b5cf6'
              }}>
                {getPlanDisplayName(org.subscription?.plan || 'trial')}
              </span>
            </td>
            <td style={styles.td}>
              {editingOrgId === org._id ? (
                <select
                  value={editOrgData.isActive !== undefined ? editOrgData.isActive : org.isActive}
                  onChange={(e) => setEditOrgData({...editOrgData, isActive: e.target.value === 'true'})}
                  style={styles.inlineSelect}
                >
                  <option value="true">{lang.active}</option>
                  <option value="false">{lang.paused}</option>
                </select>
              ) : (
                <span style={{
                  ...styles.statusBadge,
                  background: org.isActive ? '#10b981' : '#ef4444'
                }}>
                  {org.isActive ? lang.active : lang.paused}
                  {org.subscription?.status === 'trial' && <span style={styles.trialBadge}>{lang.trial}</span>}
                </span>
              )}
            </td>
            <td style={styles.td}>{org.userCount || 0}</td>
            <td style={styles.td}>{org.taskCount || 0}</td>
            <td style={styles.td}>
              <div>{getDaysLeft(org.subscription?.endDate)}</div>
              <div style={styles.orgDetails}>
                {org.subscription?.endDate && new Date(org.subscription.endDate).toLocaleDateString()}
              </div>
            </td>
            <td style={styles.td}>
              {editingOrgId === org._id ? (
                <div style={styles.actionButtons}>
                  <button onClick={() => saveEditOrg(org._id)} style={styles.saveButton}>💾 {lang.save}</button>
                  <button onClick={cancelEditOrg} style={styles.cancelButton}>✕ {lang.cancel}</button>
                </div>
              ) : (
                <div style={styles.actionButtons}>
                  <button onClick={() => startEditOrg(org)} style={styles.editButton} title={lang.edit}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => { setSelectedOrg(org); setShowExtendModal(true); }} style={styles.extendButton} title={lang.extendSubscription}>
                    <i className="fas fa-calendar-plus"></i>
                  </button>
                  <button onClick={() => org.isActive ? handlePauseOrg(org._id) : handleResumeOrg(org._id)} style={org.isActive ? styles.pauseButton : styles.resumeButton} title={org.isActive ? lang.pause : lang.resume}>
                    <i className={`fas fa-${org.isActive ? 'pause' : 'play'}`}></i>
                  </button>
                  <button onClick={() => { setSelectedOrg(org); setSelectedPlan(org.subscription?.plan || 'trial'); setSelectedDuration(1); setShowPlanModal(true); }} style={styles.planButton} title={lang.changePlan}>
                    <i className="fas fa-tag"></i>
                  </button>
                  <button onClick={() => { setSelectedOrg(org); setShowDeleteConfirm(true); }} style={styles.deleteButton} title={lang.delete}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

      {/* Create Organization Modal */}
      {showOrgModal && (
        <div style={styles.modalOverlay} onClick={() => setShowOrgModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.createOrganization}</h2>
            <form onSubmit={handleCreateOrganization}>
              <input type="text" name="name" placeholder={lang.orgName} style={styles.input} required />
              <input type="email" name="email" placeholder={lang.email} style={styles.input} required />
              <input type="tel" name="phone" placeholder={lang.phone} style={styles.input} />
              <input type="text" name="adminName" placeholder="Super Admin Full Name" style={styles.input} required />
              <select name="plan" style={styles.select} defaultValue="trial" required>
                <option value="trial">💰 Trial - 0 SEK (14 days)</option>
                <option value="basic">💰 Basic - 399 SEK/month</option>
                <option value="standard">💰 Standard - 799 SEK/month</option>
                <option value="pro">💰 Pro - 1,299 SEK/month</option>
                <option value="business">💎 Business - 2,499 SEK/month</option>
                <option value="enterprise">💎 Enterprise - 4,999 SEK/month</option>
                <option value="corporate">💎 Corporate - 9,999 SEK/month</option>
                <option value="custom">💎 Custom - Contact Sales</option>
              </select>
              <input type="number" name="trialDays" placeholder={lang.trialDays || "Trial Days (default: 14)"} style={styles.input} defaultValue="14" />
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowOrgModal(false)} style={styles.cancelButton}>{lang.cancel}</button>
                <button type="submit" style={styles.submitButton}>{lang.create}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extend Subscription Modal */}
      {showExtendModal && (
        <div style={styles.modalOverlay} onClick={() => setShowExtendModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.extendSubscription}</h2>
            <p>{lang.extend} <strong>{selectedOrg?.name}</strong></p>
            <input type="number" value={extendDays} onChange={(e) => setExtendDays(parseInt(e.target.value))} placeholder={lang.days} style={styles.input} min="1" max="365" />
            <div style={styles.modalButtons}>
              <button onClick={() => setShowExtendModal(false)} style={styles.cancelButton}>{lang.cancel}</button>
              <button onClick={handleExtendSubscription} style={styles.submitButton}>{lang.extend} {extendDays} {lang.days}</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showPlanModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPlanModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.changePlan}</h2>
            <p style={{ marginBottom: '20px', fontSize: '14px' }}>{lang.changeTo} <strong>{selectedOrg?.name}</strong></p>
            
            <div style={styles.planOptions}>
              <div onClick={() => setSelectedPlan('basic')} style={{...styles.planCard, borderColor: selectedPlan === 'basic' ? '#00d1ff' : 'rgba(255,255,255,0.2)', background: selectedPlan === 'basic' ? 'rgba(0,209,255,0.1)' : 'rgba(255,255,255,0.05)'}}>
                <h3>💰 Basic</h3>
                <div style={styles.planPrice}>399<span>SEK/month</span></div>
                <ul style={styles.planFeatures}>
                  <li>✓ Up to 25 employees</li>
                  <li>✓ 3 branches</li>
                  <li>✓ 200 emails/month</li>
                  <li>✓ Basic reports</li>
                  <li>✓ Email support</li>
                </ul>
              </div>
              
              <div onClick={() => setSelectedPlan('standard')} style={{...styles.planCard, borderColor: selectedPlan === 'standard' ? '#00d1ff' : 'rgba(255,255,255,0.2)', background: selectedPlan === 'standard' ? 'rgba(0,209,255,0.1)' : 'rgba(255,255,255,0.05)'}}>
                <h3>💰 Standard</h3>
                <div style={styles.planPrice}>799<span>SEK/month</span></div>
                <ul style={styles.planFeatures}>
                  <li>✓ Up to 50 employees</li>
                  <li>✓ 5 branches</li>
                  <li>✓ 400 emails/month</li>
                  <li>✓ Standard reports</li>
                  <li>✓ Email support</li>
                </ul>
              </div>
              
              <div onClick={() => setSelectedPlan('pro')} style={{...styles.planCard, borderColor: selectedPlan === 'pro' ? '#00d1ff' : 'rgba(255,255,255,0.2)', background: selectedPlan === 'pro' ? 'rgba(0,209,255,0.1)' : 'rgba(255,255,255,0.05)'}}>
                <h3>💰 Pro</h3>
                <div style={styles.planPrice}>1,299<span>SEK/month</span></div>
                <ul style={styles.planFeatures}>
                  <li>✓ Up to 100 employees</li>
                  <li>✓ 8 branches</li>
                  <li>✓ 700 emails/month</li>
                  <li>✓ Advanced reports</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
              
              <div onClick={() => setSelectedPlan('business')} style={{...styles.planCard, borderColor: selectedPlan === 'business' ? '#00d1ff' : 'rgba(255,255,255,0.2)', background: selectedPlan === 'business' ? 'rgba(0,209,255,0.1)' : 'rgba(255,255,255,0.05)'}}>
                <h3>💎 Business</h3>
                <div style={styles.planPrice}>2,499<span>SEK/month</span></div>
                <ul style={styles.planFeatures}>
                  <li>✓ Up to 250 employees</li>
                  <li>✓ 15 branches</li>
                  <li>✓ 2,000 emails/month</li>
                  <li>✓ Advanced + Export</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
              
              <div onClick={() => setSelectedPlan('enterprise')} style={{...styles.planCard, borderColor: selectedPlan === 'enterprise' ? '#00d1ff' : 'rgba(255,255,255,0.2)', background: selectedPlan === 'enterprise' ? 'rgba(0,209,255,0.1)' : 'rgba(255,255,255,0.05)'}}>
                <h3>💎 Enterprise</h3>
                <div style={styles.planPrice}>4,999<span>SEK/month</span></div>
                <ul style={styles.planFeatures}>
                  <li>✓ Up to 500 employees</li>
                  <li>✓ 30 branches</li>
                  <li>✓ 5,000 emails/month</li>
                  <li>✓ Premium + Custom</li>
                  <li>✓ API access</li>
                </ul>
              </div>
              
              <div onClick={() => setSelectedPlan('corporate')} style={{...styles.planCard, borderColor: selectedPlan === 'corporate' ? '#00d1ff' : 'rgba(255,255,255,0.2)', background: selectedPlan === 'corporate' ? 'rgba(0,209,255,0.1)' : 'rgba(255,255,255,0.05)'}}>
                <h3>💎 Corporate</h3>
                <div style={styles.planPrice}>9,999<span>SEK/month</span></div>
                <ul style={styles.planFeatures}>
                  <li>✓ Up to 1,000 employees</li>
                  <li>✓ 60 branches</li>
                  <li>✓ 12,000 emails/month</li>
                  <li>✓ Premium+ reports</li>
                  <li>✓ 24/7 dedicated support</li>
                </ul>
              </div>
              <div onClick={() => setSelectedPlan('custom')} style={{...styles.planCard, borderColor: selectedPlan === 'custom' ? '#00d1ff' : 'rgba(255,255,255,0.2)', background: selectedPlan === 'custom' ? 'rgba(0,209,255,0.1)' : 'rgba(255,255,255,0.05)'}}>
                <h3>✏️ Custom</h3>
                <div style={styles.planPrice}>Set Your Own<span>Price</span></div>
                <ul style={styles.planFeatures}>
                  <li>✓ Custom employee limit</li>
                  <li>✓ Custom branch limit</li>
                  <li>✓ Custom email limit</li>
                  <li>✓ Custom admin limit</li>
                  <li>✓ Tailored pricing</li>
                </ul>
                <button onClick={(e) => { e.stopPropagation(); setShowCustomPlanModal(true); }} style={styles.customButton}>
                  Configure Custom Plan
                </button>
              </div>
            </div>
            
            <div style={styles.durationSelector}>
              <label style={{ fontSize: '14px' }}>Duration:</label>
              <select value={selectedDuration} onChange={(e) => setSelectedDuration(parseInt(e.target.value))} style={styles.durationSelect}>
                <option value={1}>1 month</option>
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
              </select>
            </div>
            
            <div style={styles.priceSummary}>
              <strong>Total:</strong> {getPlanPrice(selectedPlan, selectedDuration)} SEK
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowPlanModal(false)} style={styles.cancelButton}>{lang.cancel}</button>
              <button onClick={handleChangePlan} style={styles.submitButton}>{lang.changeTo} {getPlanDisplayName(selectedPlan)}</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Plan Modal */}
      {showCustomPlanModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCustomPlanModal(false)}>
          <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Custom Plan Configuration</h2>
            <p style={{ marginBottom: '20px', fontSize: '14px', color: '#00d1ff' }}>
              Set custom limits and pricing for <strong>{selectedOrg?.name}</strong>
            </p>
            
            <div style={styles.customForm}>
              <div style={styles.customField}>
                <label style={styles.label}>Max Employees</label>
                <input type="number" value={customPlanData.maxEmployees} onChange={(e) => setCustomPlanData({...customPlanData, maxEmployees: parseInt(e.target.value) || 0})} style={styles.input} min="1" max="10000" />
              </div>
              <div style={styles.customField}>
                <label style={styles.label}>Max Branches</label>
                <input type="number" value={customPlanData.maxBranches} onChange={(e) => setCustomPlanData({...customPlanData, maxBranches: parseInt(e.target.value) || 0})} style={styles.input} min="1" max="500" />
              </div>
              <div style={styles.customField}>
                <label style={styles.label}>Max Emails / Month</label>
                <input type="number" value={customPlanData.maxEmails} onChange={(e) => setCustomPlanData({...customPlanData, maxEmails: parseInt(e.target.value) || 0})} style={styles.input} min="100" max="100000" />
              </div>
              <div style={styles.customField}>
                <label style={styles.label}>Max Admins</label>
                <input type="number" value={customPlanData.maxAdmins} onChange={(e) => setCustomPlanData({...customPlanData, maxAdmins: parseInt(e.target.value) || 0})} style={styles.input} min="1" max="500" />
              </div>
              <div style={styles.customField}>
                <label style={styles.label}>Monthly Price (SEK)</label>
                <input type="number" value={customPlanData.price} onChange={(e) => setCustomPlanData({...customPlanData, price: parseInt(e.target.value) || 0})} style={styles.input} min="0" step="100" />
              </div>
              <div style={styles.pricePreview}>
                <h4>Price Summary:</h4>
                <p>Monthly: <strong>{customPlanData.price.toLocaleString()} SEK</strong></p>
                <p>Yearly (12 months): <strong>{(customPlanData.price * 12).toLocaleString()} SEK</strong></p>
                <p>VAT 25%: <strong>{(customPlanData.price * 0.25).toLocaleString()} SEK/month</strong></p>
              </div>
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowCustomPlanModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={() => { handleChangePlanCustom(customPlanData); setShowCustomPlanModal(false); }} style={styles.submitButton}>Apply Custom Plan</button>
            </div>
          </div>
        </div>
      )}

      {showUsersModal && (
        <div style={styles.modalOverlay} onClick={() => setShowUsersModal(false)}>
          <div style={{...styles.modal, maxWidth: '800px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {lang.manageUsers} - {selectedOrg?.name}
              <button onClick={() => setShowCreateUserModal(true)} style={styles.addUserButton}>
                <i className="fas fa-plus"></i> {lang.addUser}
              </button>
            </h2>
            
            <div style={styles.usersTableContainer}>
              {!selectedOrgUsers || selectedOrgUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                  <i className="fas fa-users" style={{ fontSize: '32px', marginBottom: '16px', display: 'block' }}></i>
                  No users found. Click "Add User" to create one.
                </div>
              ) : (
                <table style={styles.usersTable}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th>Name</th><th>Email</th><th>{lang.role}</th><th>{lang.status}</th><th>{lang.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrgUsers.map((user) => (
                      <tr key={user._id} style={styles.tableRow}>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>
                          <span style={{
                            ...styles.roleBadge,
                            background: user.role === 'superadmin' ? '#8b5cf6' : 
                                        user.role === 'admin' ? '#3b82f6' : '#10b981'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            ...styles.statusBadge,
                            background: user.isActive ? '#10b981' : '#ef4444'
                          }}>
                            {user.isActive ? lang.active : lang.paused}
                          </span>
                        </td>
                        <td>
                          <div style={styles.actionButtons}>
                            <button onClick={() => { setSelectedUser(user); setShowResetPasswordModal(true); }} style={styles.resetButton} title={lang.resetPassword}>
                              <i className="fas fa-key"></i>
                            </button>
                            <button onClick={() => handleDeleteUser(user._id, user.role, user.name)} style={styles.deleteButton} title={lang.delete}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div style={styles.modalButtons}>
              <button onClick={() => setShowUsersModal(false)} style={styles.cancelButton}>{lang.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateUserModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.addUser}</h2>
            <form onSubmit={handleCreateUser}>
              <input type="text" placeholder={lang.fullName} value={newUserData.name} onChange={(e) => setNewUserData({...newUserData, name: e.target.value})} style={styles.input} required />
              <input type="email" placeholder={lang.email} value={newUserData.email} onChange={(e) => setNewUserData({...newUserData, email: e.target.value})} style={styles.input} required />
              <input type="password" placeholder={lang.password} value={newUserData.password} onChange={(e) => setNewUserData({...newUserData, password: e.target.value})} style={styles.input} required />
              <select value={newUserData.role} onChange={(e) => setNewUserData({...newUserData, role: e.target.value})} style={styles.select}>
                <option value="superadmin">{lang.superAdmin}</option>
                <option value="admin">{lang.admin}</option>
              </select>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateUserModal(false)} style={styles.cancelButton}>{lang.cancel}</button>
                <button type="submit" style={styles.submitButton}>{lang.createUser}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div style={styles.modalOverlay} onClick={() => setShowResetPasswordModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.resetPassword}</h2>
            <p>{lang.resetPassword} for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})</p>
            <input type="password" placeholder={lang.newPassword} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={styles.input} required />
            <div style={styles.modalButtons}>
              <button onClick={() => setShowResetPasswordModal(false)} style={styles.cancelButton}>{lang.cancel}</button>
              <button onClick={handleResetUserPassword} style={styles.submitButton}>{lang.resetPassword}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.deleteOrganization}</h2>
            <p>{lang.deleteOrganization} <strong>{selectedOrg?.name}</strong>?</p>
            <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>⚠️ {lang.deleteWarning}</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteConfirm(false)} style={styles.cancelButton}>{lang.cancel}</button>
              <button onClick={handleDeleteOrg} style={styles.confirmDeleteButton}>{lang.deleteForever}</button>
            </div>
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
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    zIndex: 2000,
    fontSize: '14px',
    animation: 'fadeInOut 3s ease',
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
    border: '3px solid rgba(0,209,255,0.3)',
    borderRadius: '50%',
    borderTopColor: '#00d1ff',
    animation: 'spin 1s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  headerRight: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  languageContainer: {
    position: 'relative',
  },
  languageButton: {
    padding: '10px 16px',
    background: 'rgba(0,209,255,0.2)',
    border: '1px solid #00d1ff',
    borderRadius: '50px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  languageDropdown: {
    position: 'absolute',
    top: '45px',
    right: '0',
    background: '#1e293b',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    zIndex: 100,
    minWidth: '120px',
  },
  languageOption: {
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontSize: '12px',
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
  logoutButton: {
    padding: '10px 24px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50px',
    color: 'white',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '24px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'transform 0.3s',
  },
  statIcon: {
    fontSize: '32px',
    color: '#00d1ff',
    marginBottom: '12px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  addButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
  },
  searchFilter: {
    display: 'flex',
    gap: '12px',
  },
  searchInput: {
    padding: '10px 16px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    width: '250px',
    fontSize: '14px',
  },
  filterSelect: {
    padding: '10px 16px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
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
  },
  th: {
    padding: '16px 12px',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: 'white',
  },
  td: {
    padding: '16px 12px',
    fontSize: '14px',
  },
  orgDetails: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '4px',
  },
  planBadge: {
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    display: 'inline-block',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  trialBadge: {
    background: 'rgba(255,255,255,0.3)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  extendButton: {
    background: 'rgba(16,185,129,0.2)',
    border: '1px solid #10b981',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#10b981',
    cursor: 'pointer',
  },
  pauseButton: {
    background: 'rgba(245,158,11,0.2)',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#f59e0b',
    cursor: 'pointer',
  },
  resumeButton: {
    background: 'rgba(16,185,129,0.2)',
    border: '1px solid #10b981',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#10b981',
    cursor: 'pointer',
  },
  deleteButton: {
    background: 'rgba(239,68,68,0.2)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#ef4444',
    cursor: 'pointer',
  },
  planButton: {
    background: 'rgba(139,92,246,0.2)',
    border: '1px solid #8b5cf6',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#8b5cf6',
    cursor: 'pointer',
  },
  usersButton: {
    background: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#3b82f6',
    cursor: 'pointer',
  },
  editButton: {
    background: 'rgba(59,130,246,0.2)',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#3b82f6',
    cursor: 'pointer',
  },
  saveButton: {
    background: 'rgba(16,185,129,0.2)',
    border: '1px solid #10b981',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#10b981',
    cursor: 'pointer',
  },
  inlineInput: {
    background: '#0f172a',
    border: '1px solid #00d1ff',
    borderRadius: '4px',
    padding: '6px 8px',
    color: 'white',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box',
  },
  inlineSelect: {
    background: '#0f172a',
    border: '1px solid #00d1ff',
    borderRadius: '4px',
    padding: '6px 8px',
    color: 'white',
    fontSize: '13px',
    width: '100%',
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
    padding: '24px',
    maxWidth: '550px',
    width: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  modalLarge: {
    background: '#1e293b',
    borderRadius: '24px',
    padding: '24px',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '24px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    marginBottom: '16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    marginBottom: '16px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
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
  confirmDeleteButton: {
    flex: 1,
    padding: '12px',
    background: '#ef4444',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
  },
  planOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '4px',
  },
  planCard: {
    padding: '12px',
    borderRadius: '12px',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  planPrice: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '8px 0',
  },
  planFeatures: {
    listStyle: 'none',
    padding: 0,
    fontSize: '11px',
  },
  durationSelector: {
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  durationSelect: {
    padding: '8px 12px',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    flex: 1,
  },
  priceSummary: {
    padding: '10px',
    background: 'rgba(0,209,255,0.1)',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '16px',
  },
  addUserButton: {
    float: 'right',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    marginLeft: 'auto',
  },
  usersTableContainer: {
    overflowX: 'auto',
    marginBottom: '20px',
  },
  usersTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  resetButton: {
    background: 'rgba(245, 158, 11, 0.2)',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#f59e0b',
    cursor: 'pointer',
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    display: 'inline-block',
  },
  customButton: {
    marginTop: '10px',
    padding: '6px 12px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '11px',
    width: '100%',
  },
  customForm: {
    marginBottom: '20px',
  },
  customField: {
    marginBottom: '16px',
  },
  pricePreview: {
    marginTop: '16px',
    padding: '16px',
    background: 'rgba(0,209,255,0.1)',
    borderRadius: '8px',
  },
};

// Add animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(20px); }
    15% { opacity: 1; transform: translateX(0); }
    85% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(20px); }
  }
  input:focus, select:focus {
    border-color: #00d1ff !important;
    outline: none;
  }
  .statCard:hover {
    transform: translateY(-4px);
  }
  select option {
    background: #1e293b;
    color: white;
    padding: 8px;
  }
  select option:hover {
    background: #00d1ff;
    color: #0f172a;
  }
  input, select, textarea {
    color: white !important;
  }
  input::placeholder, textarea::placeholder {
    color: rgba(255,255,255,0.5);
  }
`;
document.head.appendChild(styleSheet);

export default MasterDashboard;