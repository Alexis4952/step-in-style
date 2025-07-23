import React, { useState } from 'react';

const mockOrders = [
  { id: 'ORD-2024-128', customer: 'Γιώργος Παπαδόπουλος', email: 'g.papadopoulos@email.com', date: '2024-06-25', total: '89.99€', status: 'Ολοκληρώθηκε', items: [ { name: 'Nike Air Max', qty: 1, price: '89.99€' } ] },
  { id: 'ORD-2024-127', customer: 'Μαρία Ιωάννου', email: 'm.ionnou@email.com', date: '2024-06-25', total: '59.00€', status: 'Εκκρεμεί', items: [ { name: 'Adidas Superstar', qty: 2, price: '29.50€' } ] },
  { id: 'ORD-2024-126', customer: 'Νίκος Κωνσταντίνου', email: 'n.konstantinou@email.com', date: '2024-06-24', total: '120.00€', status: 'Ολοκληρώθηκε', items: [ { name: 'Puma RS-X', qty: 1, price: '120.00€' } ] },
  { id: 'ORD-2024-125', customer: 'Ελένη Σταμάτη', email: 'e.stamati@email.com', date: '2024-06-24', total: '45.50€', status: 'Ακυρώθηκε', items: [ { name: 'Converse All Star', qty: 1, price: '45.50€' } ] },
  { id: 'ORD-2024-124', customer: 'Πέτρος Αντωνίου', email: 'p.antoniou@email.com', date: '2024-06-23', total: '210.00€', status: 'Σε εξέλιξη', items: [ { name: 'New Balance 574', qty: 2, price: '105.00€' } ] },
  { id: 'ORD-2024-123', customer: 'Αναστασία Μιχαήλ', email: 'a.michail@email.com', date: '2024-06-22', total: '75.00€', status: 'Εκκρεμεί', items: [ { name: 'Vans Old Skool', qty: 1, price: '75.00€' } ] },
];

const statusColors = {
  'Ολοκληρώθηκε': '#4caf50',
  'Εκκρεμεί': '#f6c77a',
  'Σε εξέλιξη': '#2196f3',
  'Ακυρώθηκε': '#b82a2a',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Όλες');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pendingStatus, setPendingStatus] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = orders.filter(o =>
    (statusFilter === 'Όλες' || o.status === statusFilter) &&
    (
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page-1)*perPage, page*perPage);

  const handleStatusSave = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: pendingStatus } : o));
    setSelectedOrder(sel => sel ? { ...sel, status: pendingStatus } : sel);
    setPendingStatus('');
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
          <option>Ολοκληρώθηκε</option>
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
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign:'center',padding:'32px',color:'#b87b2a',fontWeight:700}}>Δεν βρέθηκαν παραγγελίες.</td></tr>
            ) : paginated.map((o,i) => (
              <tr key={i} style={{borderBottom:'1px solid #f6c77a',background:i%2?'#fff':'#fff6ec'}}>
                <td style={{padding:'14px 0 14px 24px',fontWeight:700}}>{o.id}</td>
                <td style={{padding:'14px 0'}}>{o.customer}</td>
                <td style={{padding:'14px 0'}}>{o.email}</td>
                <td style={{padding:'14px 0'}}>{o.date}</td>
                <td style={{padding:'14px 0'}}>{o.total}</td>
                <td style={{padding:'14px 0'}}>
                  <span style={{background:statusColors[o.status],color:'#fff',borderRadius:8,padding:'6px 14px',fontWeight:700,fontSize:15}}>{o.status}</span>
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
          <div style={{background:'#fff',borderRadius:18,padding:40,minWidth:340,maxWidth:480,boxShadow:'0 8px 48px #b87b2a22',position:'relative'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:900,fontSize:22,color:'#b87b2a',marginBottom:12}}>Λεπτομέρειες Παραγγελίας</div>
            <div style={{marginBottom:10}}><b>ID:</b> {selectedOrder.id}</div>
            <div style={{marginBottom:10}}><b>Πελάτης:</b> {selectedOrder.customer}</div>
            <div style={{marginBottom:10}}><b>Email:</b> {selectedOrder.email}</div>
            <div style={{marginBottom:10}}><b>Ημερομηνία:</b> {selectedOrder.date}</div>
            <div style={{marginBottom:10}}><b>Σύνολο:</b> {selectedOrder.total}</div>
            <div style={{marginBottom:10}}><b>Κατάσταση:</b>
              <>
                <select value={pendingStatus || selectedOrder.status} onChange={e=>setPendingStatus(e.target.value)} style={{padding:'8px 14px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16,fontWeight:700,marginLeft:8}}>
                  <option>Ολοκληρώθηκε</option>
                  <option>Εκκρεμεί</option>
                  <option>Σε εξέλιξη</option>
                  <option>Ακυρώθηκε</option>
                </select>
                <button onClick={()=>handleStatusSave(selectedOrder.id)} style={{marginLeft:10,background:'#4caf50',color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:15,cursor:'pointer'}}>Αποθήκευση</button>
              </>
            </div>
            <div style={{marginBottom:10}}><b>Προϊόντα:</b>
              <ul style={{margin:'8px 0 0 18px',padding:0}}>
                {selectedOrder.items.map((item,idx)=>(
                  <li key={idx}>{item.name} x{item.qty} ({item.price})</li>
                ))}
              </ul>
            </div>
            <button onClick={()=>{setSelectedOrder(null); setPendingStatus('');}} style={{marginTop:18,background:'#b87b2a',color:'#fff',border:'none',borderRadius:10,padding:'10px 24px',fontWeight:700,fontSize:16,cursor:'pointer'}}>Κλείσιμο</button>
          </div>
        </div>
      )}
    </div>
  );
} 