import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const EmployeeDashboard = ({ user, onLogout }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  useEffect(() => {
    fetchEmployeeData();
    const savedLogo = localStorage.getItem('organizationLogo');
    if (savedLogo) setLogoPreview(savedLogo);
  }, [currentDate]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Get employee's approved shifts (applications with status approved)
      const appsRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/applications/my-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appsData = await appsRes.json();
      
      // Filter only approved applications
      const approvedApps = (appsData.data || []).filter(app => app.status === 'approved');
      setApplications(approvedApps);
      
      // Get task details for each approved application
      const taskPromises = approvedApps.map(app => 
        fetch(`https://taskbridge-production-9d91.up.railway.app/api/tasks/${app.task}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
      );
      
      const tasksData = await Promise.all(taskPromises);
      setTasks(tasksData.map(t => t.data).filter(t => t));
      
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
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
        setProfileData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
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

  const getTasksForDate = (date) => {
    return tasks.filter(task => isSameDay(new Date(task.date), date));
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
    const dayTasks = getTasksForDate(day);
    const isToday = isSameDay(day, new Date());
    const isCurrentMonth = isSameMonth(day, currentDate);
    
    return (
      <div
        key={day.toISOString()}
        onClick={() => dayTasks.length > 0 && handleTaskClick(dayTasks[0])}
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
          {dayTasks.slice(0, 2).map(task => (
            <div
              key={task._id}
              style={{
                ...styles.taskDot,
                backgroundColor: '#10b981'
              }}
              title={task.title}
            >
              {task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title}
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
      {/* Header with Organization Logo */}
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
            <p style={styles.subtitle}>Your approved shifts and schedule</p>
          </div>
        </div>
        <div style={styles.headerButtons}>
          <button onClick={() => setShowProfileModal(true)} style={styles.profileButton}>Profile</button>
          <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-calendar-check"></i></div>
          <div style={styles.statValueSmall}>{tasks.length}</div>
          <div style={styles.statLabelSmall}>Approved Shifts</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-clock"></i></div>
          <div style={styles.statValueSmall}>
            {tasks.reduce((total, task) => {
              const start = new Date(`1970-01-01T${task.startTime}`);
              const end = new Date(`1970-01-01T${task.endTime}`);
              const hours = (end - start) / (1000 * 60 * 60);
              return total + hours;
            }, 0)}
          </div>
          <div style={styles.statLabelSmall}>Total Hours</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconSmall}><i className="fas fa-building"></i></div>
          <div style={styles.statValueSmall}>{user?.organization?.name || 'N/A'}</div>
          <div style={styles.statLabelSmall}>Organization</div>
        </div>
      </div>

      {/* Calendar Header */}
      <div style={styles.calendarHeader}>
        <div style={styles.headerLeft}>
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} style={styles.navButton}>←</button>
          <h2 style={styles.monthTitle}>{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} style={styles.navButton}>→</button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div style={styles.weekHeaders}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} style={styles.weekDay}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={styles.calendarGrid}>
        {getMonthDays().map(day => renderDayCell(day))}
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div><span style={{...styles.legendDot, backgroundColor: '#10b981'}}></span> Your Approved Shifts</div>
      </div>

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div style={styles.modalOverlay} onClick={() => setShowTaskModal(false)}>
          <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedTask.title}</h2>
              <button onClick={() => setShowTaskModal(false)} style={styles.closeButton}>✕</button>
            </div>
            
            {/* Task Info */}
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
              {selectedTask.notes && (
                <div style={styles.taskNotes}>
                  <strong>📌 Special Instructions:</strong><br/>
                  {selectedTask.notes}
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Profile Settings</h2>
            <div style={styles.profileInfo}>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> Employee</p>
              <p><strong>Organization:</strong> {user?.organization?.name}</p>
              {user?.jobDescription && <p><strong>Job Role:</strong> {user.jobDescription.name}</p>}
              {user?.branch && <p><strong>Branch:</strong> {user.branch.name}</p>}
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

      {/* Delete Account Modal */}
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
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' },
  statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: 'center' },
  statIconSmall: { fontSize: '20px', color: '#00d1ff', marginBottom: '6px' },
  statValueSmall: { fontSize: '22px', fontWeight: 'bold', color: 'white' },
  statLabelSmall: { fontSize: '10px', color: 'rgba(255,255,255,0.6)' },
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
  taskNotes: { fontSize: '12px', color: '#00d1ff', marginTop: '8px', padding: '8px', background: 'rgba(0,209,255,0.1)', borderRadius: '8px', lineHeight: '1.5' },
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

export default EmployeeDashboard;