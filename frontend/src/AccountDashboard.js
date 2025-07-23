import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './AccountDashboard.css';
import { FaUserCircle, FaSignOutAlt, FaBoxOpen, FaCog, FaShoppingBag, FaTag, FaEdit, FaHeadset, FaCalendarAlt, FaTimes, FaComments } from 'react-icons/fa';
import logoMain from './logo.svg';
import { useNavigate } from 'react-router-dom';

const mockOrders = [
  { id: 'ORD-2024-001', date: '2024-06-01', total: 129.99 },
  { id: 'ORD-2024-002', date: '2024-06-10', total: 89.50 },
  { id: 'ORD-2024-003', date: '2024-06-15', total: 49.00 },
  { id: 'ORD-2024-004', date: '2024-06-18', total: 210.00 },
  { id: 'ORD-2024-005', date: '2024-06-20', total: 75.99 },
  { id: 'ORD-2024-006', date: '2024-06-22', total: 59.99 },
];

const mockActivity = [
  { type: 'order', date: '2024-06-22', desc: 'Ολοκλήρωση παραγγελίας #ORD-2024-006' },
  { type: 'profile', date: '2024-06-20', desc: 'Αλλαγή email' },
  { type: 'order', date: '2024-06-20', desc: 'Ολοκλήρωση παραγγελίας #ORD-2024-005' },
  { type: 'profile', date: '2024-06-18', desc: 'Αλλαγή τηλεφώνου' },
];

const QuickAction = ({ icon, label, onClick }) => (
  <button className="quick-action-btn" onClick={onClick}>
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ icon, label, value }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
);

const ActivityItem = ({ type, date, desc }) => (
  <div className={`activity-item activity-${type}`}>
    <div className="activity-dot" />
    <div className="activity-content">
      <div className="activity-desc">{desc}</div>
      <div className="activity-date">{date}</div>
        </div>
      </div>
    );

