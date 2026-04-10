import React, { useState, useEffect } from 'react';

const Contact = ({ onNavigate, onLoginClick }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus(null);

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setFormStatus(null), 5000);
    }, 1500);
  };

  const t = {
    en: {
      nav: { home: 'Home', about: 'About', pricing: 'Pricing', contact: 'Contact' },
      signIn: 'Sign In',
      title: 'Get in Touch',
      subtitle: 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
      contactInfo: 'Contact Information',
      address: 'Address',
      addressLine: 'Stockholm, Sweden',
      email: 'Email',
      phone: 'Phone',
      businessHours: 'Business Hours',
      hours: 'Monday - Friday: 9:00 AM - 6:00 PM',
      sales: 'Sales',
      support: 'Support',
      sendMessage: 'Send Message',
      yourName: 'Your Name',
      yourEmail: 'Your Email',
      subject: 'Subject',
      yourMessage: 'Your Message',
      messagePlaceholder: 'Tell us how we can help you...',
      sending: 'Sending...',
      send: 'Send Message',
      successMessage: 'Thank you! Your message has been sent. We\'ll get back to you soon.',
      errorMessage: 'Something went wrong. Please try again later.',
      followUs: 'Follow Us',
      office: 'Office',
      generalInquiries: 'General Inquiries',
      salesInquiries: 'Sales Inquiries',
      supportInquiries: 'Support Inquiries',
      footer: 'All rights reserved. Developed by'
    },
    sv: {
      nav: { home: 'Hem', about: 'Om Oss', pricing: 'Priser', contact: 'Kontakt' },
      signIn: 'Logga in',
      title: 'Kontakta Oss',
      subtitle: 'Har du frågor? Vi vill gärna höra från dig. Skicka ett meddelande så svarar vi så snart som möjligt.',
      contactInfo: 'Kontaktinformation',
      address: 'Adress',
      addressLine: 'Stockholm, Sverige',
      email: 'E-post',
      phone: 'Telefon',
      businessHours: 'Öppettider',
      hours: 'Måndag - Fredag: 09:00 - 18:00',
      sales: 'Försäljning',
      support: 'Support',
      sendMessage: 'Skicka Meddelande',
      yourName: 'Ditt Namn',
      yourEmail: 'Din E-post',
      subject: 'Ämne',
      yourMessage: 'Ditt Meddelande',
      messagePlaceholder: 'Berätta hur vi kan hjälpa dig...',
      sending: 'Skickar...',
      send: 'Skicka Meddelande',
      successMessage: 'Tack! Ditt meddelande har skickats. Vi återkommer snart.',
      errorMessage: 'Något gick fel. Vänligen försök igen senare.',
      followUs: 'Följ Oss',
      office: 'Kontor',
      generalInquiries: 'Allmänna Frågor',
      salesInquiries: 'Försäljningsfrågor',
      supportInquiries: 'Supportfrågor',
      footer: 'Alla rättigheter förbehållna. Utvecklad av'
    }
  };

  const lang = t[language];
  const isSmall = screenWidth <= 480;

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
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('pricing'); }} style={styles.navLink}>{lang.nav.pricing}</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('contact'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.contact}</a>
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
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('pricing'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.pricing}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('contact'); setMobileMenuOpen(false); }} style={styles.mobileNavLink}>{lang.nav.contact}</a>          <button onClick={() => { onNavigate && onNavigate('login'); setMobileMenuOpen(false); }} style={styles.mobileSignInButton}>{lang.signIn}</button>
        </div>
      )}

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.tag}>
            <span style={styles.tagDot}></span>
            <span style={styles.tagText}>Contact</span>
          </div>
          <h1 style={{ ...styles.title, fontSize: isSmall ? '30px' : isMobile ? '36px' : '56px' }}>{lang.title}</h1>
          <p style={{ ...styles.subtitle, fontSize: isSmall ? '14px' : isMobile ? '15px' : '18px' }}>{lang.subtitle}</p>
        </div>
      </div>

      {/* Contact Content */}
      <div style={{ ...styles.contactWrapper, flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Contact Info */}
        <div style={styles.contactInfo}>
          <h2 style={styles.infoTitle}>{lang.contactInfo}</h2>
          
          <div style={styles.infoItem}>
            <div style={styles.infoIcon}><i className="fas fa-map-marker-alt"></i></div>
            <div>
              <h4>{lang.address}</h4>
              <p>{lang.addressLine}</p>
            </div>
          </div>

          <div style={styles.infoItem}>
            <div style={styles.infoIcon}><i className="fas fa-envelope"></i></div>
            <div>
              <h4>{lang.email}</h4>
              <p><a href="mailto:info@taskbridge.com" style={styles.infoLink}>info@taskbridge.com</a></p>
              <p><a href="mailto:sales@taskbridge.com" style={styles.infoLink}>sales@taskbridge.com</a></p>
              <p><a href="mailto:support@taskbridge.com" style={styles.infoLink}>support@taskbridge.com</a></p>
            </div>
          </div>

          <div style={styles.infoItem}>
            <div style={styles.infoIcon}><i className="fas fa-phone-alt"></i></div>
            <div>
              <h4>{lang.phone}</h4>
              <p><a href="tel:+46812345678" style={styles.infoLink}>+46 (0)8 123 456 78</a></p>
            </div>
          </div>

          <div style={styles.infoItem}>
            <div style={styles.infoIcon}><i className="fas fa-clock"></i></div>
            <div>
              <h4>{lang.businessHours}</h4>
              <p>{lang.hours}</p>
            </div>
          </div>

          <div style={styles.socialLinks}>
            <h4 style={styles.socialTitle}>{lang.followUs}</h4>
            <div style={styles.socialIcons}>
              <a href="#" style={styles.socialIcon}><i className="fab fa-linkedin-in"></i></a>
              <a href="#" style={styles.socialIcon}><i className="fab fa-twitter"></i></a>
              <a href="#" style={styles.socialIcon}><i className="fab fa-facebook-f"></i></a>
              <a href="#" style={styles.socialIcon}><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div style={styles.contactForm}>
          <h2 style={styles.formTitle}>{lang.sendMessage}</h2>
          
          {formStatus === 'success' && (
            <div style={styles.successAlert}>
              <i className="fas fa-check-circle"></i> {lang.successMessage}
            </div>
          )}
          
          {formStatus === 'error' && (
            <div style={styles.errorAlert}>
              <i className="fas fa-exclamation-circle"></i> {lang.errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder={lang.yourName}
              value={formData.name}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="email"
              name="email"
              placeholder={lang.yourEmail}
              value={formData.email}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="subject"
              placeholder={lang.subject}
              value={formData.subject}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <textarea
              name="message"
              placeholder={lang.messagePlaceholder}
              value={formData.message}
              onChange={handleInputChange}
              style={styles.textarea}
              rows="5"
              required
            ></textarea>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><i className="fas fa-spinner fa-spin"></i> {lang.sending}</>
              ) : (
                <><i className="fas fa-paper-plane"></i> {lang.send}</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Map Section */}
      <div style={styles.mapSection}>
        <div style={styles.mapContainer}>
          <iframe
            title="Office Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d325515.6816597318!2d18.0685808!3d59.3293235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465f763119640bcb%3A0xa80d27d3679d7766!2sStockholm!5e0!3m2!1sen!2sse!4v1700000000000!5m2!1sen!2sse"
            width="100%"
            height="100%"
            style={styles.map}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
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
  contactWrapper: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px 40px 60px',
    display: 'flex',
    gap: '48px',
  },
  contactInfo: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  infoTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '24px',
  },
  infoItem: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  infoIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(0, 209, 255, 0.1)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00d1ff',
    fontSize: '18px',
  },
  infoLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  },
  socialLinks: {
    marginTop: '24px',
  },
  socialTitle: {
    color: 'white',
    marginBottom: '16px',
    fontSize: '16px',
  },
  socialIcons: {
    display: 'flex',
    gap: '12px',
  },
  socialIcon: {
    width: '36px',
    height: '36px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  contactForm: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '24px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #00f5ff, #00d1ff)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  successAlert: {
    padding: '12px 16px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid #10b981',
    borderRadius: '12px',
    color: '#10b981',
    marginBottom: '20px',
    fontSize: '14px',
  },
  errorAlert: {
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid #ef4444',
    borderRadius: '12px',
    color: '#ef4444',
    marginBottom: '20px',
    fontSize: '14px',
  },
  mapSection: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 40px 60px',
  },
  mapContainer: {
    width: '100%',
    height: '300px',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  map: {
    border: 0,
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
  .infoLink:hover { color: #00d1ff !important; }
  .socialIcon:hover { background: #00d1ff !important; transform: translateY(-2px); }
  .submitButton:hover { transform: translateY(-2px); }
  input:focus, textarea:focus { border-color: #00d1ff !important; outline: none; }

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

export default Contact;