import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderNumber.trim() || !email.trim()) {
      setError('Παρακαλώ συμπληρώστε όλα τα πεδία');
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await fetch(`http://localhost:5000/api/orders/track/${orderNumber}?email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Η παραγγελία δεν βρέθηκε');
        return;
      }

      setOrderData(result.order);
    } catch (error) {
      console.error('Error tracking order:', error);
      setError('Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': { text: 'Εκκρεμεί', color: '#ffc107', bgColor: 'rgba(255, 193, 7, 0.1)' },
      'confirmed': { text: 'Επιβεβαιωμένη', color: '#17a2b8', bgColor: 'rgba(23, 162, 184, 0.1)' },
      'processing': { text: 'Σε εξέλιξη', color: '#6f42c1', bgColor: 'rgba(111, 66, 193, 0.1)' },
      'completed': { text: 'Προς αποστολή', color: '#4caf50', bgColor: 'rgba(76, 175, 80, 0.1)' },
      'shipped': { text: 'Αποστολή', color: '#fd7e14', bgColor: 'rgba(253, 126, 20, 0.1)' },
      'delivered': { text: 'Παραδόθηκε', color: '#28a745', bgColor: 'rgba(40, 167, 69, 0.1)' },
      'cancelled': { text: 'Ακυρώθηκε', color: '#dc3545', bgColor: 'rgba(220, 53, 69, 0.1)' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-tracking-container">
      <div className="order-tracking-content">
        <div className="tracking-header">
          <h1>Παρακολούθηση Παραγγελίας</h1>
          <p>Εισάγετε τον αριθμό παραγγελίας και το email σας για να δείτε την κατάσταση</p>
        </div>

        {!orderData ? (
          <div className="tracking-form-container">
            <form onSubmit={handleSubmit} className="tracking-form">
              <h3>Στοιχεία Παραγγελίας</h3>
              
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Αριθμός Παραγγελίας</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="π.χ. ORD-123456789"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Αρχική
                </button>
                
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Αναζήτηση...' : 'Παρακολούθηση'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="order-details-container">
            <div className="order-header-info">
              <h3>Παραγγελία #{orderData.order_number}</h3>
              <div 
                className="order-status-badge"
                style={{
                  color: getStatusDisplay(orderData.status).color,
                  backgroundColor: getStatusDisplay(orderData.status).bgColor
                }}
              >
                {getStatusDisplay(orderData.status).text}
              </div>
            </div>

            <div className="order-info-grid">
              <div className="order-info-card">
                <h4>Στοιχεία Παραγγελίας</h4>
                <div className="order-info-item">
                  <span className="label">Ημερομηνία:</span>
                  <span className="value">{formatDate(orderData.created_at)}</span>
                </div>
                <div className="order-info-item">
                  <span className="label">Σύνολο:</span>
                  <span className="value">{orderData.total.toFixed(2)}€</span>
                </div>
                <div className="order-info-item">
                  <span className="label">Κατάσταση:</span>
                  <span 
                    className="value"
                    style={{ color: getStatusDisplay(orderData.status).color }}
                  >
                    {getStatusDisplay(orderData.status).text}
                  </span>
                </div>
              </div>

              <div className="order-items-card">
                <h4>Προϊόντα ({orderData.items.length})</h4>
                <div className="order-items-list">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <div className="item-info">
                        <span className="item-name">{item.product_name}</span>
                        <span className="item-qty">x{item.quantity}</span>
                      </div>
                      <span className="item-price">{(item.price * item.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
                <div className="order-total-row">
                  <strong>Σύνολο: {orderData.total.toFixed(2)}€</strong>
                </div>
              </div>
            </div>

            <div className="tracking-actions">
              <button
                onClick={() => {
                  setOrderData(null);
                  setOrderNumber('');
                  setEmail('');
                  setError('');
                }}
                className="btn-secondary"
              >
                Αναζήτηση Άλλης Παραγγελίας
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Συνέχεια Αγορών
              </button>
            </div>

            <div className="contact-info">
              <p>
                💡 Για περισσότερες πληροφορίες επικοινωνήστε μαζί μας στο{' '}
                <strong>6986749305</strong> ή στο{' '}
                <strong>info@stepinstyle.gr</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
