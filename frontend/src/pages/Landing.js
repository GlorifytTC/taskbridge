import React from 'react';

const Landing = ({ onLoginClick }) => {
  console.log('Landing page rendered, onLoginClick:', onLoginClick);

  const handleSignIn = () => {
    console.log('Sign In button clicked');
    if (onLoginClick) {
      onLoginClick();
    }
  };

  // Get dynamic current date for calendar
  const currentDate = new Date();
  const today = currentDate.getDate();

  // Generate dynamic calendar days
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const days = [];
  
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

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
          <div style={styles.logoIcon}>
            <span>T</span>
          </div>
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
        </div>

        {/* Dynamic Calendar Animation */}
        <div style={styles.calendarContainer}>
          <div style={styles.calendar}>
            <div style={styles.calendarHeader}>
              <div style={styles.calendarMonth}>
                TaskBridge
              </div>
            </div>
            <div style={styles.calendarWeekdays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={styles.weekday}>{day}</div>
              ))}
            </div>
            <div style={styles.calendarDays}>
              {days.map((day, index) => (
                <div 
                  key={index} 
                  style={{
                    ...styles.calendarDay,
                    ...(day === today ? styles.today : {}),
                    ...(day && day % 2 === 0 ? styles.blinkingEye : {})
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
            <div style={styles.calendarGlow}></div>
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
            <h3 style={styles.featureTitle}>Shift Management</h3>
            <p style={styles.featureDesc}>Create and manage shifts with flexible scheduling and approval workflows.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <i className="fas fa-users"></i>
            </div>
            <h3 style={styles.featureTitle}>Multi-branch Support</h3>
            <p style={styles.featureDesc}>Manage multiple locations with centralized control and branch-specific settings.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <i className="fas fa-chart-line"></i>
            </div>
            <h3 style={styles.featureTitle}>Real-time Analytics</h3>
            <p style={styles.featureDesc}>Track attendance, hours worked, and generate comprehensive reports.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <i className="fas fa-bell"></i>
            </div>
            <h3 style={styles.featureTitle}>Smart Notifications</h3>
            <p style={styles.featureDesc}>Automated alerts for shift assignments, approvals, and reminders.</p>
          </div>
        </div>
      </div>

      {/* Company Owner Section - GlorifyTC */}
      <div style={styles.ownerSection}>
        <div style={styles.ownerContainer}>
          <div style={styles.ownerCard}>
            <div style={styles.ownerLogo}>
              <a href="https://glorifytc.se" target="_blank" rel="noopener noreferrer" style={styles.glorifyLogoLink}>
                <div style={styles.glorifyLogoIcon}>
                  <span>G</span>
                </div>
                <div style={styles.glorifyLogoText}>GlorifyTC</div>
              </a>
            </div>
            <div style={styles.ownerInfo}>
              <h3 style={styles.ownerTitle}>Project Owner & Lead Developer</h3>
              <div style={styles.ownerDetails}>
                <div style={styles.contactItem}>
                  <i className="fas fa-envelope" style={styles.contactIcon}></i>
                  <a href="mailto:info@glorifytc.se" style={styles.contactLink}>info@glorifytc.se</a>
                </div>
                <div style={styles.contactItem}>
                  <i className="fas fa-globe" style={styles.contactIcon}></i>
                  <a href="https://glorifytc.se" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>glorifytc.se</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p>&copy; 2026 TaskBridge. All rights reserved. Developed by <strong style={styles.glorifyHighlight}>GlorifyTC</strong></p>
        </div>
      </footer>

      {/* Add Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
};

// Full responsive styles with all sections
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
    '@media (max-width: 768px)': {
      width: '300px',
      height: '300px',
    },
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
    '@media (max-width: 768px)': {
      width: '250px',
      height: '250px',
    },
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
    '@media (max-width: 768px)': {
      width: '350px',
      height: '350px',
    },
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
    '@media (max-width: 768px)': {
      backgroundSize: '30px 30px',
    },
  },
  navbar: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    maxWidth: '1400px',
    margin: '0 auto',
    '@media (max-width: 768px)': {
      padding: '16px 20px',
    },
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
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
    boxShadow: '0 0 25px rgba(0, 209, 255, 0.35)',
    animation: 'softGlow 3s ease-in-out infinite',
    '@media (max-width: 768px)': {
      width: '32px',
      height: '32px',
      fontSize: '18px',
      borderRadius: '10px',
    },
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #fff, #00d1ff)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    '@media (max-width: 768px)': {
      fontSize: '18px',
    },
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
    '@media (max-width: 768px)': {
      padding: '8px 20px',
      fontSize: '13px',
    },
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
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
      textAlign: 'center',
      gap: '40px',
      padding: '40px 24px',
    },
    '@media (max-width: 768px)': {
      padding: '30px 20px',
      gap: '30px',
    },
  },
  heroContent: {
    maxWidth: '600px',
    '@media (max-width: 1024px)': {
      maxWidth: '100%',
    },
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
    '@media (max-width: 768px)': {
      marginBottom: '20px',
      padding: '5px 12px',
    },
  },
  tagDot: {
    width: '8px',
    height: '8px',
    background: '#00d1ff',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
    '@media (max-width: 768px)': {
      width: '6px',
      height: '6px',
    },
  },
  tagText: {
    fontSize: '14px',
    color: '#00d1ff',
    fontWeight: '500',
    '@media (max-width: 768px)': {
      fontSize: '12px',
    },
  },
  title: {
    fontSize: '56px',
    fontWeight: '700',
    lineHeight: '1.2',
    marginBottom: '24px',
    color: 'white',
    '@media (max-width: 1024px)': {
      fontSize: '42px',
    },
    '@media (max-width: 768px)': {
      fontSize: '32px',
      marginBottom: '16px',
    },
    '@media (max-width: 480px)': {
      fontSize: '28px',
    },
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
    '@media (max-width: 768px)': {
      fontSize: '16px',
      marginBottom: '24px',
    },
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    marginBottom: '0',
    '@media (max-width: 480px)': {
      flexDirection: 'column',
      gap: '12px',
    },
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
    '@media (max-width: 480px)': {
      padding: '12px 24px',
      fontSize: '14px',
      width: '100%',
    },
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
    '@media (max-width: 480px)': {
      padding: '12px 24px',
      fontSize: '14px',
      width: '100%',
    },
  },
  calendarContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    width: '350px',
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
    borderRadius: '24px',
    padding: '20px',
    border: '2px solid rgba(0, 209, 255, 0.3)',
    boxShadow: '0 0 30px rgba(0, 209, 255, 0.2)',
    position: 'relative',
    backdropFilter: 'blur(10px)',
    animation: 'floatCalendar 6s ease-in-out infinite',
    '@media (max-width: 768px)': {
      width: '300px',
      padding: '16px',
    },
    '@media (max-width: 480px)': {
      width: '280px',
      padding: '14px',
    },
  },
  calendarHeader: {
    textAlign: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(0, 209, 255, 0.3)',
    '@media (max-width: 768px)': {
      marginBottom: '16px',
      paddingBottom: '10px',
    },
  },
  calendarMonth: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #fff, #00d1ff)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    letterSpacing: '1px',
    '@media (max-width: 768px)': {
      fontSize: '20px',
    },
  },
  calendarWeekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginBottom: '12px',
    '@media (max-width: 768px)': {
      gap: '4px',
      marginBottom: '8px',
    },
  },
  weekday: {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    padding: '8px 0',
    '@media (max-width: 768px)': {
      fontSize: '10px',
      padding: '4px 0',
    },
  },
  calendarDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    '@media (max-width: 768px)': {
      gap: '4px',
    },
  },
  calendarDay: {
    textAlign: 'center',
    padding: '10px 0',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '@media (max-width: 768px)': {
      padding: '8px 0',
      fontSize: '12px',
    },
    '@media (max-width: 480px)': {
      padding: '6px 0',
      fontSize: '11px',
    },
  },
  today: {
    background: 'rgba(0, 209, 255, 0.2)',
    border: '1px solid rgba(0, 209, 255, 0.5)',
    fontWeight: 'bold',
    color: '#00d1ff',
  },
  blinkingEye: {
    animation: 'calendarBlink 2s infinite',
  },
  calendarGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(0, 209, 255, 0.1) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '24px',
    pointerEvents: 'none',
    zIndex: -1,
  },
  features: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '80px 40px',
    '@media (max-width: 768px)': {
      padding: '50px 24px',
    },
    '@media (max-width: 480px)': {
      padding: '40px 20px',
    },
  },
  featuresTitle: {
    fontSize: '36px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '48px',
    color: 'white',
    '@media (max-width: 768px)': {
      fontSize: '28px',
      marginBottom: '32px',
    },
    '@media (max-width: 480px)': {
      fontSize: '24px',
      marginBottom: '24px',
    },
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    '@media (max-width: 768px)': {
      gap: '20px',
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
      gap: '16px',
    },
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '32px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    '@media (max-width: 768px)': {
      padding: '24px',
    },
    '@media (max-width: 480px)': {
      padding: '20px',
    },
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
    '@media (max-width: 480px)': {
      width: '56px',
      height: '56px',
      fontSize: '24px',
      marginBottom: '16px',
    },
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '12px',
    color: 'white',
    '@media (max-width: 768px)': {
      fontSize: '18px',
    },
  },
  featureDesc: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    '@media (max-width: 768px)': {
      fontSize: '13px',
    },
  },
  ownerSection: {
    position: 'relative',
    zIndex: 10,
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
    borderTop: '1px solid rgba(0, 209, 255, 0.2)',
    borderBottom: '1px solid rgba(0, 209, 255, 0.2)',
    padding: '50px 40px',
    marginTop: '20px',
    '@media (max-width: 768px)': {
      padding: '40px 24px',
    },
    '@media (max-width: 480px)': {
      padding: '30px 20px',
    },
  },
  ownerContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  ownerCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 209, 255, 0.2)',
    borderRadius: '28px',
    padding: '35px 40px',
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '40px',
    backdropFilter: 'blur(10px)',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      textAlign: 'center',
      padding: '30px',
      gap: '30px',
    },
    '@media (max-width: 480px)': {
      padding: '24px',
      gap: '24px',
    },
  },
  ownerLogo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: '1px solid rgba(0, 209, 255, 0.2)',
    '@media (max-width: 768px)': {
      borderRight: 'none',
      borderBottom: '1px solid rgba(0, 209, 255, 0.2)',
      paddingBottom: '25px',
    },
  },
  glorifyLogoLink: {
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  glorifyLogoIcon: {
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '48px',
    color: 'white',
    boxShadow: '0 0 25px rgba(0, 209, 255, 0.35)',
    animation: 'softGlow 3s ease-in-out infinite',
    '@media (max-width: 768px)': {
      width: '70px',
      height: '70px',
      fontSize: '40px',
      borderRadius: '20px',
    },
  },
  glorifyLogoText: {
    fontWeight: '800',
    fontSize: '28px',
    background: 'linear-gradient(135deg, #fff, #00d1ff, #fff)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    animation: 'shimmer 4s ease infinite',
    '@media (max-width: 768px)': {
      fontSize: '24px',
    },
  },
  ownerInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    '@media (max-width: 768px)': {
      alignItems: 'center',
    },
  },
  ownerTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#00d1ff',
    marginBottom: '20px',
    '@media (max-width: 768px)': {
      fontSize: '18px',
      marginBottom: '16px',
    },
  },
  ownerDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    '@media (max-width: 768px)': {
      alignItems: 'center',
    },
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    '@media (max-width: 480px)': {
      fontSize: '12px',
      gap: '8px',
    },
  },
  contactIcon: {
    width: '16px',
    color: '#00d1ff',
  },
  contactLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  },
  footer: {
    position: 'relative',
    zIndex: 10,
    background: '#0a0f1a',
    padding: '25px 40px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    '@media (max-width: 768px)': {
      padding: '20px 24px',
    },
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    textAlign: 'center',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    '@media (max-width: 768px)': {
      fontSize: '12px',
    },
  },
  glorifyHighlight: {
    color: '#00d1ff',
    fontWeight: '600',
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
  @keyframes floatCalendar {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  @keyframes calendarBlink {
    0%, 90%, 100% {
      opacity: 1;
      transform: scale(1);
      background: rgba(0, 209, 255, 0);
    }
    95% {
      opacity: 0.3;
      transform: scale(0.9);
      background: rgba(0, 209, 255, 0.3);
      box-shadow: 0 0 10px rgba(0, 209, 255, 0.8);
    }
  }
  @keyframes softGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0, 209, 255, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(0, 209, 255, 0.6);
    }
  }
  @keyframes shimmer {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  .glorifyLogoIcon:hover {
    transform: scale(1.03);
    animation: none;
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
  .calendarDay:not(.today):hover {
    background: rgba(0, 209, 255, 0.1);
    transform: scale(1.05);
  }
  .contactLink:hover {
    color: #00d1ff;
  }
  
  @media (max-width: 768px) {
    .featureCard:active {
      transform: scale(0.98);
    }
    .primaryButton:active, .secondaryButton:active {
      transform: scale(0.98);
    }
  }
`;
document.head.appendChild(styleSheet);

export default Landing;