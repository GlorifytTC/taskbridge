import React, { useState, useEffect } from 'react';

const MasterDashboard = ({ onLogout }) => {
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
  const [selectedPlan, setSelectedPlan] = useState('basic');
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
      const orgData = await orgRes.json();
      
      if (orgData.success) {
        const orgs = orgData.data;
        setOrganizations(orgs);
        
        const activeSubs = orgs.filter(o => o.subscription?.status === 'active').length;
        const trialExpiring = orgs.filter(o => {
          if (o.subscription?.status === 'trial' && o.subscription?.endDate) {
            const daysLeft = Math.ceil((new Date(o.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));
            return daysLeft <= 7 && daysLeft > 0;
          }
          return false;
        }).length;
        
        setStats({
          totalOrganizations: orgs.length,
          totalUsers: orgs.reduce((sum, org) => sum + (org.userCount || 0), 0),
          totalTasks: orgs.reduce((sum, org) => sum + (org.taskCount || 0), 0),
          monthlyRevenue: 12500,
          activeSubscriptions: activeSubs,
          trialExpiring: trialExpiring,
          pendingOrganizations: orgs.filter(o => o.status === 'pending').length
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newOrg = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
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
        fetchDashboardData();
        setShowOrgModal(false);
      }
    } catch (error) {
      console.error('Error creating organization:', error);
    }
  };

  const handleChangePlan = async () => {
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
          plan: selectedPlan, 
          duration: selectedDuration 
        })
      });
      
      if (response.ok) {
        setShowPlanModal(false);
        setSelectedOrg(null);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error changing plan:', error);
    }
  };


  // Fetch users for an organization
const fetchOrganizationUsers = async (orgId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/organizations/${orgId}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) {
      setSelectedOrgUsers(data.users);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

// Create new super admin or admin
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
    
    if (response.ok) {
      setShowCreateUserModal(false);
      setNewUserData({ name: '', email: '', password: '', role: 'superadmin' });
      fetchOrganizationUsers(selectedOrg._id);
    }
  } catch (error) {
    console.error('Error creating user:', error);
  }
};

// Reset user password
const handleResetPassword = async () => {
  if (!selectedUser) return;
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${selectedUser._id}/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password: newPassword })
    });
    
    if (response.ok) {
      setShowResetPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
      alert('Password reset successfully!');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
  }
};

