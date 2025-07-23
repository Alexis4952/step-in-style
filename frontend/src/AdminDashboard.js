import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Σύνολο Παραγγελιών', value: 128, icon: '📦', color: '#b87b2a' },
  { label: 'Σύνολο Εσόδων', value: '3.520€', icon: '💶', color: '#7a4a1a' },
  { label: 'Νέοι Πελάτες (μήνα)', value: 12, icon: '🧑‍🤝‍🧑', color: '#b87b2a' },
  { label: 'Διαθέσιμα Προϊόντα', value: 85, icon: '👟', color: '#7a4a1a' },
];

const recentOrders = [
  { id: 'ORD-2024-128', customer: 'Γιώργος Παπαδόπουλος', date: '2024-06-25', total: '89.99€', status: 'Ολοκληρώθηκε', items: [
    { name: 'Nike Air Max', qty: 1, price: '89.99€' }
  ] },
  { id: 'ORD-2024-127', customer: 'Μαρία Ιωάννου', date: '2024-06-25', total: '59.00€', status: 'Εκκρεμεί', items: [
    { name: 'Adidas Superstar', qty: 2, price: '29.50€' }
  ] },
  { id: 'ORD-2024-126', customer: 'Νίκος Κωνσταντίνου', date: '2024-06-24', total: '120.00€', status: 'Ολοκληρώθηκε', items: [
    { name: 'Puma RS-X', qty: 1, price: '120.00€' }
  ] },
  { id: 'ORD-2024-125', customer: 'Ελένη Σταμάτη', date: '2024-06-24', total: '45.50€', status: 'Ακυρώθηκε', items: [
    { name: 'Converse All Star', qty: 1, price: '45.50€' }
  ] },
  { id: 'ORD-2024-124', customer: 'Πέτρος Αντωνίου', date: '2024-06-23', total: '210.00€', status: 'Ολοκληρώθηκε', items: [
    { name: 'New Balance 574', qty: 2, price: '105.00€' }
  ] },
];

const alerts = [
  { type: 'warning', message: '3 προϊόντα έχουν χαμηλό απόθεμα!', action: 'Δες προϊόντα', onClick: 'lowStock' },
  { type: 'info', message: '1 παραγγελία σε εκκρεμότητα.', action: 'Δες παραγγελίες', onClick: 'pendingOrders' },
];

const lowStockProducts = [
  { name: 'Nike Air Max', stock: 2 },
  { name: 'Adidas Superstar', stock: 1 },
  { name: 'Puma RS-X', stock: 3 },
];

// Mock δεδομένα για bar chart εσόδων
const revenueData = [
  { month: 'Ιαν', value: 1200 },
  { month: 'Φεβ', value: 900 },
  { month: 'Μαρ', value: 1500 },
  { month: 'Απρ', value: 1800 },
  { month: 'Μαϊ', value: 2100 },
  { month: 'Ιουν', value: 1750 },
];
const maxRevenue = Math.max(...revenueData.map(d => d.value));

const barColors = [
  'linear-gradient(120deg,#f6c77a 60%,#b87b2a 100%)',
  'linear-gradient(120deg,#b87b2a 60%,#f6c77a 100%)',
  'linear-gradient(120deg,#f7e3c6 60%,#b87b2a 100%)',
  'linear-gradient(120deg,#b87b2a 60%,#f7e3c6 100%)',
  'linear-gradient(120deg,#f6c77a 60%,#7a4a1a 100%)',
  'linear-gradient(120deg,#7a4a1a 60%,#f6c77a 100%)',
];

