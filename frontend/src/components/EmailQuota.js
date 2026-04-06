import React, { useState, useEffect } from 'react';

const EmailQuota = ({ organizationId }) => {
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/organizations/email-quota', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setQuota(data.data);
      }
    } catch (error) {
      console.error('Error fetching quota:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading quota...</div>;
  if (!quota) return null;

  const percentage = quota.percentage;
  const isWarning = percentage > 80;
  const isDanger = percentage > 95;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <i className="fas fa-envelope"></i>
        <span>Email Quota: {quota.used} / {quota.limit} emails</span>
      </div>
      <div style={styles.progressBar}>
        <div style={{
          ...styles.progressFill,
          width: `${percentage}%`,
          background: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'
        }}></div>
      </div>
      {!quota.canSend && (
        <div style={styles.warning}>
          ⚠️ Email limit reached! Please upgrade your plan to send more emails.
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '16px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'white',
    fontSize: '14px',
    marginBottom: '8px'
  },
  progressBar: {
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  warning: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#ef4444'
  }
};

export default EmailQuota;