// Delete user
const handleDeleteUser = async (userId) => {
  if (!window.confirm('Are you sure you want to delete this user?')) return;
  try {
    const token = localStorage.getItem('token');
    await fetch(`https://taskbridge-production-9d91.up.railway.app/api/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchOrganizationUsers(selectedOrg._id);
  } catch (error) {
    console.error('Error deleting user:', error);
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
      setShowExtendModal(false);
      setSelectedOrg(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error extending subscription:', error);
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

  const getDaysLeft = (endDate) => {
    if (!endDate) return 'N/A';
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    return `${days} days`;
  };

  const getTotalPrice = (plan, months) => {
  const prices = { basic: 49, professional: 99, enterprise: 299 };
  let total = prices[plan] * months;
  if (months >= 3) total = total * 0.95;
  if (months >= 6) total = total * 0.9;
  if (months >= 12) total = total * 0.85;
  return Math.round(total);
};

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          org.email.toLowerCase().includes(searchTerm.toLowerCase());
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
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Master Dashboard</h1>
          <p style={styles.subtitle}>System overview and organization management</p>
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

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
          <div style={styles.statIcon}><i className="fas fa-exclamation-triangle"></i></div>
          <div style={styles.statValue}>{stats.trialExpiring}</div>
          <div style={styles.statLabel}>Trials Expiring Soon</div>
        </div>
      </div>

      <div style={styles.actionsBar}>
        <button onClick={() => setShowOrgModal(true)} style={styles.addButton}>
          <i className="fas fa-plus"></i> New Organization
        </button>
        <div style={styles.searchFilter}>
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="trial">Trial</option>
          </select>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Organization</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Plan</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Users</th>
              <th style={styles.th}>Tasks</th>
              <th style={styles.th}>Subscription</th>
              <th style={styles.th}>Actions</th>
             </tr>
          </thead>
          <tbody>
            {filteredOrgs.map((org) => (
              <tr key={org._id} style={styles.tableRow}>
                <td style={styles.td}>
                  <strong>{org.name}</strong>
                  <div style={styles.orgDetails}>{org.address?.city && `${org.address.city}`}</div>
                    <button 
                    onClick={() => {
                        setSelectedOrg(org);
                        fetchOrganizationUsers(org._id);
                        setShowUsersModal(true);
                    }}
                    style={styles.usersButton}
                    title="Manage Users"
                    >
                    <i className="fas fa-users-cog"></i>
                    </button>
                </td>
                <td style={styles.td}>
                  <div>{org.email}</div>
                  <div style={styles.orgDetails}>{org.phone}</div>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.planBadge,
                    background: org.subscription?.plan === 'enterprise' ? '#8b5cf6' : 
                                org.subscription?.plan === 'professional' ? '#3b82f6' : '#10b981'
                  }}>
                    {org.subscription?.plan || 'trial'}
                  </span>
                  
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    background: org.isActive ? '#10b981' : '#ef4444'
                  }}>
                    {org.isActive ? 'Active' : 'Paused'}
                    {org.subscription?.status === 'trial' && <span style={styles.trialBadge}>Trial</span>}
                  </span>
                </td>
                <td style={styles.td}>{org.userCount || 0}</td>
                <td style={styles.td}>{org.taskCount || 0}</td>
                <td style={styles.td}>
                  <div>{getDaysLeft(org.subscription?.endDate)} left</div>
                  <div style={styles.orgDetails}>
                    {org.subscription?.endDate && new Date(org.subscription.endDate).toLocaleDateString()}
                  </div>
                  
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button onClick={() => { setSelectedOrg(org); setShowExtendModal(true); }} style={styles.extendButton} title="Extend Subscription">
                      <i className="fas fa-calendar-plus"></i>
                    </button>
                    <button onClick={() => org.isActive ? handlePauseOrg(org._id) : handleResumeOrg(org._id)} style={org.isActive ? styles.pauseButton : styles.resumeButton} title={org.isActive ? 'Pause' : 'Resume'}>
                      <i className={`fas fa-${org.isActive ? 'pause' : 'play'}`}></i>
                    </button>
                    <button onClick={() => { setSelectedOrg(org); setSelectedPlan(org.subscription?.plan || 'basic'); setSelectedDuration(1); setShowPlanModal(true); }} style={styles.planButton} title="Change Plan">
                      <i className="fas fa-tag"></i>
                    </button>
                    <button onClick={() => { setSelectedOrg(org); setShowDeleteConfirm(true); }} style={styles.deleteButton} title="Delete">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Organization Modal */}
      {showOrgModal && (
        <div style={styles.modalOverlay} onClick={() => setShowOrgModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Organization</h2>
            <form onSubmit={handleCreateOrganization}>
              <input type="text" name="name" placeholder="Organization Name" style={styles.input} required />
              <input type="email" name="email" placeholder="Email" style={styles.input} required />
              <input type="tel" name="phone" placeholder="Phone" style={styles.input} />
              <select name="plan" style={styles.select} defaultValue="trial">
                <option value="trial">Trial (14 days)</option>
                <option value="basic">Basic - $49/month</option>
                <option value="professional">Professional - $99/month</option>
                <option value="enterprise">Enterprise - $299/month</option>
              </select>
              <input type="number" name="trialDays" placeholder="Trial Days (default: 14)" style={styles.input} />
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowOrgModal(false)} style={styles.cancelButton}>Cancel</button>
                <button type="submit" style={styles.submitButton}>Create Organization</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extend Subscription Modal */}
      {showExtendModal && (
        <div style={styles.modalOverlay} onClick={() => setShowExtendModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Extend Subscription</h2>
            <p>Extend subscription for <strong>{selectedOrg?.name}</strong></p>
            <input type="number" value={extendDays} onChange={(e) => setExtendDays(parseInt(e.target.value))} placeholder="Days to extend" style={styles.input} min="1" max="365" />
            <div style={styles.modalButtons}>
              <button onClick={() => setShowExtendModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleExtendSubscription} style={styles.submitButton}>Extend by {extendDays} days</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal - Updated with scrollable content */}
{showPlanModal && (
  <div style={styles.modalOverlay} onClick={() => setShowPlanModal(false)}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <h2 style={styles.modalTitle}>Change Subscription Plan</h2>
      <p style={{ marginBottom: '20px', fontSize: '14px' }}>Change plan for <strong>{selectedOrg?.name}</strong></p>
      
      <div style={styles.planOptions}>
        <div onClick={() => setSelectedPlan('basic')} style={{...styles.planCard, borderColor: selectedPlan === 'basic' ? '#00d1ff' : 'rgba(255,255,255,0.2)', background: selectedPlan === 'basic' ? 'rgba(0,209,255,0.1)' : 'rgba(255,255,255,0.05)'}}>
          <h3 style={{ fontSize: '16px', margin: 0 }}>Basic</h3>
          <div style={styles.planPrice}>$49<span>/month</span></div>
          <ul style={styles.planFeatures}>
            <li>✓ Up to 50 employees</li>
            <li>✓ 1 branch</li>
            <li>✓ Basic reports</li>
            <li>✓ Email support</li>
          </ul>
        </div>
        <div onClick={() => setSelectedPlan('professional')} style={{...styles.planCard, borderColor: selectedPlan === 'professional' ? '#00d1ff' : 'rgba(255,255,255,0.2)', background: selectedPlan === 'professional' ? 'rgba(0,209,255,0.1)' : 'rgba(255,255,255,0.05)'}}>
          <h3 style={{ fontSize: '16px', margin: 0 }}>Professional</h3>
          <div style={styles.planPrice}>$99<span>/month</span></div>
          <ul style={styles.planFeatures}>
            <li>✓ Up to 200 employees</li>
            <li>✓ 5 branches</li>
            <li>✓ Advanced reports</li>
            <li>✓ Priority support</li>
            <li>✓ API access</li>
          </ul>
        </div>
        <div onClick={() => setSelectedPlan('enterprise')} style={{...styles.planCard, borderColor: selectedPlan === 'enterprise' ? '#00d1ff' : 'rgba(255,255,255,0.2)', background: selectedPlan === 'enterprise' ? 'rgba(0,209,255,0.1)' : 'rgba(255,255,255,0.05)'}}>
          <h3 style={{ fontSize: '16px', margin: 0 }}>Enterprise</h3>
          <div style={styles.planPrice}>$299<span>/month</span></div>
          <ul style={styles.planFeatures}>
            <li>✓ Unlimited employees</li>
            <li>✓ Unlimited branches</li>
            <li>✓ Custom reports</li>
            <li>✓ 24/7 support</li>
            <li>✓ Full API access</li>
            <li>✓ Custom integrations</li>
          </ul>
        </div>
      </div>
      
      <div style={styles.durationSelector}>
        <label style={{ fontSize: '14px' }}>Duration:</label>
        <select value={selectedDuration} onChange={(e) => setSelectedDuration(parseInt(e.target.value))} style={styles.durationSelect}>
          <option value={1}>1 month</option>
          <option value={3}>3 months (save 5%)</option>
          <option value={6}>6 months (save 10%)</option>
          <option value={12}>12 months (save 15%)</option>
        </select>
      </div>
      
      <div style={styles.priceSummary}>
        <strong>Total:</strong> ${getTotalPrice(selectedPlan, selectedDuration)}
      </div>
      
      <div style={styles.modalButtons}>
        
        <button onClick={() => setShowPlanModal(false)} style={styles.cancelButton}>Cancel</button>
        <button onClick={handleChangePlan} style={styles.submitButton}>Change to {selectedPlan}</button>
      </div>
    </div>
  </div>
)}{/* Users Management Modal */}
{showUsersModal && (
  <div style={styles.modalOverlay} onClick={() => setShowUsersModal(false)}>
    <div style={{...styles.modal, maxWidth: '800px'}} onClick={(e) => e.stopPropagation()}>
      <h2 style={styles.modalTitle}>
        Manage Users - {selectedOrg?.name}
        <button 
          onClick={() => {
            setShowCreateUserModal(true);
          }}
          style={styles.addUserButton}
        >
          <i className="fas fa-plus"></i> Add User
        </button>
      </h2>
      
      <div style={styles.usersTableContainer}>
        <table style={styles.usersTable}>
          <thead>
            <tr style={styles.tableHeader}>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
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
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div style={styles.actionButtons}>
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setNewPassword('');
                        setShowResetPasswordModal(true);
                      }}
                      style={styles.resetButton}
                      title="Reset Password"
                    >
                      <i className="fas fa-key"></i>
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user._id)}
                      style={styles.deleteButton}
                      title="Delete User"
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
      
      <div style={styles.modalButtons}>
        <button onClick={() => setShowUsersModal(false)} style={styles.cancelButton}>Close</button>
      </div>
    </div>
  </div>
)}

{/* Create User Modal */}
{showCreateUserModal && (
  <div style={styles.modalOverlay} onClick={() => setShowCreateUserModal(false)}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <h2 style={styles.modalTitle}>Add New User</h2>
      <form onSubmit={handleCreateUser}>
        <input
          type="text"
          placeholder="Full Name"
          value={newUserData.name}
          onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
          style={styles.input}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUserData.email}
          onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newUserData.password}
          onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
          style={styles.input}
          required
        />
        <select
          value={newUserData.role}
          onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
          style={styles.select}
        >
          <option value="superadmin">Super Admin</option>
          <option value="admin">Admin</option>
        </select>
        <div style={styles.modalButtons}>
          <button type="button" onClick={() => setShowCreateUserModal(false)} style={styles.cancelButton}>Cancel</button>
          <button type="submit" style={styles.submitButton}>Create User</button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Reset Password Modal */}
{showResetPasswordModal && (
  <div style={styles.modalOverlay} onClick={() => setShowResetPasswordModal(false)}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <h2 style={styles.modalTitle}>Reset Password</h2>
      <p>Reset password for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})</p>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={styles.input}
        required
      />
      <div style={styles.modalButtons}>
        <button onClick={() => setShowResetPasswordModal(false)} style={styles.cancelButton}>Cancel</button>
        <button onClick={handleResetPassword} style={styles.submitButton}>Reset Password</button>
      </div>
    </div>
  </div>
)}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Delete Organization</h2>
            <p>Are you sure you want to delete <strong>{selectedOrg?.name}</strong>?</p>
            <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>⚠️ This action cannot be undone. All data will be permanently removed.</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteConfirm(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleDeleteOrg} style={styles.confirmDeleteButton}>Delete Forever</button>
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
durationSelect: {
  padding: '8px 12px',
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  flex: 1,
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
  // Replace the planOptions and related styles with these:

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
  span: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.6)',
  }
},
planFeatures: {
  listStyle: 'none',
  padding: 0,
  fontSize: '11px',
  li: {
    marginBottom: '4px',
  }
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
  background: 'rgba(255,255,255,0.08)',
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
usersButton: {
  background: 'rgba(59, 130, 246, 0.2)',
  border: '1px solid #3b82f6',
  borderRadius: '8px',
  padding: '6px 10px',
  color: '#3b82f6',
  cursor: 'pointer',
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
};

// Add to the existing styleSheet
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  input:focus, select:focus {
    border-color: #00d1ff !important;
    outline: none;
  }
  .statCard:hover {
    transform: translateY(-4px);
  }
  /* Fix for dropdown options visibility */
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