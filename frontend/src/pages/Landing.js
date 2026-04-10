import React, { useEffect, useState } from 'react';

const Landing = ({ onLoginClick, onNavigate }) => {
  console.log('Landing page rendered, onLoginClick:', onLoginClick);
  const [isMobile, setIsMobile] = useState(false);
  const [language, setLanguage] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);

  useEffect(() => {
    const checkMobile = () => {
      const w = window.innerWidth;
      setScreenWidth(w);
      setIsMobile(w <= 768);
      if (w > 768) {
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignIn = () => {
    if (onLoginClick) {
      onLoginClick();
    }
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'sv' : 'en');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Calendar data
  const currentDate = new Date();
  const today = currentDate.getDate();
  const currentMonth = currentDate.toLocaleString(language === 'en' ? 'default' : 'sv-SE', { month: 'long' });
  const currentYear = currentDate.getFullYear();

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

  const t = {
    en: {
      nav: { home: 'Home', about: 'About', pricing: 'Pricing', contact: 'Contact Us' },
      signIn: 'Sign In',
      tag: 'Smart Staff Management',
      title: 'Manage Your Workforce with Intelligence',
      subtitle: 'TaskBridge helps schools, hospitals, and organizations manage shifts, track attendance, and streamline communication with ease.',
      getStarted: 'Get Started',
      watchDemo: 'Watch Demo',
      featuresTitle: 'Powerful Features for Modern Teams',
      shiftMgmt: 'Shift Management',
      shiftDesc: 'Create and manage shifts with flexible scheduling and approval workflows.',
      multiBranch: 'Multi-branch Support',
      branchDesc: 'Manage multiple locations with centralized control and branch-specific settings.',
      realtimeAnalytics: 'Real-time Analytics',
      analyticsDesc: 'Track attendance, hours worked, and generate comprehensive reports.',
      smartNotif: 'Smart Notifications',
      notifDesc: 'Automated alerts for shift assignments, approvals, and reminders.',
      ownerTitle: 'Project Owner & Lead Developer',
      footer: 'All rights reserved. Developed by',
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    sv: {
      nav: { home: 'Hem', about: 'Om Programmet', pricing: 'Priser', contact: 'Kontakta Oss' },
      signIn: 'Logga in',
      tag: 'Smart Personalhantering',
      title: 'Hantera Din Arbetsstyrka med Intelligens',
      subtitle: 'TaskBridge hjälper skolor, sjukhus och organisationer att hantera pass, följa upp närvaro och effektivisera kommunikation.',
      getStarted: 'Kom igång',
      watchDemo: 'Titta Demo',
      featuresTitle: 'Kraftfulla Funktioner för Moderna Team',
      shiftMgmt: 'Passhantering',
      shiftDesc: 'Skapa och hantera pass med flexibel schemaläggning och godkännandeprocesser.',
      multiBranch: 'Stöd för Flera Filialer',
      branchDesc: 'Hantera flera platser med central kontroll och filialspecifika inställningar.',
      realtimeAnalytics: 'Realtidsanalyser',
      analyticsDesc: 'Spåra närvaro, arbetade timmar och generera omfattande rapporter.',
      smartNotif: 'Smarta Notiser',
      notifDesc: 'Automatiska aviseringar för passtilldelningar, godkännanden och påminnelser.',
      ownerTitle: 'Projektägare & Lead Utvecklare',
      footer: 'Alla rättigheter förbehållna. Utvecklad av',
      weekdays: ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör']
    }
  };

  const content = t[language];
  const isSmall = screenWidth <= 480;

  return (
    <div style={styles.container}>
      <div style={styles.bgAnimation}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
        <div style={styles.bgCircle3}></div>
        <div style={styles.bgGrid}></div>
      </div>

      {/* Navigation */}
      <nav style={{
        ...styles.navbar,
        padding: isSmall ? '12px 14px' : isMobile ? '14px 18px' : '20px 40px',
      }}>
        <div style={styles.logo}>
          <div style={{
            ...styles.logoIcon,
            width: isSmall ? '32px' : isMobile ? '36px' : '40px',
            height: isSmall ? '32px' : isMobile ? '36px' : '40px',
            fontSize: isSmall ? '17px' : isMobile ? '20px' : '24px',
            borderRadius: isSmall ? '8px' : '12px',
          }} className="tb-logo-icon"><span>T</span></div>
          <span style={{
            ...styles.logoText,
            fontSize: isSmall ? '18px' : isMobile ? '21px' : '24px',
          }} className="tb-logo-text">TaskBridge</span>
        </div>
        
        {!isMobile && (
          <>
            <div style={styles.navLinks}>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('landing'); }} style={styles.navLink}>{content.nav.home}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); }} style={styles.navLink}>{content.nav.about}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('pricing'); }} style={styles.navLink}>{content.nav.pricing}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('contact'); }} style={styles.navLink}>{content.nav.contact}</a>
            </div>
            <div style={styles.navActions}>
              <button onClick={toggleLanguage} style={styles.langButton}>{language === 'en' ? 'SV' : 'EN'}</button>
              <button onClick={handleSignIn} style={styles.navButton}>{content.signIn}</button>
            </div>
          </>
        )}

        {isMobile && (
          <div style={styles.mobileControls}>
            <button onClick={toggleLanguage} style={styles.langButtonMobile}>{language === 'en' ? 'SV' : 'EN'}</button>
            <button onClick={toggleMobileMenu} style={styles.menuButton}>
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        )}
      </nav>

      {isMobile && mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('landing'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{content.nav.home}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{content.nav.about}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('pricing'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{content.nav.pricing}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('contact'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{content.nav.contact}</a>
          <button onClick={handleSignIn} style={styles.mobileSignInButton}>{content.signIn}</button>
        </div>
      )}

      {/* Hero Section - Calendar now VISIBLE on mobile */}
      <div style={{
        ...styles.hero,
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        padding: isSmall ? '24px 16px' : isMobile ? '32px 20px' : '60px 40px',
        gap: isSmall ? '28px' : isMobile ? '36px' : '60px',
        textAlign: isMobile ? 'center' : 'left',
      }}>
        <div style={styles.heroContent}>
          <div style={styles.tag}>
            <span style={styles.tagDot}></span>
            <span style={styles.tagText}>{content.tag}</span>
          </div>
          <h1 style={{
            ...styles.title,
            fontSize: isSmall ? '30px' : isMobile ? '36px' : '56px',
          }}>
            {content.title.split(' ').map((word, i) => 
              word === 'Workforce' || word === 'Arbetsstyrka' ? 
                <span key={i}><span style={styles.titleGradient}>{word}</span> </span> : 
                word + ' '
            )}
          </h1>
          <p style={{
            ...styles.subtitle,
            fontSize: isSmall ? '14px' : isMobile ? '15px' : '18px',
          }}>{content.subtitle}</p>
          <div style={{
            ...styles.buttons,
            flexDirection: isSmall ? 'column' : 'row',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}>
            <button onClick={handleSignIn} style={{
              ...styles.primaryButton,
              width: isSmall ? '100%' : 'auto',
              padding: isSmall ? '12px 20px' : '14px 32px',
            }}>
              {content.getStarted} <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
            </button>
            <button style={{
              ...styles.secondaryButton,
              width: isSmall ? '100%' : 'auto',
              padding: isSmall ? '12px 20px' : '14px 32px',
            }}>
              {content.watchDemo} <i className="fas fa-play" style={{ marginLeft: '8px', fontSize: '12px' }}></i>
            </button>
          </div>
        </div>

        {/* CALENDAR - FIXED: Always visible on mobile */}
        <div style={styles.calendarContainer}>
          <div style={{
            ...styles.calendar,
            maxWidth: isSmall ? '100%' : isMobile ? '340px' : '380px',
            padding: isSmall ? '16px' : '24px',
          }}>
            <div style={styles.calendarHeader}>
              <div style={{
                ...styles.calendarMonth,
                fontSize: isSmall ? '16px' : '22px',
              }}>{currentMonth} {currentYear}</div>
            </div>
            <div style={styles.calendarWeekdays}>
              {content.weekdays.map(day => <div key={day} style={{
                ...styles.weekday,
                fontSize: isSmall ? '10px' : '13px',
                padding: isSmall ? '4px 0' : '8px 0',
              }}>{day}</div>)}
            </div>
            <div style={styles.calendarDays}>
              {days.map((day, index) => (
                <div key={index} style={{...styles.calendarDay, ...(day === today ? styles.today : {}), ...(day && day % 2 === 0 ? styles.blinkingEye : {}), fontSize: isSmall ? '11px' : '14px', padding: isSmall ? '6px 0' : '10px 0'}}>
                  {day}
                </div>
              ))}
            </div>
            <div style={styles.calendarGlow}></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        ...styles.features,
        padding: isSmall ? '40px 16px' : isMobile ? '50px 20px' : '80px 40px',
      }}>
        <h2 style={{
          ...styles.featuresTitle,
          fontSize: isSmall ? '22px' : isMobile ? '26px' : '36px',
        }}>
          {content.featuresTitle.split(' ').map((word, i) => 
            word === 'Modern' || word === 'Moderna' ? 
              <span key={i}><span style={styles.titleGradient}>{word}</span> </span> : word + ' '
          )}
        </h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}><i className="fas fa-clock"></i></div>
            <h3 style={styles.featureTitle}>{content.shiftMgmt}</h3>
            <p style={styles.featureDesc}>{content.shiftDesc}</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}><i className="fas fa-users"></i></div>
            <h3 style={styles.featureTitle}>{content.multiBranch}</h3>
            <p style={styles.featureDesc}>{content.branchDesc}</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}><i className="fas fa-chart-line"></i></div>
            <h3 style={styles.featureTitle}>{content.realtimeAnalytics}</h3>
            <p style={styles.featureDesc}>{content.analyticsDesc}</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}><i className="fas fa-bell"></i></div>
            <h3 style={styles.featureTitle}>{content.smartNotif}</h3>
            <p style={styles.featureDesc}>{content.notifDesc}</p>
          </div>
        </div>
      </div>

      {/* Owner Section - FIXED: Text no longer cut off */}
      <div style={{
        ...styles.ownerSection,
        padding: isSmall ? '40px 16px' : isMobile ? '40px 20px' : '60px 40px',
      }}>
        <div style={styles.ownerContainer}>
          <div style={{
            ...styles.ownerCard,
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'left',
            padding: isSmall ? '24px 16px' : isMobile ? '28px 20px' : '40px',
            gap: isSmall ? '20px' : isMobile ? '24px' : '50px',
          }}>
            <div style={styles.ownerLogo}>
              <a href="https://glorifytc.se" target="_blank" rel="noopener noreferrer" style={styles.glorifyLogoLink}>
                <div style={{
                  ...styles.glorifyLogoIcon,
                  width: isSmall ? '64px' : '80px',
                  height: isSmall ? '64px' : '80px',
                  fontSize: isSmall ? '36px' : '44px',
                }}><span>G</span></div>
                <div style={styles.glorifyLogoText}>GlorifyTC</div>
              </a>
            </div>
            <div style={{ ...styles.ownerInfo, width: isMobile ? '100%' : 'auto' }}>
              <h3 style={{
                ...styles.ownerTitle,
                fontSize: isSmall ? '16px' : isMobile ? '18px' : '24px',
              }}>{content.ownerTitle}</h3>
              <div style={{
                ...styles.ownerDetails,
                alignItems: isMobile ? 'center' : 'flex-start',
              }}>
                <div style={styles.contactItem}>
                  <i className="fas fa-envelope"></i>
                  <a href="mailto:info@glorifytc.se" style={styles.contactLink}>info@glorifytc.se</a>
                </div>
                <div style={styles.contactItem}>
                  <i className="fas fa-globe"></i>
                  <a href="https://glorifytc.se" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>glorifytc.se</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        ...styles.footer,
        padding: isSmall ? '20px 16px' : '30px 40px',
      }}>
        <div style={styles.footerContent}>
          <p>&copy; 2026 TaskBridge. {content.footer} <strong style={styles.glorifyHighlight}>GlorifyTC</strong></p>
        </div>
      </footer>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f172a',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflowX: 'hidden',
  },
  bgAnimation: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
    pointerEvents: 'none',
  },
  bgCircle1: {
    position: 'absolute',
    top: '10%',
    right: '5%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(0, 209, 255, 0.15) 0%, transparent 70%)',
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
    background: 'radial-gradient(circle, rgba(0, 209, 255, 0.08) 0%, transparent 70%)',
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
    zIndex: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    flexWrap: 'nowrap',
    gap: '12px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 0 25px rgba(0, 209, 255, 0.35)',
    animation: 'softGlow 3s ease-in-out infinite',
    flexShrink: 0,
  },
  logoText: {
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #fff, #00d1ff)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    whiteSpace: 'nowrap',
  },
  navLinks: {
    display: 'flex',
    gap: '32px',
  },
  navLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'color 0.3s ease',
    cursor: 'pointer',
  },
  navActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  langButton: {
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50px',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  navButton: {
    padding: '10px 24px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50px',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
  },
  mobileControls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexShrink: 0,
  },
  langButtonMobile: {
    padding: '7px 13px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50px',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  menuButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50px',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '7px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileMenu: {
    position: 'relative',
    zIndex: 19,
    background: 'rgba(15, 23, 42, 0.98)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0, 209, 255, 0.2)',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mobileNavLink: {
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '500',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
  },
  mobileSignInButton: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '50px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  hero: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    alignItems: 'center',
  },
  heroContent: {
    width: '100%',
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
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '32px',
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    marginBottom: '48px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '50px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  secondaryButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  calendarContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  calendar: {
    width: '100%',
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
    borderRadius: '24px',
    border: '2px solid rgba(0, 209, 255, 0.3)',
    boxShadow: '0 0 30px rgba(0, 209, 255, 0.2)',
    position: 'relative',
    backdropFilter: 'blur(10px)',
    animation: 'floatCalendar 6s ease-in-out infinite',
  },
  calendarHeader: {
    textAlign: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(0, 209, 255, 0.3)',
  },
  calendarMonth: {
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #fff, #00d1ff)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  calendarWeekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    marginBottom: '8px',
  },
  weekday: {
    textAlign: 'center',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  calendarDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  },
  calendarDay: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  today: {
    background: 'rgba(0, 209, 255, 0.25)',
    border: '1px solid rgba(0, 209, 255, 0.6)',
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
  },
  featuresTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '48px',
    color: 'white',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '32px',
    textAlign: 'center',
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
  featureTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '12px',
    color: 'white',
  },
  featureDesc: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: '1.6',
  },
  ownerSection: {
    position: 'relative',
    zIndex: 10,
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
    borderTop: '1px solid rgba(0, 209, 255, 0.2)',
    borderBottom: '1px solid rgba(0, 209, 255, 0.2)',
  },
  ownerContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  ownerCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 209, 255, 0.25)',
    borderRadius: '28px',
    display: 'flex',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  ownerLogo: {
    flexShrink: 0,
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
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    color: 'white',
    boxShadow: '0 0 25px rgba(0, 209, 255, 0.35)',
    animation: 'softGlow 3s ease-in-out infinite',
  },
  glorifyLogoText: {
    fontWeight: '800',
    fontSize: '24px',
    background: 'linear-gradient(135deg, #fff, #00d1ff, #fff)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    animation: 'shimmer 4s ease infinite',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerTitle: {
    fontWeight: '600',
    color: '#00d1ff',
    marginBottom: '20px',
  },
  ownerDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.8)',
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
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    textAlign: 'center',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  glorifyHighlight: {
    color: '#00d1ff',
    fontWeight: '600',
  },
};

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
    50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
  }
  @keyframes floatCalendar {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes calendarBlink {
    0%, 90%, 100% { opacity: 1; background: rgba(0, 209, 255, 0); }
    95% { opacity: 0.5; background: rgba(0, 209, 255, 0.2); }
  }
  @keyframes softGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 209, 255, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 209, 255, 0.5); }
  }
  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .primaryButton:hover, .secondaryButton:hover, .navButton:hover, .langButton:hover {
    transform: translateY(-2px);
  }
  .featureCard:hover {
    transform: translateY(-5px);
    border-color: rgba(0, 209, 255, 0.3);
  }
  .calendarDay:hover {
    background: rgba(0, 209, 255, 0.15);
  }
  .contactLink:hover {
    color: #00d1ff;
  }
  .navLink:hover {
    color: #00d1ff !important;
  }
  .mobileNavLink:hover {
    color: #00d1ff !important;
  }

  /* Responsive navbar rules */
  @media (max-width: 768px) {
    nav { padding: 16px 20px !important; }
    .tb-logo-icon { width: 34px !important; height: 34px !important; font-size: 19px !important; }
    .tb-logo-text { font-size: 20px !important; }
  }
  @media (max-width: 480px) {
    nav { padding: 12px 14px !important; }
    .tb-logo-icon { width: 30px !important; height: 30px !important; font-size: 16px !important; border-radius: 8px !important; }
    .tb-logo-text { font-size: 17px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default Landing;