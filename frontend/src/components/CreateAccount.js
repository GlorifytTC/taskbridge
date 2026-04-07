import React, { useState, useEffect } from 'react';

const CreateAccount = ({ onBack, onLogin }) => {
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [organizationData, setOrganizationData] = useState(null);

  useEffect(() => {
    // Get email from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      validateEmail(emailParam);
    }
  }, []);

  const validateEmail = async (emailToCheck) => {
    try {
      const response = await fetch(`https://taskbridge-production-9d91.up.railway.app/api/auth/validate-organization?email=${encodeURIComponent(emailToCheck)}`);
      const data = await response.json();
      
      if (data.exists && data.needsSetup) {
        setValidEmail(true);
        setOrganizationData(data.organization);
        setSchoolName(data.organization.name);
        setError('');
      } else if (!data.exists) {
        setError('This email is not registered. Please check your invoice or contact support.');
        setValidEmail(false);
      } else if (!data.needsSetup) {
        setError('Account already set up for this organization. Please login instead.');
        setValidEmail(false);
      }
    } catch (err) {
      console.error('Error validating email:', err);
      setError('Error validating email. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Verify school name matches
    if (schoolName !== organizationData?.name) {
      setError(`School name does not match. Please enter "${organizationData?.name}" exactly as in your contract.`);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/auth/setup-organization-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          schoolName,
          organizationId: organizationData?._id
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onLogin(data.user);
        }, 2000);
      } else {
        setError(data.message || 'Failed to create account');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
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

          <h2 style={styles.welcomeTitle}>Register Your School</h2>
          <p style={styles.welcomeSubtitle}>Verify your information and set up your account</p>

          {error && (
            <div style={styles.errorMessage}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
              {error}
            </div>
          )}

          {success && (
            <div style={styles.successMessage}>
              <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address (from invoice)</label>
              <div style={styles.inputWrapper}>
                <i className="fas fa-envelope" style={styles.inputIcon}></i>
                <input
                  type="email"
                  placeholder="Enter the email from your invoice"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => validateEmail(email)}
                  style={styles.input}
                  required
                  disabled={validEmail}
                />
              </div>
              {validEmail && organizationData && (
                <p style={styles.validMessage}>
                  ✓ Valid: {organizationData.name}
                </p>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                School Name <span style={styles.required}>(exactly as in contract)</span>
              </label>
              <div style={styles.inputWrapper}>
                <i className="fas fa-school" style={styles.inputIcon}></i>
                <input
                  type="text"
                  placeholder="Enter your school name exactly as in contract"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  style={styles.input}
                  required
                  disabled={!validEmail}
                />
              </div>
              {organizationData && schoolName !== organizationData.name && schoolName && (
                <p style={styles.warningMessage}>
                  ⚠️ Must match: "{organizationData.name}"
                </p>
              )}
              {organizationData && schoolName === organizationData.name && (
                <p style={styles.validMessage}>
                  ✓ School name verified
                </p>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <i className="fas fa-lock" style={styles.inputIcon}></i>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                  disabled={!validEmail}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <i className="fas fa-check-circle" style={styles.inputIcon}></i>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                  required
                  disabled={!validEmail}
                />
              </div>
            </div>

            {organizationData && (
              <div style={styles.infoBox}>
                <h4>Your Package: {organizationData.subscription?.plan?.toUpperCase()}</h4>
                <p>📧 {organizationData.subscription?.features?.maxEmailsPerMonth || 0} emails/month</p>
                <p>👥 Up to {organizationData.subscription?.features?.maxEmployees || 0} employees</p>
                <p>🏢 Up to {organizationData.subscription?.features?.maxBranches || 0} branches</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !validEmail}
              style={(loading || !validEmail) ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
            >
              {loading ? (
                <span><i className="fas fa-spinner fa-spin"></i> Creating Account...</span>
              ) : (
                'Register School Account'
              )}
            </button>
          </form>

          <div style={styles.backLink}>
            <button onClick={onBack} style={styles.backButton}>
              ← Back to Login
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
    maxWidth: '500px',
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
  required: {
    color: '#f87171',
    fontSize: '11px',
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
  validMessage: {
    fontSize: '12px',
    color: '#10b981',
    marginTop: '4px',
  },
  warningMessage: {
    fontSize: '12px',
    color: '#f59e0b',
    marginTop: '4px',
  },
  infoBox: {
    background: 'rgba(0, 209, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '8px',
    border: '1px solid rgba(0, 209, 255, 0.2)',
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
  input:focus {
    border-color: #00d1ff !important;
    outline: none;
  }
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 209, 255, 0.4);
  }
  .backButton:hover {
    color: #00d1ff;
  }
`;
document.head.appendChild(styleSheet);

export default CreateAccount;