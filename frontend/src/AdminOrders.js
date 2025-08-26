import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const statusColors = {
  'completed': '#4caf50',
  'pending': '#f6c77a',
  'processing': '#2196f3',
  'cancelled': '#b82a2a',
};

const statusLabels = {
  'completed': 'Προς αποστολή',
  'pending': 'Εκκρεμεί',
  'processing': 'Σε εξέλιξη',
  'cancelled': 'Ακυρώθηκε',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Όλες');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pendingStatus, setPendingStatus] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  // Fetch orders from database
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch all orders from Supabase (both registered and guest orders)
      let allOrders = [];
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          allOrders = data.map(order => ({
            id: `ORD-${String(order.id).padStart(8, '0')}`,
            customer: order.customer_name || 'Άγνωστος πελάτης',
            email: order.customer_email || 'Δεν υπάρχει email',
            date: new Date(order.created_at).toLocaleDateString('el-GR'),
            total: `${order.total}€`,
            status: order.status,
            originalId: order.id,
            items: order.items || [],
            phone: order.customer_phone,
            address: order.customer_address,
            source: 'supabase',
            order_type: order.order_type || 'guest'
          }));
        }
      } catch (supabaseError) {
        console.error('Error fetching orders from Supabase:', supabaseError);
        allOrders = [];
      }
      
      // Sort by date (newest first) - handle Greek date format
      allOrders.sort((a, b) => {
        const parseGreekDate = (dateStr) => {
          const [day, month, year] = dateStr.split('/');
          return new Date(year, month - 1, day);
        };
        return parseGreekDate(b.date) - parseGreekDate(a.date);
      });

      setOrders(allOrders);
      console.log('📋 Loaded orders from Supabase:', {
        total: allOrders.length,
        registered: allOrders.filter(order => order.order_type === 'registered').length,
        guest: allOrders.filter(order => order.order_type === 'guest').length,
        sampleOrder: allOrders[0] // Debug: δείχνω το πρώτο order
      });

    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => {
    const statusMatch = statusFilter === 'Όλες' || 
      (statusFilter === 'Προς αποστολή' && o.status === 'completed') ||
      (statusFilter === 'Εκκρεμεί' && o.status === 'pending') ||
      (statusFilter === 'Σε εξέλιξη' && o.status === 'processing') ||
      (statusFilter === 'Ακυρώθηκε' && o.status === 'cancelled');
    
    const searchMatch = 
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    
    return statusMatch && searchMatch;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page-1)*perPage, page*perPage);

  const handleStatusSave = async (orderDisplayId) => {
    try {
      const order = orders.find(o => o.id === orderDisplayId);
      if (!order) return;

      // Convert Greek status to English for database
      let englishStatus = pendingStatus;
      if (pendingStatus === 'Προς αποστολή') englishStatus = 'completed';
      else if (pendingStatus === 'Εκκρεμεί') englishStatus = 'pending';
      else if (pendingStatus === 'Σε εξέλιξη') englishStatus = 'processing';
      else if (pendingStatus === 'Ακυρώθηκε') englishStatus = 'cancelled';

      // Update status in Supabase (all orders are now in Supabase)
      const { error } = await supabase
        .from('orders')
        .update({ status: englishStatus })
        .eq('id', order.originalId);

      if (error) {
        console.error('Error updating order status:', error);
        alert('Σφάλμα κατά την ενημέρωση της κατάστασης!');
        return;
      }

      // Update local state
      setOrders(prev => prev.map(o => o.id === orderDisplayId ? { ...o, status: englishStatus } : o));
      setSelectedOrder(sel => sel ? { ...sel, status: englishStatus } : sel);
      setPendingStatus('');
      
      alert('Η κατάσταση ενημερώθηκε επιτυχώς!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Σφάλμα κατά την ενημέρωση της κατάστασης!');
    }
  };

  return (
    <div style={{maxWidth:1200,margin:'0 auto',fontFamily:'Montserrat'}}>
      <h1 style={{color:'#b87b2a',fontWeight:900,fontSize:'2.2rem',marginBottom:18}}>Διαχείριση Παραγγελιών</h1>
      <div style={{display:'flex',gap:18,marginBottom:28,flexWrap:'wrap'}}>
        <input
          type="text"
          placeholder="Αναζήτηση πελάτη, email ή ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{padding:'14px 18px',borderRadius:12,border:'1.5px solid #f6c77a',fontSize:17,minWidth:260,fontFamily:'Montserrat'}}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{padding:'14px 18px',borderRadius:12,border:'1.5px solid #f6c77a',fontSize:17,fontFamily:'Montserrat'}}
        >
          <option>Όλες</option>
          <option>Προς αποστολή</option>
          <option>Εκκρεμεί</option>
          <option>Σε εξέλιξη</option>
          <option>Ακυρώθηκε</option>
        </select>
      </div>
      <div style={{overflowX:'auto',background:'#fff6ec',borderRadius:20,padding:0,boxShadow:'0 2px 16px #b87b2a11'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:17}}>
          <thead>
            <tr style={{color:'#b87b2a',fontWeight:800}}>
              <th style={{textAlign:'left',padding:'18px 0 12px 24px'}}>ID</th>
              <th style={{textAlign:'left',padding:'18px 0 12px 0'}}>Πελάτης</th>
              <th style={{textAlign:'left',padding:'18px 0 12px 0'}}>Email</th>
              <th style={{textAlign:'left',padding:'18px 0 12px 0'}}>Ημερομηνία</th>
              <th style={{textAlign:'left',padding:'18px 0 12px 0'}}>Σύνολο</th>
              <th style={{textAlign:'left',padding:'18px 0 12px 0'}}>Κατάσταση</th>
              <th style={{textAlign:'center',padding:'18px 0 12px 0'}}>Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{textAlign:'center',padding:'32px',color:'#b87b2a',fontWeight:700}}>Φόρτωση παραγγελιών...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign:'center',padding:'32px',color:'#b87b2a',fontWeight:700}}>Δεν βρέθηκαν παραγγελίες.</td></tr>
            ) : paginated.map((o,i) => (
              <tr key={i} style={{borderBottom:'1px solid #f6c77a',background:i%2?'#fff':'#fff6ec'}}>
                <td style={{padding:'14px 0 14px 24px',fontWeight:700}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {o.id}
                    {o.source === 'api' && (
                      <span style={{background:'#17a2b8',color:'#fff',borderRadius:6,padding:'2px 6px',fontSize:11,fontWeight:700}}>GUEST</span>
                    )}
                  </div>
                </td>
                <td style={{padding:'14px 0'}}>{o.customer}</td>
                <td style={{padding:'14px 0'}}>{o.email}</td>
                <td style={{padding:'14px 0'}}>{o.date}</td>
                <td style={{padding:'14px 0'}}>{o.total}</td>
                <td style={{padding:'14px 0'}}>
                  <span style={{background:statusColors[o.status],color:'#fff',borderRadius:8,padding:'6px 14px',fontWeight:700,fontSize:15}}>{statusLabels[o.status]}</span>
                </td>
                <td style={{padding:'14px 0',textAlign:'center'}}>
                  <button onClick={()=>setSelectedOrder(o)} style={{background:'#b87b2a',color:'#fff',border:'none',borderRadius:10,padding:'8px 18px',fontWeight:700,fontSize:15,cursor:'pointer'}}>Προβολή</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:10,padding:'24px 0'}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{background:'#f6c77a',color:'#7a4a1a',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:15,cursor:page===1?'not-allowed':'pointer',opacity:page===1?0.5:1}}>Προηγούμενη</button>
            {Array.from({length: totalPages}, (_,i)=>(
              <button key={i+1} onClick={()=>setPage(i+1)} style={{background:page===i+1?'#b87b2a':'#fff',color:page===i+1?'#fff':'#b87b2a',border:'1.5px solid #b87b2a',borderRadius:8,padding:'7px 14px',fontWeight:700,fontSize:15,cursor:'pointer',margin:'0 2px'}}>{i+1}</button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{background:'#f6c77a',color:'#7a4a1a',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:15,cursor:page===totalPages?'not-allowed':'pointer',opacity:page===totalPages?0.5:1}}>Επόμενη</button>
          </div>
        )}
      </div>
      {/* Modal λεπτομερειών */}
      {selectedOrder && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>{setSelectedOrder(null); setPendingStatus('');}}>
          <div style={{background:'#fff',borderRadius:18,padding:40,minWidth:420,maxWidth:600,boxShadow:'0 8px 48px #b87b2a22',position:'relative',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:900,fontSize:22,color:'#b87b2a',marginBottom:12}}>Λεπτομέρειες Παραγγελίας</div>
            <div style={{marginBottom:10}}><b>ID:</b> {selectedOrder.id}</div>
            <div style={{marginBottom:10}}><b>Πελάτης:</b> {selectedOrder.customer}</div>
            <div style={{marginBottom:10}}><b>Email:</b> {selectedOrder.email}</div>
            <div style={{marginBottom:10}}><b>Ημερομηνία:</b> {selectedOrder.date}</div>
            <div style={{marginBottom:10}}><b>Σύνολο:</b> {selectedOrder.total}</div>
            {/* Στοιχεία Αποστολής */}
            <div style={{marginBottom:15,padding:12,backgroundColor:'#fff6ec',borderRadius:8,border:'1px solid #f6c77a'}}>
              <div style={{fontWeight:700,fontSize:16,color:'#b87b2a',marginBottom:8}}>📍 Στοιχεία Αποστολής</div>
              {selectedOrder.address && (
                <div style={{marginBottom:6}}><b>Διεύθυνση:</b> {selectedOrder.address}</div>
              )}
              {selectedOrder.phone && (
                <div style={{marginBottom:6}}><b>Τηλέφωνο:</b> {selectedOrder.phone}</div>
              )}
            </div>
            
            <div style={{marginBottom:10}}><b>Κατάσταση:</b>
              <>
                <select 
                  value={pendingStatus || statusLabels[selectedOrder.status]} 
                  onChange={e=>setPendingStatus(e.target.value)} 
                  style={{padding:'8px 14px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16,fontWeight:700,marginLeft:8}}
                >
                  <option value="Προς αποστολή">Προς αποστολή</option>
                  <option value="Εκκρεμεί">Εκκρεμεί</option>
                  <option value="Σε εξέλιξη">Σε εξέλιξη</option>
                  <option value="Ακυρώθηκε">Ακυρώθηκε</option>
                </select>
                <button onClick={()=>handleStatusSave(selectedOrder.id)} style={{marginLeft:10,background:'#4caf50',color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:15,cursor:'pointer'}}>Αποθήκευση</button>
              </>
            </div>
            <div style={{marginBottom:15}}><b>📦 Προϊόντα Παραγγελίας:</b>
              <div style={{marginTop:8,padding:12,backgroundColor:'#f8f9fa',borderRadius:8,border:'1px solid #dee2e6'}}>
                {selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items.map((item,idx)=>(
                  <div key={idx} style={{
                    padding:'8px 0',
                    borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #e9ecef' : 'none',
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'center'
                  }}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,color:'#2d1c0b'}}>
                        {item.name || item.product_name || 'Άγνωστο προϊόν'}
                      </div>
                      <div style={{fontSize:14,color:'#6c757d'}}>
                        Ποσότητα: <span style={{fontWeight:600,color:'#b87b2a'}}>{item.qty || item.quantity}</span>
                        {(item.selectedSize || item.selected_size) && (
                          <span style={{marginLeft:12}}>
                            👟 Νούμερο: <span style={{fontWeight:600,color:'#e74c3c'}}>{item.selectedSize || item.selected_size}</span>
                          </span>
                        )}
                        {(item.category || item.product_category) && (
                          <span style={{marginLeft:12,fontSize:12,color:'#999'}}>
                            ({item.category || item.product_category})
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{fontWeight:700,color:'#b87b2a',fontSize:16}}>
                      {(parseFloat(item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2)}€
                    </div>
                  </div>
                )) : (
                  <div style={{textAlign:'center',color:'#999',padding:'20px'}}>
                    Δεν υπάρχουν διαθέσιμες πληροφορίες προϊόντων
                  </div>
                )}
              </div>
            </div>
            <button onClick={()=>{setSelectedOrder(null); setPendingStatus('');}} style={{marginTop:18,background:'#b87b2a',color:'#fff',border:'none',borderRadius:10,padding:'10px 24px',fontWeight:700,fontSize:16,cursor:'pointer'}}>Κλείσιμο</button>
          </div>
        </div>
      )}
    </div>
  );
} 