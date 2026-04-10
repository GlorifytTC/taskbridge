import React, { useState, useEffect } from 'react';

const Pricing = ({ onNavigate, onLoginClick }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [showContactModal, setShowContactModal] = useState(false);

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

  const planPrices = {
    trial: { price: 0, name: 'Trial', maxEmployees: 10, maxBranches: 2, maxEmails: 50, maxAdmins: 1, popular: false },
    basic: { price: 399, name: 'Basic', maxEmployees: 25, maxBranches: 3, maxEmails: 200, maxAdmins: 2, popular: false },
    standard: { price: 799, name: 'Standard', maxEmployees: 50, maxBranches: 5, maxEmails: 400, maxAdmins: 3, popular: false },
    pro: { price: 1299, name: 'Pro', maxEmployees: 100, maxBranches: 8, maxEmails: 700, maxAdmins: 5, popular: true },
    business: { price: 2499, name: 'Business', maxEmployees: 250, maxBranches: 15, maxEmails: 2000, maxAdmins: 10, popular: false },
    enterprise: { price: 4999, name: 'Enterprise', maxEmployees: 500, maxBranches: 30, maxEmails: 5000, maxAdmins: 20, popular: false },
    corporate: { price: 9999, name: 'Corporate', maxEmployees: 1000, maxBranches: 60, maxEmails: 12000, maxAdmins: 50, popular: false },
    custom: { price: 0, name: 'Custom', maxEmployees: 'Unlimited', maxBranches: 'Unlimited', maxEmails: 'Unlimited', maxAdmins: 'Unlimited', popular: false }
  };

  const getPlanPrice = (plan, months) => {
    const price = planPrices[plan]?.price || 0;
    let total = price * months;
    if (months >= 3) total = total * 0.95;
    if (months >= 6) total = total * 0.9;
    if (months >= 12) total = total * 0.85;
    return Math.round(total);
  };

  const getMonthlyPrice = (plan, months) => {
    const total = getPlanPrice(plan, months);
    return Math.round(total / months);
  };

  const t = {
    en: {
      nav: { home: 'Home', about: 'About', pricing: 'Pricing', contact: 'Contact' },
      signIn: 'Sign In',
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the perfect plan for your organization. No hidden fees.',
      monthly: 'Monthly',
      yearly: 'Yearly',
      saveUpTo: 'Save up to 15%',
      perMonth: '/month',
      getStarted: 'Get Started',
      contactSales: 'Contact Sales',
      features: 'Features',
      employees: 'Employees',
      branches: 'Branches',
      emailsPerMonth: 'Emails/month',
      admins: 'Admins',
      support: 'Support',
      emailSupport: 'Email Support',
      prioritySupport: 'Priority Support',
      dedicatedSupport: '24/7 Dedicated Support',
      apiAccess: 'API Access',
      customReports: 'Custom Reports',
      faqTitle: 'Frequently Asked Questions',
      faq1q: 'Can I change my plan later?',
      faq1a: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
      faq2q: 'What payment methods do you accept?',
      faq2a: 'We accept all major credit cards, invoice for annual plans, and bank transfers for enterprise customers.',
      faq3q: 'Is there a setup fee?',
      faq3a: 'No, there are no setup fees or hidden costs. You only pay the monthly subscription fee.',
      faq4q: 'Can I cancel my subscription?',
      faq4a: 'Yes, you can cancel anytime. No long-term contracts required.',
      footer: 'All rights reserved. Developed by',
      mostPopular: 'MOST POPULAR',
      customPlanTitle: 'Need a Custom Plan?',
      customPlanDesc: 'Contact our sales team for a tailored solution that fits your specific needs.',
      discount: 'Save {percentage}%',
      discount3: '5',
      discount6: '10',
      discount12: '15'
    },
    sv: {
      nav: { home: 'Hem', about: 'Om Oss', pricing: 'Priser', contact: 'Kontakt' },
      signIn: 'Logga in',
      title: 'Enkla, Transparenta Priser',
      subtitle: 'Välj den perfekta planen för din organisation. Inga dolda avgifter.',
      monthly: 'Månadsvis',
      yearly: 'Årsvis',
      saveUpTo: 'Spara upp till 15%',
      perMonth: '/månad',
      getStarted: 'Kom igång',
      contactSales: 'Kontakta oss',
      features: 'Funktioner',
      employees: 'Anställda',
      branches: 'Filialer',
      emailsPerMonth: 'E-post/månad',
      admins: 'Administratörer',
      support: 'Support',
      emailSupport: 'E-post Support',
      prioritySupport: 'Prioriterad Support',
      dedicatedSupport: '24/7 Dedikerad Support',
      apiAccess: 'API-åtkomst',
      customReports: 'Anpassade Rapporter',
      faqTitle: 'Vanliga Frågor',
      faq1q: 'Kan jag ändra min plan senare?',
      faq1a: 'Ja, du kan uppgradera eller nedgradera din plan när som helst. Ändringar syns i nästa faktureringsperiod.',
      faq2q: 'Vilka betalningsmetoder accepterar ni?',
      faq2a: 'Vi accepterar alla större kreditkort, faktura för årsplaner och banköverföringar för företagskunder.',
      faq3q: 'Finns det en installationsavgift?',
      faq3a: 'Nej, det finns inga installationsavgifter eller dolda kostnader. Du betalar bara månadsavgiften.',
      faq4q: 'Kan jag avsluta min prenumeration?',
      faq4a: 'Ja, du kan avsluta när som helst. Inga långtidskontrakt krävs.',
      footer: 'Alla rättigheter förbehållna. Utvecklad av',
      mostPopular: 'MEST POPULÄR',
      customPlanTitle: 'Behöver du en Anpassad Plan?',
      customPlanDesc: 'Kontakta vårt säljteam för en skräddarsydd lösning som passar dina specifika behov.',
      discount: 'Spara {percentage}%',
      discount3: '5',
      discount6: '10',
      discount12: '15'
    }
  };

  const lang = t[language];
  const isSmall = screenWidth <= 480;

  const handleGetStarted = (planName) => {
    if (planName === 'custom') {
      setShowContactModal(true);
    } else {
      if (onLoginClick) onLoginClick();
    }
  };

  const plans = [
    { id: 'basic', ...planPrices.basic },
    { id: 'standard', ...planPrices.standard },
    { id: 'pro', ...planPrices.pro },
    { id: 'business', ...planPrices.business },
    { id: 'enterprise', ...planPrices.enterprise },
    { id: 'corporate', ...planPrices.corporate }
  ];

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
              <a href="#" onClick={(e) => { e.preventDefault(); }} style={styles.navLink}>{lang.nav.contact}</a>
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
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.contact}</a>
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

      {/* Billing Toggle */}
      <div style={styles.billingToggle}>
        <button 
          onClick={() => setSelectedDuration(1)} 
          style={{ ...styles.toggleButton, background: selectedDuration === 1 ? '#00d1ff' : 'rgba(255,255,255,0.1)' }}
        >
          {lang.monthly}
        </button>
        <button 
          onClick={() => setSelectedDuration(12)} 
          style={{ ...styles.toggleButton, background: selectedDuration === 12 ? '#00d1ff' : 'rgba(255,255,255,0.1)' }}
        >
          {lang.yearly}
          <span style={styles.saveBadge}>{lang.saveUpTo}</span>
        </button>
      </div>

      {/* Pricing Cards */}
      <div style={{ ...styles.pricingGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {plans.map((plan) => {
          const monthlyPrice = selectedDuration === 1 ? plan.price : getMonthlyPrice(plan.id, selectedDuration);
          const hasDiscount = selectedDuration === 12 && plan.price > 0;
          const discountPercent = selectedDuration === 12 ? 15 : 0;
          
          return (
            <div key={plan.id} style={{ ...styles.pricingCard, ...(plan.popular ? styles.popularCard : {}) }}>
              {plan.popular && <div style={styles.popularBadge}>{lang.mostPopular}</div>}
              <h3 style={styles.planName}>{plan.name}</h3>
              <div style={styles.price}>
                {monthlyPrice === 0 ? 'Free' : `${monthlyPrice.toLocaleString()} SEK`}
                {monthlyPrice > 0 && <span style={styles.pricePeriod}>{lang.perMonth}</span>}
              </div>
              {hasDiscount && (
                <div style={styles.discountBadge}>
                  {lang.discount.replace('{percentage}', discountPercent)}
                </div>
              )}
              <div style={styles.featuresList}>
                <div style={styles.feature}>
                  <i className="fas fa-users"></i>
                  <span>Up to {plan.maxEmployees.toLocaleString()} {lang.employees}</span>
                </div>
                <div style={styles.feature}>
                  <i className="fas fa-code-branch"></i>
                  <span>Up to {plan.maxBranches} {lang.branches}</span>
                </div>
                <div style={styles.feature}>
                  <i className="fas fa-envelope"></i>
                  <span>Up to {plan.maxEmails.toLocaleString()} {lang.emailsPerMonth}</span>
                </div>
                <div style={styles.feature}>
                  <i className="fas fa-user-shield"></i>
                  <span>Up to {plan.maxAdmins} {lang.admins}</span>
                </div>
                <div style={styles.feature}>
                  <i className="fas fa-headset"></i>
                  <span>
                    {plan.id === 'corporate' ? lang.dedicatedSupport : 
                     plan.id === 'enterprise' || plan.id === 'business' ? lang.prioritySupport : 
                     lang.emailSupport}
                  </span>
                </div>
                {(plan.id === 'enterprise' || plan.id === 'corporate') && (
                  <div style={styles.feature}>
                    <i className="fas fa-code"></i>
                    <span>{lang.apiAccess}</span>
                  </div>
                )}
                {plan.id === 'corporate' && (
                  <div style={styles.feature}>
                    <i className="fas fa-chart-pie"></i>
                    <span>{lang.customReports}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleGetStarted(plan.id)} 
                style={styles.getStartedButton}
              >
                {lang.getStarted}
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Plan Section */}
      <div style={styles.customPlanSection}>
        <div style={styles.customPlanCard}>
          <div style={styles.customPlanIcon}>
            <i className="fas fa-gem"></i>
          </div>
          <h2 style={styles.customPlanTitle}>{lang.customPlanTitle}</h2>
          <p style={styles.customPlanDesc}>{lang.customPlanDesc}</p>
          <button onClick={() => setShowContactModal(true)} style={styles.customPlanButton}>
            {lang.contactSales}
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={styles.faqSection}>
        <h2 style={styles.faqTitle}>{lang.faqTitle}</h2>
        <div style={{ ...styles.faqGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
          <div style={styles.faqItem}>
            <h4>{lang.faq1q}</h4>
            <p>{lang.faq1a}</p>
          </div>
          <div style={styles.faqItem}>
            <h4>{lang.faq2q}</h4>
            <p>{lang.faq2a}</p>
          </div>
          <div style={styles.faqItem}>
            <h4>{lang.faq3q}</h4>
            <p>{lang.faq3a}</p>
          </div>
          <div style={styles.faqItem}>
            <h4>{lang.faq4q}</h4>
            <p>{lang.faq4a}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ ...styles.footer, padding: isSmall ? '20px 16px' : '30px 40px' }}>
        <div style={styles.footerContent}>
          <p>&copy; 2026 TaskBridge. {lang.footer} <strong style={styles.glorifyHighlight}>GlorifyTC</strong></p>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div style={styles.modalOverlay} onClick={() => setShowContactModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{lang.contactSales}</h2>
            <p style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.7)' }}>
              Contact our sales team for a custom plan tailored to your needs.
            </p>
            <div style={styles.contactInfo}>
              <p><i className="fas fa-envelope"></i> sales@taskbridge.com</p>
              <p><i className="fas fa-phone"></i> +46 (0)8 123 456 78</p>
            </div>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowContactModal(false)} style={styles.cancelButton}>
                {lang.close}
              </button>
            </div>
          </div>
        </div>
      )}

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
  billingToggle: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '48px',
  },
  toggleButton: {
    padding: '12px 32px',
    border: 'none',
    borderRadius: '50px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    position: 'relative',
  },
  saveBadge: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    background: '#10b981',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '50px',
    whiteSpace: 'nowrap',
  },
  pricingGrid: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px 40px',
    display: 'grid',
    gap: '24px',
  },
  pricingCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.3s ease',
    position: 'relative',
  },
  popularCard: {
    border: '2px solid #00d1ff',
    transform: 'scale(1.02)',
  },
  popularBadge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#00d1ff',
    padding: '4px 16px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#0f172a',
    whiteSpace: 'nowrap',
  },
  planName: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '16px',
    textAlign: 'center',
  },
  price: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#00d1ff',
    textAlign: 'center',
    marginBottom: '8px',
  },
  pricePeriod: {
    fontSize: '14px',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  discountBadge: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#10b981',
    marginBottom: '16px',
  },
  featuresList: {
    margin: '24px 0',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  getStartedButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '50px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  customPlanSection: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '800px',
    margin: '60px auto',
    padding: '0 40px',
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
  },
  faqSection: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px',
  },
  faqTitle: {
    fontSize: '32px',
    fontWeight: '700',
    textAlign: 'center',
    color: 'white',
    marginBottom: '48px',
  },
  faqGrid: {
    display: 'grid',
    gap: '24px',
  },
  faqItem: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    padding: '24px',
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1e293b',
    borderRadius: '24px',
    padding: '32px',
    maxWidth: '450px',
    width: '90%',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '16px',
  },
  contactInfo: {
    marginBottom: '24px',
    padding: '16px',
    background: 'rgba(0,209,255,0.1)',
    borderRadius: '12px',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(50px, -50px); } }
  @keyframes float2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-40px, 40px); } }
  @keyframes pulse { 0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); } }
  @keyframes softGlow { 0%, 100% { box-shadow: 0 0 20px rgba(0, 209, 255, 0.3); } 50% { box-shadow: 0 0 40px rgba(0, 209, 255, 0.5); } }
  
  .pricingCard:hover { transform: translateY(-8px); }
  .getStartedButton:hover { transform: translateY(-2px); }
  .customPlanButton:hover { background: rgba(0,209,255,0.2); }
  .navLink:hover { color: #00d1ff !important; }
  .mobileNavLink:hover { color: #00d1ff !important; }

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

export default Pricing;