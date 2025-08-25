import React from 'react';
import { Navigate, Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const adminSession = JSON.parse(localStorage.getItem('admin_session'));

  // Αν δεν υπάρχει admin session και δεν είμαστε ήδη στο login, redirect στο login
  if (!adminSession && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  // Αν είμαστε στο login, εμφάνισε μόνο το Outlet (δηλαδή τη φόρμα σύνδεσης)
  if (location.pathname === '/admin/login') {
    return <Outlet />;
  }

  // Sidebar links
  const links = [
    { to: '/admin/dashboard', label: 'Πίνακας Ελέγχου' },
    { to: '/admin/orders', label: 'Παραγγελίες' },
    { to: '/admin/products', label: 'Προϊόντα' },
    { to: '/admin/users', label: 'Χρήστες' },
    { to: '/admin/messages', label: 'Μηνύματα Επικοινωνίας' },
  ];

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'#fff6ec'}}>
      <nav style={{width:240,background:'#b87b2a',color:'#fff',display:'flex',flexDirection:'column',alignItems:'stretch',padding:'32px 0',boxShadow:'2px 0 24px #b87b2a22'}}>
        <div style={{fontWeight:900,fontSize:'1.7rem',marginBottom:40,textAlign:'center',letterSpacing:1}}>Admin Panel</div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                padding: '14px 32px',
                color: isActive ? '#b87b2a' : '#fff',
                background: isActive ? '#fff6ec' : 'none',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 18,
                margin: '0 12px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 2px 12px #b87b2a11' : 'none',
              })}
              end
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('admin_session');
            navigate('/admin/login');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 18,
            marginTop: 'auto',
            cursor: 'pointer',
            padding: '18px 32px',
            fontWeight: 700,
            textAlign: 'left',
          }}
        >
          Αποσύνδεση
        </button>
      </nav>
      <main style={{flex:1,padding:48,minHeight:'100vh',background:'#fff'}}>
        <Outlet />
      </main>
    </div>
  );
} 