import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VerifyEmail = ({ onLogin }) => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/auth/verify-email/${token}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Email verified successfully! Your 14-day trial has started.');
          // Auto login after verification
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setTimeout(() => {
            onLogin(data.user);
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Invalid or expired verification link.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };
    
    if (token) {
      verifyEmail();
    }
  }, [token, onLogin]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'verifying' && (
          <>
            <div style={styles.spinner}></div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we verify your account.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ ...styles.icon, background: '#10b981' }}>✓</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <p>Redirecting to your dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ ...styles.icon, background: '#ef4444' }}>!</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/login')} style={styles.button}>
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
  },
  card: {
    background: '#1e293b',
    borderRadius: '24px',
    padding: '48px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid rgba(0,209,255,0.3)',
    borderRadius: '50%',
    borderTopColor: '#00d1ff',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  icon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: 'white',
    margin: '0 auto 20px',
  },
  button: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '20px',
  },
};

export default VerifyEmail;