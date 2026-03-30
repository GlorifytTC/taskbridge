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

const theme = createTheme({
  palette: {
    primary: { main: '#4F46E5' },
    background: { default: '#F9FAFB' },
  },
});

function App() {
  console.log('✅ App rendering...');
  
  return (
    <HashRouter basename="/taskbridge">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/dashboard" element={
                <Layout>
                  <Dashboard />
                </Layout>
              } />
            </Routes>
            <ToastContainer />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;