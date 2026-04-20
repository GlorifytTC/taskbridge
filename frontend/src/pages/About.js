import React, { useEffect, useState } from 'react';

const About = ({ onNavigate, user }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);

  useEffect(() => {
    const checkMobile = () => {
      const w = window.innerWidth;
      setScreenWidth(w);
      setIsMobile(w <= 768);
      if (w > 768) setMobileMenuOpen(false);
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
    const elements = ['hero', 'mission', 'services', 'features', 'roomSystem', 'owner'];
    elements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'sv' : 'en';
    setLanguage(newLang);
    localStorage.setItem('taskbridge_language', newLang);
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

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
      
      // Room Assignment System Section
      roomSystemTitle: 'Smart Room Assignment',
      roomSystemDesc: 'Our intelligent room allocation system automatically matches groups to the best available rooms and staff members.',
      roomFeature1: 'Create groups that need placement (classes, teams, patients)',
      roomFeature2: 'Set up rooms with capacity and type (classroom, lab, medical)',
      roomFeature3: 'Register staff with their specializations and availability',
      roomFeature4: 'One-click auto-sorting matches groups to rooms and workers',
      roomFeature5: 'Visual map view shows all assignments clearly',
      roomFeature6: 'Learning system improves suggestions from your overrides',
      
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
      
      // Room Assignment System Section
      roomSystemTitle: 'Smart Rumsplacering',
      roomSystemDesc: 'Vårt intelligenta rumsplaceringssystem matchar automatiskt grupper till de bästa tillgängliga rummen och personalen.',
      roomFeature1: 'Skapa grupper som behöver placeras (klasser, team, patienter)',
      roomFeature2: 'Skapa rum med kapacitet och typ (klassrum, labb, medicinskt)',
      roomFeature3: 'Registrera personal med deras specialiseringar och tillgänglighet',
      roomFeature4: 'Ett-klicks sortering matchar grupper till rum och personal',
      roomFeature5: 'Visuell kartvy visar alla tilldelningar tydligt',
      roomFeature6: 'Inlärningssystem förbättrar förslag från dina åsidosättningar',
      
      ownerTitle: 'Projektägare & Lead Utvecklare',
      developedBy: 'Utvecklad av',
      pic1Caption: 'Central Dashboard', 
      pic2Caption: 'Smart Kalender', 
      pic3Caption: 'Analys'
    }
  };

  const lang = t[language];
  const isSmall = screenWidth <= 480;

  const fadeIn = (id) => ({
    opacity: isVisible[id] ? 1 : 0,
    transform: `translateY(${isVisible[id] ? 0 : '30px'})`,
    transition: 'all 0.6s ease',
  });

  return (
    <div style={styles.container}>
      <div style={styles.bgAnimation}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
        <div style={styles.bgCircle3}></div>
        <div style={styles.bgGrid}></div>
      </div>

      {/* Navigation Bar */}
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
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('landing'); }} style={styles.navLink}>{lang.nav.home}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); }} style={{ ...styles.navLink, color: '#00d1ff' }}>{lang.nav.about}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('pricing'); }} style={styles.navLink}>{lang.nav.pricing}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('contact'); }} style={styles.navLink}>{lang.nav.contact}</a>
            </div>
            <div style={styles.navActions}>
              <button onClick={toggleLanguage} style={styles.langButton}>{language === 'en' ? 'SV' : 'EN'}</button>
              <button onClick={() => onNavigate && onNavigate('login')} style={styles.navButton}>{lang.signIn}</button>
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
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('landing'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.home}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); setMobileMenuOpen(false); }} style={{ ...styles.mobileNavLink, color: '#00d1ff' }}>{lang.nav.about}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('pricing'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.pricing}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('contact'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.contact}</a>
          <button onClick={() => { onNavigate && onNavigate('login'); setMobileMenuOpen(false); }} style={styles.mobileSignInButton}>{lang.signIn}</button>
        </div>
      )}

      {/* Hero */}
      <div id="hero" style={{ ...styles.hero, ...fadeIn('hero'), padding: isSmall ? '40px 16px 30px' : isMobile ? '60px 20px 40px' : '80px 40px 60px' }}>
        <div style={styles.heroContent}>
          <div style={styles.tag}><span style={styles.tagDot}></span><span style={styles.tagText}>Company</span></div>
          <h1 style={{ ...styles.title, fontSize: isSmall ? '30px' : isMobile ? '36px' : '56px' }}>{lang.title}</h1>
          <p style={{ ...styles.subtitle, fontSize: isSmall ? '14px' : isMobile ? '15px' : '18px' }}>{lang.subtitle}</p>
        </div>
      </div>

      {/* Mission */}
      <div id="mission" style={{ ...styles.section, ...fadeIn('mission'), padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : '40px' }}>
        <div style={styles.missionCard}>
          <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '22px' : isMobile ? '26px' : '32px' }}>{lang.missionTitle}</h2>
          <p style={{ ...styles.missionText, fontSize: isSmall ? '14px' : isMobile ? '15px' : '18px' }}>{lang.missionText}</p>
        </div>
      </div>

      {/* Room Assignment System Section - NEW */}
      <div id="roomSystem" style={{ ...styles.section, ...fadeIn('roomSystem'), padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : '40px' }}>
        <div style={styles.roomSystemCard}>
          <div style={styles.roomSystemIcon}>🏠</div>
          <h2 style={{ ...styles.roomSystemTitle, fontSize: isSmall ? '24px' : '32px' }}>{lang.roomSystemTitle}</h2>
          <p style={styles.roomSystemDesc}>{lang.roomSystemDesc}</p>
          <div style={{ ...styles.roomFeaturesGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
            <div style={styles.roomFeature}>
              <span style={styles.roomFeatureIcon}>📋</span>
              <span>{lang.roomFeature1}</span>
            </div>
            <div style={styles.roomFeature}>
              <span style={styles.roomFeatureIcon}>🏠</span>
              <span>{lang.roomFeature2}</span>
            </div>
            <div style={styles.roomFeature}>
              <span style={styles.roomFeatureIcon}>👥</span>
              <span>{lang.roomFeature3}</span>
            </div>
            <div style={styles.roomFeature}>
              <span style={styles.roomFeatureIcon}>⚙️</span>
              <span>{lang.roomFeature4}</span>
            </div>
            <div style={styles.roomFeature}>
              <span style={styles.roomFeatureIcon}>🗺️</span>
              <span>{lang.roomFeature5}</span>
            </div>
            <div style={styles.roomFeature}>
              <span style={styles.roomFeatureIcon}>🧠</span>
              <span>{lang.roomFeature6}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Who We Serve */}
      <div id="services" style={{ ...styles.section, ...fadeIn('services'), padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : '40px' }}>
        <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '22px' : isMobile ? '26px' : '32px' }}>{lang.whoItServes}</h2>
        <div style={{ ...styles.servicesGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}>
          {[
            { icon: 'fa-graduation-cap', title: lang.schools, desc: lang.schoolsDesc },
            { icon: 'fa-hospital', title: lang.hospitals, desc: lang.hospitalsDesc },
            { icon: 'fa-building', title: lang.organizations, desc: lang.organizationsDesc },
          ].map((s, i) => (
            <div key={i} style={styles.serviceCard}>
              <div style={styles.serviceIcon}><i className={`fas ${s.icon}`}></i></div>
              <h3 style={styles.serviceTitle}>{s.title}</h3>
              <p style={styles.serviceDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Images */}
      <div id="features" style={{ ...styles.section, ...fadeIn('features'), padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : '40px' }}>
        <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '22px' : isMobile ? '26px' : '32px' }}>{lang.featuresTitle}</h2>
        <div style={{ ...styles.featureImagesGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}>
          {[
            { icon: 'fa-chalkboard-user', caption: lang.pic1Caption, desc: lang.shiftManagementDesc },
            { icon: 'fa-calendar-alt', caption: lang.pic2Caption, desc: lang.multiBranchDesc },
            { icon: 'fa-chart-line', caption: lang.pic3Caption, desc: lang.realtimeAnalyticsDesc },
          ].map((f, i) => (
            <div key={i} style={styles.featureImageCard}>
              <div style={styles.imagePlaceholder}><i className={`fas ${f.icon}`} style={{ fontSize: '48px', color: '#00d1ff' }}></i></div>
              <p style={styles.imageCaption}>{f.caption}</p>
              <p style={styles.imageDesc}>{f.desc.substring(0, 60)}...</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ ...styles.section, padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : '40px' }}>
        <div style={{ ...styles.featuresGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
          {[
            { icon: 'fa-clock', title: lang.shiftManagement, desc: lang.shiftManagementDesc },
            { icon: 'fa-code-branch', title: lang.multiBranch, desc: lang.multiBranchDesc },
            { icon: 'fa-chart-simple', title: lang.realtimeAnalytics, desc: lang.realtimeAnalyticsDesc },
            { icon: 'fa-bell', title: lang.smartNotifications, desc: lang.smartNotificationsDesc },
            { icon: 'fa-mobile-alt', title: lang.employeeApp, desc: lang.employeeAppDesc },
            { icon: 'fa-file-alt', title: lang.reporting, desc: lang.reportingDesc },
          ].map((f, i) => (
            <div key={i} style={styles.featureItem}>
              <div style={styles.featureItemIcon}><i className={`fas ${f.icon}`}></i></div>
              <div>
                <h4 style={styles.featureItemTitle}>{f.title}</h4>
                <p style={styles.featureItemDesc}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Owner */}
      <div id="owner" style={{ ...styles.ownerSection, ...fadeIn('owner'), padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : '40px' }}>
        <div style={{
          ...styles.ownerCard,
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: isMobile ? 'center' : 'left',
          padding: isSmall ? '24px 16px' : isMobile ? '28px 20px' : '40px',
          gap: isSmall ? '20px' : isMobile ? '24px' : '50px',
        }}>
          <div style={styles.ownerLogo}>
            <a href="https://glorifytc.se" target="_blank" rel="noopener noreferrer" style={styles.glorifyLogoLink}>
              <div style={{ ...styles.glorifyLogoIcon, width: isSmall ? '64px' : '80px', height: isSmall ? '64px' : '80px', fontSize: isSmall ? '36px' : '44px' }}>
                <span>G</span>
              </div>
              <div style={styles.glorifyLogoText}>GlorifyTC</div>
            </a>
          </div>
          <div style={{ ...styles.ownerInfo, width: isMobile ? '100%' : 'auto' }}>
            <h3 style={{ ...styles.ownerTitle, fontSize: isSmall ? '16px' : isMobile ? '18px' : '24px' }}>{lang.ownerTitle}</h3>
            <div style={{ ...styles.ownerContact, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <a href="mailto:info@glorifytc.se" style={styles.ownerLink}>info@glorifytc.se</a>
              <a href="https://glorifytc.se" target="_blank" rel="noopener noreferrer" style={styles.ownerLink}>glorifytc.se</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ ...styles.footer, padding: isSmall ? '20px 16px' : '30px 40px' }}>
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
    textAlign: 'center',
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
    fontWeight: '700',
    lineHeight: '1.2',
    marginBottom: '24px',
    color: 'white',
  },
  subtitle: {
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1400px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '40px',
    color: 'white',
  },
  missionCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '28px',
    padding: '48px',
    textAlign: 'center',
    border: '1px solid rgba(0, 209, 255, 0.3)',
  },
  missionText: {
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  
  // Room Assignment System Styles
  roomSystemCard: {
    background: 'rgba(0, 209, 255, 0.05)',
    borderRadius: '28px',
    padding: '48px',
    textAlign: 'center',
    border: '1px solid rgba(0, 209, 255, 0.3)',
  },
  roomSystemIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  roomSystemTitle: {
    fontWeight: '700',
    color: '#00d1ff',
    marginBottom: '16px',
  },
  roomSystemDesc: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '700px',
    margin: '0 auto 32px auto',
  },
  roomFeaturesGrid: {
    display: 'grid',
    gap: '16px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  roomFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '14px 20px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
  },
  roomFeatureIcon: {
    fontSize: '20px',
    minWidth: '32px',
  },
  
  servicesGrid: {
    display: 'grid',
    gap: '24px',
  },
  serviceCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
  },
  serviceIcon: {
    fontSize: '40px',
    marginBottom: '16px',
    color: '#00d1ff',
  },
  serviceTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '8px',
  },
  serviceDesc: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: '1.5',
  },
  featureImagesGrid: {
    display: 'grid',
    gap: '24px',
    marginBottom: '40px',
  },
  featureImageCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '20px',
    overflow: 'hidden',
    textAlign: 'center',
    padding: '24px',
    transition: 'transform 0.3s ease',
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
    gap: '20px',
  },
  featureItem: {
    display: 'flex',
    gap: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    padding: '20px',
    transition: 'transform 0.3s ease',
  },
  featureItemIcon: {
    fontSize: '28px',
    color: '#00d1ff',
    minWidth: '40px',
  },
  featureItemTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '6px',
  },
  featureItemDesc: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: '1.5',
  },
  ownerSection: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1400px',
    margin: '0 auto',
  },
  ownerCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '28px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(0, 209, 255, 0.3)',
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
  ownerContact: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  ownerLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    fontSize: '15px',
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
  
  .navLink:hover, .mobileNavLink:hover {
    color: #00d1ff !important;
  }
  .serviceCard:hover, .featureImageCard:hover, .featureItem:hover {
    transform: translateY(-4px);
  }
  .roomFeature:hover {
    background: rgba(0, 209, 255, 0.1);
  }
  .ownerLink:hover {
    color: #00d1ff !important;
  }

  /* Responsive navbar rules */
  @media (max-width: 768px) {
    nav { padding: 16px 20px !important; }
    .tb-logo-icon { width: 34px !important; height: 34px !important; font-size: 19px !important; }
    .tb-logo-text { font-size: 20px !important; }
    .roomSystemCard { padding: 32px 20px !important; }
    .roomSystemDesc { font-size: 16px !important; }
  }
  @media (max-width: 480px) {
    nav { padding: 12px 14px !important; }
    .tb-logo-icon { width: 30px !important; height: 30px !important; font-size: 16px !important; border-radius: 8px !important; }
    .tb-logo-text { font-size: 17px !important; }
    .roomSystemCard { padding: 24px 16px !important; }
    .roomFeature { font-size: 12px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default About;