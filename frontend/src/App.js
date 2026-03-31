import React, { useState, useEffect } from 'react';

// Simple Login Component
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>TaskBridge</h1>
        <h2 style={styles.subtitle}>Sign In</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        
        
      </div>
    </div>
  );
}

// Simple Dashboard Component
function Dashboard({ user, onLogout }) {
  const [userData, setUserData] = useState(user);
  
  useEffect(() => {
    // Fetch fresh user data
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setUserData(data.user);
        })
        .catch(console.error);
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>TaskBridge</h1>
        <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
      </div>
      
      <div style={styles.card}>
        <h2>Welcome, {userData?.name}!</h2>
        <p><strong>Email:</strong> {userData?.email}</p>
        <p><strong>Role:</strong> {userData?.role}</p>
        <p><strong>Organization:</strong> {userData?.organization?.name || 'TaskBridge Master'}</p>
      </div>
      
      <div style={styles.successCard}>
        <h3>✅ TaskBridge is Fully Working!</h3>
        <p>Backend: Connected to Railway</p>
        <p>Database: MongoDB Atlas with your users</p>
        <p>Authentication: Working with JWT tokens</p>
      </div>
    </div>
  );
}

// Main App
function App() {
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
          } else {
            localStorage.removeItem('token');
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

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    maxWidth: '800px',
    margin: '0 auto 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '15px 30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  headerTitle: {
    margin: 0,
    color: '#4F46E5'
  },
  card: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '40px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  title: {
    textAlign: 'center',
    color: '#4F46E5',
    marginBottom: '10px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px'
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px'
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px'
  },
  demo: {
    marginTop: '30px',
    padding: '15px',
    background: '#f0f0f0',
    borderRadius: '5px',
    fontSize: '12px'
  },
  successCard: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    background: '#d4edda',
    color: '#155724',
    borderRadius: '10px',
    border: '1px solid #c3e6cb'
  },
  logoutButton: {
    padding: '8px 20px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  loading: {
    textAlign: 'center',
    marginTop: '100px',
    fontSize: '18px',
    color: '#666'
  }
};

export default App;