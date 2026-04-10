import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MasterDashboard from './pages/MasterDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import SmartCalendar from './components/SmartCalendar';
import CreateAccount from './components/CreateAccount';
import About from './pages/About'; // Import About page
import Pricing from './pages/Pricing'; 
import Contact from './pages/Contact';

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
            } else if (data.user.role === 'superadmin') {
              setCurrentPage('superadmin');
            } else if (data.user.role === 'admin') {
              setCurrentPage('admin');
            } else if (data.user.role === 'employee') {
              setCurrentPage('employee');
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
    setCurrentPage('login');
  };

  const goToLanding = () => {
    setCurrentPage('landing');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    // Redirect based on role
    if (userData.role === 'master') {
      setCurrentPage('master');
    } else if (userData.role === 'superadmin') {
      setCurrentPage('superadmin');
    } else if (userData.role === 'admin') {
      setCurrentPage('admin');
    } else if (userData.role === 'employee') {
      setCurrentPage('employee');
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

  // Public routes
  if (currentPage === 'login') {
    return <Login onBack={goToLanding} onLogin={handleLogin} onNavigate={handleNavigate} />;
  }

  // Create Account route
  if (currentPage === 'create-account') {
    return <CreateAccount onBack={() => setCurrentPage('login')} onLogin={handleLogin} />;
  }

  // About page (public)
  if (currentPage === 'about') {
    return <About user={user} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'pricing') {  
    return <Pricing user={user} onNavigate={handleNavigate} />;
  }
  if (currentPage === 'Contact') {  
    return <Contact user={user} onNavigate={handleNavigate} />;
  }
  // Protected routes with role-based dashboards
  if (currentPage === 'master' && user) {
    return <MasterDashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'superadmin' && user) {
    return <SuperAdminDashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'admin' && user) {
    return <AdminDashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'employee' && user) {
    return <EmployeeDashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
  }

  // Feature pages
  if (currentPage === 'profile' && user) {
    return <Profile user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'tasks' && user) {
    return <Tasks user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'calendar' && user) {
    return <SmartCalendar user={user} onLogout={handleLogout} onNavigate={handleNavigate} onBack={() => {
      if (user?.role === 'master') setCurrentPage('master');
      else if (user?.role === 'superadmin') setCurrentPage('superadmin');
      else if (user?.role === 'admin') setCurrentPage('admin');
      else setCurrentPage('dashboard');
    }} />;
  }

  // Default landing page
  return <Landing onLoginClick={goToLogin} onNavigate={handleNavigate} />;
}

export default App;