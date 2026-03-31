import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingApplications: 0,
    approvedShifts: 0,
    totalEmployees: 0,
  });
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', background: '#0f172a' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,209,255,0.3)', borderRadius: '50%', borderTopColor: '#00d1ff', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome, {user?.name}!</h1>
          <p style={styles.subtitle}>Here's an overview of your organization</p>
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-tasks"></i></div>
          <div style={styles.statValue}>{stats.totalTasks}</div>
          <div style={styles.statLabel}>Total Tasks</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-clock"></i></div>
          <div style={styles.statValue}>{stats.pendingApplications}</div>
          <div style={styles.statLabel}>Pending Applications</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-check-circle"></i></div>
          <div style={styles.statValue}>{stats.approvedShifts}</div>
          <div style={styles.statLabel}>Approved Shifts</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-users"></i></div>
          <div style={styles.statValue}>{stats.totalEmployees}</div>
          <div style={styles.statLabel}>Total Employees</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <button style={styles.actionButton}>
            <i className="fas fa-plus-circle"></i> Create Task
          </button>
          <button style={styles.actionButton}>
            <i className="fas fa-user-plus"></i> Add Employee
          </button>
          <button style={styles.actionButton}>
            <i className="fas fa-calendar-alt"></i> View Calendar
          </button>
          <button style={styles.actionButton}>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px',
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
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
  section: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '20px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  actionButton: {
    padding: '12px 20px',
    background: 'rgba(0,209,255,0.1)',
    border: '1px solid rgba(0,209,255,0.3)',
    borderRadius: '12px',
    color: '#00d1ff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s',
  },
};

export default Dashboard;