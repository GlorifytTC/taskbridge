import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingApplications: 0,
    approvedShifts: 0,
    totalEmployees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard stats...');
        const response = await api.get('/dashboard/stats');
        console.log('Stats response:', response.data);
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: 'white'
      }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  console.log('Rendering dashboard with stats:', stats);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>
        Welcome, {user?.name}!
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          background: 'rgba(0,209,255,0.1)', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #00d1ff'
        }}>
          <div style={{ color: '#00d1ff', fontSize: '14px' }}>Total Tasks</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.totalTasks}</div>
        </div>
        
        <div style={{ 
          background: 'rgba(245,158,11,0.1)', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #f59e0b'
        }}>
          <div style={{ color: '#f59e0b', fontSize: '14px' }}>Pending Applications</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.pendingApplications}</div>
        </div>
        
        <div style={{ 
          background: 'rgba(16,185,129,0.1)', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #10b981'
        }}>
          <div style={{ color: '#10b981', fontSize: '14px' }}>Approved Shifts</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.approvedShifts}</div>
        </div>
        
        <div style={{ 
          background: 'rgba(239,68,68,0.1)', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #ef4444'
        }}>
          <div style={{ color: '#ef4444', fontSize: '14px' }}>Total Employees</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.totalEmployees}</div>
        </div>
      </div>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        padding: '20px', 
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={() => window.location.href = '/taskbridge/#/tasks'}
            style={{
              background: '#00d1ff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Create Task
          </button>
          <button 
            onClick={() => window.location.href = '/taskbridge/#/employees'}
            style={{
              background: '#00d1ff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Add Employee
          </button>
          <button 
            onClick={() => window.location.href = '/taskbridge/#/calendar'}
            style={{
              background: '#00d1ff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            View Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;