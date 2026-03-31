import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MasterDashboard from './pages/MasterDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
            // Check user role to set correct page
            if (data.user.role === 'master') {
              setCurrentPage('master');
            } else {
              setCurrentPage('dashboard');
            }
          }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const goToLogin = () => {
    console.log('Going to login page');
    setCurrentPage('login');
  };

  const goToLanding = () => {
    console.log('Going to landing');
    setCurrentPage('landing');
  };

  const handleLogin = (userData) => {
    console.log('User logged in:', userData);
    setUser(userData);
    // Redirect based on role
    if (userData.role === 'master') {
      setCurrentPage('master');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentPage('landing');
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>Loading...</div>;
  }

  if (currentPage === 'login') {
    return <Login onBack={goToLanding} onLogin={handleLogin} />;
  }

  if (currentPage === 'master' && user) {
    return <MasterDashboard user={user} onLogout={handleLogout} />;
  }

  if (currentPage === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <Landing onLoginClick={goToLogin} />;
}

export default App;