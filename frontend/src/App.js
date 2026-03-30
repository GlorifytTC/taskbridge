import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Applications from './pages/Applications';
import Employees from './pages/Employees';
import Branches from './pages/Branches';
import JobDescriptions from './pages/JobDescriptions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5',
      light: '#818CF8',
      dark: '#4338CA',
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <HashRouter basename="/taskbridge">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/applications" element={<Applications />} />
                  
                  <Route element={<RoleBasedRoute allowedRoles={['admin', 'superadmin', 'master']} />}>
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/branches" element={<Branches />} />
                    <Route path="/job-descriptions" element={<JobDescriptions />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                  
                  <Route element={<RoleBasedRoute allowedRoles={['superadmin', 'master']} />}>
                    <Route path="/billing" element={<Billing />} />
                  </Route>
                  
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>
              
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;