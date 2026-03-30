import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Simple components for testing
const Login = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '100px auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#4F46E5' }}>TaskBridge</h1>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      
      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c00', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Demo Credentials:</p>
        <p><strong>Admin:</strong> admin@school.com / Admin@123</p>
        <p><strong>Employee:</strong> john@school.com / Employee@123</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Welcome, {user.name}!</h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Dashboard</h2>
        <p>Role: {user.role}</p>
        <p>Email: {user.email}</p>
        <p>Organization: {user.organization?.name}</p>
        
        <div style={{ marginTop: '20px', padding: '20px', background: '#f3f4f6', borderRadius: '10px' }}>
          <h3>TaskBridge is working! 🎉</h3>
          <p>Your backend is connected and running.</p>
          <p>Next steps: Build out the full UI with all features.</p>
        </div>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

const theme = createTheme({
  palette: {
    primary: { main: '#4F46E5' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;