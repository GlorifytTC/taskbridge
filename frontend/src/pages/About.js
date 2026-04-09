import React, { useEffect, useState } from 'react';

const About = ({ onNavigate, user }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });
  const [isVisible, setIsVisible] = useState({});

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

    const elements = ['hero', 'mission', 'features', 'stats', 'owner'];
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

  const t = {
    en: {
      title: 'About TaskBridge',
      subtitle: 'Smart Workforce Management for Modern Organizations',
      backToDashboard: 'Back to Dashboard',
      missionTitle: 'Our Mission',
      missionText: 'TaskBridge empowers schools, hospitals, and organizations with intelligent shift management, real-time attendance tracking, and seamless communication — all in one platform.',
      whoItServes: 'Who It Serves',
      schools: 'Schools',
      schoolsDesc: 'Manage teacher schedules, substitute coverage, and extracurricular activities',
      hospitals: 'Hospitals',
      hospitalsDesc: 'Coordinate nursing shifts, doctor rotations, and emergency coverage',
      organizations: 'Organizations',
      organizationsDesc: 'Streamline workforce operations across multiple branches and departments',
      featuresTitle: 'Key Features',
      shiftManagement: 'Smart Shift Management',
      shiftManagementDesc: 'Create, assign, and track shifts with automated conflict detection and approval workflows.',
      multiBranch: 'Multi-Branch Support',
      multiBranchDesc: 'Centralized control with branch-specific settings, roles, and reporting.',
      realtimeAnalytics: 'Real-Time Analytics',
      realtimeAnalyticsDesc: 'Live dashboards showing attendance, hours worked, and labor costs.',
      smartNotifications: 'Smart Notifications',
      smartNotificationsDesc: 'Automated alerts for shift reminders, approvals, and schedule changes.',
      employeeApp: 'Employee Mobile App',
      employeeAppDesc: 'Employees can view shifts, apply for openings, and track their hours.',
      reporting: 'Advanced Reporting',
      reportingDesc: 'Export detailed reports on attendance, payroll, and branch performance.',
      statsTitle: 'Trusted By',
      organizationsCount: '500+',
      organizationsLabel: 'Active Organizations',
      employeesCount: '10K+',
      employeesLabel: 'Employees Managed',
      satisfactionCount: '98%',
      satisfactionLabel: 'Satisfaction Rate',
      shiftsCount: '50K+',
      shiftsLabel: 'Shifts Completed',
      ownerTitle: 'Project Owner & Lead Developer',
      developedBy: 'Developed by',
      pic1Alt: 'TaskBridge Dashboard Interface',
      pic2Alt: 'Shift Management Calendar',
      pic3Alt: 'Analytics Dashboard',
      pic1Caption: 'Centralized Dashboard',
      pic2Caption: 'Smart Calendar View',
      pic3Caption: 'Real-Time Analytics'
    },
    sv: {
      title: 'Om TaskBridge',
      subtitle: 'Smart Personalhantering för Moderna Organisationer',
      backToDashboard: 'Tillbaka till Dashboard',
      missionTitle: 'Vårt Uppdrag',
      missionText: 'TaskBridge ger skolor, sjukhus och organisationer intelligent schemaläggning, realtidsnärvaro och sömlös kommunikation — allt i en plattform.',
      whoItServes: 'Vem Det Tjänar',
      schools: 'Skolor',
      schoolsDesc: 'Hantera lärarscheman, vikarietäckning och extracurricular aktiviteter',
      hospitals: 'Sjukhus',
      hospitalsDesc: 'Koordinera skift för sjuksköterskor, läkarrotationer och akuttäckning',
      organizations: 'Organisationer',
      organizationsDesc: 'Effektivisera personalverksamhet över flera filialer och avdelningar',
      featuresTitle: 'Huvudfunktioner',
      shiftManagement: 'Smart Skifthallning',
      shiftManagementDesc: 'Skapa, tilldela och spåra skift med automatisk konfliktdetektering och godkännandeprocesser.',
      multiBranch: 'Stöd för Flera Filialer',
      multiBranchDesc: 'Central kontroll med filialspecifika inställningar, roller och rapporter.',
      realtimeAnalytics: 'Realtidsanalyser',
      realtimeAnalyticsDesc: 'Live-instrumentpaneler som visar närvaro, arbetade timmar och personalkostnader.',
      smartNotifications: 'Smarta Notiser',
      smartNotificationsDesc: 'Automatiska aviseringar för skiftpåminnelser, godkännanden och schemaändringar.',
      employeeApp: 'Mobilapp för Anställda',
      employeeAppDesc: 'Anställda kan se skift, söka lediga pass och följa sina timmar.',
      reporting: 'Avancerad Rapportering',
      reportingDesc: 'Exportera detaljerade rapporter om närvaro, löner och filialprestanda.',
      statsTitle: 'Lita På Av',
      organizationsCount: '500+',
      organizationsLabel: 'Aktiva Organisationer',
      employeesCount: '10K+',
      employeesLabel: 'Hanterade Anställda',
      satisfactionCount: '98%',
      satisfactionLabel: 'Nöjdhetsgrad',
      shiftsCount: '50K+',
      shiftsLabel: 'Genomförda Skift',
      ownerTitle: 'Projektägare & Lead Utvecklare',
      developedBy: 'Utvecklad av',
      pic1Alt: 'TaskBridge Dashboard Gränssnitt',
      pic2Alt: 'Smart Kalendervy',
      pic3Alt: 'Analysinstrumentpanel',
      pic1Caption: 'Centraliserad Dashboard',
      pic2Caption: 'Smart Kalendervy',
      pic3Caption: 'Realtidsanalyser'
    }
  };

  const lang = t[language];

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('taskbridge_language', langCode);
  };

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgAnimation}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
        <div style={styles.bgCircle3}></div>
      </div>

      {/* Language Switcher */}
      <div style={styles.languageSwitcher}>
        <button onClick={() => changeLanguage('en')} style={{...styles.langBtn, background: language === 'en' ? '#00d1ff' : 'rgba(255,255,255,0.1)'}}>EN</button>
        <button onClick={() => changeLanguage('sv')} style={{...styles.langBtn, background: language === 'sv' ? '#00d1ff' : 'rgba(255,255,255,0.1)'}}>SV</button>
      </div>

      {/* Back Button */}
      <div style={styles.backButtonContainer}>
        <button onClick={() => onNavigate(getDashboardRoute())} style={styles.backButton}>
          ← {lang.backToDashboard}
        </button>
      </div>

      {/* Hero Section */}
      <div id="hero" style={{...styles.section, ...styles.heroSection, opacity: isVisible.hero ? 1 : 0, transform: `translateY(${isVisible.hero ? 0 : '30px'})`, transition: 'all 0.6s ease' }}>
        <div style={styles.heroIcon}>
          <span>T</span>
        </div>
        <h1 style={styles.title}>{lang.title}</h1>
        <p style={styles.subtitle}>{lang.subtitle}</p>
      </div>

      {/* Mission Section */}
      <div id="mission" style={{...styles.section, opacity: isVisible.mission ? 1 : 0, transform: `translateY(${isVisible.mission ? 0 : '30px'})`, transition: 'all 0.6s ease 0.1s' }}>
        <div style={styles.missionCard}>
          <h2 style={styles.sectionTitle}>{lang.missionTitle}</h2>
          <p style={styles.missionText}>{lang.missionText}</p>
        </div>
      </div>

      {/* Who It Serves - 3 Cards */}
      <div id="features" style={{...styles.section, opacity: isVisible.features ? 1 : 0, transform: `translateY(${isVisible.features ? 0 : '30px'})`, transition: 'all 0.6s ease 0.2s' }}>
        <h2 style={styles.sectionTitle}>{lang.whoItServes}</h2>
        <div style={styles.servicesGrid}>
          <div style={styles.serviceCard}>
            <div style={styles.serviceIcon}>🏫</div>
            <h3>{lang.schools}</h3>
            <p>{lang.schoolsDesc}</p>
          </div>
          <div style={styles.serviceCard}>
            <div style={styles.serviceIcon}>🏥</div>
            <h3>{lang.hospitals}</h3>
            <p>{lang.hospitalsDesc}</p>
          </div>
          <div style={styles.serviceCard}>
            <div style={styles.serviceIcon}>🏢</div>
            <h3>{lang.organizations}</h3>
            <p>{lang.organizationsDesc}</p>
          </div>
        </div>
      </div>

      {/* Feature Images Section - You can add your pics here */}
      <div style={styles.section}>
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

      {/* Features List Grid */}
      <div style={styles.section}>
        <div style={styles.featuresGrid}>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>📅</div>
            <div>
              <h4>{lang.shiftManagement}</h4>
              <p>{lang.shiftManagementDesc}</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>🏪</div>
            <div>
              <h4>{lang.multiBranch}</h4>
              <p>{lang.multiBranchDesc}</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>📊</div>
            <div>
              <h4>{lang.realtimeAnalytics}</h4>
              <p>{lang.realtimeAnalyticsDesc}</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>🔔</div>
            <div>
              <h4>{lang.smartNotifications}</h4>
              <p>{lang.smartNotificationsDesc}</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>📱</div>
            <div>
              <h4>{lang.employeeApp}</h4>
              <p>{lang.employeeAppDesc}</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureItemIcon}>📋</div>
            <div>
              <h4>{lang.reporting}</h4>
              <p>{lang.reportingDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div id="stats" style={{...styles.statsSection, opacity: isVisible.stats ? 1 : 0, transform: `translateY(${isVisible.stats ? 0 : '30px'})`, transition: 'all 0.6s ease 0.3s' }}>
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
      <div id="owner" style={{...styles.ownerSection, opacity: isVisible.owner ? 1 : 0, transform: `translateY(${isVisible.owner ? 0 : '30px'})`, transition: 'all 0.6s ease 0.4s' }}>
        <div style={styles.ownerCard}>
          <div style={styles.ownerLogo}>
            <div style={styles.ownerLogoIcon}>G</div>
            <div style={styles.ownerLogoText}>GlorifyTC</div>
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
        <p>© 2026 TaskBridge. {lang.developedBy} <strong style={{ color: '#00d1ff' }}>GlorifyTC</strong></p>
      </footer>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    fontFamily: 'Inter, sans-serif',
    position: 'relative',
    overflowX: 'hidden',
    padding: '80px 40px 40px',
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
  languageSwitcher: {
    position: 'fixed',
    top: '20px',
    right: '120px',
    zIndex: 100,
    display: 'flex',
    gap: '8px',
  },
  langBtn: {
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  backButtonContainer: {
    position: 'fixed',
    top: '20px',
    left: '40px',
    zIndex: 100,
  },
  backButton: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  section: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    marginBottom: '60px',
  },
  heroSection: {
    textAlign: 'center',
    marginTop: '20px',
    marginBottom: '60px',
  },
  heroIcon: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    fontSize: '44px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 0 40px rgba(0,209,255,0.4)',
    animation: 'softGlow 3s ease-in-out infinite',
  },
  title: {
    fontSize: '48px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #fff, #00d1ff)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.7)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: '40px',
  },
  missionCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '28px',
    padding: '40px',
    textAlign: 'center',
    border: '1px solid rgba(0,209,255,0.3)',
  },
  missionText: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: 'rgba(255,255,255,0.8)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  serviceCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
  },
  serviceIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  featureImagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  featureImageCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '20px',
    overflow: 'hidden',
    textAlign: 'center',
    padding: '24px',
  },
  imagePlaceholder: {
    width: '100%',
    height: '180px',
    background: 'rgba(0,209,255,0.05)',
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
    color: 'rgba(255,255,255,0.6)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
  },
  featureItem: {
    display: 'flex',
    gap: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    padding: '20px',
  },
  featureItemIcon: {
    fontSize: '32px',
  },
  statsSection: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    marginBottom: '60px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#00d1ff',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
  },
  ownerSection: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '800px',
    margin: '0 auto',
    marginBottom: '40px',
  },
  ownerCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '28px',
    padding: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    border: '1px solid rgba(0,209,255,0.3)',
    flexWrap: 'wrap',
    justifyContent: 'center',
    textAlign: 'center',
  },
  ownerLogo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  ownerLogoIcon: {
    width: '70px',
    height: '70px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '38px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 0 25px rgba(0,209,255,0.35)',
  },
  ownerLogoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #fff, #00d1ff)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  ownerInfo: {
    textAlign: 'center',
  },
  ownerTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#00d1ff',
    marginBottom: '12px',
  },
  ownerContact: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ownerLink: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: '14px',
  },
  footer: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '24px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
  },
};

// Add animations
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
    0%, 100% { box-shadow: 0 0 20px rgba(0,209,255,0.3); }
    50% { box-shadow: 0 0 40px rgba(0,209,255,0.5); }
  }
  .serviceCard:hover, .featureImageCard:hover, .featureItem:hover, .statCard:hover {
    transform: translateY(-4px);
    transition: transform 0.3s ease;
  }
  .ownerLink:hover {
    color: #00d1ff;
  }
`;
document.head.appendChild(styleSheet);

export default About;