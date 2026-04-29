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
import RoomAssignment from './components/RoomAssignment';
import VerifyEmail from './pages/VerifyEmail';

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
    
    if (path.startsWith('/verify-email/')) {
      console.log('Verify email page detected');
      setCurrentPage('verify-email');
      setLoading(false);
      return;
    }
  }, []);

  // ✅ FIXED: Check token and validate with backend AFTER login
  // In App.js, add this at the beginning of your auth check:
useEffect(() => {
  const checkAuth = async () => {
    let token = localStorage.getItem('token');
    
    // ✅ Fix: Check if token is null, 'null', or 'undefined'
    if (!token || token === 'null' || token === 'undefined') {
      console.log('❌ Invalid token found, clearing...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLoading(false);
      return;
    }
    
    console.log('🔐 Checking auth with token length:', token.length);
    
    try {
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      console.log('📡 Auth check response:', data);
      
      if (data.success && data.user) {
        setUser(data.user);
        // Redirect based on role...
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('❌ Auth check error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };
  
  checkAuth();
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
    console.log('✅ Login successful, user:', userData);
    setUser(userData);
    // ✅ Redirect based on role immediately
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
    console.log('Logging out');
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

  // Verify Email route
  if (currentPage === 'verify-email') {
    return <VerifyEmail onLogin={handleLogin} />;
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

  // Room Assignment route
  if (currentPage === 'room-assignment' && user) {
    return <RoomAssignment user={user} onClose={() => {
      if (user?.role === 'master') setCurrentPage('master');
      else if (user?.role === 'superadmin') setCurrentPage('superadmin');
      else if (user?.role === 'admin') setCurrentPage('admin');
      else if (user?.role === 'employee') setCurrentPage('employee');
      else setCurrentPage('dashboard');
    }} />;
  }

  // ✅ Protected routes - CHECK USER EXISTS
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

  // ✅ If no user but trying to access protected page, redirect to landing
  if (!user && (currentPage === 'superadmin' || currentPage === 'admin' || currentPage === 'employee' || currentPage === 'dashboard')) {
    console.log('No user found, redirecting to landing');
    return <Landing onLoginClick={goToLogin} onNavigate={handleNavigate} />;
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