export default function AdminDashboard() {
  const adminSession = JSON.parse(localStorage.getItem('admin_session'));
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showPendingOrders, setShowPendingOrders] = useState(false);

  // Βρες παραγγελίες σε εκκρεμότητα
  const pendingOrders = recentOrders.filter(o => o.status === 'Εκκρεμεί' || o.status === 'Σε εξέλιξη');

  return (
    <div style={{maxWidth:1200,margin:'0 auto',fontFamily:'Montserrat'}}>
      <h1 style={{color:'#b87b2a',fontWeight:900,fontSize:'2.5rem',marginBottom:16}}>Πίνακας Ελέγχου</h1>
      <div style={{fontSize:'1.1rem',color:'#7a4a1a',marginBottom:24}}>
        {adminSession ? <>Συνδεδεμένος ως <b>{adminSession.username}</b> ({adminSession.role})</> : 'Δεν βρέθηκε admin session.'}
      </div>
      {/* Stats Cards */}
      <div style={{display:'flex',gap:40,flexWrap:'wrap',marginBottom:40,justifyContent:'center',maxWidth:1200}}>
        {stats.map((s, i) => (
          <div key={i} style={{flex:'1 1 260px',background:'#fff6ec',borderRadius:28,padding:'40px 32px',boxShadow:'0 2px 24px #b87b2a11',display:'flex',flexDirection:'column',alignItems:'center',minWidth:220,maxWidth:320}}>
            <div style={{fontSize:48,marginBottom:12}}>{s.icon}</div>
            <div style={{fontWeight:900,fontSize:32,color:s.color,marginBottom:6}}>{s.value}</div>
            <div style={{fontWeight:700,fontSize:18,color:'#7a4a1a'}}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Alerts */}
      <div style={{display:'flex',gap:24,marginBottom:40,flexWrap:'wrap',justifyContent:'center',maxWidth:1200}}>
        {alerts.map((a,i) => (
          <div key={i}
            style={{background:a.type==='warning'?'#ffe6c7':'#e6f0ff',color:a.type==='warning'?'#b87b2a':'#1a4a7a',padding:'18px 32px',borderRadius:16,fontWeight:700,fontSize:18,boxShadow:'0 1px 12px #b87b2a11',cursor:a.action?'pointer':'default'}}
            onClick={()=>{
              if(a.onClick==='lowStock') setShowLowStock(true);
              if(a.onClick==='pendingOrders') setShowPendingOrders(true);
            }}
          >
            {a.message} {a.action && <span style={{textDecoration:'underline',marginLeft:10}}>{a.action}</span>}
          </div>
        ))}
      </div>
      {/* Chart: Bar Chart (improved) */}
      <div style={{background:'#fff',borderRadius:28,padding:48,boxShadow:'0 2px 24px #b87b2a11',marginBottom:48,minHeight:340,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',maxWidth:1100,marginLeft:'auto',marginRight:'auto'}}>
        <div style={{fontWeight:900,fontSize:26,color:'#b87b2a',marginBottom:12}}>Έσοδα ανά Μήνα (τελευταίοι 6 μήνες)</div>
        <div style={{color:'#7a4a1a',fontSize:18,marginBottom:24}}>Ενδεικτικά δεδομένα για παρουσίαση.</div>
        <div style={{position:'relative',width:'100%',maxWidth:800,height:260,display:'flex',alignItems:'flex-end',gap:48,margin:'0 auto 12px auto',paddingLeft:48,paddingRight:48}}>
          {/* Grid lines */}
          {[0,0.25,0.5,0.75,1].map((v,idx)=>(
            <div key={idx} style={{position:'absolute',left:0,right:0,top:`${v*200+30}px`,height:1,background:'#f6c77a',opacity:0.3}} />
          ))}
          {/* Y axis labels */}
          {[0,0.25,0.5,0.75,1].map((v,idx)=>(
            <div key={idx} style={{position:'absolute',left:0,top:`${v*200+18}px`,fontSize:15,color:'#b87b2a',fontWeight:700}}>
              {Math.round(maxRevenue*(1-v))}€
            </div>
          ))}
          {/* Bars */}
          {revenueData.map((d,i)=>(
            <div key={i} style={{flex:'1 1 0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',zIndex:2}}>
              <div
                style={{
                  height:`${Math.round((d.value/maxRevenue)*200)}px`,
                  width:54,
                  background:barColors[i%barColors.length],
                  borderRadius:16,
                  boxShadow:'0 2px 16px #b87b2a22',
                  display:'flex',alignItems:'flex-end',justifyContent:'center',
                  position:'relative',
                  transition:'height 0.3s',
                  cursor:'pointer',
                }}
                title={`${d.value}€`}
              >
                <span style={{
                  fontWeight:900,
                  fontSize:20,
                  color:'#fff',
                  marginBottom:14,
                  textShadow:'0 2px 8px #b87b2a55',
                  background:'rgba(184,123,42,0.92)',
                  borderRadius:10,
                  padding:'4px 16px',
                  opacity:0.98,
                  position:'absolute',
                  left:'50%',
                  transform:'translateX(-50%)',
                  top:-40,
                  pointerEvents:'none',
                  transition:'opacity 0.2s',
                }}>{d.value}€</span>
              </div>
              <span style={{marginTop:18,fontSize:18,color:'#7a4a1a',fontWeight:900,letterSpacing:1}}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Orders */}
      <div style={{background:'#fff6ec',borderRadius:20,padding:32,boxShadow:'0 2px 16px #b87b2a11',marginBottom:32}}>
        <div style={{fontWeight:700,fontSize:20,color:'#b87b2a',marginBottom:18}}>Πρόσφατες Παραγγελίες</div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:16}}>
          <thead>
            <tr style={{color:'#b87b2a',fontWeight:700}}>
              <th style={{textAlign:'left',padding:'8px 0'}}>ID</th>
              <th style={{textAlign:'left',padding:'8px 0'}}>Πελάτης</th>
              <th style={{textAlign:'left',padding:'8px 0'}}>Ημερομηνία</th>
              <th style={{textAlign:'left',padding:'8px 0'}}>Σύνολο</th>
              <th style={{textAlign:'left',padding:'8px 0'}}>Κατάσταση</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o,i) => (
              <tr key={i} style={{borderBottom:'1px solid #f6c77a',cursor:'pointer'}} onClick={()=>setSelectedOrder(o)}>
                <td style={{padding:'8px 0'}}>{o.id}</td>
                <td style={{padding:'8px 0'}}>{o.customer}</td>
                <td style={{padding:'8px 0'}}>{o.date}</td>
                <td style={{padding:'8px 0'}}>{o.total}</td>
                <td style={{padding:'8px 0'}}>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedOrder && (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSelectedOrder(null)}>
            <div style={{background:'#fff',borderRadius:18,padding:36,minWidth:340,maxWidth:420,boxShadow:'0 8px 48px #b87b2a22',position:'relative'}} onClick={e=>e.stopPropagation()}>
              <div style={{fontWeight:800,fontSize:22,color:'#b87b2a',marginBottom:8}}>Λεπτομέρειες Παραγγελίας</div>
              <div style={{marginBottom:8}}><b>ID:</b> {selectedOrder.id}</div>
              <div style={{marginBottom:8}}><b>Πελάτης:</b> {selectedOrder.customer}</div>
              <div style={{marginBottom:8}}><b>Ημερομηνία:</b> {selectedOrder.date}</div>
              <div style={{marginBottom:8}}><b>Σύνολο:</b> {selectedOrder.total}</div>
              <div style={{marginBottom:8}}><b>Κατάσταση:</b> {selectedOrder.status}</div>
              <div style={{marginBottom:8}}><b>Προϊόντα:</b>
                <ul style={{margin:'8px 0 0 18px',padding:0}}>
                  {selectedOrder.items.map((item,idx)=>(
                    <li key={idx}>{item.name} x{item.qty} ({item.price})</li>
                  ))}
                </ul>
              </div>
              <button onClick={()=>setSelectedOrder(null)} style={{marginTop:18,background:'#b87b2a',color:'#fff',border:'none',borderRadius:10,padding:'10px 24px',fontWeight:700,fontSize:16,cursor:'pointer'}}>Κλείσιμο</button>
            </div>
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:32}}>
        <button style={{flex:'1 1 220px',background:'#b87b2a',color:'#fff',border:'none',borderRadius:16,padding:'22px 0',fontWeight:700,fontSize:18,cursor:'pointer',boxShadow:'0 2px 12px #b87b2a22'}} onClick={()=>navigate('/admin/products')}>+ Προσθήκη Προϊόντος</button>
        <button style={{flex:'1 1 220px',background:'#7a4a1a',color:'#fff',border:'none',borderRadius:16,padding:'22px 0',fontWeight:700,fontSize:18,cursor:'pointer',boxShadow:'0 2px 12px #b87b2a22'}} onClick={()=>navigate('/admin/orders')}>Διαχείριση Παραγγελιών</button>
        <button style={{flex:'1 1 220px',background:'#b87b2a',color:'#fff',border:'none',borderRadius:16,padding:'22px 0',fontWeight:700,fontSize:18,cursor:'pointer',boxShadow:'0 2px 12px #b87b2a22'}} onClick={()=>navigate('/admin/users')}>Διαχείριση Χρηστών</button>
      </div>
      {/* Google Analytics Placeholder */}
      <div style={{background:'#e6f0ff',borderRadius:20,padding:32,boxShadow:'0 2px 16px #b87b2a11',marginBottom:32,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div style={{fontWeight:700,fontSize:20,color:'#1a4a7a',marginBottom:8}}>Google Analytics / Επισκεψιμότητα</div>
        <div style={{color:'#1a4a7a',fontSize:16}}>Σύντομα θα εμφανίζονται εδώ στατιστικά επισκεψιμότητας από το Google Analytics.</div>
      </div>
      {/* Low Stock Modal */}
      {showLowStock && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowLowStock(false)}>
          <div style={{background:'#fff',borderRadius:18,padding:36,minWidth:340,maxWidth:420,boxShadow:'0 8px 48px #b87b2a22',position:'relative'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:22,color:'#b87b2a',marginBottom:8}}>Προϊόντα με χαμηλό απόθεμα</div>
            <ul style={{margin:'12px 0 0 18px',padding:0}}>
              {lowStockProducts.map((p,i)=>(
                <li key={i}>{p.name} <span style={{color:'#b82a2a',fontWeight:700}}>({p.stock} τεμ.)</span></li>
              ))}
            </ul>
            <button onClick={()=>setShowLowStock(false)} style={{marginTop:18,background:'#b87b2a',color:'#fff',border:'none',borderRadius:10,padding:'10px 24px',fontWeight:700,fontSize:16,cursor:'pointer'}}>Κλείσιμο</button>
          </div>
        </div>
      )}
      {/* Pending Orders Modal */}
      {showPendingOrders && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowPendingOrders(false)}>
          <div style={{background:'#fff',borderRadius:18,padding:36,minWidth:340,maxWidth:520,boxShadow:'0 8px 48px #b87b2a22',position:'relative'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:22,color:'#b87b2a',marginBottom:8}}>Παραγγελίες σε Εκκρεμότητα</div>
            {pendingOrders.length === 0 ? (
              <div style={{color:'#7a4a1a',margin:'18px 0'}}>Δεν υπάρχουν παραγγελίες σε εκκρεμότητα.</div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:16}}>
                <thead>
                  <tr style={{color:'#b87b2a',fontWeight:700}}>
                    <th style={{textAlign:'left',padding:'8px 0'}}>ID</th>
                    <th style={{textAlign:'left',padding:'8px 0'}}>Πελάτης</th>
                    <th style={{textAlign:'left',padding:'8px 0'}}>Ημερομηνία</th>
                    <th style={{textAlign:'left',padding:'8px 0'}}>Σύνολο</th>
                    <th style={{textAlign:'left',padding:'8px 0'}}>Κατάσταση</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((o,i) => (
                    <tr key={i} style={{borderBottom:'1px solid #f6c77a'}}>
                      <td style={{padding:'8px 0'}}>{o.id}</td>
                      <td style={{padding:'8px 0'}}>{o.customer}</td>
                      <td style={{padding:'8px 0'}}>{o.date}</td>
                      <td style={{padding:'8px 0'}}>{o.total}</td>
                      <td style={{padding:'8px 0'}}>{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button onClick={()=>setShowPendingOrders(false)} style={{marginTop:18,background:'#b87b2a',color:'#fff',border:'none',borderRadius:10,padding:'10px 24px',fontWeight:700,fontSize:16,cursor:'pointer'}}>Κλείσιμο</button>
          </div>
        </div>
      )}
    </div>
  );
} 