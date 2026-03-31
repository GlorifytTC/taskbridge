import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingApplications: 0,
    approvedShifts: 0,
    totalEmployees: 0,
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [taskStatusData, setTaskStatusData] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchUpcomingShifts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, attendanceRes, tasksRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/attendance'),
        api.get('/dashboard/task-status'),
      ]);
      
      setStats(statsRes.data);
      setAttendanceData(attendanceRes.data);
      setTaskStatusData(tasksRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingShifts = async () => {
    try {
      const response = await api.get('/tasks?status=open&limit=5');
      setUpcomingShifts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('sv-SE', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Animated Background */}
      <div className="dashboard-bg">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      {/* Welcome Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '100', color: 'white' }}>
          Välkommen tillbaka, <span style={{ 
            background: 'linear-gradient(to right, #00f5ff, #00d1ff)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>{user?.name}!</span>
        </h1>
        <p style={{ color: 'var(--white-70)', marginTop: '0.5rem' }}>
          Här är en översikt över din verksamhet
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Totala Uppgifter</span>
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{stats.totalTasks}</div>
          <div className="stat-trend">
            <i className="fas fa-arrow-up"></i>
            <span>+12% från förra månaden</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Väntande Ansökningar</span>
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{stats.pendingApplications}</div>
          <div className="stat-trend" style={{ color: '#f59e0b' }}>
            <i className="fas fa-clock"></i>
            <span>Behöver granskas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Godkända Skift</span>
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{stats.approvedShifts}</div>
          <div className="stat-trend" style={{ color: '#10b981' }}>
            <i className="fas fa-check-circle"></i>
            <span>Bekräftade</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Anställda</span>
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{stats.totalEmployees}</div>
          <div className="stat-trend">
            <i className="fas fa-users"></i>
            <span>Aktiva medarbetare</span>
          </div>
        </div>
      </div>

      {/* Upcoming Shifts */}
      <div className="shifts-card">
        <div className="shifts-header">
          <div className="shifts-title">
            <i className="fas fa-calendar-alt"></i>
            <span>Kommande Skift</span>
          </div>
          <button 
            onClick={() => window.location.href = '/#/calendar'}
            style={{
              background: 'rgba(0, 209, 255, 0.1)',
              border: '1px solid var(--cyan-400)',
              borderRadius: '50px',
              padding: '0.5rem 1rem',
              color: 'var(--cyan-400)',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Visa alla →
          </button>
        </div>
        
        <div className="shifts-list">
          {upcomingShifts.length > 0 ? (
            upcomingShifts.map((shift) => (
              <div key={shift._id} className="shift-item">
                <div className="shift-info">
                  <div className="shift-date">
                    <div className="shift-day">{formatDate(shift.date)}</div>
                  </div>
                  <div className="shift-details">
                    <h4>{shift.title}</h4>
                    <p>
                      <i className="fas fa-clock"></i>
                      {shift.startTime} - {shift.endTime}
                    </p>
                    <p>
                      <i className="fas fa-map-marker-alt"></i>
                      {shift.location || 'Plats ej angiven'}
                    </p>
                  </div>
                </div>
                <div className={`shift-status status-${shift.status === 'open' ? 'pending' : 'approved'}`}>
                  {shift.status === 'open' ? 'Ledig plats' : 'Bekräftad'}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--white-50)' }}>
              <i className="fas fa-calendar-day" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
              <p>Inga kommande skift</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-grid">
        <button 
          className="action-button"
          onClick={() => window.location.href = '/#/tasks'}
        >
          <i className="fas fa-plus-circle"></i>
          <span>Skapa Ny Uppgift</span>
        </button>
        <button 
          className="action-button"
          onClick={() => window.location.href = '/#/employees'}
        >
          <i className="fas fa-user-plus"></i>
          <span>Lägg Till Anställd</span>
        </button>
        <button 
          className="action-button"
          onClick={() => window.location.href = '/#/reports'}
        >
          <i className="fas fa-chart-line"></i>
          <span>Generera Rapport</span>
        </button>
        <button 
          className="action-button"
          onClick={() => window.location.href = '/#/calendar'}
        >
          <i className="fas fa-calendar-week"></i>
          <span>Visa Kalender</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;