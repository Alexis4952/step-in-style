import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './App.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Login με Supabase Auth
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (loginError) {
      setError('Λάθος email ή κωδικός.');
      setLoading(false);
      return;
    }
    // Έλεγχος αν είναι admin
    const user = data.user;
    if (!user) {
      setError('Σφάλμα ταυτοποίησης.');
      setLoading(false);
      return;
    }
    // Query στον πίνακα admins
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setLoading(false);
    if (adminError || !adminData) {
      setError('Δεν έχετε δικαίωμα πρόσβασης στο admin panel.');
      return;
    }
    // Επιτυχής σύνδεση admin
    localStorage.setItem('admin_session', JSON.stringify({
      id: adminData.id,
      email: adminData.email,
      role: adminData.role
    }));
    navigate('/admin/dashboard');
  };

  return (
    <div className="admin-login-bg" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(120deg,#fff6ec 60%,#f6c77a 100%)'}}>
      <form className="admin-login-card" onSubmit={handleSubmit} style={{background:'#fff',borderRadius:32,padding:'48px 36px',boxShadow:'0 8px 48px #b87b2a22',display:'flex',flexDirection:'column',gap:22,minWidth:340}}>
        <div style={{fontWeight:900,fontSize:'2rem',color:'#b87b2a',marginBottom:8,textAlign:'center'}}>Admin Login</div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="premium-input"
          style={{padding:14,borderRadius:12,border:'1.5px solid #f6c77a',fontSize:18,fontFamily:'Montserrat',marginBottom:4}}
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="premium-input"
          style={{padding:14,borderRadius:12,border:'1.5px solid #f6c77a',fontSize:18,fontFamily:'Montserrat'}}
        />
        {error && <div style={{color:'#b82a2a',fontWeight:700,textAlign:'center'}}>{error}</div>}
        <button type="submit" className="premium-product-btn" style={{marginTop:8,fontSize:20,borderRadius:16}} disabled={loading}>{loading ? 'Σύνδεση...' : 'Σύνδεση'}</button>
      </form>
    </div>
  );
} 