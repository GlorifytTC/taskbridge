import { useState, useEffect } from 'react';

const MasterDashboard = ({ onLogout }) => {
  const [organizations, setOrganizations] = useState([]);
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    totalTasks: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    trialExpiring: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch organizations
      const orgRes = await fetch('https://taskbridge-production-9d91.up.railway.app/api/organizations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const orgData = await orgRes.json();
      
      if (orgData.success) {
        setOrganizations(orgData.data);
        setStats({
          totalOrganizations: orgData.data.length,
          totalUsers: orgData.data.reduce((sum, org) => sum + (org.userCount || 0), 0),
          totalTasks: orgData.data.reduce((sum, org) => sum + (org.taskCount || 0), 0),
          monthlyRevenue: 12500,
          activeSubscriptions: orgData.data.filter(o => o.subscription?.status === 'active').length,
          trialExpiring: orgData.data.filter(o => o.subscription?.status === 'trial').length
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseOrg = async (orgId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${orgId}/pause`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error pausing organization:', error);
    }
  };

  const handleResumeOrg = async (orgId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${orgId}/resume`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error resuming organization:', error);
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
      setShowDeleteConfirm(false);
      setSelectedOrg(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting organization:', error);
    }
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
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Master Dashboard</h1>
          <p style={styles.subtitle}>System overview and organization management</p>
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-building"></i></div>
          <div style={styles.statValue}>{stats.totalOrganizations}</div>
          <div style={styles.statLabel}>Total Organizations</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-users"></i></div>
          <div style={styles.statValue}>{stats.totalUsers}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-tasks"></i></div>
          <div style={styles.statValue}>{stats.totalTasks}</div>
          <div style={styles.statLabel}>Total Tasks</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-dollar-sign"></i></div>
          <div style={styles.statValue}>${stats.monthlyRevenue.toLocaleString()}</div>
          <div style={styles.statLabel}>Monthly Revenue</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-check-circle"></i></div>
          <div style={styles.statValue}>{stats.activeSubscriptions}</div>
          <div style={styles.statLabel}>Active Subscriptions</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><i className="fas fa-clock"></i></div>
          <div style={styles.statValue}>{stats.trialExpiring}</div>
          <div style={styles.statLabel}>Trial Expiring Soon</div>
        </div>
      </div>

      {/* Organizations Table */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Organizations</h2>
          <button style={styles.addButton}>
            <i className="fas fa-plus"></i> New Organization
          </button>
        </div>
        
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableHeaderCell}>Organization</th>
                <th style={styles.tableHeaderCell}>Email</th>
                <th style={styles.tableHeaderCell}>Plan</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Users</th>
                <th style={styles.tableHeaderCell}>Tasks</th>
                <th style={styles.tableHeaderCell}>Expires</th>
                <th style={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org._id} style={styles.tableRow}>
                  <td><strong>{org.name}</strong></td>
                  <td>{org.email}</td>
                  <td>
                    <span style={{
                      ...styles.planBadge,
                      backgroundColor: org.subscription?.plan === 'enterprise' ? '#8b5cf6' : 
                                      org.subscription?.plan === 'professional' ? '#3b82f6' : '#10b981'
                    }}>
                      {org.subscription?.plan || 'trial'}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: org.isActive ? '#10b981' : '#ef4444'
                    }}>
                      {org.isActive ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td>{org.userCount || 0}</td>
                  <td>{org.taskCount || 0}</td>
                  <td style={{ fontSize: '12px' }}>
                    {org.subscription?.endDate ? new Date(org.subscription.endDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={styles.actionButtons}>
                      <button 
                        onClick={() => org.isActive ? handlePauseOrg(org._id) : handleResumeOrg(org._id)}
                        style={org.isActive ? styles.pauseButton : styles.resumeButton}
                        title={org.isActive ? 'Pause' : 'Resume'}
                      >
                        <i className={`fas fa-${org.isActive ? 'pause' : 'play'}`}></i>
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedOrg(org);
                          setShowDeleteConfirm(true);
                        }}
                        style={styles.deleteButton}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Delete Organization</h3>
            <p>Are you sure you want to delete <strong>{selectedOrg?.name}</strong>?</p>
            <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
              This action cannot be undone. All data will be permanently removed.
            </p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteConfirm(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleDeleteOrg} style={styles.confirmDeleteButton}>
                Delete Forever
              </button>
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
    border: '3px solid rgba(0, 209, 255, 0.3)',
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
    transition: 'all 0.3s',
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
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
  },
  addButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '50px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  tableContainer: {
    overflowX: 'auto',
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
    letterSpacing: '1px',
  },
  tableHeaderCell: {
    padding: '12px 8px',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: '14px',
  },
  planBadge: {
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    display: 'inline-block',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  pauseButton: {
    background: 'rgba(245, 158, 11, 0.2)',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#f59e0b',
    cursor: 'pointer',
  },
  resumeButton: {
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid #10b981',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#10b981',
    cursor: 'pointer',
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#ef4444',
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
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '16px',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
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
  confirmDeleteButton: {
    flex: 1,
    padding: '12px',
    background: '#ef4444',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
  },
};

// Add animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default MasterDashboard;