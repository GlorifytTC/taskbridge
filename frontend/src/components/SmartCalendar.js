import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays } from 'date-fns';

const SmartCalendar = ({ user, onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingTask, setEditingTask] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterJobRole, setFilterJobRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [branches, setBranches] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Conflict detection
  const [conflicts, setConflicts] = useState([]);

  const getDashboardRoute = () => {
    if (user?.role === 'master') return 'master';
    if (user?.role === 'superadmin') return 'superadmin';
    if (user?.role === 'admin') return 'admin';
    return 'dashboard';
  };

  useEffect(() => {
    fetchCalendarData();
    fetchFiltersData();
  }, [currentDate, viewMode]);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchTerm, filterBranch, filterJobRole, filterStatus]);

  const fetchFiltersData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch branches for filter
      const branchesRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/branches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const branchesData = await branchesRes.json();
      setBranches(branchesData.data || []);
      
      // Fetch job roles for filter
      const jobsRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/job-descriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const jobsData = await jobsRes.json();
      setJobRoles(jobsData.data || []);
      
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      let startDate, endDate;
      if (viewMode === 'month') {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      } else if (viewMode === 'week') {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        startDate = currentDate;
        endDate = currentDate;
      }
      
      let tasksUrl = `https://taskbridge-production-9d91.up.railway.app/api/tasks?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      
      if (user?.role === 'admin') {
        const adminRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const adminData = await adminRes.json();
        const assignedBranchIds = adminData.user.assignedBranches?.map(b => b._id) || [];
        
        if (assignedBranchIds.length > 0) {
          tasksUrl += `&branches=${assignedBranchIds.join(',')}`;
        }
      }
      
      const tasksRes = await fetch(tasksUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tasksData = await tasksRes.json();
      setTasks(tasksData.data || []);
      
      // Detect conflicts
      detectConflicts(tasksData.data || []);
      
      if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'master') {
        const appsRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const appsData = await appsRes.json();
        setApplications(appsData.data || []);
      }
      
      const employeesRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/users?role=employee', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const employeesData = await employeesRes.json();
      setEmployees(employeesData.data || []);
      
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectConflicts = (tasksList) => {
    const conflictsList = [];
    
    // Group tasks by date and employee
    tasksList.forEach(task => {
      const approvedApps = applications.filter(app => 
        (app.task === task._id || app.task?._id === task._id) && app.status === 'approved'
      );
      
      approvedApps.forEach(app => {
        // Check if this employee has other tasks at same time
        const employeeTasks = tasksList.filter(t => {
          const employeeApps = applications.filter(a => 
            (a.task === t._id || a.task?._id === t._id) && 
            a.status === 'approved' && 
            a.employee === app.employee
          );
          return employeeApps.length > 0 && t.date === task.date && t._id !== task._id;
        });
        
        employeeTasks.forEach(conflictTask => {
          // Check if times overlap
          const taskStart = task.startTime;
          const taskEnd = task.endTime;
          const conflictStart = conflictTask.startTime;
          const conflictEnd = conflictTask.endTime;
          
          if ((taskStart >= conflictStart && taskStart < conflictEnd) ||
              (taskEnd > conflictStart && taskEnd <= conflictEnd)) {
            conflictsList.push({
              employeeId: app.employee,
              employeeName: app.employee?.name || 'Unknown',
              task1: task.title,
              task2: conflictTask.title,
              date: task.date
            });
          }
        });
      });
    });
    
    setConflicts(conflictsList);
  };

  const applyFilters = () => {
    let filtered = [...tasks];
    
    // Search by branch, job role, task title, or employee
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => {
        const matchesBranch = task.branch?.name?.toLowerCase().includes(term);
        const matchesJobRole = task.jobDescription?.name?.toLowerCase().includes(term);
        const matchesTitle = task.title?.toLowerCase().includes(term);
        
        // Check if any employee assigned matches search
        const taskApps = applications.filter(app => 
          (app.task === task._id || app.task?._id === task._id) && app.status === 'approved'
        );
        const matchesEmployee = taskApps.some(app => 
          app.employee?.name?.toLowerCase().includes(term)
        );
        
        return matchesBranch || matchesJobRole || matchesTitle || matchesEmployee;
      });
    }
    
    // Filter by branch
    if (filterBranch !== 'all') {
      filtered = filtered.filter(task => task.branch?._id === filterBranch);
    }
    
    // Filter by job role
    if (filterJobRole !== 'all') {
      filtered = filtered.filter(task => task.jobDescription?._id === filterJobRole);
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => {
        if (filterStatus === 'available') return task.status === 'open';
        if (filterStatus === 'full') return task.status === 'filled';
        if (filterStatus === 'cancelled') return task.status === 'cancelled';
        if (filterStatus === 'past') return new Date(task.date) < new Date();
        return true;
      });
    }
    
    setFilteredTasks(filtered);
  };

  const getTasksForDate = (date) => {
    return filteredTasks.filter(task => isSameDay(new Date(task.date), date));
  };

  const getApplicationsForTask = (taskId) => {
    const approvedApps = applications.filter(app => {
      const taskMatch = app.task === taskId || app.task?._id === taskId;
      const isApproved = app.status === 'approved';
      return taskMatch && isApproved;
    });
    return approvedApps;
  };

  const getEmployeeName = (employeeData) => {
    if (employeeData && typeof employeeData === 'object' && employeeData.name) {
      return employeeData.name;
    }
    if (employeeData && typeof employeeData === 'string') {
      for (const app of applications) {
        if (app.employee && app.employee._id === employeeData) {
          return app.employee.name;
        }
        if (app.employee === employeeData && app.employeeData) {
          return app.employeeData.name;
        }
      }
      const employee = employees.find(e => e._id === employeeData);
      if (employee && employee.name) {
        return employee.name;
      }
    }
    return 'Unknown';
  };

  const getTaskStatusColor = (task) => {
    const currentDateObj = new Date();
    const taskDate = new Date(task.date);
    
    if (taskDate < currentDateObj) return '#6b7280';
    if (task.status === 'cancelled') return '#ef4444';
    if (task.status === 'filled' || task.currentEmployees >= task.maxEmployees) return '#f59e0b';
    return '#10b981';
  };

  const getTaskStatusText = (task) => {
    const currentDateObj = new Date();
    const taskDate = new Date(task.date);
    
    if (taskDate < currentDateObj) return 'Past';
    if (task.status === 'cancelled') return 'Cancelled';
    if (task.status === 'filled' || task.currentEmployees >= task.maxEmployees) return 'Full';
    return 'Available';
  };

  const handleDayClick = (date, dayTasks) => {
    setSelectedDay(date);
    setShowDayModal(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setEditingTask(false);
    setEditFormData({
      title: task.title,
      description: task.description || '',
      startTime: task.startTime,
      endTime: task.endTime,
      maxEmployees: task.maxEmployees,
      location: task.location || '',
    });
    setShowTaskModal(true);
    setShowDayModal(false);
  };

  const handleUpdateTask = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/tasks/${selectedTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      
      if (response.ok) {
        alert('Task updated successfully!');
        setEditingTask(false);
        fetchCalendarData();
      } else {
        alert('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const handleCancelTask = async () => {
    if (!confirm('Are you sure you want to cancel this task?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/tasks/${selectedTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      alert('Task cancelled successfully');
      fetchCalendarData();
      setShowTaskModal(false);
    } catch (error) {
      console.error('Error cancelling task:', error);
      alert('Failed to cancel task');
    }
  };

  const handleRemoveEmployee = async (employeeId, applicationId) => {
    if (!confirm('Remove this employee from the shift?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/applications/${applicationId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Removed by admin' })
      });
      alert('Employee removed successfully');
      fetchCalendarData();
    } catch (error) {
      console.error('Error removing employee:', error);
      alert('Failed to remove employee');
    }
  };

  const getDays = () => {
    if (viewMode === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(start, i));
      }
      return days;
    } else {
      return [currentDate];
    }
  };

  const renderDayCell = (day) => {
    const dayTasks = getTasksForDate(day);
    const isToday = isSameDay(day, new Date());
    const isCurrentMonth = isSameMonth(day, currentDate);
    
    return (
      <div
        key={day.toISOString()}
        onClick={() => dayTasks.length > 0 && handleDayClick(day, dayTasks)}
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
          {dayTasks.slice(0, 3).map(task => (
            <div
              key={task._id}
              onClick={(e) => {
                e.stopPropagation();
                handleTaskClick(task);
              }}
              style={{
                ...styles.taskDot,
                backgroundColor: getTaskStatusColor(task)
              }}
              title={`${task.title} - ${task.startTime} to ${task.endTime} (${task.currentEmployees}/${task.maxEmployees} workers)`}
            >
              {task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title}
            </div>
          ))}
          {dayTasks.length > 3 && (
            <div style={styles.moreTasks}>+{dayTasks.length - 3} more</div>
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
      <div style={styles.backButtonContainer}>
        <button onClick={() => onNavigate(getDashboardRoute())} style={styles.closeButton}>
          ✕
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div style={styles.searchFilterBar}>
        <div style={styles.searchContainer}>
          <i className="fas fa-search" style={styles.searchIcon}></i>
          <input
            type="text"
            placeholder="Search by branch, job role, task, or employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={styles.filterToggleButton}>
          <i className="fas fa-sliders-h"></i> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div style={styles.filtersPanel}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Branch:</label>
              <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} style={styles.filterSelect}>
                <option value="all">All Branches</option>
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>{branch.name}</option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Job Role:</label>
              <select value={filterJobRole} onChange={(e) => setFilterJobRole(e.target.value)} style={styles.filterSelect}>
                <option value="all">All Roles</option>
                {jobRoles.map(role => (
                  <option key={role._id} value={role._id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="full">Full</option>
                <option value="cancelled">Cancelled</option>
                <option value="past">Past</option>
              </select>
            </div>
            <button onClick={() => {
              setSearchTerm('');
              setFilterBranch('all');
              setFilterJobRole('all');
              setFilterStatus('all');
            }} style={styles.clearFiltersButton}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Conflict Warning */}
      {conflicts.length > 0 && (
        <div style={styles.conflictWarning}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>⚠️ {conflicts.length} scheduling conflicts detected! Employees have overlapping shifts.</span>
        </div>
      )}

      <div style={styles.calendarHeader}>
        <div style={styles.headerLeft}>
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} style={styles.navButton}>←</button>
          <h2 style={styles.monthTitle}>{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} style={styles.navButton}>→</button>
        </div>
        <div style={styles.viewButtons}>
          <button onClick={() => setViewMode('month')} style={{...styles.viewButton, background: viewMode === 'month' ? '#00d1ff' : 'rgba(255,255,255,0.1)'}}>Month</button>
          <button onClick={() => setViewMode('week')} style={{...styles.viewButton, background: viewMode === 'week' ? '#00d1ff' : 'rgba(255,255,255,0.1)'}}>Week</button>
          <button onClick={() => setViewMode('day')} style={{...styles.viewButton, background: viewMode === 'day' ? '#00d1ff' : 'rgba(255,255,255,0.1)'}}>Day</button>
        </div>
      </div>

      <div style={styles.weekHeaders}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} style={styles.weekDay}>{day}</div>
        ))}
      </div>

      <div style={styles.calendarGrid}>
        {getDays().map(day => renderDayCell(day))}
      </div>

      <div style={styles.legend}>
        <div><span style={{...styles.legendDot, backgroundColor: '#10b981'}}></span> Available</div>
        <div><span style={{...styles.legendDot, backgroundColor: '#f59e0b'}}></span> Full</div>
        <div><span style={{...styles.legendDot, backgroundColor: '#ef4444'}}></span> Cancelled</div>
        <div><span style={{...styles.legendDot, backgroundColor: '#6b7280'}}></span> Past</div>
        <div><span style={{...styles.legendDot, backgroundColor: '#f97316'}}></span> Conflict</div>
      </div>

      {showDayModal && selectedDay && (
        <div style={styles.modalOverlay} onClick={() => setShowDayModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{format(selectedDay, 'EEEE, MMMM d, yyyy')}</h2>
              <button onClick={() => setShowDayModal(false)} style={styles.closeButton}>✕</button>
            </div>
            <div style={styles.tasksList}>
              {getTasksForDate(selectedDay).length === 0 ? (
                <p style={styles.noTasks}>No tasks scheduled for this day</p>
              ) : (
                getTasksForDate(selectedDay).map(task => (
                  <div key={task._id} onClick={() => handleTaskClick(task)} style={styles.taskCard}>
                    <div style={styles.taskCardHeader}>
                      <h3 style={styles.taskTitle}>{task.title}</h3>
                      <span style={{...styles.taskStatusBadge, backgroundColor: getTaskStatusColor(task)}}>
                        {getTaskStatusText(task)}
                      </span>
                    </div>
                    <div style={styles.taskDetails}>
                      <span>⏰ {task.startTime} - {task.endTime}</span>
                      <span>👥 {task.currentEmployees}/{task.maxEmployees}</span>
                      <span>📍 {task.location || 'No location'}</span>
                    </div>
                    <div style={styles.taskMeta}>{task.jobDescription?.name} • {task.branch?.name}</div>
                  </div>
                ))
              )}
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
                <span><strong>Date:</strong> {new Date(selectedTask.date).toLocaleDateString()}</span>
                <span><strong>Time:</strong> {selectedTask.startTime} - {selectedTask.endTime}</span>
              </div>
              <div style={styles.taskInfoRow}>
                <span><strong>Branch:</strong> {selectedTask.branch?.name}</span>
                <span><strong>Role:</strong> {selectedTask.jobDescription?.name}</span>
              </div>
              <div style={styles.taskInfoRow}>
                <span><strong>Location:</strong> {selectedTask.location || 'Not specified'}</span>
                <span><strong>Status:</strong> 
                  <span style={{...styles.taskStatusBadge, backgroundColor: getTaskStatusColor(selectedTask), marginLeft: '8px'}}>
                    {getTaskStatusText(selectedTask)}
                  </span>
                </span>
              </div>
              {selectedTask.description && (
                <div style={styles.taskDescription}><strong>Description:</strong> {selectedTask.description}</div>
              )}
            </div>

            {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'master') && (
              <div style={styles.editSection}>
                <div style={styles.editHeader}>
                  <h3 style={styles.editTitle}>Edit Task</h3>
                  {!editingTask ? (
                    <button onClick={() => setEditingTask(true)} style={styles.editButton}>✎ Edit</button>
                  ) : (
                    <button onClick={() => setEditingTask(false)} style={styles.cancelEditButton}>Cancel</button>
                  )}
                </div>
                
                {editingTask ? (
                  <div style={styles.editForm}>
                    <input type="text" placeholder="Task Title" value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} style={styles.input} />
                    <textarea placeholder="Description" value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} style={styles.textarea} rows="2" />
                    <div style={styles.timeRow}>
                      <input type="time" value={editFormData.startTime} onChange={(e) => setEditFormData({...editFormData, startTime: e.target.value})} style={{...styles.input, flex: 1}} />
                      <input type="time" value={editFormData.endTime} onChange={(e) => setEditFormData({...editFormData, endTime: e.target.value})} style={{...styles.input, flex: 1}} />
                    </div>
                    <input type="number" placeholder="Max Employees" value={editFormData.maxEmployees} onChange={(e) => setEditFormData({...editFormData, maxEmployees: parseInt(e.target.value)})} style={styles.input} min="1" />
                    <input type="text" placeholder="Location" value={editFormData.location} onChange={(e) => setEditFormData({...editFormData, location: e.target.value})} style={styles.input} />
                    <div style={styles.editButtons}>
                      <button onClick={handleUpdateTask} style={styles.saveButton}>Save Changes</button>
                      <button onClick={handleCancelTask} style={styles.cancelTaskButton}>Cancel Task</button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.taskQuickInfo}>
                    <p>⏰ {selectedTask.startTime} - {selectedTask.endTime}</p>
                    <p>👥 Capacity: {selectedTask.currentEmployees}/{selectedTask.maxEmployees}</p>
                    <p>📍 {selectedTask.location || 'Location not specified'}</p>
                  </div>
                )}
              </div>
            )}

            <div style={styles.workersSection}>
              <h3 style={styles.workersTitle}>Assigned Workers ({getApplicationsForTask(selectedTask._id).length}/{selectedTask.maxEmployees})</h3>
              <div style={styles.workersList}>
                {getApplicationsForTask(selectedTask._id).length === 0 ? (
                  <p style={styles.noWorkers}>No workers assigned yet</p>
                ) : (
                  getApplicationsForTask(selectedTask._id).map(app => {
                    let employeeName = 'Unknown';
                    if (app.employee) {
                      if (typeof app.employee === 'object' && app.employee.name) {
                        employeeName = app.employee.name;
                      } else if (typeof app.employee === 'string') {
                        employeeName = getEmployeeName(app.employee);
                      }
                    }
                    
                    return (
                      <div key={app._id} style={styles.workerCard}>
                        <div style={styles.workerInfo}>
                          <div style={styles.workerName}>{employeeName}</div>
                          <div style={styles.workerStatus}>✅ Approved</div>
                        </div>
                        {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'master') && (
                          <button onClick={() => handleRemoveEmployee(app.employee._id || app.employee, app._id)} style={styles.removeButton}>Remove</button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif' },
  backButtonContainer: { display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' },
  closeButton: { background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', width: '36px', height: '36px', color: '#ffffff', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' },
  loadingSpinner: { width: '40px', height: '40px', border: '3px solid rgba(0,209,255,0.3)', borderRadius: '50%', borderTopColor: '#00d1ff', animation: 'spin 1s linear infinite' },
  
  // Search and Filter Styles
  searchFilterBar: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  searchContainer: { flex: 1, position: 'relative' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: '14px' },
  searchInput: { width: '100%', padding: '10px 12px 10px 35px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' },
  filterToggleButton: { padding: '10px 16px', background: 'rgba(0,209,255,0.2)', border: '1px solid #00d1ff', borderRadius: '10px', color: '#00d1ff', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
  filtersPanel: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' },
  filterRow: { display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' },
  filterLabel: { color: 'rgba(255,255,255,0.7)', fontSize: '12px' },
  filterSelect: { padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px' },
  clearFiltersButton: { padding: '8px 16px', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontSize: '13px' },
  conflictWarning: { background: 'rgba(249,115,22,0.2)', border: '1px solid #f97316', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#f97316', fontSize: '13px' },
  
  calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  navButton: { padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#ffffff', cursor: 'pointer', fontSize: '16px' },
  monthTitle: { fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 },
  viewButtons: { display: 'flex', gap: '8px' },
  viewButton: { padding: '6px 14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', color: '#ffffff', cursor: 'pointer', fontSize: '12px' },
  weekHeaders: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' },
  weekDay: { textAlign: 'center', padding: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '500' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' },
  dayCell: { minHeight: '100px', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' },
  dayNumber: { fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' },
  dayTasks: { display: 'flex', flexDirection: 'column', gap: '4px' },
  taskDot: { fontSize: '10px', padding: '2px 6px', borderRadius: '4px', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' },
  moreTasks: { fontSize: '10px', color: 'rgba(255,255,255,0.5)', padding: '2px 4px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' },
  modalLarge: { background: '#1e293b', borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '90%', maxHeight: '85vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 },
  closeButton: { background: 'none', border: 'none', color: '#ffffff', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' },
  tasksList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  taskCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  taskCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  taskTitle: { fontSize: '14px', fontWeight: '600', color: '#ffffff', margin: 0 },
  taskDetails: { display: 'flex', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', flexWrap: 'wrap' },
  taskMeta: { fontSize: '11px', color: '#00d1ff' },
  taskStatusBadge: { padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', color: '#ffffff' },
  noTasks: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '40px' },
  taskInfoCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', marginBottom: '20px' },
  taskInfoRow: { display: 'flex', gap: '20px', marginBottom: '8px', fontSize: '13px', color: '#ffffff', flexWrap: 'wrap' },
  taskDescription: { fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '8px' },
  editSection: { background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '20px' },
  editHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  editTitle: { fontSize: '14px', fontWeight: '600', color: '#ffffff', margin: 0 },
  editButton: { padding: '4px 12px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: '#ffffff', cursor: 'pointer', fontSize: '11px' },
  cancelEditButton: { padding: '4px 12px', background: '#6b7280', border: 'none', borderRadius: '6px', color: '#ffffff', cursor: 'pointer', fontSize: '11px' },
  editForm: { marginTop: '12px' },
  input: { width: '100%', padding: '8px 12px', marginBottom: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#ffffff', fontSize: '12px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px 12px', marginBottom: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#ffffff', fontFamily: 'inherit', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box' },
  timeRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  editButtons: { display: 'flex', gap: '10px', marginTop: '12px' },
  saveButton: { flex: 1, padding: '8px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '8px', color: '#ffffff', cursor: 'pointer', fontSize: '12px' },
  cancelTaskButton: { flex: 1, padding: '8px', background: '#ef4444', border: 'none', borderRadius: '8px', color: '#ffffff', cursor: 'pointer', fontSize: '12px' },
  taskQuickInfo: { marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' },
  workersSection: { marginTop: '20px' },
  workersTitle: { fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' },
  workersList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  workerCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px 12px' },
  workerInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  workerName: { color: '#ffffff', fontSize: '13px', fontWeight: '500' },
  workerStatus: { fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '12px' },
  removeButton: { background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '6px', padding: '4px 10px', color: '#ef4444', cursor: 'pointer', fontSize: '11px' },
  noWorkers: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '20px' },
  legend: { display: 'flex', gap: '20px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', color: 'rgba(255,255,255,0.7)', flexWrap: 'wrap' },
  legendDot: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', marginRight: '6px' },
};

export default SmartCalendar;