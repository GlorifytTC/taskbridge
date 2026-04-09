import React, { useEffect, useState } from 'react';

const About = ({ onNavigate, user }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.2 }
    );

    const elements = ['hero', 'mission', 'services', 'features', 'stats', 'owner'];
    elements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const getDashboardRoute = () => {
    if (user?.role === 'master') return 'master';
    if (user?.role === 'superadmin') return 'superadmin';
    if (user?.role === 'admin') return 'admin';
    return 'dashboard';
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'sv' : 'en';
    setLanguage(newLang);
    localStorage.setItem('taskbridge_language', newLang);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const t = {
    en: {
      nav: { home: 'Home', about: 'About', pricing: 'Pricing', contact: 'Contact' },
      signIn: 'Sign In',
      title: 'About TaskBridge',
      subtitle: 'Smart Workforce Management for Modern Organizations',
      missionTitle: 'Our Mission',
      missionText: 'TaskBridge empowers schools, hospitals, and organizations with intelligent shift management, real-time attendance tracking, and seamless communication — all in one platform.',
      whoItServes: 'Who We Serve',
      schools: 'Schools',
      schoolsDesc: 'Manage teacher schedules, substitute coverage, and extracurricular activities',
      hospitals: 'Hospitals',
      hospitalsDesc: 'Coordinate nursing shifts, doctor rotations, and emergency coverage',
      organizations: 'Enterprises',
      organizationsDesc: 'Streamline workforce operations across multiple branches and departments',
      featuresTitle: 'Platform Capabilities',
      shiftManagement: 'Shift Management',
      shiftManagementDesc: 'Create, assign, and track shifts with automated conflict detection and approval workflows.',
      multiBranch: 'Multi-Branch Support',
      multiBranchDesc: 'Centralized control with branch-specific settings, roles, and reporting.',
      realtimeAnalytics: 'Analytics',
      realtimeAnalyticsDesc: 'Live dashboards showing attendance, hours worked, and labor costs.',
      smartNotifications: 'Smart Notifications',
      smartNotificationsDesc: 'Automated alerts for shift reminders, approvals, and schedule changes.',
      employeeApp: 'Employee Portal',
      employeeAppDesc: 'Employees can view shifts, apply for openings, and track their hours.',
      reporting: 'Reporting',
      reportingDesc: 'Export detailed reports on attendance, payroll, and branch performance.',
      statsTitle: 'Trusted By',
      organizationsCount: '500+',
      organizationsLabel: 'Organizations',
      employeesCount: '10K+',
      employeesLabel: 'Employees',
      satisfactionCount: '98%',
      satisfactionLabel: 'Satisfaction',
      shiftsCount: '50K+',
      shiftsLabel: 'Shifts Completed',
      ownerTitle: 'Project Owner & Lead Developer',
      developedBy: 'Developed by',
      pic1Caption: 'Central Dashboard',
      pic2Caption: 'Smart Calendar',
      pic3Caption: 'Analytics'
    },
    sv: {
      nav: { home: 'Hem', about: 'Om Oss', pricing: 'Priser', contact: 'Kontakt' },
      signIn: 'Logga in',
      title: 'Om TaskBridge',
      subtitle: 'Smart Personalhantering för Moderna Organisationer',
      missionTitle: 'Vårt Uppdrag',
      missionText: 'TaskBridge ger skolor, sjukhus och organisationer intelligent schemaläggning, realtidsnärvaro och sömlös kommunikation — allt i en plattform.',
      whoItServes: 'Vem Vi Tjänar',
      schools: 'Skolor',
      schoolsDesc: 'Hantera lärarscheman, vikarietäckning och extracurricular aktiviteter',
      hospitals: 'Sjukhus',
      hospitalsDesc: 'Koordinera skift för sjuksköterskor, läkarrotationer och akuttäckning',
      organizations: 'Företag',
      organizationsDesc: 'Effektivisera personalverksamhet över flera filialer och avdelningar',
      featuresTitle: 'Plattformsfunktioner',
      shiftManagement: 'Skifthallning',
      shiftManagementDesc: 'Skapa, tilldela och spåra skift med automatisk konfliktdetektering och godkännandeprocesser.',
      multiBranch: 'Filialstöd',
      multiBranchDesc: 'Central kontroll med filialspecifika inställningar, roller och rapporter.',
      realtimeAnalytics: 'Analyser',
      realtimeAnalyticsDesc: 'Live-instrumentpaneler som visar närvaro, arbetade timmar och personalkostnader.',
      smartNotifications: 'Notiser',
      smartNotificationsDesc: 'Automatiska aviseringar för skiftpåminnelser, godkännanden och schemaändringar.',
      employeeApp: 'Personalportal',
      employeeAppDesc: 'Anställda kan se skift, söka lediga pass och följa sina timmar.',
      reporting: 'Rapportering',
      reportingDesc: 'Exportera detaljerade rapporter om närvaro, löner och filialprestanda.',
      statsTitle: 'Lita På Av',
      organizationsCount: '500+',
      organizationsLabel: 'Organisationer',
      employeesCount: '10K+',
      employeesLabel: 'Anställda',
      satisfactionCount: '98%',
      satisfactionLabel: 'Nöjdhet',
      shiftsCount: '50K+',
      shiftsLabel: 'Genomförda Skift',
      ownerTitle: 'Projektägare & Lead Utvecklare',
      developedBy: 'Utvecklad av',
      pic1Caption: 'Central Dashboard',
      pic2Caption: 'Smart Kalender',
      pic3Caption: 'Analys'
    }
  };

  const lang = t[language];

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgAnimation}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
        <div style={styles.bgCircle3}></div>
        <div style={styles.bgGrid}></div>
      </div>

      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          {/* FIX: added className for responsive CSS targeting */}
          <div style={styles.logoIcon} className="tb-logo-icon">
            <span>T</span>
          </div>
          <span style={styles.logoText} className="tb-logo-text">TaskBridge</span>
        </div>
        
        {!isMobile && (
          <>
            <div style={styles.navLinks}>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('landing'); }} style={styles.navLink}>{lang.nav.home}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); }} style={{...styles.navLink, color: '#00d1ff'}}>{lang.nav.about}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); }} style={styles.navLink}>{lang.nav.pricing}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); }} style={styles.navLink}>{lang.nav.contact}</a>
            </div>
            <div style={styles.navActions}>
              <button onClick={toggleLanguage} style={styles.langButton}>
                {language === 'en' ? 'SV' : 'EN'}
              </button>
              <button onClick={() => onNavigate && onNavigate('login')} style={styles.navButton}>
                {lang.signIn}
              </button>
            </div>
          </>
        )}

        {isMobile && (
          <div style={styles.mobileControls}>
            <button onClick={toggleLanguage} style={styles.langButtonMobile}>
              {language === 'en' ? 'SV' : 'EN'}
            </button>
            <button onClick={toggleMobileMenu} style={styles.menuButton}>
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('landing'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.home}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }} style={{...styles.mobileNavLink, color: '#00d1ff'}}>{lang.nav.about}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.pricing}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.contact}</a>
          <button onClick={() => { onNavigate && onNavigate('login'); setMobileMenuOpen(false); }} style={styles.mobileSignInButton}>
            {lang.signIn}
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div id="hero" style={{...styles.hero, opacity: isVisible.hero ? 1 : 0, transform: `translateY(${isVisible.hero ? 0 : '30px'})`, transition: 'all 0.6s ease' }}>
        <div style={styles.heroContent}>
          <div style={styles.tag}>
            <span style={styles.tagDot}></span>
            <span style={styles.tagText}>Company</span>
          </div>
          <h1 style={styles.title}>{lang.title}</h1>
          <p style={styles.subtitle}>{lang.subtitle}</p>
        </div>
      </div>

      {/* Mission Section */}
      <div id="mission" style={{...styles.section, opacity: isVisible.mission ? 1 : 0, transform: `translateY(${isVisible.mission ? 0 : '30px'})`, transition: 'all 0.6s ease 0.1s' }}>
        <div style={styles.missionCard}>
          <h2 style={styles.sectionTitle}>{lang.missionTitle}</h2>
          <p style={styles.missionText}>{lang.missionText}</p>
        </div>
      </div>

      {/* Who We Serve */}
      <div id="services" style={{...styles.section, opacity: isVisible.services ? 1 : 0, transform: `translateY(${isVisible.services ? 0 : '30px'})`, transition: 'all 0.6s ease 0.2s' }}>
        <h2 style={styles.sectionTitle}>{lang.whoItServes}</h2>
        <div style={styles.servicesGrid}>
          <div style={styles.serviceCard}>
            <div style={styles.serviceIcon}>
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3>{lang.schools}</h3>
            <p>{lang.schoolsDesc}</p>
          </div>
          <div style={styles.serviceCard}>
            <div style={styles.serviceIcon}>
              <i className="fas fa-hospital"></i>
            </div>
            <h3>{lang.hospitals}</h3>
            <p>{lang.hospitalsDesc}</p>
          </div>
          <div style={styles.serviceCard}>
            <div style={styles.serviceIcon}>
              <i className="fas fa-building"></i>
            </div>
            <h3>{lang.organizations}</h3>
            <p>{lang.organizationsDesc}</p>
          </div>
        </div>
      </div>

      {/* Feature Images */}
      <div id="features" style={{...styles.section, opacity: isVisible.features ? 1 : 0, transform: `translateY(${isVisible.features ? 0 : '30px'})`, transition: 'all 0.6s ease 0.3s' }}>
        <h2 style={styles.sectionTitle}>{lang.featuresTitle}</h2>
        <div style={styles.featureImagesGrid}>
          <div style={styles.featureImageCard}>
            <div style={styles.imagePlaceholder}>
              <i className="fas fa-chalkboard-user" style={{ fontSize: '48px', color: '#00d1ff' }}></i>
            </div>
            <p style={styles.imageCaption}>{lang.pic1Caption}</p>
            <p style={styles.imageDesc}>{lang.shiftManagementDesc.substring(0, 60)}...</p>
          </div>
          <div style={styles.featureImageCard}>
            <div style={styles.imagePlaceholder}>
              <i className="fas fa-calendar-alt" style={{ fontSize: '48px', color: '#00d1ff' }}></i>
            </div>
            <p style={styles.imageCaption}>{lang.pic2Caption}</p>
            <p style={styles.imageDesc}>{lang.multiBranchDesc.substring(0, 60)}...</p>
          </div>
          <div style={styles.featureImageCard}>
            <div style={styles.imagePlaceholder}>
              <i className="fas fa-chart-line" style={{ fontSize: '48px', color: '#00d1ff' }}></i>
            </div>
            <p style={styles.imageCaption}>{lang.pic3Caption}</p>
            <p style={styles.imageDesc}>{lang.realtimeAnalyticsDesc.substring(0, 60)}...</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div style={styles.section}>
        <div style={styles.featuresGrid}>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <h4>{lang.shiftManagement}</h4>
              <p>{lang.shiftManagementDesc}</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>
              <i className="fas fa-code-branch"></i>
            </div>
            <div>
              <h4>{lang.multiBranch}</h4>
              <p>{lang.multiBranchDesc}</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>
              <i className="fas fa-chart-simple"></i>
            </div>
            <div>
              <h4>{lang.realtimeAnalytics}</h4>
              <p>{lang.realtimeAnalyticsDesc}</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>
              <i className="fas fa-bell"></i>
            </div>
            <div>
              <h4>{lang.smartNotifications}</h4>
              <p>{lang.smartNotificationsDesc}</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>
              <i className="fas fa-mobile-alt"></i>
            </div>
            <div>
              <h4>{lang.employeeApp}</h4>
              <p>{lang.employeeAppDesc}</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>
              <i className="fas fa-file-alt"></i>
            </div>
            <div>
              <h4>{lang.reporting}</h4>
              <p>{lang.reportingDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div id="stats" style={{...styles.statsSection, opacity: isVisible.stats ? 1 : 0, transform: `translateY(${isVisible.stats ? 0 : '30px'})`, transition: 'all 0.6s ease 0.4s' }}>
        <h2 style={styles.sectionTitle}>{lang.statsTitle}</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{lang.organizationsCount}</div>
            <div style={styles.statLabel}>{lang.organizationsLabel}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{lang.employeesCount}</div>
            <div style={styles.statLabel}>{lang.employeesLabel}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{lang.satisfactionCount}</div>
            <div style={styles.statLabel}>{lang.satisfactionLabel}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{lang.shiftsCount}</div>
            <div style={styles.statLabel}>{lang.shiftsLabel}</div>
          </div>
        </div>
      </div>

      {/* Owner Section */}
      <div id="owner" style={{...styles.ownerSection, opacity: isVisible.owner ? 1 : 0, transform: `translateY(${isVisible.owner ? 0 : '30px'})`, transition: 'all 0.6s ease 0.5s' }}>
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
            <h3 style={styles.ownerTitle}>{lang.ownerTitle}</h3>
            <div style={styles.ownerContact}>
              <a href="mailto:info@glorifytc.se" style={styles.ownerLink}>info@glorifytc.se</a>
              <a href="https://glorifytc.se" target="_blank" rel="noopener noreferrer" style={styles.ownerLink}>glorifytc.se</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p>&copy; 2026 TaskBridge. {lang.developedBy} <strong style={styles.glorifyHighlight}>GlorifyTC</strong></p>
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
  // FIX: removed dead @media keys — moved to styleSheet below
  navbar: {
    position: 'relative',
    zIndex: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    maxWidth: '1400px',
    margin: '0 auto',
    flexWrap: 'wrap',
    gap: '16px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  // FIX: removed dead @media keys — tb-logo-icon class handles responsive sizing
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
  },
  // FIX: removed dead @media keys — tb-logo-text class handles responsive sizing
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #fff, #00d1ff)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
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
    '&:hover': {
      color: '#00d1ff',
    },
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
    gap: '12px',
    alignItems: 'center',
  },
  langButtonMobile: {
    padding: '8px 16px',
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
    padding: '8px 16px',
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
    padding: '80px 40px 60px',
    textAlign: 'center',
    '@media (max-width: 768px)': {
      padding: '60px 24px 40px',
    },
    '@media (max-width: 480px)': {
      padding: '40px 16px 30px',
    },
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
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
    '@media (max-width: 768px)': {
      fontSize: '42px',
    },
    '@media (max-width: 480px)': {
      fontSize: '32px',
    },
  },
  subtitle: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.7)',
    '@media (max-width: 768px)': {
      fontSize: '16px',
    },
  },
  section: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px',
    '@media (max-width: 768px)': {
      padding: '30px 24px',
    },
    '@media (max-width: 480px)': {
      padding: '30px 16px',
    },
  },
  sectionTitle: {
    fontSize: '32px',
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
  missionCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '28px',
    padding: '48px',
    textAlign: 'center',
    border: '1px solid rgba(0, 209, 255, 0.3)',
    '@media (max-width: 768px)': {
      padding: '32px',
    },
    '@media (max-width: 480px)': {
      padding: '24px',
    },
  },
  missionText: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '800px',
    margin: '0 auto',
    '@media (max-width: 768px)': {
      fontSize: '16px',
    },
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    },
  },
  serviceCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      borderColor: 'rgba(0, 209, 255, 0.3)',
    },
    '@media (max-width: 480px)': {
      padding: '24px',
    },
  },
  serviceIcon: {
    fontSize: '40px',
    marginBottom: '16px',
    color: '#00d1ff',
  },
  featureImagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '40px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    },
  },
  featureImageCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '20px',
    overflow: 'hidden',
    textAlign: 'center',
    padding: '24px',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
  imagePlaceholder: {
    width: '100%',
    height: '180px',
    background: 'rgba(0, 209, 255, 0.05)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  imageCaption: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#00d1ff',
    marginBottom: '8px',
  },
  imageDesc: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  featureItem: {
    display: 'flex',
    gap: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    padding: '20px',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      borderColor: 'rgba(0, 209, 255, 0.3)',
    },
  },
  featureItemIcon: {
    fontSize: '28px',
    color: '#00d1ff',
    minWidth: '40px',
  },
  statsSection: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px',
    '@media (max-width: 768px)': {
      padding: '30px 24px',
    },
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
  statNumber: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#00d1ff',
    marginBottom: '8px',
    '@media (max-width: 768px)': {
      fontSize: '36px',
    },
  },
  statLabel: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  ownerSection: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px',
    '@media (max-width: 768px)': {
      padding: '30px 24px',
    },
  },
  ownerCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '28px',
    padding: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '50px',
    border: '1px solid rgba(0, 209, 255, 0.3)',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      textAlign: 'center',
      padding: '30px',
      gap: '25px',
    },
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
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '44px',
    color: 'white',
    boxShadow: '0 0 25px rgba(0, 209, 255, 0.35)',
    animation: 'softGlow 3s ease-in-out infinite',
    '@media (max-width: 768px)': {
      width: '70px',
      height: '70px',
      fontSize: '38px',
    },
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
    '@media (max-width: 768px)': {
      fontSize: '22px',
    },
  },
  ownerInfo: {
    flex: 1,
    '@media (max-width: 768px)': {
      width: '100%',
    },
  },
  ownerTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#00d1ff',
    marginBottom: '20px',
    '@media (max-width: 768px)': {
      fontSize: '20px',
    },
  },
  ownerContact: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    '@media (max-width: 768px)': {
      justifyContent: 'center',
      gap: '16px',
    },
  },
  ownerLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    fontSize: '15px',
    transition: 'color 0.3s ease',
    '&:hover': {
      color: '#00d1ff',
    },
  },
  footer: {
    position: 'relative',
    zIndex: 10,
    background: '#0a0f1a',
    padding: '30px 40px',
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
    color: 'rgba(255, 255, 255, 0.5)',
    '@media (max-width: 768px)': {
      fontSize: '12px',
    },
  },
  glorifyHighlight: {
    color: '#00d1ff',
    fontWeight: '600',
  },
};

const styleSheet = document.createElement('style');
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
  @keyframes softGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 209, 255, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 209, 255, 0.5); }
  }
  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .navButton:hover, .langButton:hover, .langButtonMobile:hover, .menuButton:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .navLink:hover, .mobileNavLink:hover {
    color: #00d1ff !important;
  }
  .serviceCard:hover, .featureImageCard:hover, .featureItem:hover, .statCard:hover {
    transform: translateY(-4px);
  }
  .ownerLink:hover {
    color: #00d1ff;
  }

  /* FIX: Responsive navbar rules that actually work in the browser */
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

export default About;
