import React from 'react';

const Landing = ({ onLoginClick }) => {
  console.log('Landing page rendered, onLoginClick:', onLoginClick);

  const handleSignIn = () => {
  console.log('Sign In button clicked');
  if (onLoginClick) {
    onLoginClick();
  }
};

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgAnimation}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
        <div style={styles.bgCircle3}></div>
        <div style={styles.bgGrid}></div>
      </div>

      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>T</div>
          <span style={styles.logoText}>TaskBridge</span>
        </div>
        <button onClick={handleSignIn} style={styles.navButton}>
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.tag}>
            <span style={styles.tagDot}></span>
            <span style={styles.tagText}>Smart Staff Management</span>
          </div>
          <h1 style={styles.title}>
            Manage Your <span style={styles.titleGradient}>Workforce</span>
            <br />with Intelligence
          </h1>
          <p style={styles.subtitle}>
            TaskBridge helps schools, hospitals, and organizations manage shifts,
            track attendance, and streamline communication with ease.
          </p>
          <div style={styles.buttons}>
            <button onClick={handleSignIn} style={styles.primaryButton}>
              Get Started <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
            </button>
            <button style={styles.secondaryButton}>
              Watch Demo <i className="fas fa-play" style={{ marginLeft: '8px', fontSize: '12px' }}></i>
            </button>
          </div>

          {/* Stats */}
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>500+</div>
              <div style={styles.statLabel}>Active Organizations</div>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>10K+</div>
              <div style={styles.statLabel}>Employees Managed</div>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>98%</div>
              <div style={styles.statLabel}>Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Robot Animation */}
        <div style={styles.robotContainer}>
          <div style={styles.robot}>
            <div style={styles.robotHead}>
              <div style={styles.robotAntenna}></div>
              <div style={styles.robotFace}>
                <div style={styles.robotEyes}>
                  <div style={styles.robotEye}></div>
                  <div style={styles.robotEye}></div>
                </div>
                <div style={styles.robotMouth}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.features}>
        <h2 style={styles.featuresTitle}>
          Powerful Features for <span style={styles.titleGradient}>Modern Teams</span>
        </h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <i className="fas fa-clock"></i>
            </div>
            <h3>Shift Management</h3>
            <p>Create and manage shifts with flexible scheduling and approval workflows.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <i className="fas fa-users"></i>
            </div>
            <h3>Multi-branch Support</h3>
            <p>Manage multiple locations with centralized control and branch-specific settings.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Real-time Analytics</h3>
            <p>Track attendance, hours worked, and generate comprehensive reports.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <i className="fas fa-bell"></i>
            </div>
            <h3>Smart Notifications</h3>
            <p>Automated alerts for shift assignments, approvals, and reminders.</p>
          </div>
        </div>
      </div>

      {/* Add Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
};

// Styles object (same as before - keeping it compact)
const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f172a',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflowX: 'hidden',
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
    right: '5%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(0, 209, 255, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float1 20s ease-in-out infinite',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '20%',
    left: '5%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(138, 43, 226, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float2 25s ease-in-out infinite',
  },
  bgCircle3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(0, 209, 255, 0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'pulse 15s ease-in-out infinite',
  },
  bgGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'linear-gradient(rgba(0, 209, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 209, 255, 0.03) 1px, transparent 1px)',
    backgroundSize: '50px 50px',
    zIndex: 0,
  },
  navbar: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #fff, #00d1ff)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  navButton: {
    padding: '10px 24px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50px',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  hero: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '60px 40px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: '600px',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(0, 209, 255, 0.1)',
    border: '1px solid rgba(0, 209, 255, 0.3)',
    borderRadius: '50px',
    padding: '6px 16px',
    marginBottom: '24px',
  },
  tagDot: {
    width: '8px',
    height: '8px',
    background: '#00d1ff',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  tagText: {
    fontSize: '14px',
    color: '#00d1ff',
    fontWeight: '500',
  },
  title: {
    fontSize: '56px',
    fontWeight: '700',
    lineHeight: '1.2',
    marginBottom: '24px',
    color: 'white',
  },
  titleGradient: {
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  subtitle: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '32px',
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    marginBottom: '48px',
  },
  primaryButton: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '50px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  secondaryButton: {
    padding: '14px 32px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    paddingTop: '32px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#00d1ff',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statDivider: {
    width: '1px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.2)',
  },
  robotContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  robot: {
    width: '300px',
    height: '300px',
    animation: 'floatRobot 6s ease-in-out infinite',
  },
  robotHead: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
    borderRadius: '60px',
    border: '2px solid rgba(0, 209, 255, 0.3)',
    position: 'relative',
    boxShadow: '0 0 30px rgba(0, 209, 255, 0.2)',
  },
  robotAntenna: {
    position: 'absolute',
    top: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '30px',
    background: 'linear-gradient(to top, #00d1ff, transparent)',
    borderRadius: '2px',
  },
  robotFace: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  robotEyes: {
    display: 'flex',
    gap: '40px',
    marginBottom: '20px',
  },
  robotEye: {
    width: '40px',
    height: '40px',
    background: '#00d1ff',
    borderRadius: '50%',
    boxShadow: '0 0 20px rgba(0, 209, 255, 0.8)',
    animation: 'eyeBlink 4s infinite',
  },
  robotMouth: {
    width: '80px',
    height: '12px',
    background: '#00d1ff',
    borderRadius: '6px',
    margin: '0 auto',
  },
  features: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '80px 40px',
  },
  featuresTitle: {
    fontSize: '36px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '48px',
    color: 'white',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '32px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    width: '64px',
    height: '64px',
    background: 'rgba(0, 209, 255, 0.1)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '28px',
    color: '#00d1ff',
  },
};

// Add animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float1 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(50px, -50px); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-40px, 40px); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
  }
  @keyframes floatRobot {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  @keyframes eyeBlink {
    0%, 90%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.1); }
  }
  .primaryButton:hover, .secondaryButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 209, 255, 0.3);
  }
  .navButton:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(0, 209, 255, 0.5);
  }
  .featureCard:hover {
    transform: translateY(-8px);
    border-color: rgba(0, 209, 255, 0.3);
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.3);
  }
`;
document.head.appendChild(styleSheet);

export default Landing;