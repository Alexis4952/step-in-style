import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './App.css';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;

  useEffect(() => {
    // If no order data, redirect to home
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const { orderId, orderNumber, email, isGuest } = orderData;

  return (
    <div className="order-success-container">
      <div className="order-success-content">
        {/* Success Icon */}
        <div className="success-icon">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="success-message">
          <h1>🎉 Συγχαρητήρια!</h1>
          <h2>Η παραγγελία σας ολοκληρώθηκε επιτυχώς!</h2>
        </div>

        {/* Order Details */}
        <div className="order-details">
          <div className="order-info-card">
            <h3>Στοιχεία Παραγγελίας</h3>
            <div className="order-info-grid">
              <div className="order-info-item">
                <span className="label">Αριθμός Παραγγελίας:</span>
                <span className="value order-number">#{orderNumber}</span>
              </div>
              <div className="order-info-item">
                <span className="label">Email Επιβεβαίωσης:</span>
                <span className="value">{email}</span>
              </div>
              <div className="order-info-item">
                <span className="label">Κατάσταση:</span>
                <span className="value status-pending">Εκκρεμεί</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="next-steps-card">
            <h3>Τι ακολουθεί;</h3>
            <div className="steps-list">
              <div className="step-item">
                <span className="step-icon">📧</span>
                <div className="step-content">
                  <h4>Email Επιβεβαίωσης</h4>
                  <p>Θα λάβετε email επιβεβαίωσης στο {email}</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-icon">📞</span>
                <div className="step-content">
                  <h4>Επικοινωνία</h4>
                  <p>Θα επικοινωνήσουμε μαζί σας για τις λεπτομέρειες παράδοσης</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-icon">🚚</span>
                <div className="step-content">
                  <h4>Παράδοση</h4>
                  <p>Η παραγγελία σας θα παραδοθεί στη διεύθυνση που καθορίσατε</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          {isGuest && (
            <div className="account-info-card">
              <h3>💡 Συμβουλή</h3>
              <p>
                Δημιουργήστε λογαριασμό για να παρακολουθείτε εύκολα τις παραγγελίες σας 
                και να έχετε γρηγορότερες μελλοντικές αγορές!
              </p>
              <Link to="/register" className="btn-secondary">
                Δημιουργία Λογαριασμού
              </Link>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="success-actions">
          <Link to="/products" className="btn-primary">
            Συνέχεια Αγορών
          </Link>
          
          {!isGuest && (
            <Link to="/account" className="btn-secondary">
              Οι Παραγγελίες Μου
            </Link>
          )}
          
          <Link to="/track-order" className="btn-outline">
            Παρακολούθηση Παραγγελίας
          </Link>
          
          <Link to="/contact" className="btn-outline">
            Επικοινωνία
          </Link>
        </div>

        {/* Order Tracking Info */}
        <div className="tracking-info">
          <div className="tracking-card">
            <h4>📋 Παρακολούθηση Παραγγελίας</h4>
            <p>
              Κρατήστε τον αριθμό παραγγελίας <strong>#{orderNumber}</strong> για 
              παρακολούθηση της κατάστασης
            </p>
            {isGuest && (
              <p className="tracking-note">
                💡 Μπορείτε να παρακολουθήσετε την παραγγελία σας με το email και 
                τον αριθμό παραγγελίας
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
