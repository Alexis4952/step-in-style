import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './desktop/App.css';


export default function RegisterPage() {
  const { register, signInWithGoogle, loading, error, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/account');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
    if (!termsAccepted) {
      setFormError('Πρέπει να αποδεχτείς τους όρους χρήσης.');
      return;
    }
    if (!email || !password) {
      setFormError('Συμπλήρωσε email και password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Τα password δεν ταιριάζουν.');
      return;
    }
    if (!fullName) {
      setFormError('Συμπλήρωσε το όνομά σου.');
      return;
    }
    if (!phone) {
      setFormError('Συμπλήρωσε το τηλέφωνό σου.');
      return;
    }
    const { error } = await register(email, password, { full_name: fullName, phone });
    if (!error) {
      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setPhone('');
      setTermsAccepted(false);
    }
  };

  return (
    <div className="modern-auth-container">
      <div className="modern-auth-card">
        {/* Logo/Brand Section */}
        <div className="auth-brand">
          <div className="auth-logo">
            <img src="/step in style.jpg" alt="Step In Style" />
          </div>
          <h1>Καλωσήρθες στο Step In Style</h1>
          <p>Δημιούργησε τον λογαριασμό σου</p>
        </div>

        {/* Form Section */}
        <form className="modern-auth-form" onSubmit={handleSubmit}>
          {formError && <div className="modern-auth-error">{formError}</div>}
          {error && <div className="modern-auth-error">{error}</div>}
          {success && <div className="modern-auth-success">Έγινε εγγραφή! Έλεγξε το email σου για επιβεβαίωση.</div>}
          
          <div className="form-group">
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <input 
                type="text" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                placeholder="Όνομα"
                autoComplete="name" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Email"
                autoComplete="email" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Τηλέφωνο"
                autoComplete="tel" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Κωδικός"
                autoComplete="new-password" 
                required 
                minLength={6} 
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="Επιβεβαίωση κωδικού"
                autoComplete="new-password" 
                required 
                minLength={6} 
              />
            </div>
          </div>

          <div className="form-group terms-group">
            <label className="modern-terms">
              <input 
                type="checkbox" 
                checked={termsAccepted} 
                onChange={e => setTermsAccepted(e.target.checked)} 
              />
              <span className="checkmark"></span>
              Αποδέχομαι τους <a href="#" target="_blank" rel="noopener noreferrer">όρους χρήσης</a>
            </label>
          </div>

          <button className="modern-auth-btn" type="submit" disabled={loading}>
            {loading ? 'Εγγραφή...' : 'Δημιούργησε λογαριασμό'}
          </button>

          <div className="auth-divider">
            <span>ή</span>
          </div>

          <button 
            type="button" 
            className="google-auth-btn" 
            onClick={signInWithGoogle}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Σύνδεση...' : 'Σύνδεση με Google'}
            </button>

            <div className="auth-bottom-link">
              Έχεις ήδη λογαριασμό; <Link to="/login">Σύνδεση</Link>
            </div>
          </form>
      </div>
    </div>
  );
} 