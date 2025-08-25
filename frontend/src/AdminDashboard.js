import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import AdminNotifications from './AdminNotifications';

const statsConfig = [
  { label: 'Σύνολο Παραγγελιών', key: 'totalOrders', icon: '📦', color: '#b87b2a' },
  { label: 'Σύνολο Εσόδων', key: 'totalRevenue', icon: '💶', color: '#7a4a1a', suffix: '€' },
  { label: 'Σύνολο Χρηστών', key: 'totalUsers', icon: '🧑‍🤝‍🧑', color: '#b87b2a' },
  { label: 'Διαθέσιμα Προϊόντα', key: 'availableProducts', icon: '👟', color: '#7a4a1a' },
];

// Recent orders will be fetched from database

// Dynamic alerts will be generated based on real data

// Low stock products will be fetched from database

// Revenue data will be fetched from API

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

  // State for real data
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscription για προϊόντα
  useEffect(() => {
    const setupRealtimeSubscription = () => {
      const subscription = supabase
        .channel('dashboard_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'products' 
          }, 
          (payload) => {
            console.log('📦 Product updated, refreshing dashboard stats...');
            fetchDashboardData();
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'orders' 
          }, 
          (payload) => {
            console.log('📋 Order updated, refreshing dashboard stats...');
            fetchDashboardData();
          }
        )
        .subscribe();

      return subscription;
    };

    const subscription = setupRealtimeSubscription();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch dashboard data function
  const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Initialize default values
        let orders = [];
        let newCustomers = [];
        let products = [];

        // Get total orders (handle error gracefully)
        try {
          // 1. Get Supabase orders
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*');
          if (!ordersError) {
            orders = ordersData || [];
          }
        } catch (error) {
          console.log('Orders table not found, using 0 orders');
        }

        // 2. Get guest orders from API
        try {
          const response = await fetch('http://localhost:5000/api/orders');
          const result = await response.json();
          
          if (result.success && result.orders) {
            // Add guest orders to the orders array
            const guestOrders = result.orders.map(order => ({
              ...order,
              total: parseFloat(order.total),
              created_at: order.created_at
            }));
            orders = [...orders, ...guestOrders];
          }
        } catch (apiError) {
          console.log('Guest orders not available:', apiError);
        }

        // Get all users (handle error gracefully)
        try {
          const { data: usersData, error: usersError } = await supabase
            .from('user_profiles')
            .select('*');
          if (!usersError) {
            newCustomers = usersData || [];
          }
        } catch (error) {
          console.log('User profiles table not found, using 0 users');
        }

        // Get available products (this should work)
        try {
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*');
          if (!productsError) {
            products = productsData || [];
          } else {
            console.error('Error fetching products:', productsError);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }

        // Calculate total revenue from real orders (include pending guest orders)
        const totalRevenue = orders
          .filter(order => order.status === 'completed' || order.status === 'pending')
          .reduce((sum, order) => sum + (order.total || 0), 0);

        // Format real orders for display
        const formattedOrders = orders.map(order => ({
          id: `ORD-${String(order.id).padStart(3, '0')}`,
          customer: order.customer_name || 'Άγνωστος πελάτης',
          date: new Date(order.created_at).toLocaleDateString('el-GR'),
          total: `${order.total}€`,
          status: order.status,
          items: [] // We'll add items later if needed
        }));

        const formattedPendingOrders = formattedOrders.filter(order => order.status === 'pending');

        // Calculate low stock products (< 2 stock)
        console.log('📦 Products stock check:', products.map(p => ({
          name: p.name,
          stock: p.stock,
          total_stock: p.total_stock,
          final_stock: p.total_stock || p.stock || 0
        })));
        
        const lowStockProductsList = products.filter(product => {
          const currentStock = product.total_stock || product.stock || 0;
          return currentStock < 2 && currentStock >= 0;
        }).map(product => ({
          name: product.name,
          stock: product.total_stock || product.stock || 0
        }));

        console.log('⚠️ Low stock products found:', lowStockProductsList);

        // Set stats with real data
        setStats({
          totalOrders: orders.length,
          totalRevenue: totalRevenue.toFixed(2),
          totalUsers: newCustomers.length,
          availableProducts: products.length,
          lowStockProducts: lowStockProductsList.length,
          pendingOrders: formattedPendingOrders.length
        });

        setRecentOrders(formattedOrders);
        setLowStockProducts(lowStockProductsList);
        setPendingOrders(formattedPendingOrders);
        setRevenueData([]); // We'll implement this later

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Generate dynamic alerts based on real data
  const alerts = [];
  if (stats.lowStockProducts > 0) {
    alerts.push({
      type: 'warning',
      message: `${stats.lowStockProducts} προϊόντα έχουν χαμηλό απόθεμα!`,
      action: 'Δες προϊόντα',
      onClick: 'lowStock'
    });
  }
  if (stats.pendingOrders > 0) {
    alerts.push({
      type: 'info',
      message: `${stats.pendingOrders} παραγγελία σε εκκρεμότητα.`,
      action: 'Δες παραγγελίες',
      onClick: 'pendingOrders'
    });
  }

  const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.value)) : 0;

  return (
    <div style={{maxWidth:1200,margin:'0 auto',fontFamily:'Montserrat'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h1 style={{color:'#b87b2a',fontWeight:900,fontSize:'2.5rem',marginBottom:8}}>Πίνακας Ελέγχου</h1>
          <div style={{fontSize:'1.1rem',color:'#7a4a1a'}}>
        {adminSession ? <>Συνδεδεμένος ως <b>{adminSession.username}</b> ({adminSession.role})</> : 'Δεν βρέθηκε admin session.'}
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <button 
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              fetchDashboardData();
            }}
            style={{
              background:'#b87b2a',
              color:'white',
              border:'none',
              borderRadius:'8px',
              padding:'8px 16px',
              fontSize:'14px',
              cursor:'pointer',
              fontWeight:600
            }}
            title="Ανανέωση στατιστικών"
          >
            🔄 Ανανέωση
          </button>
          <AdminNotifications />
        </div>
      </div>
      {/* Stats Cards */}
      <div style={{display:'flex',gap:40,flexWrap:'wrap',marginBottom:40,justifyContent:'center',maxWidth:1200}}>
        {loading ? (
          // Loading skeleton
          statsConfig.map((s, i) => (
            <div key={i} style={{flex:'1 1 260px',background:'#fff6ec',borderRadius:28,padding:'40px 32px',boxShadow:'0 2px 24px #b87b2a11',display:'flex',flexDirection:'column',alignItems:'center',minWidth:220,maxWidth:320}}>
              <div style={{fontSize:48,marginBottom:12}}>{s.icon}</div>
              <div style={{fontWeight:900,fontSize:32,color:s.color,marginBottom:6}}>...</div>
              <div style={{fontWeight:700,fontSize:18,color:'#7a4a1a'}}>{s.label}</div>
            </div>
          ))
        ) : (
          statsConfig.map((s, i) => (
          <div key={i} style={{flex:'1 1 260px',background:'#fff6ec',borderRadius:28,padding:'40px 32px',boxShadow:'0 2px 24px #b87b2a11',display:'flex',flexDirection:'column',alignItems:'center',minWidth:220,maxWidth:320}}>
            <div style={{fontSize:48,marginBottom:12}}>{s.icon}</div>
              <div style={{fontWeight:900,fontSize:32,color:s.color,marginBottom:6}}>
                {stats[s.key]}{s.suffix || ''}
              </div>
            <div style={{fontWeight:700,fontSize:18,color:'#7a4a1a'}}>{s.label}</div>
          </div>
          ))
        )}
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
        <div style={{color:'#7a4a1a',fontSize:18,marginBottom:24}}>
          {loading ? 'Φόρτωση δεδομένων...' : 'Πραγματικά δεδομένα από τη βάση'}
        </div>
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
          {loading ? (
            // Loading skeleton for bars
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{flex:'1 1 0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',zIndex:2}}>
                <div
                  style={{
                    height:'100px',
                    width:54,
                    background:'#f6c77a',
                    borderRadius:16,
                    opacity:0.5
                  }}
                />
                <span style={{marginTop:18,fontSize:18,color:'#7a4a1a',fontWeight:900,letterSpacing:1}}>...</span>
              </div>
            ))
          ) : (
            revenueData.map((d,i)=>(
            <div key={i} style={{flex:'1 1 0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',zIndex:2}}>
              <div
                style={{
                    height:`${maxRevenue > 0 ? Math.round((d.value/maxRevenue)*200) : 0}px`,
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
            ))
          )}
        </div>
      </div>
      {/* Recent Orders */}
      <div style={{background:'#fff6ec',borderRadius:20,padding:32,boxShadow:'0 2px 16px #b87b2a11',marginBottom:32}}>
        <div style={{fontWeight:700,fontSize:20,color:'#b87b2a',marginBottom:18}}>Πρόσφατες Παραγγελίες</div>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px 0',color:'#7a4a1a'}}>Φόρτωση παραγγελιών...</div>
        ) : recentOrders.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 0',color:'#7a4a1a'}}>Δεν υπάρχουν παραγγελίες ακόμα.</div>
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
        )}
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
            {lowStockProducts.length === 0 ? (
              <div style={{color:'#7a4a1a',margin:'18px 0'}}>Δεν υπάρχουν προϊόντα με χαμηλό απόθεμα.</div>
            ) : (
            <ul style={{margin:'12px 0 0 18px',padding:0}}>
              {lowStockProducts.map((p,i)=>(
                <li key={i}>{p.name} <span style={{color:'#b82a2a',fontWeight:700}}>({p.stock} τεμ.)</span></li>
              ))}
            </ul>
            )}
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