const OrdersModal = ({ open, onClose, orders }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content orders-modal">
        <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
            <h2>Οι Παραγγελίες μου</h2>
        {orders.length === 0 ? (
          <div className="no-orders">Δεν υπάρχουν παραγγελίες.</div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div className="order-card" key={order.id}>
                <div className="order-id">#{order.id}</div>
                <div className="order-date">{order.date}</div>
                <div className="order-total">Σύνολο: <b>{order.total.toFixed(2)}€</b></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsModal = ({ open, onClose, user, updateEmail, updatePassword, updateProfile, deleteAccount }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!open) return null;

  const handleEmail = async (e) => {
    e.preventDefault(); setSuccess(''); setError(''); setLoading(true);
    if (!email) { setError('Συμπλήρωσε νέο email.'); setLoading(false); return; }
    const { error } = await updateEmail(email);
    if (error) setError(error.message);
    else setSuccess('Το email άλλαξε!');
    setLoading(false);
  };
  const handlePassword = async (e) => {
    e.preventDefault(); setSuccess(''); setError(''); setLoading(true);
    if (password.length < 6) { setError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.'); setLoading(false); return; }
    if (password !== confirmPassword) { setError('Οι κωδικοί δεν ταιριάζουν.'); setLoading(false); return; }
    const { error } = await updatePassword(password);
    if (error) setError(error.message);
    else setSuccess('Ο κωδικός άλλαξε!');
    setLoading(false);
  };
  const handlePhone = async (e) => {
    e.preventDefault(); setSuccess(''); setError(''); setLoading(true);
    if (!phone) { setError('Συμπλήρωσε νέο τηλέφωνο.'); setLoading(false); return; }
    if (!/^\d{10}$/.test(phone)) { setError('Το τηλέφωνο πρέπει να έχει ακριβώς 10 ψηφία.'); setLoading(false); return; }
    const { error } = await updateProfile({ phone });
    if (error) setError(error.message);
    else setSuccess('Το τηλέφωνο άλλαξε!');
    setLoading(false);
  };
  const handleDelete = async () => {
    if (!window.confirm('Είσαι σίγουρος; Η διαγραφή είναι μη αναστρέψιμη!')) return;
    setSuccess(''); setError(''); setLoading(true);
    const { error } = await deleteAccount();
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content settings-modal">
        <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        <h2>Ρυθμίσεις Λογαριασμού</h2>
        <form className="settings-form" onSubmit={handleEmail} autoComplete="off">
          <label>Αλλαγή Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Νέο email" />
          <button type="submit" disabled={loading}>Αποθήκευση</button>
        </form>
        <form className="settings-form" onSubmit={handlePassword} autoComplete="off">
          <label>Αλλαγή Κωδικού</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Νέος κωδικός" />
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Επιβεβαίωση νέου κωδικού" />
          <button type="submit" disabled={loading}>Αποθήκευση</button>
        </form>
        <form className="settings-form" onSubmit={handlePhone} autoComplete="off">
          <label>Αλλαγή Τηλεφώνου</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Νέο τηλέφωνο" />
          <button type="submit" disabled={loading}>Αποθήκευση</button>
        </form>
        <div className="settings-danger">
          <button className="danger-btn" onClick={handleDelete} disabled={loading}>Διαγραφή Λογαριασμού</button>
        </div>
        {success && <div className="dashboard-success">{success}</div>}
        {error && <div className="dashboard-error">{error}</div>}
      </div>
    </div>
  );
};

const AccountDashboard = () => {
  const { user, logout, updateEmail, updatePassword, updateProfile, deleteAccount, loading } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Stats
  const totalOrders = mockOrders.length;
  const totalSpent = mockOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2);
  const lastOrder = mockOrders[mockOrders.length - 1];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="dashboard-v2-bg">
      <div className="dashboard-v2-container">
        {/* HERO SECTION */}
        <section className="dashboard-hero">
          <div className="hero-avatar">
            <FaUserCircle size={72} />
          </div>
          <div className="hero-info">
            <div className="hero-greeting">Καλωσήρθες{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!</div>
            <div className="hero-email">{user?.email}</div>
            <div className="hero-status">Premium Member</div>
          </div>
          <button className="hero-edit-btn" onClick={() => setShowEdit(true)} title="Επεξεργασία προφίλ"><FaEdit /></button>
        </section>

        {/* QUICK ACTIONS */}
        <section className="dashboard-quick-actions">
          <QuickAction icon={<FaBoxOpen />} label="Οι παραγγελίες μου" onClick={() => setShowOrders(true)} />
          <QuickAction icon={<FaCog />} label="Ρυθμίσεις" onClick={() => setShowSettings(true)} />
          <button className="quick-action-btn" onClick={() => navigate('/account/support')}>
            <FaComments className="quick-action-icon" /> Υποστήριξη
          </button>
          <QuickAction icon={<FaSignOutAlt />} label="Αποσύνδεση" onClick={handleLogout} />
        </section>

        {/* STATS CARDS */}
        <section className="dashboard-stats-row">
          <StatCard icon={<FaShoppingBag />} label="Παραγγελίες" value={totalOrders} />
          <StatCard icon={<FaTag />} label="Σύνολο Αγορών" value={`${totalSpent}€`} />
          <StatCard icon={<FaCalendarAlt />} label="Τελευταία Αγορά" value={lastOrder ? `${lastOrder.date} / ${lastOrder.total.toFixed(2)}€` : '-'} />
        </section>

        {/* ACTIVITY FEED */}
        <section className="dashboard-activity-feed">
          <h4>Πρόσφατη Δραστηριότητα</h4>
          <div className="activity-timeline">
            {mockActivity.map((a, i) => <ActivityItem key={i} {...a} />)}
          </div>
        </section>
        <OrdersModal open={showOrders} onClose={() => setShowOrders(false)} orders={mockOrders} />
        <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} user={user} updateEmail={updateEmail} updatePassword={updatePassword} updateProfile={updateProfile} deleteAccount={deleteAccount} />
      </div>
    </div>
  );
};

export default AccountDashboard; 