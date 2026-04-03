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
      shiftApproved: 'Shift Approved',
      shiftApprovedMessage: 'You have been approved for this shift. Please arrive on time.',
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
      newTasksAvailable: 'New Tasks Available',
      applicationsPending: 'Applications Pending',
      applyForShift: 'Apply for Shift',
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
      shiftApproved: 'Pass Godkänt',
      shiftApprovedMessage: 'Du har blivit godkänd för detta pass. Var vänlig kom i tid.',
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
      newTasksAvailable: 'Nya Uppgifter Tillgängliga',
      applicationsPending: 'Väntande Ansökningar',
      applyForShift: 'Ansök om Pass',
      language: 'Språk',
      swedish: 'Svenska',
      english: 'Engelska'
    }
  };

  const lang = t[language];

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('taskbridge_language', langCode);
    setShowLanguageDropdown(false);
    // Update chat welcome message
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
    setChatMessages([{
      text: language === 'en' 
        ? "Hello! I'm your TaskBridge AI Assistant. How can I help you today?" 
        : "Hej! Jag är din TaskBridge AI-assistent. Hur kan jag hjälpa dig idag?",
      sender: 'ai',
      time: new Date().toLocaleTimeString()
    }]);
    const interval = setInterval(() => {
      fetchEmployeeData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const tasksRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tasksData = await tasksRes.json();
      
      const appsRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
        });
      const appsData = await appsRes.json();
      
      const allApps = appsData.data || [];
      setApplications(allApps);
      
      const appliedTaskIds = allApps.map(app => app.task);
      
      const available = (tasksData.data || []).filter(task => 
        task.status === 'open' && !appliedTaskIds.includes(task._id)
      );
      setAvailableTasks(available);
      
      const approved = allApps.filter(app => app.status === 'approved');
      setApprovedShifts(approved);
      
      const pending = allApps.filter(app => app.status === 'pending').length;
      setNotificationCount(pending);
      
      const newNotifications = [];
      const hasNewTasks = available.length > 0 && !localStorage.getItem('notified_tasks');
      if (hasNewTasks) {
        newNotifications.push({
          id: 'new-tasks',
          title: language === 'en' ? 'New Tasks Available' : 'Nya Uppgifter Tillgängliga',
          message: `${available.length} ${language === 'en' ? 'new task' : 'ny uppgift'}${available.length > 1 ? (language === 'en' ? 's' : 'er') : ''} ${language === 'en' ? 'available for you' : 'tillgängliga för dig'}`,
          time: new Date().toLocaleTimeString(),
          read: false
        });
      }
      if (pending > 0 && !localStorage.getItem('notified_pending')) {
        newNotifications.push({
          id: 'pending-apps',
          title: language === 'en' ? 'Applications Pending' : 'Väntande Ansökningar',
          message: `${language === 'en' ? 'You have' : 'Du har'} ${pending} ${language === 'en' ? 'application' : 'ansökan'}${pending > 1 ? (language === 'en' ? 's' : 'er') : ''} ${language === 'en' ? 'awaiting review' : 'som väntar på granskning'}`,
          time: new Date().toLocaleTimeString(),
          read: false
        });
      }
      setNotifications(newNotifications);
      
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
        setNotificationCount(prev => prev + 1);
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
    if (notifId === 'new-tasks') localStorage.setItem('notified_tasks', 'true');
    if (notifId === 'pending-apps') localStorage.setItem('notified_pending', 'true');
    setNotificationCount(prev => Math.max(0, prev - 1));
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
    return approvedShifts.filter(app => isSameDay(new Date(app.task?.date), date));
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
          ? "You get notifications when new jobs are available or when your application status changes. The bell icon shows how many unread notifications you have."
          : "Du får notiser när nya jobb finns tillgängliga eller när din ansökningsstatus ändras. Klockikonen visar hur många olästa notiser du har.";
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
        }}
      >
        <div style={styles.dayNumber}>{format(day, 'd')}</div>
        <div style={styles.dayTasks}>
          {dayTasks.slice(0, 2).map(app => (
            <div
              key={app._id}
              style={{
                ...styles.taskDot,
                backgroundColor: '#10b981'
              }}
              title={app.task?.title}
            >
              {app.task?.title?.length > 20 ? app.task.title.substring(0, 20) + '...' : app.task?.title}
            </div>
          ))}
          {dayTasks.length > 2 && (
            <div style={styles.moreTasks}>+{dayTasks.length - 2} more</div>
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
              <h1 style={styles.title}>{lang.employeeDashboard}</h1>
              <span style={styles.userNameBadge}>
                <i className="fas fa-user"></i> {user?.name}
              </span>
            </div>
            <p style={styles.subtitle}>{lang.yourSchedule}</p>
          </div>
        </div>
        <div style={styles.headerButtons}>
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
          <div style={styles.notificationContainer}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={styles.notificationButton}>
              <i className="fas fa-bell"></i>
              {notificationCount > 0 && (
                <span style={styles.notificationBadge}>{notificationCount > 9 ? '9+' : notificationCount}</span>
              )}
            </button>
            {showNotifications && (
              <div style={styles.notificationDropdown}>
                {notifications.length === 0 ? (
                  <div style={styles.noNotifications}>{lang.noNotifications}</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} style={styles.notificationItem} onClick={() => handleMarkNotificationAsRead(notif.id)}>
                      <div style={styles.notificationTitle}>{notif.title}</div>
                      <div style={styles.notificationMessage}>{notif.message}</div>
                      <div style={styles.notificationTime}>{notif.time}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button onClick={() => setShowProfileModal(true)} style={styles.profileButton}>{lang.profile}</button>
          <button onClick={onLogout} style={styles.logoutButton}>{lang.logout}</button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-briefcase" style={{ color: '#00d1ff' }}></i></div>
          <div style={styles.statValueSmall}>{availableTasks.length}</div>
          <div style={styles.statLabelSmall}>{lang.availableJobs}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-calendar-check" style={{ color: '#00d1ff' }}></i></div>
          <div style={styles.statValueSmall}>{approvedShifts.length}</div>
          <div style={styles.statLabelSmall}>{lang.approvedShifts}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-clock" style={{ color: '#00d1ff' }}></i></div>
          <div style={styles.statValueSmall}>
            {approvedShifts.reduce((total, app) => {
              if (app.task) {
                const start = new Date(`1970-01-01T${app.task.startTime}`);
                const end = new Date(`1970-01-01T${app.task.endTime}`);
                const hours = (end - start) / (1000 * 60 * 60);
                return total + hours;
              }
              return total;
            }, 0)}
          </div>
          <div style={styles.statLabelSmall}>{lang.totalHours}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-building" style={{ color: '#00d1ff' }}></i></div>
          <div style={styles.statValueSmall}>{user?.organization?.name?.substring(0, 10) || 'N/A'}</div>
          <div style={styles.statLabelSmall}>{lang.organization}</div>
        </div>
      </div>

      <div style={styles.sectionCard}>
        <h3 style={styles.sectionTitle}>{lang.availableJobs}</h3>
        <div style={styles.tasksList}>
          {availableTasks.length === 0 ? (
            <p style={styles.noTasks}>{lang.noAvailableJobs}</p>
          ) : (
            availableTasks.slice(0, 5).map(task => {
              const alreadyApplied = applications.some(app => app.task === task._id);
              return (
                <div key={task._id} style={styles.taskItem}>
                  <div style={styles.taskItemInfo}>
                    <div style={styles.taskItemTitle}>{task.title}</div>
                    <div style={styles.taskItemDetails}>
                      <span><i className="fas fa-calendar"></i> {new Date(task.date).toLocaleDateString()}</span>
                      <span><i className="fas fa-clock"></i> {task.startTime} - {task.endTime}</span>
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
                    style={{...styles.applyButton, background: alreadyApplied ? '#6b7280' : 'linear-gradient(135deg, #00f5ff, #00d1ff)'}}
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

      <div style={styles.sectionCard}>
        <div style={styles.calendarHeader}>
          <div style={styles.headerLeft}>
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} style={styles.navButton}>←</button>
            <h2 style={styles.monthTitle}>{format(currentDate, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} style={styles.navButton}>→</button>
          </div>
        </div>

        <div style={styles.weekHeaders}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} style={styles.weekDay}>{day}</div>
          ))}
        </div>

        <div style={styles.calendarGrid}>
          {getMonthDays().map(day => renderDayCell(day))}
        </div>

        <div style={styles.legend}>
          <div><span style={{...styles.legendDot, backgroundColor: '#10b981'}}></span> {lang.approvedShifts}</div>
        </div>
      </div>

      {showApplyModal && selectedTask && (
        <div style={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
          <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{lang.applyForShift}</h2>
              <button onClick={() => setShowApplyModal(false)} style={styles.closeButton}>✕</button>
            </div>
            <div style={styles.taskInfoCard}>
              <h3>{selectedTask.title}</h3>
              <div style={styles.taskInfoRow}>
                <span><strong>{lang.date}:</strong> {new Date(selectedTask.date).toLocaleDateString()}</span>
                <span><strong>{lang.time}:</strong> {selectedTask.startTime} - {selectedTask.endTime}</span>
              </div>
              <div style={styles.taskInfoRow}>
                <span><strong>{lang.location}:</strong> {selectedTask.location || lang.location}</span>
                <span><strong>{lang.role}:</strong> {selectedTask.jobDescription?.name}</span>
              </div>
              <div style={styles.taskInfoRow}>
                <span><strong>{lang.branch}:</strong> {selectedTask.branch?.name}</span>
                <span><strong>{lang.slots}:</strong> {selectedTask.currentEmployees}/{selectedTask.maxEmployees}</span>
              </div>
              {selectedTask.description && (
                <div style={styles.taskDescription}>
                  <strong>{lang.description}:</strong><br/>{selectedTask.description}
                </div>
              )}
            </div>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowApplyModal(false)} style={styles.cancelButton}>{lang.cancel}</button>
              <button onClick={() => handleApplyForTask(selectedTask._id)} style={styles.submitButton}>{lang.confirmApplication}</button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && selectedTask && (
        <div style={styles.modalOverlay} onClick={() => setShowTaskModal(false)}>
          <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedTask.title}</h2>
              <button onClick={() => setShowTaskModal(false)} style={styles.closeButton}>✕</button>
            </div>
            
            <div style={styles.taskInfoCard}>
              <div style={styles.taskInfoRow}>
                <span><strong>{lang.date}:</strong> {new Date(selectedTask.date).toLocaleDateString()}</span>
                <span><strong>{lang.time}:</strong> {selectedTask.startTime} - {selectedTask.endTime}</span>
              </div>
              <div style={styles.taskInfoRow}>
                <span><strong>{lang.location}:</strong> {selectedTask.location || lang.location}</span>
                <span><strong>{lang.role}:</strong> {selectedTask.jobDescription?.name}</span>
              </div>
              <div style={styles.taskInfoRow}>
                <span><strong>{lang.branch}:</strong> {selectedTask.branch?.name}</span>
              </div>
              {selectedTask.description && (
                <div style={styles.taskDescription}>
                  <strong>{lang.notesFromAdmin}:</strong><br/>
                  {selectedTask.description}
                </div>
              )}
            </div>
            
            <div style={styles.taskStatusCard}>
              <div style={styles.statusIcon}>✅</div>
              <div>
                <div style={styles.statusTitle}>{lang.shiftApproved}</div>
                <div style={styles.statusText}>{lang.shiftApprovedMessage}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.profileSettings}</h2>
            <div style={styles.profileInfo}>
              <p><strong style={{color: '#00d1ff'}}>{lang.name}:</strong> <span style={{color: 'white'}}>{user?.name}</span></p>
              <p><strong style={{color: '#00d1ff'}}>{lang.email}:</strong> <span style={{color: 'white'}}>{user?.email}</span></p>
              <p><strong style={{color: '#00d1ff'}}>{lang.role}:</strong> <span style={{color: 'white'}}>Employee</span></p>
              <p><strong style={{color: '#00d1ff'}}>{lang.organization}:</strong> <span style={{color: 'white'}}>{user?.organization?.name}</span></p>
              {user?.jobDescription && <p><strong style={{color: '#00d1ff'}}>{lang.jobRole}:</strong> <span style={{color: 'white'}}>{user.jobDescription.name}</span></p>}
              {user?.branch && <p><strong style={{color: '#00d1ff'}}>{lang.branch}:</strong> <span style={{color: 'white'}}>{user.branch.name}</span></p>}
            </div>
            <h3 style={styles.subTitle}>{lang.changePassword}</h3>
            <input type="password" placeholder={lang.currentPassword} value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder={lang.newPassword} value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder={lang.confirmPassword} value={profileData.confirmPassword} onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})} style={styles.input} />
            <button onClick={handleUpdatePassword} style={styles.submitButton}>{lang.updatePassword}</button>
            <div style={styles.dangerZone}>
              <h3 style={{ color: '#ef4444' }}>{lang.dangerZone}</h3>
              <button onClick={() => { setShowProfileModal(false); setShowDeleteAccountModal(true); }} style={styles.deleteAccountButton}>{lang.deleteAccount}</button>
              <p style={styles.warningText}>⚠️ {lang.deleteWarning}</p>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteAccountModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.deleteAccount}</h2>
            <p>{language === 'en' ? 'Are you sure you want to delete your account?' : 'Är du säker på att du vill radera ditt konto?'}</p>
            <p style={{ color: '#ef4444' }}>⚠️ {language === 'en' ? 'This action cannot be undone. Your personal data will be removed.' : 'Denna åtgärd kan inte ångras. Din personliga data kommer att raderas.'}</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteAccountModal(false)} style={styles.cancelButton}>{lang.cancel}</button>
              <button onClick={handleDeleteAccount} style={styles.confirmDeleteButton}>{lang.deleteAccount}</button>
            </div>
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
            <input type="text" placeholder={language === 'en' ? "Ask me..." : "Fråga mig..."} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()} style={styles.chatInput} />
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
  messageToast: { position: 'fixed', top: '20px', right: '20px', padding: '12px 20px', borderRadius: '8px', color: 'white', zIndex: 2000, fontSize: '14px', animation: 'fadeInOut 3s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  logoSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  orgLogo: { width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' },
  logoPlaceholder: { width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  title: { fontSize: '22px', fontWeight: 'bold', color: 'white', margin: 0 },
  userNameBadge: { background: 'rgba(0,209,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', color: '#00d1ff' },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: '2px' },
  headerButtons: { display: 'flex', gap: '12px', alignItems: 'center' },
  languageContainer: { position: 'relative' },
  languageButton: { padding: '6px 12px', background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' },
  languageDropdown: { position: 'absolute', top: '35px', right: '0', background: '#1e293b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100, minWidth: '120px' },
  languageOption: { padding: '8px 12px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '12px' },
  notificationContainer: { position: 'relative' },
  notificationButton: { background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '20px', color: 'white', cursor: 'pointer', padding: '6px 12px', fontSize: '14px', position: 'relative' },
  notificationBadge: { position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  notificationDropdown: { position: 'absolute', top: '40px', right: '0', width: '280px', background: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100, maxHeight: '300px', overflowY: 'auto' },
  noNotifications: { padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' },
  notificationItem: { padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' },
  notificationTitle: { fontSize: '12px', fontWeight: '600', color: '#00d1ff', marginBottom: '4px' },
  notificationMessage: { fontSize: '11px', color: 'rgba(255,255,255,0.7)' },
  notificationTime: { fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' },
  profileButton: { padding: '6px 14px', background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  logoutButton: { padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '20px' },
  statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: 'center' },
  statIconSmall: { fontSize: '20px', marginBottom: '6px' },
  statValueSmall: { fontSize: '22px', fontWeight: 'bold', color: 'white' },
  statLabelSmall: { fontSize: '10px', color: 'rgba(255,255,255,0.6)' },
  sectionCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px', marginBottom: '20px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '12px' },
  tasksList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px', flexWrap: 'wrap', gap: '10px' },
  taskItemInfo: { flex: 1 },
  taskItemTitle: { fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '4px' },
  taskItemDetails: { display: 'flex', gap: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' },
  applyButton: { background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '20px', padding: '6px 16px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  noTasks: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '20px' },
  calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  navButton: { padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '14px' },
  monthTitle: { fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 },
  weekHeaders: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px' },
  weekDay: { textAlign: 'center', padding: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '500' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' },
  dayCell: { minHeight: '80px', padding: '6px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' },
  dayNumber: { fontSize: '12px', fontWeight: '500', color: 'white', marginBottom: '6px' },
  dayTasks: { display: 'flex', flexDirection: 'column', gap: '3px' },
  taskDot: { fontSize: '9px', padding: '2px 4px', borderRadius: '4px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  moreTasks: { fontSize: '9px', color: 'rgba(255,255,255,0.5)', padding: '2px 4px' },
  legend: { display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' },
  legendDot: { display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', marginRight: '6px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '20px', maxWidth: '400px', width: '90%', maxHeight: '80vh', overflowY: 'auto' },
  modalLarge: { background: '#1e293b', borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '85vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  modalTitle: { fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 },
  closeButton: { background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' },
  taskInfoCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', marginBottom: '16px' },
  taskInfoRow: { display: 'flex', gap: '16px', marginBottom: '6px', fontSize: '12px', color: 'white', flexWrap: 'wrap' },
  taskDescription: { fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '8px', lineHeight: '1.5' },
  taskStatusCard: { background: 'rgba(16,185,129,0.1)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(16,185,129,0.3)' },
  statusIcon: { fontSize: '24px' },
  statusTitle: { fontSize: '14px', fontWeight: '600', color: '#10b981' },
  statusText: { fontSize: '11px', color: 'rgba(255,255,255,0.7)' },
  profileInfo: { background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' },
  subTitle: { fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '12px', marginTop: '16px' },
  input: { width: '100%', padding: '8px 10px', marginBottom: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', fontSize: '12px', boxSizing: 'border-box' },
  modalButtons: { display: 'flex', gap: '10px', marginTop: '16px' },
  cancelButton: { flex: 1, padding: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '12px' },
  submitButton: { flex: 1, padding: '8px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '12px' },
  confirmDeleteButton: { flex: 1, padding: '8px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '12px' },
  deleteAccountButton: { padding: '8px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', width: '100%', marginTop: '10px', fontSize: '12px' },
  dangerZone: { marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  warningText: { fontSize: '10px', color: '#f87171', marginTop: '6px' },
  chatButton: { position: 'fixed', bottom: '20px', right: '20px', width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', zIndex: 1000 },
  chatModal: { position: 'fixed', bottom: '80px', right: '20px', width: '300px', height: '450px', background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1001 },
  chatHeader: { padding: '12px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' },
  chatClose: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' },
  chatMessages: { flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  chatMessage: { display: 'flex' },
  messageBubble: { maxWidth: '85%', padding: '8px 12px', borderRadius: '12px', color: 'white', fontSize: '12px', lineHeight: '1.4' },
  messageTime: { fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' },
  typingIndicator: { padding: '8px 12px', background: '#1e293b', borderRadius: '12px', width: '60px', fontSize: '11px' },
  chatInputContainer: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' },
  chatInput: { flex: 1, padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: 'white', outline: 'none', fontSize: '12px' },
  chatSend: { padding: '8px 12px', background: '#00d1ff', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer', fontSize: '12px' }
};

export default EmployeeDashboard;