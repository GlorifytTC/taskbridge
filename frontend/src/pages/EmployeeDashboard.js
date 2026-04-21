import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const EmployeeDashboard = ({ user, onLogout }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableTasks, setAvailableTasks] = useState([]);
  const [approvedShifts, setApprovedShifts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileData, setProfileData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);
  const [lastApprovedCount, setLastApprovedCount] = useState(0);

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

  const t = {
    en: {
      employeeDashboard: 'Employee Dashboard',
      yourSchedule: 'Your schedule and available shifts',
      profile: 'Profile',
      logout: 'Logout',
      availableJobs: 'Available Jobs for You',
      approvedShifts: 'Approved Shifts',
      totalHours: 'Total Hours',
      organization: 'Organization',
      noAvailableJobs: 'No available jobs at the moment',
      apply: 'Apply',
      applied: 'Applied',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      role: 'Role',
      branch: 'Branch',
      slots: 'Slots',
      description: 'Description',
      confirmApplication: 'Confirm Application',
      cancel: 'Cancel',
      shiftApproved: 'Shift Approved!',
      shiftApprovedMessage: 'Your application for {taskTitle} has been approved!',
      shiftRejected: 'Shift Rejected',
      shiftRejectedMessage: 'Your application for {taskTitle} was rejected. Reason: {reason}',
      notesFromAdmin: 'Notes from Admin',
      profileSettings: 'Profile Settings',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      jobRole: 'Job Role',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      updatePassword: 'Update Password',
      dangerZone: 'Danger Zone',
      deleteAccount: 'Delete My Account',
      deleteWarning: 'This will permanently delete your account and all your data.',
      notifications: 'Notifications',
      noNotifications: 'No new notifications',
      newShiftApproved: 'New Shift Approved',
      language: 'Language',
      swedish: 'Svenska',
      english: 'English'
    },
    sv: {
      employeeDashboard: 'Anställd Dashboard',
      yourSchedule: 'Ditt schema och tillgängliga pass',
      profile: 'Profil',
      logout: 'Logga ut',
      availableJobs: 'Lediga Jobb för Dig',
      approvedShifts: 'Godkända Pass',
      totalHours: 'Totalt Timmar',
      organization: 'Organisation',
      noAvailableJobs: 'Inga lediga jobb just nu',
      apply: 'Ansök',
      applied: 'Ansökt',
      date: 'Datum',
      time: 'Tid',
      location: 'Plats',
      role: 'Roll',
      branch: 'Avdelning',
      slots: 'Platser',
      description: 'Beskrivning',
      confirmApplication: 'Bekräfta Ansökan',
      cancel: 'Avbryt',
      shiftApproved: 'Pass Godkänt!',
      shiftApprovedMessage: 'Din ansökan för {taskTitle} har godkänts!',
      shiftRejected: 'Pass Nekat',
      shiftRejectedMessage: 'Din ansökan för {taskTitle} nekades. Anledning: {reason}',
      notesFromAdmin: 'Anteckningar från Admin',
      profileSettings: 'Profilinställningar',
      name: 'Namn',
      email: 'E-post',
      role: 'Roll',
      jobRole: 'Jobbroll',
      changePassword: 'Byt Lösenord',
      currentPassword: 'Nuvarande Lösenord',
      newPassword: 'Nytt Lösenord',
      confirmPassword: 'Bekräfta Nytt Lösenord',
      updatePassword: 'Uppdatera Lösenord',
      dangerZone: 'Riskzon',
      deleteAccount: 'Radera Mitt Konto',
      deleteWarning: 'Detta kommer att permanent radera ditt konto och all din data.',
      notifications: 'Notiser',
      noNotifications: 'Inga nya notiser',
      newShiftApproved: 'Nytt Pass Godkänt',
      language: 'Språk',
      swedish: 'Svenska',
      english: 'Engelska'
    }
  };

  const lang = t[language];
  const isSmall = screenWidth <= 480;

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('taskbridge_language', langCode);
    setShowLanguageDropdown(false);
    setChatMessages([{
      text: langCode === 'en' 
        ? "Hello! I'm your TaskBridge AI Assistant. How can I help you today?" 
        : "Hej! Jag är din TaskBridge AI-assistent. Hur kan jag hjälpa dig idag?",
      sender: 'ai',
      time: new Date().toLocaleTimeString()
    }]);
  };

  useEffect(() => {
    fetchEmployeeData();
    const savedLogo = localStorage.getItem('organizationLogo');
    if (savedLogo) setLogoPreview(savedLogo);
    
    const interval = setInterval(() => {
      fetchEmployeeData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchEmployeeData = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const appsRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/applications/my-applications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const appsData = await appsRes.json();
    
    const allApps = appsData.data || [];
    
    const appsWithTasks = await Promise.all(allApps.map(async (app) => {
      if (app.task && typeof app.task === 'object' && app.task._id) {
        return app;
      } else if (app.task) {
        const taskRes = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/tasks/${app.task}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const taskData = await taskRes.json();
        return { ...app, task: taskData.data };
      }
      return app;
    }));
    
    const previousApprovedCount = lastApprovedCount;
    const currentApprovedApps = appsWithTasks.filter(app => app.status === 'approved');
    const currentApprovedCount = currentApprovedApps.length;
    
    if (currentApprovedCount > previousApprovedCount && previousApprovedCount !== 0) {
      const newApprovedApps = currentApprovedApps.filter(app => {
        const wasNotApproved = !approvedShifts.some(prevApp => prevApp._id === app._id);
        return wasNotApproved;
      });
      
      const newNotifications = newApprovedApps.map(app => ({
        id: `approved-${app._id}-${Date.now()}`,
        title: lang.newShiftApproved,
        message: lang.shiftApprovedMessage.replace('{taskTitle}', app.task?.title || 'Shift'),
        time: new Date().toLocaleTimeString(),
        read: false,
        type: 'approved'
      }));
      
      setNotifications(prev => [...newNotifications, ...prev]);
      setNotificationCount(prev => prev + newNotifications.length);
    }
    
    setLastApprovedCount(currentApprovedCount);
    setApplications(appsWithTasks);
    
    const appliedTaskIds = appsWithTasks.map(app => app.task?._id || app.task);
    
    const tasksRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const tasksData = await tasksRes.json();
    
    const available = (tasksData.data || []).filter(task => 
      task.status === 'open' && !appliedTaskIds.includes(task._id)
    );
    setAvailableTasks(available);
    
    const approved = appsWithTasks.filter(app => app.status === 'approved');
    setApprovedShifts(approved);
    
  } catch (error) {
    console.error('Error fetching employee data:', error);
  } finally {
    setLoading(false);
  }
};

  const handleApplyForTask = async (taskId) => {
    const alreadyApplied = applications.some(app => app.task === taskId);
    if (alreadyApplied) {
      showMessage(language === 'en' ? 'You have already applied for this task' : 'Du har redan ansökt för denna uppgift', 'error');
      setAvailableTasks(prev => prev.filter(task => task._id !== taskId));
      setShowApplyModal(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/applications/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taskId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAvailableTasks(prev => prev.filter(task => task._id !== taskId));
        const newApplication = { task: taskId, status: 'pending' };
        setApplications(prev => [...prev, newApplication]);
        showMessage(language === 'en' ? 'Application submitted successfully!' : 'Ansökan skickades!', 'success');
        setShowApplyModal(false);
        fetchEmployeeData();
      } else {
        showMessage(data.message || (language === 'en' ? 'Failed to apply' : 'Kunde inte ansöka'), 'error');
      }
    } catch (error) {
      console.error('Error applying for task:', error);
      showMessage(language === 'en' ? 'Error applying for task' : 'Fel vid ansökan', 'error');
    }
  };

  const handleMarkNotificationAsRead = (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications([]);
    setNotificationCount(0);
    setShowNotifications(false);
  };

  const handleUpdatePassword = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      showMessage(language === 'en' ? 'New passwords do not match' : 'Lösenorden matchar inte', 'error');
      return;
    }
    if (profileData.newPassword && profileData.newPassword.length < 6) {
      showMessage(language === 'en' ? 'Password must be at least 6 characters' : 'Lösenordet måste vara minst 6 tecken', 'error');
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
        showMessage(language === 'en' ? 'Password changed successfully!' : 'Lösenordet ändrades!', 'success');
        setShowProfileModal(false);
        setProfileData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showMessage(language === 'en' ? 'Failed to change password' : 'Kunde inte ändra lösenord', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage(language === 'en' ? 'Error changing password' : 'Fel vid lösenordsändring', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(language === 'en' ? '⚠️ WARNING: This will delete YOUR account only. Are you sure?' : '⚠️ VARNING: Detta raderar ENDAST ditt konto. Är du säker?')) return;
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
      showMessage(language === 'en' ? 'Failed to delete account' : 'Kunde inte radera konto', 'error');
    }
  };

  const getApprovedTasksForDate = (date) => {
    return approvedShifts.filter(app => {
      if (!app.task) return false;
      const taskDate = new Date(app.task.date);
      return isSameDay(taskDate, date);
    });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
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
      
      if (input.includes('apply') || input.includes('ansök')) {
        response = language === 'en'
          ? "To apply for a job:\n1. Go to 'Available Jobs' section\n2. Click 'Apply' on the job you want\n3. Confirm your application\n4. Wait for admin approval"
          : "För att ansöka om ett jobb:\n1. Gå till 'Lediga Jobb' sektionen\n2. Klicka på 'Ansök' för jobbet du vill ha\n3. Bekräfta din ansökan\n4. Vänta på admin godkännande";
      } 
      else if (input.includes('calendar') || input.includes('kalender')) {
        response = language === 'en'
          ? "The calendar shows all your approved shifts. Green dots indicate days you have approved shifts. Click on any day to see details."
          : "Kalendern visar alla dina godkända pass. Gröna prickar indikerar dagar du har godkända pass. Klicka på en dag för att se detaljer.";
      }
      else if (input.includes('notification') || input.includes('notis')) {
        response = language === 'en'
          ? "You get notifications when your shifts are approved by admin. The bell icon shows how many unread notifications you have."
          : "Du får notiser när dina pass godkänns av admin. Klockikonen visar hur många olästa notiser du har.";
      }
      else {
        response = language === 'en'
          ? "I can help with:\n• Applying for jobs\n• Viewing your calendar\n• Understanding notifications\n• Changing your password\n• Managing your profile\n\nWhat would you like to know?"
          : "Jag kan hjälpa till med:\n• Ansöka om jobb\n• Visa din kalender\n• Förstå notiser\n• Ändra ditt lösenord\n• Hantera din profil\n\nVad vill du veta?";
      }
      
      const aiMessage = { text: response, sender: 'ai', time: new Date().toLocaleTimeString() };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsAiTyping(false);
    }, 800);
  };

  const renderDayCell = (day) => {
    const dayTasks = getApprovedTasksForDate(day);
    const isToday = isSameDay(day, new Date());
    const isCurrentMonth = isSameMonth(day, currentDate);
    
    return (
      <div
        key={day.toISOString()}
        onClick={() => dayTasks.length > 0 && handleTaskClick(dayTasks[0].task)}
        style={{
          ...styles.dayCell,
          background: isToday ? 'rgba(0,209,255,0.15)' : 'rgba(255,255,255,0.03)',
          border: isToday ? '1px solid #00d1ff' : '1px solid rgba(255,255,255,0.1)',
          opacity: isCurrentMonth ? 1 : 0.5,
          cursor: dayTasks.length > 0 ? 'pointer' : 'default',
          minHeight: isSmall ? '60px' : '80px',
          padding: isSmall ? '4px' : '6px',
        }}
      >
        <div style={{...styles.dayNumber, fontSize: isSmall ? '10px' : '12px'}}>{format(day, 'd')}</div>
        <div style={styles.dayTasks}>
          {dayTasks.slice(0, isSmall ? 1 : 2).map(app => {
            const task = app.task;
            return (
              <div
                key={app._id}
                style={{
                  ...styles.taskDot,
                  backgroundColor: '#10b981',
                  fontSize: isSmall ? '7px' : '9px',
                  padding: isSmall ? '1px 3px' : '2px 4px',
                }}
                title={task?.title}
              >
                {task?.title?.length > (isSmall ? 10 : 20) ? task.title.substring(0, isSmall ? 10 : 20) + '...' : task?.title}
              </div>
            );
          })}
          {dayTasks.length > (isSmall ? 1 : 2) && (
            <div style={{...styles.moreTasks, fontSize: isSmall ? '7px' : '9px'}}>+{dayTasks.length - (isSmall ? 1 : 2)} more</div>
          )}
        </div>
      </div>
    );
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
      {message.text && (
        <div style={{...styles.messageToast, background: message.type === 'success' ? '#10b981' : '#ef4444'}}>
          {message.text}
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
              <h1 style={{...styles.title, fontSize: isSmall ? '18px' : '22px'}}>{lang.employeeDashboard}</h1>
              <span style={{...styles.userNameBadge, fontSize: isSmall ? '10px' : '11px'}}>
                <i className="fas fa-user"></i> {user?.name}
              </span>
            </div>
            <p style={{...styles.subtitle, fontSize: isSmall ? '10px' : '11px'}}>{lang.yourSchedule}</p>
          </div>
        </div>
        <div style={{...styles.headerButtons, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end'}}>
          <div style={styles.languageContainer}>
            <button onClick={() => setShowLanguageDropdown(!showLanguageDropdown)} style={{...styles.languageButton, fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 10px' : '6px 12px'}}>
              <i className="fas fa-globe"></i> {language === 'en' ? 'EN' : 'SV'}
            </button>
            {showLanguageDropdown && (
              <div style={styles.languageDropdown}>
                <button onClick={() => changeLanguage('en')} style={styles.languageOption}>🇬🇧 {lang.english}</button>
                <button onClick={() => changeLanguage('sv')} style={styles.languageOption}>🇸🇪 {lang.swedish}</button>
              </div>
            )}
          </div>
          <div style={styles.notificationContainer}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{...styles.notificationButton, fontSize: isSmall ? '12px' : '14px', padding: isSmall ? '5px 10px' : '6px 12px'}}>
              <i className="fas fa-bell"></i>
              {notificationCount > 0 && (
                <span style={{...styles.notificationBadge, width: isSmall ? '14px' : '16px', height: isSmall ? '14px' : '16px', fontSize: isSmall ? '8px' : '10px'}}>{notificationCount > 9 ? '9+' : notificationCount}</span>
              )}
            </button>
            {showNotifications && (
              <div style={{...styles.notificationDropdown, width: isSmall ? '260px' : '280px'}}>
                <div style={styles.notificationHeader}>
                  <span style={styles.notificationHeaderTitle}>{lang.notifications}</span>
                  {notificationCount > 0 && (
                    <button onClick={handleMarkAllNotificationsAsRead} style={styles.markAllReadButton}>Mark all read</button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={styles.noNotifications}>{lang.noNotifications}</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} style={styles.notificationItem} onClick={() => handleMarkNotificationAsRead(notif.id)}>
                      <div style={{...styles.notificationTitle, fontSize: isSmall ? '11px' : '12px'}}>{notif.title}</div>
                      <div style={{...styles.notificationMessage, fontSize: isSmall ? '10px' : '11px'}}>{notif.message}</div>
                      <div style={{...styles.notificationTime, fontSize: isSmall ? '8px' : '9px'}}>{notif.time}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button onClick={() => setShowProfileModal(true)} style={{...styles.profileButton, fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 12px' : '6px 14px'}}>{lang.profile}</button>
          <button onClick={onLogout} style={{...styles.logoutButton, fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '5px 12px' : '6px 14px'}}>{lang.logout}</button>
        </div>
      </div>

      <div style={{...styles.statsGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(100px, 1fr))'}}>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-briefcase" style={{ color: '#00d1ff' }}></i></div>
          <div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '22px'}}>{availableTasks.length}</div>
          <div style={{...styles.statLabelSmall, fontSize: isSmall ? '9px' : '10px'}}>{lang.availableJobs}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-calendar-check" style={{ color: '#00d1ff' }}></i></div>
          <div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '22px'}}>{approvedShifts.length}</div>
          <div style={{...styles.statLabelSmall, fontSize: isSmall ? '9px' : '10px'}}>{lang.approvedShifts}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-clock" style={{ color: '#00d1ff' }}></i></div>
          <div style={{...styles.statValueSmall, fontSize: isSmall ? '18px' : '22px'}}>
            {approvedShifts.reduce((total, app) => {
              if (app.task) {
                const start = new Date(`1970-01-01T${app.task.startTime}`);
                const end = new Date(`1970-01-01T${app.task.endTime}`);
                const hours = (end - start) / (1000 * 60 * 60);
                return total + hours;
              }
              return total;
            }, 0).toFixed(1)}
          </div>
          <div style={{...styles.statLabelSmall, fontSize: isSmall ? '9px' : '10px'}}>{lang.totalHours}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-building" style={{ color: '#00d1ff' }}></i></div>
          <div style={{...styles.statValueSmall, fontSize: isSmall ? '16px' : '22px'}}>{user?.organization?.name?.substring(0, isSmall ? 8 : 10) || 'N/A'}</div>
          <div style={{...styles.statLabelSmall, fontSize: isSmall ? '9px' : '10px'}}>{lang.organization}</div>
        </div>
      </div>

      <div style={{...styles.sectionCard, padding: isSmall ? '12px' : '16px'}}>
        <h3 style={{...styles.sectionTitle, fontSize: isSmall ? '14px' : '16px'}}>{lang.availableJobs}</h3>
        <div style={styles.tasksList}>
          {availableTasks.length === 0 ? (
            <p style={{...styles.noTasks, fontSize: isSmall ? '12px' : '14px'}}>{lang.noAvailableJobs}</p>
          ) : (
            availableTasks.slice(0, isSmall ? 3 : 5).map(task => {
              const alreadyApplied = applications.some(app => app.task === task._id);
              return (
                <div key={task._id} style={{...styles.taskItem, padding: isSmall ? '10px' : '12px'}}>
                  <div style={styles.taskItemInfo}>
                    <div style={{...styles.taskItemTitle, fontSize: isSmall ? '13px' : '14px'}}>{task.title}</div>
                    <div style={{...styles.taskItemDetails, fontSize: isSmall ? '9px' : '10px'}}>
                      <span><i className="fas fa-calendar"></i> {new Date(task.date).toLocaleDateString()}</span>
                      {!isSmall && <span><i className="fas fa-clock"></i> {task.startTime} - {task.endTime}</span>}
                      <span><i className="fas fa-map-marker-alt"></i> {task.location || lang.location}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (alreadyApplied) {
                        showMessage(language === 'en' ? 'You have already applied for this task' : 'Du har redan ansökt för denna uppgift', 'error');
                      } else {
                        setSelectedTask(task);
                        setShowApplyModal(true);
                      }
                    }} 
                    style={{...styles.applyButton, background: alreadyApplied ? '#6b7280' : 'linear-gradient(135deg, #00f5ff, #00d1ff)', fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '4px 12px' : '6px 16px'}}
                    disabled={alreadyApplied}
                  >
                    {alreadyApplied ? lang.applied : lang.apply}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{...styles.sectionCard, padding: isSmall ? '12px' : '16px', overflowX: isSmall ? 'auto' : 'visible'}}>
        <div style={{...styles.calendarHeader, flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'center' : 'center'}}>
          <div style={styles.headerLeft}>
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} style={{...styles.navButton, fontSize: isSmall ? '12px' : '14px', padding: isSmall ? '4px 10px' : '6px 12px'}}>←</button>
            <h2 style={{...styles.monthTitle, fontSize: isSmall ? '16px' : '18px'}}>{format(currentDate, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} style={{...styles.navButton, fontSize: isSmall ? '12px' : '14px', padding: isSmall ? '4px 10px' : '6px 12px'}}>→</button>
          </div>
        </div>

        <div style={{...styles.weekHeaders, gap: isSmall ? '3px' : '6px'}}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} style={{...styles.weekDay, fontSize: isSmall ? '9px' : '11px', padding: isSmall ? '4px' : '6px'}}>{day}</div>
          ))}
        </div>

        <div style={{...styles.calendarGrid, gap: isSmall ? '3px' : '6px'}}>
          {getMonthDays().map(day => renderDayCell(day))}
        </div>

        <div style={{...styles.legend, gap: isSmall ? '10px' : '20px', fontSize: isSmall ? '9px' : '10px'}}>
          <div><span style={{...styles.legendDot, width: isSmall ? '6px' : '8px', height: isSmall ? '6px' : '8px'}}></span> {lang.approvedShifts}</div>
        </div>
      </div>

      {showApplyModal && selectedTask && (
        <div style={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
          <div style={{...styles.modalLarge, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '400px' : '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '18px'}}>{lang.applyForShift}</h2>
              <button onClick={() => setShowApplyModal(false)} style={styles.closeButton}>✕</button>
            </div>
            <div style={{...styles.taskInfoCard, padding: isSmall ? '12px' : '14px'}}>
              <h3 style={{fontSize: isSmall ? '15px' : '18px', color: 'white'}}>{selectedTask.title}</h3>
              <div style={{...styles.taskInfoRow, fontSize: isSmall ? '11px' : '12px'}}>
                <span><strong style={{color: '#00d1ff'}}>{lang.date}:</strong> <span style={{color: 'white'}}>{new Date(selectedTask.date).toLocaleDateString()}</span></span>
                <span><strong style={{color: '#00d1ff'}}>{lang.time}:</strong> <span style={{color: 'white'}}>{selectedTask.startTime} - {selectedTask.endTime}</span></span>
              </div>
              <div style={{...styles.taskInfoRow, fontSize: isSmall ? '11px' : '12px'}}>
                <span><strong style={{color: '#00d1ff'}}>{lang.location}:</strong> <span style={{color: 'white'}}>{selectedTask.location || lang.location}</span></span>
                <span><strong style={{color: '#00d1ff'}}>{lang.role}:</strong> <span style={{color: 'white'}}>{selectedTask.jobDescription?.name}</span></span>
              </div>
              <div style={{...styles.taskInfoRow, fontSize: isSmall ? '11px' : '12px'}}>
                <span><strong style={{color: '#00d1ff'}}>{lang.branch}:</strong> <span style={{color: 'white'}}>{selectedTask.branch?.name}</span></span>
                <span><strong style={{color: '#00d1ff'}}>{lang.slots}:</strong> <span style={{color: 'white'}}>{selectedTask.currentEmployees}/{selectedTask.maxEmployees}</span></span>
              </div>
              {selectedTask.description && (
                <div style={{...styles.taskDescription, fontSize: isSmall ? '11px' : '12px'}}>
                  <strong style={{color: '#00d1ff'}}>{lang.description}:</strong><br/><span style={{color: 'white'}}>{selectedTask.description}</span>
                </div>
              )}
            </div>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowApplyModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.cancel}</button>
              <button onClick={() => handleApplyForTask(selectedTask._id)} style={{...styles.submitButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.confirmApplication}</button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && selectedTask && (
        <div style={styles.modalOverlay} onClick={() => setShowTaskModal(false)}>
          <div style={{...styles.modalLarge, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '400px' : '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '18px'}}>{selectedTask.title}</h2>
              <button onClick={() => setShowTaskModal(false)} style={styles.closeButton}>✕</button>
            </div>
            
            <div style={{...styles.taskInfoCard, padding: isSmall ? '12px' : '14px'}}>
              <div style={{...styles.taskInfoRow, fontSize: isSmall ? '11px' : '12px'}}>
                <span><strong style={{color: '#00d1ff'}}>{lang.date}:</strong> <span style={{color: 'white'}}>{new Date(selectedTask.date).toLocaleDateString()}</span></span>
                <span><strong style={{color: '#00d1ff'}}>{lang.time}:</strong> <span style={{color: 'white'}}>{selectedTask.startTime} - {selectedTask.endTime}</span></span>
              </div>
              <div style={{...styles.taskInfoRow, fontSize: isSmall ? '11px' : '12px'}}>
                <span><strong style={{color: '#00d1ff'}}>{lang.location}:</strong> <span style={{color: 'white'}}>{selectedTask.location || lang.location}</span></span>
                <span><strong style={{color: '#00d1ff'}}>{lang.role}:</strong> <span style={{color: 'white'}}>{selectedTask.jobDescription?.name}</span></span>
              </div>
              <div style={{...styles.taskInfoRow, fontSize: isSmall ? '11px' : '12px'}}>
                <span><strong style={{color: '#00d1ff'}}>{lang.branch}:</strong> <span style={{color: 'white'}}>{selectedTask.branch?.name}</span></span>
              </div>
              {selectedTask.description && (
                <div style={{...styles.taskDescription, fontSize: isSmall ? '11px' : '12px'}}>
                  <strong style={{color: '#00d1ff'}}>{lang.notesFromAdmin}:</strong><br/><span style={{color: 'white'}}>{selectedTask.description}</span>
                </div>
              )}
            </div>
            
            <div style={{...styles.taskStatusCard, padding: isSmall ? '12px' : '14px'}}>
              <div style={{...styles.statusIcon, fontSize: isSmall ? '20px' : '24px'}}>✅</div>
              <div>
                <div style={{...styles.statusTitle, fontSize: isSmall ? '13px' : '14px'}}>{lang.shiftApproved}</div>
                <div style={{...styles.statusText, fontSize: isSmall ? '10px' : '11px'}}>{lang.shiftApprovedMessage.replace('{taskTitle}', selectedTask.title)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '400px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '18px', color: 'white'}}>{lang.profileSettings}</h2>
            <div style={{...styles.profileInfo, padding: isSmall ? '10px' : '12px', fontSize: isSmall ? '11px' : '13px'}}>
              <p><strong style={{color: '#00d1ff'}}>{lang.name}:</strong> <span style={{color: 'white'}}>{user?.name}</span></p>
              <p><strong style={{color: '#00d1ff'}}>{lang.email}:</strong> <span style={{color: 'white'}}>{user?.email}</span></p>
              <p><strong style={{color: '#00d1ff'}}>{lang.role}:</strong> <span style={{color: 'white'}}>Employee</span></p>
              <p><strong style={{color: '#00d1ff'}}>{lang.organization}:</strong> <span style={{color: 'white'}}>{user?.organization?.name}</span></p>
              {user?.jobDescription && <p><strong style={{color: '#00d1ff'}}>{lang.jobRole}:</strong> <span style={{color: 'white'}}>{user.jobDescription.name}</span></p>}
              {user?.branch && <p><strong style={{color: '#00d1ff'}}>{lang.branch}:</strong> <span style={{color: 'white'}}>{user.branch.name}</span></p>}
            </div>
            <h3 style={{...styles.subTitle, fontSize: isSmall ? '13px' : '14px', color: 'white'}}>{lang.changePassword}</h3>
            <input type="password" placeholder={lang.currentPassword} value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
            <input type="password" placeholder={lang.newPassword} value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
            <input type="password" placeholder={lang.confirmPassword} value={profileData.confirmPassword} onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})} style={{...styles.input, fontSize: isSmall ? '11px' : '12px', color: 'white'}} />
            <button onClick={handleUpdatePassword} style={{...styles.submitButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.updatePassword}</button>
            <div style={styles.dangerZone}>
              <h3 style={{ color: '#ef4444', fontSize: isSmall ? '13px' : '14px' }}>{lang.dangerZone}</h3>
              <button onClick={() => { setShowProfileModal(false); setShowDeleteAccountModal(true); }} style={{...styles.deleteAccountButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.deleteAccount}</button>
              <p style={{...styles.warningText, fontSize: isSmall ? '9px' : '10px'}}>⚠️ {lang.deleteWarning}</p>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteAccountModal(false)}>
          <div style={{...styles.modal, width: isSmall ? '95%' : '90%', maxWidth: isSmall ? '350px' : '400px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{...styles.modalTitle, fontSize: isSmall ? '16px' : '18px', color: 'white'}}>{lang.deleteAccount}</h2>
            <p style={{color: 'white', fontSize: isSmall ? '12px' : '14px'}}>{language === 'en' ? 'Are you sure you want to delete your account?' : 'Är du säker på att du vill radera ditt konto?'}</p>
            <p style={{ color: '#ef4444', fontSize: isSmall ? '11px' : '13px' }}>⚠️ {language === 'en' ? 'This action cannot be undone. Your personal data will be removed.' : 'Denna åtgärd kan inte ångras. Din personliga data kommer att raderas.'}</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteAccountModal(false)} style={{...styles.cancelButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.cancel}</button>
              <button onClick={handleDeleteAccount} style={{...styles.confirmDeleteButton, fontSize: isSmall ? '11px' : '12px'}}>{lang.deleteAccount}</button>
            </div>
          </div>
        </div>
      )}

      <button style={{...styles.chatButton, width: isSmall ? '40px' : '45px', height: isSmall ? '40px' : '45px', fontSize: isSmall ? '16px' : '18px'}} onClick={() => setShowChat(!showChat)}>
        <i className="fas fa-robot"></i>
      </button>

      {showChat && (
        <div style={{...styles.chatModal, width: isSmall ? '260px' : '300px', height: isSmall ? '350px' : '450px', bottom: isSmall ? '70px' : '80px'}}>
          <div style={styles.chatHeader}>
            <span><i className="fas fa-robot"></i> AI Assistant</span>
            <button onClick={() => setShowChat(false)} style={styles.chatClose}>✕</button>
          </div>
          <div style={styles.chatMessages}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{...styles.chatMessage, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'}}>
                <div style={{...styles.messageBubble, background: msg.sender === 'user' ? '#00d1ff' : '#1e293b', fontSize: isSmall ? '10px' : '12px'}}>
                  {msg.sender === 'ai' && <i className="fas fa-robot"></i>} {msg.text}
                  <div style={{...styles.messageTime, fontSize: isSmall ? '8px' : '9px'}}>{msg.time}</div>
                </div>
              </div>
            ))}
            {isAiTyping && <div style={{...styles.typingIndicator, fontSize: isSmall ? '9px' : '11px'}}>AI is typing...</div>}
          </div>
          <div style={styles.chatInputContainer}>
            <input type="text" placeholder={language === 'en' ? "Ask me..." : "Fråga mig..."} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()} style={{...styles.chatInput, fontSize: isSmall ? '10px' : '12px', color: 'white'}} />
            <button onClick={sendChatMessage} style={{...styles.chatSend, fontSize: isSmall ? '11px' : '12px'}}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '20px', fontFamily: 'Inter, sans-serif', position: 'relative' },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' },
  loadingSpinner: { width: '40px', height: '40px', border: '3px solid rgba(0,209,255,0.3)', borderRadius: '50%', borderTopColor: '#00d1ff', animation: 'spin 1s linear infinite' },
  messageToast: { position: 'fixed', top: '20px', right: '20px', padding: '12px 20px', borderRadius: '8px', color: 'white', zIndex: 2000, fontSize: '14px', animation: 'fadeInOut 3s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  logoSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  orgLogo: { width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' },
  logoPlaceholder: { width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  title: { fontWeight: 'bold', color: 'white', margin: 0 },
  userNameBadge: { background: 'rgba(0,209,255,0.2)', padding: '4px 10px', borderRadius: '20px', color: '#00d1ff' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: '2px' },
  headerButtons: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  languageContainer: { position: 'relative' },
  languageButton: { background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '20px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  languageDropdown: { position: 'absolute', top: '35px', right: '0', background: '#1e293b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100, minWidth: '120px' },
  languageOption: { padding: '8px 12px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '12px' },
  notificationContainer: { position: 'relative' },
  notificationButton: { background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '20px', color: 'white', cursor: 'pointer', position: 'relative' },
  notificationBadge: { position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  notificationDropdown: { position: 'absolute', top: '40px', right: '0', background: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100, maxHeight: '300px', overflowY: 'auto' },
  notificationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  notificationHeaderTitle: { fontSize: '13px', fontWeight: '600', color: '#00d1ff' },
  markAllReadButton: { fontSize: '10px', background: 'none', border: 'none', color: '#00d1ff', cursor: 'pointer' },
  noNotifications: { padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' },
  notificationItem: { padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' },
  notificationTitle: { fontWeight: '600', color: '#00d1ff', marginBottom: '4px' },
  notificationMessage: { color: 'rgba(255,255,255,0.7)' },
  notificationTime: { color: 'rgba(255,255,255,0.4)', marginTop: '4px' },
  profileButton: { background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '20px', color: 'white', cursor: 'pointer' },
  logoutButton: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer' },
  statsGrid: { display: 'grid', gap: '10px', marginBottom: '20px' },
  statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: 'center' },
  statIconSmall: { fontSize: '20px', marginBottom: '6px' },
  statValueSmall: { fontWeight: 'bold', color: 'white' },
  statLabelSmall: { color: 'rgba(255,255,255,0.6)' },
  sectionCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '20px' },
  sectionTitle: { fontWeight: '600', color: 'white', marginBottom: '12px' },
  tasksList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', flexWrap: 'wrap', gap: '10px' },
  taskItemInfo: { flex: 1 },
  taskItemTitle: { fontWeight: '600', color: 'white', marginBottom: '4px' },
  taskItemDetails: { display: 'flex', gap: '12px', color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' },
  applyButton: { border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' },
  noTasks: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '20px' },
  calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  navButton: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  monthTitle: { fontWeight: '600', color: 'white', margin: 0 },
  weekHeaders: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' },
  weekDay: { textAlign: 'center', fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' },
  dayCell: { borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' },
  dayNumber: { fontWeight: '500', color: 'white', marginBottom: '6px' },
  dayTasks: { display: 'flex', flexDirection: 'column', gap: '3px' },
  taskDot: { borderRadius: '4px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  moreTasks: { color: 'rgba(255,255,255,0.5)', padding: '2px 4px' },
  legend: { display: 'flex', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' },
  legendDot: { display: 'inline-block', borderRadius: '2px', marginRight: '6px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '20px', maxHeight: '80vh', overflowY: 'auto' },
  modalLarge: { background: '#1e293b', borderRadius: '16px', padding: '24px', maxHeight: '85vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  modalTitle: { fontWeight: '600', color: 'white', margin: 0 },
  closeButton: { background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' },
  taskInfoCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' },
  taskInfoRow: { display: 'flex', gap: '16px', marginBottom: '6px', flexWrap: 'wrap' },
  taskDescription: { marginTop: '8px', lineHeight: '1.5' },
  taskStatusCard: { background: 'rgba(16,185,129,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(16,185,129,0.3)' },
  statusIcon: { fontSize: '24px' },
  statusTitle: { fontWeight: '600', color: '#10b981' },
  statusText: { color: 'rgba(255,255,255,0.7)' },
  profileInfo: { background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '16px' },
  subTitle: { fontWeight: '600', color: 'white', marginBottom: '12px', marginTop: '16px' },
  input: { width: '100%', padding: '8px 10px', marginBottom: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' },
  modalButtons: { display: 'flex', gap: '10px', marginTop: '16px' },
  cancelButton: { flex: 1, padding: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  submitButton: { flex: 1, padding: '8px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  confirmDeleteButton: { flex: 1, padding: '8px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  deleteAccountButton: { padding: '8px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', width: '100%', marginTop: '10px' },
  dangerZone: { marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  warningText: { color: '#f87171', marginTop: '6px' },
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

export default EmployeeDashboard;