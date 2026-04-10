import React, { useState, useEffect } from 'react';

const Pricing = ({ onNavigate, onLoginClick }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'sv' : 'en';
    setLanguage(newLang);
    localStorage.setItem('taskbridge_language', newLang);
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const planPrices = [
    { id: 'basic', name: 'Basic', price: 399, maxEmployees: 25, maxBranches: 3, maxEmails: 200, maxAdmins: 2 },
    { id: 'standard', name: 'Standard', price: 799, maxEmployees: 50, maxBranches: 5, maxEmails: 400, maxAdmins: 3 },
    { id: 'pro', name: 'Pro', price: 1299, maxEmployees: 100, maxBranches: 8, maxEmails: 700, maxAdmins: 5, popular: true },
    { id: 'business', name: 'Business', price: 2499, maxEmployees: 250, maxBranches: 15, maxEmails: 2000, maxAdmins: 10 },
    { id: 'enterprise', name: 'Enterprise', price: 4999, maxEmployees: 500, maxBranches: 30, maxEmails: 5000, maxAdmins: 20 },
    { id: 'corporate', name: 'Corporate', price: 9999, maxEmployees: 1000, maxBranches: 60, maxEmails: 12000, maxAdmins: 50 }
  ];

  const t = {
    en: {
      nav: { home: 'Home', about: 'About', pricing: 'Pricing', contact: 'Contact' },
      signIn: 'Sign In',
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the perfect plan for your organization. No hidden fees.',
      perMonth: '/month',
      getStarted: 'Get Started',
      plan: 'Plan',
      price: 'Price (SEK)',
      employees: 'Employees',
      branches: 'Branches',
      emails: 'Emails/month',
      admins: 'Admins',
      mostPopular: 'MOST POPULAR',
      footer: 'All rights reserved. Developed by',
      contactSales: 'Contact Sales'
    },
    sv: {
      nav: { home: 'Hem', about: 'Om Oss', pricing: 'Priser', contact: 'Kontakt' },
      signIn: 'Logga in',
      title: 'Enkla, Transparenta Priser',
      subtitle: 'Välj den perfekta planen för din organisation. Inga dolda avgifter.',
      perMonth: '/månad',
      getStarted: 'Kom igång',
      plan: 'Plan',
      price: 'Pris (SEK)',
      employees: 'Anställda',
      branches: 'Filialer',
      emails: 'E-post/månad',
      admins: 'Administratörer',
      mostPopular: 'MEST POPULÄR',
      footer: 'Alla rättigheter förbehållna. Utvecklad av',
      contactSales: 'Kontakta oss'
    }
  };

  const lang = t[language];
  const isSmall = screenWidth <= 480;

  const handleGetStarted = () => {
    if (onLoginClick) onLoginClick();
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
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); }} style={styles.navLink}>{lang.nav.about}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ ...styles.navLink, color: '#00d1ff' }}>{lang.nav.pricing}</a>
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
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.about}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }} style={{ ...styles.mobileNavLink, color: '#00d1ff' }}>{lang.nav.pricing}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('contact'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.contact}</a>
          <button onClick={() => { onNavigate && onNavigate('login'); setMobileMenuOpen(false); }} style={styles.mobileSignInButton}>{lang.signIn}</button>
        </div>
      )}

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.tag}>
            <span style={styles.tagDot}></span>
            <span style={styles.tagText}>Pricing</span>
          </div>
          <h1 style={{ ...styles.title, fontSize: isSmall ? '30px' : isMobile ? '36px' : '56px' }}>{lang.title}</h1>
          <p style={{ ...styles.subtitle, fontSize: isSmall ? '14px' : isMobile ? '15px' : '18px' }}>{lang.subtitle}</p>
        </div>
      </div>

      {/* Pricing Table */}
      <div style={styles.tableContainer}>
        <div style={{ ...styles.tableWrapper, overflowX: isMobile ? 'auto' : 'visible' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>{lang.plan}</th>
                <th style={styles.th}>{lang.price}</th>
                <th style={styles.th}>{lang.employees}</th>
                <th style={styles.th}>{lang.branches}</th>
                <th style={styles.th}>{lang.emails}</th>
                <th style={styles.th}>{lang.admins}</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {planPrices.map((plan) => (
                <tr key={plan.id} style={{ ...styles.tableRow, ...(plan.popular ? styles.popularRow : {}) }}>
                  <td style={styles.td}>
                    <strong>{plan.name}</strong>
                    {plan.popular && <span style={styles.popularBadge}>{lang.mostPopular}</span>}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.priceValue}>{plan.price.toLocaleString()} SEK</span>
                    <span style={styles.pricePeriod}>{lang.perMonth}</span>
                  </td>
                  <td style={styles.td}>Up to {plan.maxEmployees.toLocaleString()}</td>
                  <td style={styles.td}>Up to {plan.maxBranches}</td>
                  <td style={styles.td}>Up to {plan.maxEmails.toLocaleString()}</td>
                  <td style={styles.td}>Up to {plan.maxAdmins}</td>
                  <td style={styles.td}>
                    <button onClick={handleGetStarted} style={styles.tableButton}>
                      {lang.getStarted}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Plan Section */}
      <div style={styles.customPlanSection}>
        <div style={styles.customPlanCard}>
          <div style={styles.customPlanIcon}>
            <i className="fas fa-gem"></i>
          </div>
          <h2 style={styles.customPlanTitle}>Need a Custom Plan?</h2>
          <p style={styles.customPlanDesc}>Contact our sales team for a tailored solution that fits your specific needs.</p>
          <button onClick={() => onNavigate && onNavigate('contact')} style={styles.customPlanButton}>
            {lang.contactSales}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ ...styles.footer, padding: isSmall ? '20px 16px' : '30px 40px' }}>
        <div style={styles.footerContent}>
          <p>&copy; 2026 TaskBridge. {lang.footer} <strong style={styles.glorifyHighlight}>GlorifyTC</strong></p>
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
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 },
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
  navLinks: { display: 'flex', gap: '32px' },
  navLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'color 0.3s ease',
    cursor: 'pointer',
  },
  navActions: { display: 'flex', gap: '12px', alignItems: 'center' },
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
  mobileControls: { display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 },
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
    padding: '60px 40px 40px',
    textAlign: 'center',
  },
  heroContent: { maxWidth: '800px', margin: '0 auto' },
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
  tagDot: { width: '8px', height: '8px', background: '#00d1ff', borderRadius: '50%', animation: 'pulse 2s infinite' },
  tagText: { fontSize: '14px', color: '#00d1ff', fontWeight: '500' },
  title: { fontWeight: '700', lineHeight: '1.2', marginBottom: '24px', color: 'white' },
  subtitle: { lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.7)' },
  tableContainer: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px 40px 40px',
  },
  tableWrapper: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px',
  },
  tableHeader: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 209, 255, 0.05)',
  },
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    color: '#00d1ff',
    fontSize: '14px',
    fontWeight: '600',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background 0.3s ease',
  },
  popularRow: {
    background: 'rgba(0, 209, 255, 0.05)',
    borderLeft: '3px solid #00d1ff',
  },
  td: {
    padding: '16px 20px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px',
  },
  priceValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#00d1ff',
  },
  pricePeriod: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: '4px',
  },
  popularBadge: {
    display: 'inline-block',
    background: '#00d1ff',
    color: '#0f172a',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '50px',
    marginLeft: '10px',
    verticalAlign: 'middle',
  },
  tableButton: {
    padding: '8px 20px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    whiteSpace: 'nowrap',
  },
  customPlanSection: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 40px 60px',
  },
  customPlanCard: {
    background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.1), rgba(138, 43, 226, 0.1))',
    borderRadius: '32px',
    padding: '48px',
    textAlign: 'center',
    border: '1px solid rgba(0, 209, 255, 0.3)',
  },
  customPlanIcon: {
    fontSize: '48px',
    color: '#00d1ff',
    marginBottom: '16px',
  },
  customPlanTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '16px',
  },
  customPlanDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '24px',
    lineHeight: '1.6',
  },
  customPlanButton: {
    padding: '14px 32px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid #00d1ff',
    borderRadius: '50px',
    color: '#00d1ff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
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
  glorifyHighlight: { color: '#00d1ff', fontWeight: '600' },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(50px, -50px); } }
  @keyframes float2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-40px, 40px); } }
  @keyframes pulse { 0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); } }
  @keyframes softGlow { 0%, 100% { box-shadow: 0 0 20px rgba(0, 209, 255, 0.3); } 50% { box-shadow: 0 0 40px rgba(0, 209, 255, 0.5); } }
  
  .navLink:hover { color: #00d1ff !important; }
  .mobileNavLink:hover { color: #00d1ff !important; }
  .tableRow:hover { background: rgba(255, 255, 255, 0.03); }
  .tableButton:hover { transform: translateY(-2px); }
  .customPlanButton:hover { background: rgba(0, 209, 255, 0.2); transform: translateY(-2px); }

  @media (max-width: 768px) {
    nav { padding: 16px 20px !important; }
    .tb-logo-icon { width: 34px !important; height: 34px !important; font-size: 19px !important; }
    .tb-logo-text { font-size: 20px !important; }
    .th, .td { padding: 12px 16px !important; }
  }
  @media (max-width: 480px) {
    nav { padding: 12px 14px !important; }
    .tb-logo-icon { width: 30px !important; height: 30px !important; font-size: 16px !important; border-radius: 8px !important; }
    .tb-logo-text { font-size: 17px !important; }
    .th, .td { padding: 10px 12px !important; font-size: 12px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default Pricing;