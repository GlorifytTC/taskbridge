import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onLogout, onNavigate }) => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingApplications: 0,
    approvedShifts: 0,
    totalEmployees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);

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
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const isSmall = screenWidth <= 480;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{...styles.header, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center'}}>
        <div>
          <h1 style={{...styles.title, fontSize: isSmall ? '24px' : '32px'}}>Welcome, {user?.name}!</h1>
          <p style={{...styles.subtitle, fontSize: isSmall ? '12px' : '14px'}}>Here's an overview of your organization</p>
        </div>
        <button onClick={onLogout} style={{...styles.logoutButton, fontSize: isSmall ? '12px' : '14px', padding: isSmall ? '8px 16px' : '10px 24px'}}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{...styles.statsGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: isSmall ? '12px' : '20px'}}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-tasks"></i></div>
          <div style={{...styles.statValue, fontSize: isSmall ? '24px' : '32px'}}>{stats.totalTasks}</div>
          <div style={{...styles.statLabel, fontSize: isSmall ? '11px' : '14px'}}>Total Tasks</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-clock"></i></div>
          <div style={{...styles.statValue, fontSize: isSmall ? '24px' : '32px'}}>{stats.pendingApplications}</div>
          <div style={{...styles.statLabel, fontSize: isSmall ? '11px' : '14px'}}>Pending Applications</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-check-circle"></i></div>
          <div style={{...styles.statValue, fontSize: isSmall ? '24px' : '32px'}}>{stats.approvedShifts}</div>
          <div style={{...styles.statLabel, fontSize: isSmall ? '11px' : '14px'}}>Approved Shifts</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-users"></i></div>
          <div style={{...styles.statValue, fontSize: isSmall ? '24px' : '32px'}}>{stats.totalEmployees}</div>
          <div style={{...styles.statLabel, fontSize: isSmall ? '11px' : '14px'}}>Total Employees</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{...styles.section, padding: isSmall ? '16px' : '24px'}}>
        <h2 style={{...styles.sectionTitle, fontSize: isSmall ? '16px' : '20px', marginBottom: isSmall ? '12px' : '20px'}}>Quick Actions</h2>
        <div style={{...styles.actionsGrid, gridTemplateColumns: isSmall ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isSmall ? '10px' : '12px'}}>
          <button 
            onClick={() => onNavigate('tasks')} 
            style={{...styles.actionButton, fontSize: isSmall ? '12px' : '14px', padding: isSmall ? '10px 16px' : '12px 20px'}}
          >
            <i className="fas fa-plus-circle"></i> Manage Tasks
          </button>
          <button 
            onClick={() => onNavigate('employees')} 
            style={{...styles.actionButton, fontSize: isSmall ? '12px' : '14px', padding: isSmall ? '10px 16px' : '12px 20px'}}
          >
            <i className="fas fa-user-plus"></i> Manage Employees
          </button>
          <button 
            onClick={() => onNavigate('calendar')} 
            style={{...styles.actionButton, fontSize: isSmall ? '12px' : '14px', padding: isSmall ? '10px 16px' : '12px 20px'}}
          >
            <i className="fas fa-calendar-alt"></i> View Calendar
          </button>
          <button 
            onClick={() => onNavigate('reports')} 
            style={{...styles.actionButton, fontSize: isSmall ? '12px' : '14px', padding: isSmall ? '10px 16px' : '12px 20px'}}
          >
            <i className="fas fa-chart-line"></i> Generate Report
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
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
  title: {
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
  },
  logoutButton: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50px',
    color: 'white',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
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
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
  },
  section: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontWeight: '600',
    color: 'white',
  },
  actionsGrid: {
    display: 'grid',
  },
  actionButton: {
    background: 'rgba(0,209,255,0.1)',
    border: '1px solid rgba(0,209,255,0.3)',
    borderRadius: '12px',
    color: '#00d1ff',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
};

export default Dashboard;