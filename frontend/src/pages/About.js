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
    const elements = ['hero', 'mission', 'overview', 'platform', 'workflow', 'rooms', 'owner'];
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
      subtitle: 'Enterprise Workforce Management Platform',
      missionTitle: 'Our Mission',
      missionText: 'TaskBridge delivers intelligent workforce management solutions for organizations of all sizes. We combine shift scheduling, attendance tracking, and resource allocation into a single, unified platform.',
      
      overviewTitle: 'What is TaskBridge?',
      overviewText: 'TaskBridge is a comprehensive workforce management system designed for schools, hospitals, and enterprises. It enables organizations to efficiently manage staff schedules, track attendance, allocate resources, and optimize workforce operations.',
      
      platformTitle: 'Platform Capabilities',
      
      // Workflow Steps
      workflowTitle: 'How TaskBridge Works',
      step1Title: 'Organization Setup',
      step1Desc: 'Create your organization structure with multiple branches, departments, and locations. Define your operational hierarchy and administrative boundaries.',
      step2Title: 'Staff Onboarding',
      step2Desc: 'Add employees, administrators, and super administrators. Define roles, job descriptions, and specialization areas for each staff member.',
      step3Title: 'Task Creation',
      step3Desc: 'Create shifts and tasks with specific dates, time slots, location requirements, and required skill sets. Set maximum capacity for each assignment.',
      step4Title: 'Application Management',
      step4Desc: 'Employees browse available tasks matching their skills and submit applications. Administrators review, approve, or reject requests with detailed feedback.',
      step5Title: 'Calendar Integration',
      step5Desc: 'Approved shifts automatically populate employee calendars. View daily, weekly, or monthly schedules with real-time availability tracking.',
      step6Title: 'Analytics & Reporting',
      step6Desc: 'Generate comprehensive reports on attendance patterns, hours worked, labor costs, and workforce utilization. Export data for payroll and compliance.',
      
      // Room Assignment System
      roomsTitle: 'Smart Resource Allocation',
      roomsDesc: 'Intelligent room and resource allocation system that optimizes space utilization and staff deployment.',
      roomsStep1: 'Group Definition - Define groups requiring placement including classes, teams, or patient units with specific requirements.',
      roomsStep2: 'Space Management - Configure rooms with capacity limits, types, and specialized equipment requirements.',
      roomsStep3: 'Staff Registration - Register personnel with their qualifications, certifications, and availability schedules.',
      roomsStep4: 'Automated Matching - One-click algorithm matches groups to optimal rooms and qualified staff based on requirements.',
      roomsStep5: 'Visual Overview - Interactive map view displays all assignments with status indicators.',
      roomsStep6: 'Adaptive Learning - System continuously improves recommendations by learning from manual adjustments.',
      
      // Features
      shiftManagement: 'Shift Management',
      shiftManagementDesc: 'Create, assign, and track shifts with automated conflict detection and approval workflows.',
      multiBranch: 'Multi-Branch Support',
      multiBranchDesc: 'Centralized control with branch-specific settings, roles, and reporting capabilities.',
      realtimeAnalytics: 'Analytics',
      realtimeAnalyticsDesc: 'Live dashboards showing attendance, hours worked, and labor costs.',
      smartNotifications: 'Smart Notifications',
      smartNotificationsDesc: 'Automated alerts for shift reminders, approvals, and schedule changes.',
      employeeApp: 'Employee Portal',
      employeeAppDesc: 'Employees can view shifts, apply for openings, and track their hours.',
      reporting: 'Reporting',
      reportingDesc: 'Export detailed reports on attendance, payroll, and branch performance.',
      
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
      subtitle: 'Enterprise Personalhanteringsplattform',
      missionTitle: 'Vårt Uppdrag',
      missionText: 'TaskBridge levererar intelligenta personalhanteringslösningar för organisationer i alla storlekar. Vi kombinerar schemaläggning, närvarospårning och resursallokering i en enhetlig plattform.',
      
      overviewTitle: 'Vad är TaskBridge?',
      overviewText: 'TaskBridge är ett komplett personalhanteringssystem utformat för skolor, sjukhus och företag. Det gör det möjligt för organisationer att effektivt hantera personalsscheman, spåra närvaro, allokera resurser och optimera personalverksamheten.',
      
      platformTitle: 'Plattformsfunktioner',
      
      workflowTitle: 'Hur TaskBridge Fungerar',
      step1Title: 'Organisationsinställning',
      step1Desc: 'Skapa din organisationsstruktur med flera filialer, avdelningar och platser. Definiera din operativa hierarki och administrativa gränser.',
      step2Title: 'Personalregistrering',
      step2Desc: 'Lägg till anställda, administratörer och superadministratörer. Definiera roller, arbetsbeskrivningar och specialiseringsområden för varje medarbetare.',
      step3Title: 'Uppgiftsskapande',
      step3Desc: 'Skapa pass och uppgifter med specifika datum, tider, platskrav och erforderliga kompetenser. Ange maximal kapacitet för varje uppdrag.',
      step4Title: 'Ansökningshantering',
      step4Desc: 'Anställda söker bland tillgängliga uppgifter som matchar deras kompetenser och skickar in ansökningar. Administratörer granskar, godkänner eller avslår förfrågningar med detaljerad feedback.',
      step5Title: 'Kalenderintegration',
      step5Desc: 'Godkända pass visas automatiskt i anställdas kalendrar. Visa dagliga, veckovisa eller månatliga scheman med realtidsuppdatering av tillgänglighet.',
      step6Title: 'Analys & Rapportering',
      step6Desc: 'Generera omfattande rapporter om närvaromönster, arbetade timmar, personalkostnader och personalutnyttjande. Exportera data för lönehantering och efterlevnad.',
      
      // Room Assignment System
      roomsTitle: 'Smart Resursallokering',
      roomsDesc: 'Intelligent rum- och resursallokeringssystem som optimerar utrymmesanvändning och personalplacering.',
      roomsStep1: 'Gruppdefinition - Definiera grupper som behöver placeras, inklusive klasser, team eller patientenheter med specifika krav.',
      roomsStep2: 'Utrymmeshantering - Konfigurera rum med kapacitetsgränser, typer och specialutrustningskrav.',
      roomsStep3: 'Personalregistrering - Registrera personal med deras kvalifikationer, certifieringar och tillgänglighetsscheman.',
      roomsStep4: 'Automatisk matchning - Ett-klicksalgoritm matchar grupper till optimala rum och kvalificerad personal baserat på krav.',
      roomsStep5: 'Visuell översikt - Interaktiv kartvy visar alla tilldelningar med statusindikatorer.',
      roomsStep6: 'Adaptiv inlärning - Systemet förbättrar kontinuerligt rekommendationer genom att lära sig från manuella justeringar.',
      
      shiftManagement: 'Skifthallning',
      shiftManagementDesc: 'Skapa, tilldela och spåra skift med automatisk konfliktdetektering och godkännandeprocesser.',
      multiBranch: 'Filialstöd',
      multiBranchDesc: 'Central kontroll med filialspecifika inställningar, roller och rapportering.',
      realtimeAnalytics: 'Analyser',
      realtimeAnalyticsDesc: 'Live-instrumentpaneler som visar närvaro, arbetade timmar och personalkostnader.',
      smartNotifications: 'Smarta Notiser',
      smartNotificationsDesc: 'Automatiska aviseringar för skiftpåminnelser, godkännanden och schemaändringar.',
      employeeApp: 'Personalportal',
      employeeAppDesc: 'Anställda kan se skift, söka lediga pass och följa sina timmar.',
      reporting: 'Rapportering',
      reportingDesc: 'Exportera detaljerade rapporter om närvaro, löner och filialprestanda.',
      
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
          <div style={styles.tag}><span style={styles.tagDot}></span><span style={styles.tagText}>Enterprise Platform</span></div>
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

      {/* What is TaskBridge */}
      <div id="overview" style={{ ...styles.section, ...fadeIn('overview'), padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : '40px' }}>
        <div style={styles.overviewCard}>
          <h2 style={{ ...styles.overviewTitle, fontSize: isSmall ? '22px' : isMobile ? '26px' : '32px' }}>{lang.overviewTitle}</h2>
          <p style={{ ...styles.overviewText, fontSize: isSmall ? '14px' : isMobile ? '15px' : '18px' }}>{lang.overviewText}</p>
        </div>
      </div>

      {/* How TaskBridge Works - Step by Step */}
      <div id="workflow" style={{ ...styles.section, ...fadeIn('workflow'), padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : '40px' }}>
        <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '22px' : isMobile ? '26px' : '32px' }}>{lang.workflowTitle}</h2>
        <div style={{ ...styles.workflowGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}>
          <div style={styles.workflowCard}>
            <div style={styles.stepNumber}>01</div>
            <h3 style={styles.workflowCardTitle}>{lang.step1Title}</h3>
            <p style={styles.workflowCardDesc}>{lang.step1Desc}</p>
          </div>
          <div style={styles.workflowCard}>
            <div style={styles.stepNumber}>02</div>
            <h3 style={styles.workflowCardTitle}>{lang.step2Title}</h3>
            <p style={styles.workflowCardDesc}>{lang.step2Desc}</p>
          </div>
          <div style={styles.workflowCard}>
            <div style={styles.stepNumber}>03</div>
            <h3 style={styles.workflowCardTitle}>{lang.step3Title}</h3>
            <p style={styles.workflowCardDesc}>{lang.step3Desc}</p>
          </div>
          <div style={styles.workflowCard}>
            <div style={styles.stepNumber}>04</div>
            <h3 style={styles.workflowCardTitle}>{lang.step4Title}</h3>
            <p style={styles.workflowCardDesc}>{lang.step4Desc}</p>
          </div>
          <div style={styles.workflowCard}>
            <div style={styles.stepNumber}>05</div>
            <h3 style={styles.workflowCardTitle}>{lang.step5Title}</h3>
            <p style={styles.workflowCardDesc}>{lang.step5Desc}</p>
          </div>
          <div style={styles.workflowCard}>
            <div style={styles.stepNumber}>06</div>
            <h3 style={styles.workflowCardTitle}>{lang.step6Title}</h3>
            <p style={styles.workflowCardDesc}>{lang.step6Desc}</p>
          </div>
        </div>
      </div>

      {/* Smart Resource Allocation / Room System */}
      <div id="rooms" style={{ ...styles.section, ...fadeIn('rooms'), padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : '40px' }}>
        <div style={styles.roomsCard}>
          <h2 style={{ ...styles.roomsTitle, fontSize: isSmall ? '22px' : isMobile ? '26px' : '32px' }}>{lang.roomsTitle}</h2>
          <p style={styles.roomsDesc}>{lang.roomsDesc}</p>
          <div style={{ ...styles.roomsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
            <div style={styles.roomsStep}>
              <span style={styles.stepBadge}>01</span>
              <span>{lang.roomsStep1}</span>
            </div>
            <div style={styles.roomsStep}>
              <span style={styles.stepBadge}>02</span>
              <span>{lang.roomsStep2}</span>
            </div>
            <div style={styles.roomsStep}>
              <span style={styles.stepBadge}>03</span>
              <span>{lang.roomsStep3}</span>
            </div>
            <div style={styles.roomsStep}>
              <span style={styles.stepBadge}>04</span>
              <span>{lang.roomsStep4}</span>
            </div>
            <div style={styles.roomsStep}>
              <span style={styles.stepBadge}>05</span>
              <span>{lang.roomsStep5}</span>
            </div>
            <div style={styles.roomsStep}>
              <span style={styles.stepBadge}>06</span>
              <span>{lang.roomsStep6}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Capabilities */}
      <div id="platform" style={{ ...styles.section, ...fadeIn('platform'), padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : '40px' }}>
        <h2 style={{ ...styles.sectionTitle, fontSize: isSmall ? '22px' : isMobile ? '26px' : '32px' }}>{lang.platformTitle}</h2>
        <div style={{ ...styles.platformGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
          <div style={styles.platformItem}>
            <div style={styles.platformIcon}><i className="fas fa-clock"></i></div>
            <div>
              <h4 style={styles.platformItemTitle}>{lang.shiftManagement}</h4>
              <p style={styles.platformItemDesc}>{lang.shiftManagementDesc}</p>
            </div>
          </div>
          <div style={styles.platformItem}>
            <div style={styles.platformIcon}><i className="fas fa-code-branch"></i></div>
            <div>
              <h4 style={styles.platformItemTitle}>{lang.multiBranch}</h4>
              <p style={styles.platformItemDesc}>{lang.multiBranchDesc}</p>
            </div>
          </div>
          <div style={styles.platformItem}>
            <div style={styles.platformIcon}><i className="fas fa-chart-simple"></i></div>
            <div>
              <h4 style={styles.platformItemTitle}>{lang.realtimeAnalytics}</h4>
              <p style={styles.platformItemDesc}>{lang.realtimeAnalyticsDesc}</p>
            </div>
          </div>
          <div style={styles.platformItem}>
            <div style={styles.platformIcon}><i className="fas fa-bell"></i></div>
            <div>
              <h4 style={styles.platformItemTitle}>{lang.smartNotifications}</h4>
              <p style={styles.platformItemDesc}>{lang.smartNotificationsDesc}</p>
            </div>
          </div>
          <div style={styles.platformItem}>
            <div style={styles.platformIcon}><i className="fas fa-mobile-alt"></i></div>
            <div>
              <h4 style={styles.platformItemTitle}>{lang.employeeApp}</h4>
              <p style={styles.platformItemDesc}>{lang.employeeAppDesc}</p>
            </div>
          </div>
          <div style={styles.platformItem}>
            <div style={styles.platformIcon}><i className="fas fa-file-alt"></i></div>
            <div>
              <h4 style={styles.platformItemTitle}>{lang.reporting}</h4>
              <p style={styles.platformItemDesc}>{lang.reportingDesc}</p>
            </div>
          </div>
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
  overviewCard: {
    background: 'rgba(0, 209, 255, 0.05)',
    borderRadius: '24px',
    padding: '40px',
    textAlign: 'center',
    border: '1px solid rgba(0, 209, 255, 0.2)',
  },
  overviewTitle: {
    fontWeight: '700',
    color: '#00d1ff',
    marginBottom: '16px',
  },
  overviewText: {
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  workflowGrid: {
    display: 'grid',
    gap: '24px',
  },
  workflowCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '28px',
    transition: 'transform 0.3s ease',
  },
  stepNumber: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#00d1ff',
    marginBottom: '12px',
    letterSpacing: '1px',
  },
  workflowCardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '12px',
  },
  workflowCardDesc: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: '1.5',
  },
  roomsCard: {
    background: 'rgba(0, 209, 255, 0.05)',
    borderRadius: '24px',
    padding: '40px',
    border: '1px solid rgba(0, 209, 255, 0.2)',
  },
  roomsTitle: {
    fontWeight: '700',
    color: '#00d1ff',
    marginBottom: '16px',
    textAlign: 'center',
  },
  roomsDesc: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    maxWidth: '700px',
    margin: '0 auto 32px auto',
  },
  roomsGrid: {
    display: 'grid',
    gap: '16px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  roomsStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '14px 20px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  stepBadge: {
    minWidth: '32px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#00d1ff',
  },
  platformGrid: {
    display: 'grid',
    gap: '20px',
  },
  platformItem: {
    display: 'flex',
    gap: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    padding: '20px',
    transition: 'transform 0.3s ease',
  },
  platformIcon: {
    fontSize: '28px',
    color: '#00d1ff',
    minWidth: '44px',
  },
  platformItemTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '6px',
  },
  platformItemDesc: {
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
  .workflowCard:hover, .platformItem:hover {
    transform: translateY(-4px);
  }
  .roomsStep:hover {
    background: rgba(0, 209, 255, 0.08);
  }
  .ownerLink:hover {
    color: #00d1ff !important;
  }

  @media (max-width: 768px) {
    nav { padding: 16px 20px !important; }
    .tb-logo-icon { width: 34px !important; height: 34px !important; font-size: 19px !important; }
    .tb-logo-text { font-size: 20px !important; }
    .roomsCard, .overviewCard, .missionCard { padding: 32px 20px !important; }
  }
  @media (max-width: 480px) {
    nav { padding: 12px 14px !important; }
    .tb-logo-icon { width: 30px !important; height: 30px !important; font-size: 16px !important; border-radius: 8px !important; }
    .tb-logo-text { font-size: 17px !important; }
    .roomsStep { font-size: 12px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default About;