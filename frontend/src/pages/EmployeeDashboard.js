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

  useEffect(() => {
    fetchEmployeeData();
    const savedLogo = localStorage.getItem('organizationLogo');
    if (savedLogo) setLogoPreview(savedLogo);
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchEmployeeData();
    }, 30000);
    return () => clearInterval(interval);
  }, [currentDate]);

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
    
    // Get employee's applications to know which tasks they already applied for
    const appsRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/applications/my-applications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const appsData = await appsRes.json();
    
    const allApps = appsData.data || [];
    setApplications(allApps);
    
    // Get task IDs that employee already applied for
    const appliedTaskIds = allApps.map(app => app.task);
    
    // Filter available tasks (open status AND not already applied for)
    const available = (tasksData.data || []).filter(task => 
      task.status === 'open' && !appliedTaskIds.includes(task._id)
    );
    setAvailableTasks(available);
    
    const approved = allApps.filter(app => app.status === 'approved');
    setApprovedShifts(approved);
    
    const pending = allApps.filter(app => app.status === 'pending').length;
    setNotificationCount(pending);
    
    // Create notifications (only unread)
    const newNotifications = [];
    const hasNewTasks = available.length > 0 && !localStorage.getItem('notified_tasks');
    if (hasNewTasks) {
      newNotifications.push({
        id: 'new-tasks',
        title: 'New Tasks Available',
        message: `${available.length} new task${available.length > 1 ? 's' : ''} available for you`,
        time: new Date().toLocaleTimeString(),
        read: false
      });
    }
    if (pending > 0 && !localStorage.getItem('notified_pending')) {
      newNotifications.push({
        id: 'pending-apps',
        title: 'Applications Pending',
        message: `You have ${pending} application${pending > 1 ? 's' : ''} awaiting review`,
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
  // Check if already applied
  const alreadyApplied = applications.some(app => app.task === taskId);
  if (alreadyApplied) {
    showMessage('You have already applied for this task', 'error');
    // Remove from available tasks even if already applied (to clean up UI)
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
      // Remove the applied task from availableTasks immediately
      setAvailableTasks(prev => prev.filter(task => task._id !== taskId));
      
      // Add to applications list
      const newApplication = { task: taskId, status: 'pending' };
      setApplications(prev => [...prev, newApplication]);
      
      // Update notification count
      setNotificationCount(prev => prev + 1);
      
      showMessage('Application submitted successfully!', 'success');
      setShowApplyModal(false);
      
      // Also refresh data in background to sync with server
      fetchEmployeeData();
    } else {
      showMessage(data.message || 'Failed to apply', 'error');
    }
  } catch (error) {
    console.error('Error applying for task:', error);
    showMessage('Error applying for task', 'error');
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
      showMessage('New passwords do not match', 'error');
      return;
    }
    if (profileData.newPassword && profileData.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
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
        showMessage('Password changed successfully!', 'success');
        setShowProfileModal(false);
        setProfileData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showMessage('Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('Error changing password', 'error');
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
      showMessage('Failed to delete account', 'error');
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
      {/* Message Toast */}
      {message.text && (
        <div style={{...styles.messageToast, background: message.type === 'success' ? '#10b981' : '#ef4444'}}>
          {message.text}
        </div>
      )}

      {/* Header */}
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
              <h1 style={styles.title}>Employee Dashboard</h1>
              <span style={styles.userNameBadge}>
                <i className="fas fa-user"></i> {user?.name}
              </span>
            </div>
            <p style={styles.subtitle}>Your schedule and available shifts</p>
          </div>
        </div>
        <div style={styles.headerButtons}>
          <div style={styles.notificationContainer}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              style={styles.notificationButton}
            >
              <i className="fas fa-bell"></i>
              {notificationCount > 0 && (
                <span style={styles.notificationBadge}>{notificationCount > 9 ? '9+' : notificationCount}</span>
              )}
            </button>
            {showNotifications && (
              <div style={styles.notificationDropdown}>
                {notifications.length === 0 ? (
                  <div style={styles.noNotifications}>No new notifications</div>
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
          <button onClick={() => setShowProfileModal(true)} style={styles.profileButton}>Profile</button>
          <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-briefcase"></i></div>
          <div style={styles.statValueSmall}>{availableTasks.length}</div>
          <div style={styles.statLabelSmall}>Available Jobs</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-calendar-check"></i></div>
          <div style={styles.statValueSmall}>{approvedShifts.length}</div>
          <div style={styles.statLabelSmall}>Approved Shifts</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-clock"></i></div>
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
          <div style={styles.statLabelSmall}>Total Hours</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-building"></i></div>
          <div style={styles.statValueSmall}>{user?.organization?.name?.substring(0, 10) || 'N/A'}</div>
          <div style={styles.statLabelSmall}>Organization</div>
        </div>
      </div>

      {/* Available Tasks Section */}
      <div style={styles.sectionCard}>
        <h3 style={styles.sectionTitle}>Available Jobs for You</h3>
        <div style={styles.tasksList}>
          {availableTasks.length === 0 ? (
            <p style={styles.noTasks}>No available jobs at the moment</p>
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
                      <span><i className="fas fa-map-marker-alt"></i> {task.location || 'No location'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (alreadyApplied) {
                        showMessage('You have already applied for this task', 'error');
                      } else {
                        setSelectedTask(task);
                        setShowApplyModal(true);
                      }
                    }} 
                    style={{...styles.applyButton, background: alreadyApplied ? '#6b7280' : 'linear-gradient(135deg, #00f5ff, #00d1ff)'}}
                    disabled={alreadyApplied}
                  >
                    {alreadyApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Calendar Section */}
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
          <div><span style={{...styles.legendDot, backgroundColor: '#10b981'}}></span> Your Approved Shifts</div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedTask && (
        <div style={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
          <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Apply for Shift</h2>
              <button onClick={() => setShowApplyModal(false)} style={styles.closeButton}>✕</button>
            </div>
            <div style={styles.taskInfoCard}>
              <h3>{selectedTask.title}</h3>
              <div style={styles.taskInfoRow}>
                <span><strong>Date:</strong> {new Date(selectedTask.date).toLocaleDateString()}</span>
                <span><strong>Time:</strong> {selectedTask.startTime} - {selectedTask.endTime}</span>
              </div>
              <div style={styles.taskInfoRow}>
                <span><strong>Location:</strong> {selectedTask.location || 'Not specified'}</span>
                <span><strong>Role:</strong> {selectedTask.jobDescription?.name}</span>
              </div>
              <div style={styles.taskInfoRow}>
                <span><strong>Branch:</strong> {selectedTask.branch?.name}</span>
                <span><strong>Slots:</strong> {selectedTask.currentEmployees}/{selectedTask.maxEmployees} available</span>
              </div>
              {selectedTask.description && (
                <div style={styles.taskDescription}>
                  <strong>Description:</strong><br/>{selectedTask.description}
                </div>
              )}
            </div>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowApplyModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={() => handleApplyForTask(selectedTask._id)} style={styles.submitButton}>Confirm Application</button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal for Approved Shifts */}
      {showTaskModal && selectedTask && (
        <div style={styles.modalOverlay} onClick={() => setShowTaskModal(false)}>
          <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedTask.title}</h2>
              <button onClick={() => setShowTaskModal(false)} style={styles.closeButton}>✕</button>
            </div>
            
            <div style={styles.taskInfoCard}>
              <div style={styles.taskInfoRow}>
                <span><strong>Date:</strong> {new Date(selectedTask.date).toLocaleDateString()}</span>
                <span><strong>Time:</strong> {selectedTask.startTime} - {selectedTask.endTime}</span>
              </div>
              <div style={styles.taskInfoRow}>
                <span><strong>Location:</strong> {selectedTask.location || 'Not specified'}</span>
                <span><strong>Role:</strong> {selectedTask.jobDescription?.name}</span>
              </div>
              <div style={styles.taskInfoRow}>
                <span><strong>Branch:</strong> {selectedTask.branch?.name}</span>
              </div>
              {selectedTask.description && (
                <div style={styles.taskDescription}>
                  <strong>📝 Notes from Admin:</strong><br/>
                  {selectedTask.description}
                </div>
              )}
            </div>
            
            <div style={styles.taskStatusCard}>
              <div style={styles.statusIcon}>✅</div>
              <div>
                <div style={styles.statusTitle}>Shift Approved</div>
                <div style={styles.statusText}>You have been approved for this shift. Please arrive on time.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal - Fixed text colors */}
      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Profile Settings</h2>
            <div style={styles.profileInfo}>
              <p><strong style={{color: '#00d1ff'}}>Name:</strong> <span style={{color: 'white'}}>{user?.name}</span></p>
              <p><strong style={{color: '#00d1ff'}}>Email:</strong> <span style={{color: 'white'}}>{user?.email}</span></p>
              <p><strong style={{color: '#00d1ff'}}>Role:</strong> <span style={{color: 'white'}}>Employee</span></p>
              <p><strong style={{color: '#00d1ff'}}>Organization:</strong> <span style={{color: 'white'}}>{user?.organization?.name}</span></p>
              {user?.jobDescription && <p><strong style={{color: '#00d1ff'}}>Job Role:</strong> <span style={{color: 'white'}}>{user.jobDescription.name}</span></p>}
              {user?.branch && <p><strong style={{color: '#00d1ff'}}>Branch:</strong> <span style={{color: 'white'}}>{user.branch.name}</span></p>}
            </div>
            <h3 style={styles.subTitle}>Change Password</h3>
            <input type="password" placeholder="Current Password" value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder="New Password" value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} style={styles.input} />
            <input type="password" placeholder="Confirm New Password" value={profileData.confirmPassword} onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})} style={styles.input} />
            <button onClick={handleUpdatePassword} style={styles.submitButton}>Update Password</button>
            <div style={styles.dangerZone}>
              <h3 style={{ color: '#ef4444' }}>Danger Zone</h3>
              <button onClick={() => { setShowProfileModal(false); setShowDeleteAccountModal(true); }} style={styles.deleteAccountButton}>Delete My Account</button>
              <p style={styles.warningText}>⚠️ This will permanently delete your account and all your data.</p>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteAccountModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Delete Your Account</h2>
            <p>Are you sure you want to delete your account?</p>
            <p style={{ color: '#ef4444' }}>⚠️ This action cannot be undone. Your personal data will be removed.</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteAccountModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleDeleteAccount} style={styles.confirmDeleteButton}>Delete My Account</button>
            </div>
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
  statIconSmall: { fontSize: '20px', color: '#00d1ff', marginBottom: '6px' },
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
};

// Add animation for toast
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(20px); }
    15% { opacity: 1; transform: translateX(0); }
    85% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(20px); }
  }
`;
document.head.appendChild(styleSheet);

export default EmployeeDashboard;