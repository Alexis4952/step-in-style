import React, { useState } from 'react';
import './AccountDashboard.css';
import { FaEnvelope, FaPhone, FaFacebook, FaInstagram, FaCheckCircle, FaLifeRing, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Navbar } from './App';

export default function AccountSupport() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.email || !form.message) {
      setError('Συμπλήρωσε όλα τα πεδία.');
      return;
    }
    setLoading(true);
    
    try {
      // Send to backend API
      const response = await fetch('https://step-in-style-backend.onrender.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || '',
          subject: 'Υποστήριξη - ' + (form.subject || 'Γενική ερώτηση'),
          message: form.message
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Το μήνυμά σου στάλθηκε! Θα επικοινωνήσουμε σύντομα.');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setError('Σφάλμα: ' + data.error);
      }
    } catch (error) {
      console.error('Σφάλμα κατά την αποστολή:', error);
      setError('Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="support-hero-bg">
      <Navbar hideLogo={false} />
      <div className="support-hero-container">
        <div className="support-hero-title-row">
          <FaComments className="support-hero-icon" />
          <h1 className="support-hero-title">Χρειάζεσαι βοήθεια;<br />Είμαστε εδώ για σένα!</h1>
        </div>
        <div className="support-hero-content">
          <section className="support-hero-info">
            <h2>Στοιχεία Επικοινωνίας</h2>
            <div className="support-hero-contact-list">
              <div className="support-hero-contact-item"><FaEnvelope /> support@stepinstyle.gr</div>
              <div className="support-hero-contact-item"><FaPhone /> +30 210 1234567</div>
              <div className="support-hero-contact-item">
                <a href="https://www.facebook.com/share/15ytp57rRz/" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <FaFacebook /> facebook.com/stepinstyle
                </a>
              </div>
              <div className="support-hero-contact-item">
                <a href="https://www.instagram.com/stepinstyle24?igsh=aGxrdHhwaHp2dW44" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <FaInstagram /> @stepinstyle24
                </a>
              </div>
            </div>
          </section>
          <section className="support-hero-form">
            <div className="support-hero-form-card">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FaComments style={{ color: '#b87b2a', fontSize: '1.5em' }} /> Επικοινωνία με Υποστήριξη</h2>
              <form className="support-hero-form-fields" onSubmit={handleSubmit} autoComplete="off">
                <label>Όνομα</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Το όνομά σου" />
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Το email σου" />
                <label>Μήνυμα</label>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="Γράψε το μήνυμά σου..." rows={4} style={{ resize: 'vertical', minHeight: 80 }} />
                <button type="submit" disabled={loading} className="support-hero-btn">Αποστολή</button>
                {success && <div className="dashboard-success" style={{ marginTop: 16 }}><FaCheckCircle style={{ color: '#4caf50', marginRight: 6 }} />{success}</div>}
                {error && <div className="dashboard-error" style={{ marginTop: 16 }}>{error}</div>}
              </form>
            </div>
          </section>
        </div>
        <button className="quick-action-btn" style={{ margin: '48px auto 0 auto', display: 'block' }} onClick={() => navigate(-1)}>
          Πίσω στο Dashboard
        </button>
      </div>
    </div>
  );
} 