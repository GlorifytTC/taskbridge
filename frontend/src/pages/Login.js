import React, { useState } from 'react';

const Login = ({ onBack, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  // Signup states
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companySize: '1-10',
    phoneNumber: ''
  });
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');
    setResetLoading(true);

    try {
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setResetMessage('Password reset link sent to your email!');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetEmail('');
          setResetMessage('');
        }, 3000);
      } else {
        setResetMessage(data.message || 'Email not found');
      }
    } catch (err) {
      setResetMessage('Network error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');
    
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }
    
    if (signupData.password.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }
    
    setSignupLoading(true);
    
    try {
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          companyName: signupData.companyName,
          companySize: signupData.companySize,
          phoneNumber: signupData.phoneNumber
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSignupSuccess(data.message || 'Account created! Please check your email to verify your account.');
        setTimeout(() => {
          setShowSignup(false);
          setSignupData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            companyName: '',
            companySize: '1-10',
            phoneNumber: ''
          });
          setSignupSuccess('');
        }, 5000);
      } else {
        setSignupError(data.message || 'Failed to create account');
      }
    } catch (err) {
      setSignupError('Network error: ' + err.message);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgAnimation}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
        <div style={styles.bgCircle3}></div>
      </div>

      <div style={styles.cardWrapper}>
        <div style={styles.card}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>T</div>
            <h1 style={styles.logoTitle}>TaskBridge</h1>
          </div>

          {!showForgotPassword && !showSignup ? (
            // LOGIN FORM
            <>
              <h2 style={styles.welcomeTitle}>Welcome Back</h2>
              <p style={styles.welcomeSubtitle}>Sign in to your account</p>

              {error && (
                <div style={styles.errorMessage}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={styles.inputWrapper}>
                    <i className="fas fa-envelope" style={styles.inputIcon}></i>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <div style={styles.inputWrapper}>
                    <i className="fas fa-lock" style={styles.inputIcon}></i>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.forgotPasswordLink}>
                  <button 
                    type="button" 
                    onClick={() => setShowForgotPassword(true)}
                    style={styles.forgotButton}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                >
                  {loading ? (
                    <span><i className="fas fa-spinner fa-spin"></i> Signing in...</span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Sign Up Section */}
              <div style={styles.signupSection}>
                <div style={styles.divider}>
                  <span style={styles.dividerText}>New to TaskBridge?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSignup(true)}
                  style={styles.signupButton}
                >
                  <i className="fas fa-user-plus"></i> Create Free Account (14-day trial)
                </button>
              </div>
            </>
          ) : showForgotPassword ? (
            // FORGOT PASSWORD FORM
            <>
              <h2 style={styles.welcomeTitle}>Reset Password</h2>
              <p style={styles.welcomeSubtitle}>Enter your email to receive reset link</p>

              {resetMessage && (
                <div style={resetMessage.includes('sent') ? styles.successMessage : styles.errorMessage}>
                  <i className={`fas fa-${resetMessage.includes('sent') ? 'check-circle' : 'exclamation-circle'}`} style={{ marginRight: '8px' }}></i>
                  {resetMessage}
                </div>
              )}

              <form onSubmit={handleForgotPassword} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={styles.inputWrapper}>
                    <i className="fas fa-envelope" style={styles.inputIcon}></i>
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  style={resetLoading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                >
                  {resetLoading ? (
                    <span><i className="fas fa-spinner fa-spin"></i> Sending...</span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetMessage('');
                    setResetEmail('');
                  }}
                  style={styles.backToLoginButton}
                >
                  ← Back to Login
                </button>
              </form>
            </>
          ) : (
            // SIGNUP FORM
            <>
              <h2 style={styles.welcomeTitle}>Start Your Free Trial</h2>
              <p style={styles.welcomeSubtitle}>14-day free trial. No credit card required.</p>

              {signupError && (
                <div style={styles.errorMessage}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                  {signupError}
                </div>
              )}

              {signupSuccess && (
                <div style={styles.successMessage}>
                  <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                  {signupSuccess}
                </div>
              )}

              <form onSubmit={handleSignup} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <div style={styles.inputWrapper}>
                    <i className="fas fa-user" style={styles.inputIcon}></i>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={signupData.name}
                      onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <div style={styles.inputWrapper}>
                    <i className="fas fa-envelope" style={styles.inputIcon}></i>
                    <input
                      type="email"
                      placeholder="your@company.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Company Name</label>
                  <div style={styles.inputWrapper}>
                    <i className="fas fa-building" style={styles.inputIcon}></i>
                    <input
                      type="text"
                      placeholder="Your company or school name"
                      value={signupData.companyName}
                      onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Company Size</label>
                  <div style={styles.inputWrapper}>
                    <i className="fas fa-users" style={styles.inputIcon}></i>
                    <select
                      value={signupData.companySize}
                      onChange={(e) => setSignupData({...signupData, companySize: e.target.value})}
                      style={styles.select}
                    >
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number (optional)</label>
                  <div style={styles.inputWrapper}>
                    <i className="fas fa-phone" style={styles.inputIcon}></i>
                    <input
                      type="tel"
                      placeholder="+46 123 456 789"
                      value={signupData.phoneNumber}
                      onChange={(e) => setSignupData({...signupData, phoneNumber: e.target.value})}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password *</label>
                  <div style={styles.inputWrapper}>
                    <i className="fas fa-lock" style={styles.inputIcon}></i>
                    <input
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={signupData.password}
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm Password *</label>
                  <div style={styles.inputWrapper}>
                    <i className="fas fa-check-circle" style={styles.inputIcon}></i>
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.infoBox}>
                  <i className="fas fa-gift" style={{ color: '#f59e0b', marginRight: '8px' }}></i>
                  <span>14-day free trial • No credit card required • Cancel anytime</span>
                </div>

                <button
                  type="submit"
                  disabled={signupLoading}
                  style={signupLoading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                >
                  {signupLoading ? (
                    <span><i className="fas fa-spinner fa-spin"></i> Creating account...</span>
                  ) : (
                    'Start Free Trial'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSignup(false);
                    setSignupError('');
                    setSignupSuccess('');
                  }}
                  style={styles.backToLoginButton}
                >
                  ← Already have an account? Sign In
                </button>
              </form>
            </>
          )}

          <div style={styles.backLink}>
            <button onClick={onBack} style={styles.backButton}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
  },
  bgCircle1: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(0, 209, 255, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float1 20s ease-in-out infinite',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '10%',
    right: '10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(138, 43, 226, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float2 25s ease-in-out infinite',
  },
  bgCircle3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(0, 209, 255, 0.08) 0%, transparent 70%)',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'pulse 15s ease-in-out infinite',
  },
  cardWrapper: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    padding: '20px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '32px',
    padding: '48px 40px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
  },
  logoTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #fff, #00d1ff)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    margin: 0,
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: '8px',
  },
  welcomeSubtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: '32px',
  },
  errorMessage: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '12px',
    color: '#f87171',
    fontSize: '14px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
  },
  successMessage: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '12px',
    padding: '12px',
    color: '#10b981',
    fontSize: '14px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '16px',
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 42px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '14px 14px 14px 42px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    appearance: 'none',
    cursor: 'pointer',
  },
  forgotPasswordLink: {
    textAlign: 'right',
    marginTop: '-8px',
  },
  forgotButton: {
    background: 'none',
    border: 'none',
    color: '#00d1ff',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px 8px',
    transition: 'color 0.3s',
  },
  backToLoginButton: {
    width: '100%',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '8px',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '8px',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  signupSection: {
    marginTop: '24px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: '16px 0',
  },
  dividerText: {
    flex: 1,
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    padding: '0 10px',
  },
  signupButton: {
    width: '100%',
    padding: '12px',
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid #10b981',
    borderRadius: '12px',
    color: '#34d399',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  infoBox: {
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '12px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#f59e0b',
  },
  backLink: {
    marginTop: '32px',
    textAlign: 'center',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'color 0.3s',
    padding: '8px 16px',
  },
};

// Add animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(40px, -40px) rotate(180deg); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-50px, 50px) rotate(-180deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
  }
  .signupButton:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: #34d399;
    transform: translateY(-2px);
  }
  input:focus, select:focus {
    border-color: #00d1ff !important;
    box-shadow: 0 0 0 3px rgba(0, 209, 255, 0.1);
  }
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 209, 255, 0.4);
  }
  .forgotButton:hover {
    color: #fff;
    text-decoration: underline;
  }
  .backButton:hover {
    color: #00d1ff;
  }
  .backToLoginButton:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;
document.head.appendChild(styleSheet);

export default Login;