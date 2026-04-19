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
import About from './pages/About';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import ResetPassword from './pages/ResetPassword';

// NEW IMPORTS FOR ROOM ASSIGNMENT SYSTEM
import RoomManagement from './components/RoomManagement';
import WorkerManagement from './components/WorkerManagement';
import GroupManagement from './components/GroupManagement';
import SortingEngine from './components/SortingEngine';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check URL on initial load
  useEffect(() => {
    const path = window.location.pathname;
    console.log('Current path:', path);
    
    if (path.startsWith('/reset-password/')) {
      console.log('Reset password page detected');
      setCurrentPage('reset-password');
      setLoading(false);
      return;
    }
  }, []);

  // Check token and validate with backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // If no token, just stop loading
    if (!token) {
      setLoading(false);
      return;
    }
    
    // Validate token with backend
    fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
          // Redirect based on role
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
        } else {
          // Token invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Auth check error:', err);
        // Don't clear token on network error, keep user logged in
        setLoading(false);
      });
  }, []);

  const goToLogin = () => {
    setCurrentPage('login');
  };

  const goToLanding = () => {
    setCurrentPage('landing');
  };

  const handleNavigate = (page) => {
    console.log('Navigating to:', page);
    setCurrentPage(page);
  };

  const handleLogin = (userData) => {
    setUser(userData);
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
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('landing');
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>Loading...</div>;
  }

  // Reset Password route
  if (currentPage === 'reset-password') {
    return <ResetPassword onBack={goToLanding} onNavigate={handleNavigate} />;
  }

  // Public routes
  if (currentPage === 'login') {
    return <Login onBack={goToLanding} onLogin={handleLogin} onNavigate={handleNavigate} />;
  }

  // Create Account route
  if (currentPage === 'create-account') {
    return <CreateAccount onBack={() => setCurrentPage('login')} onLogin={handleLogin} />;
  }

  // Public pages
  if (currentPage === 'landing') {
    return <Landing onLoginClick={goToLogin} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'about') {
    return <About user={user} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'pricing') {
    return <Pricing user={user} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'contact') {
    return <Contact user={user} onNavigate={handleNavigate} />;
  }

  // ============ NEW ROOM ASSIGNMENT SYSTEM ROUTES ============
  // These routes are accessible to SuperAdmin, Master, and Admin roles
  
  if (currentPage === 'rooms' && user) {
    return <RoomManagement user={user} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'workers' && user) {
    return <WorkerManagement user={user} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'groups' && user) {
    return <GroupManagement user={user} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'sorting' && user) {
    return <SortingEngine user={user} onNavigate={handleNavigate} />;
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