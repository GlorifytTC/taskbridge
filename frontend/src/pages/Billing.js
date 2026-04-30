import React, { useState, useEffect } from 'react';

const Billing = ({ user, onNavigate }) => {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  const plans = {
    basic: { price: 399, name: 'Basic', employees: 25, branches: 3, emails: 200, admins: 2 },
    standard: { price: 799, name: 'Standard', employees: 50, branches: 5, emails: 400, admins: 3 },
    pro: { price: 1299, name: 'Pro', employees: 100, branches: 8, emails: 700, admins: 5 },
    business: { price: 2499, name: 'Business', employees: 250, branches: 15, emails: 2000, admins: 10 },
    enterprise: { price: 4999, name: 'Enterprise', employees: 500, branches: 30, emails: 5000, admins: 20 },
    corporate: { price: 9999, name: 'Corporate', employees: 1000, branches: 60, emails: 12000, admins: 50 }
  };

  useEffect(() => {
    fetchSubscription();
    fetchInvoices();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/subscriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setSubscription(data.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/subscriptions/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setInvoices(data.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handlePlanChange = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://taskbridge-production-9d91.up.railway.app/api/subscriptions/plan', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedPlan,
          duration: selectedDuration
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Plan changed successfully! A confirmation email has been sent.');
        fetchSubscription();
        setShowPaymentModal(false);
      } else {
        alert(data.message || 'Failed to change plan');
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      alert('Error changing plan');
    }
  };

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    const price = plans[selectedPlan]?.price || 0;
    let total = price * selectedDuration;
    // Apply discounts
    if (selectedDuration >= 3) total = total * 0.95;
    if (selectedDuration >= 6) total = total * 0.9;
    if (selectedDuration >= 12) total = total * 0.85;
    return Math.round(total);
  };

  const calculateVAT = () => {
    return Math.round(calculateTotal() * 0.25);
  };

  if (loading) {
    return <div style={styles.loadingContainer}><div style={styles.loadingSpinner}></div></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => onNavigate('superadmin')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
        <h1 style={styles.title}>Billing & Subscription</h1>
      </div>

      {/* Current Subscription */}
      <div style={styles.currentCard}>
        <h2 style={styles.cardTitle}>Current Plan</h2>
        <div style={styles.planInfo}>
          <span style={styles.planName}>{subscription?.plan?.toUpperCase() || 'TRIAL'}</span>
          <span style={styles.planPrice}>
            {subscription?.price?.monthlyPrice || 0} SEK/month
          </span>
        </div>
        <div style={styles.planDetails}>
          <p>📅 Days remaining: {subscription?.daysRemaining || 0}</p>
          <p>👥 Employees: {subscription?.features?.maxEmployees || 0}</p>
          <p>🏢 Branches: {subscription?.features?.maxBranches || 0}</p>
          <p>📧 Emails/month: {subscription?.features?.maxEmailsPerMonth || 0}</p>
        </div>
        {subscription?.autoRenew && (
          <p style={styles.renewInfo}>✅ Auto-renewal enabled</p>
        )}
      </div>

      {/* Available Plans */}
      <h2 style={styles.sectionTitle}>Available Plans</h2>
      <div style={styles.plansGrid}>
        {Object.entries(plans).map(([key, plan]) => (
          <div key={key} style={styles.planCard}>
            <h3 style={styles.planCardTitle}>{plan.name}</h3>
            <div style={styles.planCardPrice}>{plan.price} SEK<span>/month</span></div>
            <ul style={styles.planCardFeatures}>
              <li>✓ Up to {plan.employees} employees</li>
              <li>✓ Up to {plan.branches} branches</li>
              <li>✓ {plan.emails} emails/month</li>
              <li>✓ Up to {plan.admins} admins</li>
            </ul>
            <button 
              onClick={() => {
                setSelectedPlan(key);
                setShowPaymentModal(true);
              }}
              style={styles.upgradeButton}
            >
              {subscription?.plan === key ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <div style={styles.invoicesSection}>
          <h2 style={styles.sectionTitle}>Invoice History</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>VAT</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td>{inv.invoiceNumber}</td>
                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td>{inv.amount} SEK</td>
                    <td>{inv.vat?.amount || 0} SEK</td>
                    <td>{inv.totalAmount} SEK</td>
                    <td><span style={styles.paidBadge}>Paid</span></td>
                    <td>
                      <button style={styles.downloadButton}>📄 PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Confirm Plan Change</h2>
            <div style={styles.paymentSummary}>
              <p><strong>Plan:</strong> {plans[selectedPlan]?.name}</p>
              <p><strong>Duration:</strong> {selectedDuration} month(s)</p>
              <p><strong>Subtotal:</strong> {calculateTotal()} SEK</p>
              <p><strong>VAT (25%):</strong> {calculateVAT()} SEK</p>
              <p><strong>Total:</strong> {calculateTotal() + calculateVAT()} SEK</p>
            </div>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowPaymentModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handlePlanChange} style={styles.confirmButton}>Confirm Change</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
  backButton: { padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  title: { fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' },
  loadingSpinner: { width: '40px', height: '40px', border: '3px solid rgba(0,209,255,0.3)', borderRadius: '50%', borderTopColor: '#00d1ff', animation: 'spin 1s linear infinite' },
  currentCard: { background: 'rgba(0,209,255,0.1)', borderRadius: '16px', padding: '24px', marginBottom: '32px', border: '1px solid rgba(0,209,255,0.2)' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#00d1ff', marginBottom: '16px' },
  planInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' },
  planName: { fontSize: '24px', fontWeight: 'bold', color: 'white' },
  planPrice: { fontSize: '20px', fontWeight: 'bold', color: '#10b981' },
  planDetails: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' },
  planDetails: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' },
  renewInfo: { fontSize: '12px', color: '#10b981', marginTop: '8px' },
  sectionTitle: { fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '20px' },
  plansGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' },
  planCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' },
  planCardTitle: { fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' },
  planCardPrice: { fontSize: '28px', fontWeight: 'bold', color: '#00d1ff', marginBottom: '16px' },
  planCardPrice: { fontSize: '28px', fontWeight: 'bold', color: '#00d1ff', marginBottom: '16px' },
  planCardPrice: { fontSize: '28px', fontWeight: 'bold', color: '#00d1ff', marginBottom: '16px' },
  planCardFeatures: { listStyle: 'none', padding: 0, marginBottom: '20px' },
  planCardFeatures: { listStyle: 'none', padding: 0, marginBottom: '20px' },
  upgradeButton: { width: '100%', padding: '10px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: '500' },
  invoicesSection: { marginTop: '20px' },
  tableContainer: { overflowX: 'auto', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  paidBadge: { background: '#10b981', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', color: 'white' },
  downloadButton: { background: '#3b82f6', border: 'none', borderRadius: '6px', padding: '6px 10px', color: 'white', cursor: 'pointer', fontSize: '11px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '24px', maxWidth: '450px', width: '90%' },
  modalTitle: { fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '20px' },
  paymentSummary: { background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', marginBottom: '20px' },
  modalButtons: { display: 'flex', gap: '12px' },
  cancelButton: { flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  confirmButton: { flex: 1, padding: '12px', background: 'linear-gradient(135deg, #00f5ff, #00d1ff)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }
};

export default Billing;