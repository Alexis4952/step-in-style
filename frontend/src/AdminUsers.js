import React from 'react';
import { useState } from 'react';

const mockUsers = [
  { id: 1, email: 'maria@gmail.com', full_name: 'Μαρία Παπαδοπούλου', phone: '6981234567', created_at: '2024-03-01', active: true },
  { id: 2, email: 'nikos@yahoo.com', full_name: 'Νίκος Κωνσταντίνου', phone: '6979876543', created_at: '2024-03-05', active: true },
  { id: 3, email: 'anna@hotmail.com', full_name: 'Άννα Δημητρίου', phone: '6941122334', created_at: '2024-03-10', active: false },
  { id: 4, email: 'kostas@outlook.com', full_name: 'Κώστας Βασιλείου', phone: '6933344556', created_at: '2024-03-12', active: true },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock παραγγελίες ανά χρήστη
  const mockOrders = {
    1: [
      { id: 101, date: '2024-03-15', total: 89.90, status: 'Ολοκληρώθηκε' },
      { id: 102, date: '2024-04-02', total: 59.00, status: 'Εκκρεμεί' },
    ],
    2: [
      { id: 201, date: '2024-03-20', total: 120.00, status: 'Ολοκληρώθηκε' },
    ],
    3: [],
    4: [
      { id: 401, date: '2024-04-10', total: 45.50, status: 'Ολοκληρώθηκε' },
      { id: 402, date: '2024-04-12', total: 99.99, status: 'Εκκρεμεί' },
      { id: 403, date: '2024-04-15', total: 32.00, status: 'Ολοκληρώθηκε' },
    ],
  };

  // Mock προϊόντα παραγγελίας
  const mockOrderDetails = {
    101: { paid: true, products: [{ name: 'Nike Air Max', qty: 1, price: 89.90 }] },
    102: { paid: false, products: [{ name: 'Adidas Superstar', qty: 2, price: 29.50 }] },
    201: { paid: true, products: [{ name: 'Puma RS-X', qty: 1, price: 120.00 }] },
    401: { paid: true, products: [{ name: 'Converse All Star', qty: 1, price: 45.50 }] },
    402: { paid: false, products: [{ name: 'Vans Old Skool', qty: 1, price: 99.99 }] },
    403: { paid: true, products: [{ name: 'Reebok Classic', qty: 2, price: 16.00 }] },
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    document.body.style.overflow = '';
  };

  const handleEdit = () => {
    setEditForm({
      full_name: selectedUser.full_name,
      phone: selectedUser.phone
    });
    setEditMode(true);
  };
  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };
  const handleEditSave = () => {
    // Mock update (μόνο τοπικά)
    setSelectedUser(u => ({ ...u, ...editForm }));
    setEditMode(false);
  };
  const handleEditCancel = () => {
    setEditMode(false);
  };

  const handleToggleActive = () => {
    setUsers(us => us.map(u => u.id === selectedUser.id ? { ...u, active: !u.active } : u));
    setSelectedUser(u => ({ ...u, active: !u.active }));
  };
  const handleDelete = () => {
    setConfirmDelete(true);
  };
  const confirmDeleteUser = () => {
    setUsers(us => us.filter(u => u.id !== selectedUser.id));
    setShowModal(false);
    setSelectedUser(null);
    setConfirmDelete(false);
    document.body.style.overflow = '';
  };
  const cancelDelete = () => setConfirmDelete(false);

  const handleShowOrders = () => setShowOrders(true);
  const closeOrders = () => setShowOrders(false);
  const handleViewOrder = (order) => setSelectedOrder(order);
  const closeOrderDetails = () => setSelectedOrder(null);

  return (
    <div style={{background:'#fff6ec',borderRadius:24,padding:40,boxShadow:'0 2px 16px #b87b2a11',fontFamily:'Montserrat',maxWidth:1100,margin:'0 auto'}}>
      <h2 style={{color:'#b87b2a',fontWeight:800,fontSize:'2rem',marginBottom:18}}>Διαχείριση Χρηστών</h2>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:18,boxShadow:'0 2px 12px #b87b2a11',fontSize:17}}>
          <thead>
            <tr style={{background:'#f6c77a',color:'#7a4a1a',fontWeight:700}}>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Email</th>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Όνομα</th>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Τηλέφωνο</th>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Ημ/νία Εγγραφής</th>
              <th style={{padding:'14px 12px',textAlign:'center'}}>Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{borderBottom:'1px solid #f6c77a55'}}>
                <td style={{padding:'12px 10px'}}>{u.email}</td>
                <td style={{padding:'12px 10px'}}>{u.full_name}</td>
                <td style={{padding:'12px 10px'}}>{u.phone}</td>
                <td style={{padding:'12px 10px'}}>{u.created_at}</td>
                <td style={{padding:'12px 10px',textAlign:'center'}}>
                  <button style={{background:'#b87b2a',color:'#fff',border:'none',borderRadius:8,padding:'8px 18px',fontWeight:700,fontSize:15,cursor:'pointer'}} onClick={()=>handleView(u)}>Προβολή</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal Προβολής Χρήστη */}
      {showModal && selectedUser && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={closeModal}>
          <div style={{background:'#fff',borderRadius:18,padding:'48px 40px',minWidth:340,maxWidth:600,width:'95%',boxShadow:'0 8px 48px #b87b2a22',position:'relative'}} onClick={e=>e.stopPropagation()}>
            <button onClick={closeModal} style={{position:'absolute',top:18,right:18,background:'none',border:'none',fontSize:26,color:'#b87b2a',cursor:'pointer',fontWeight:900}} title="Κλείσιμο">×</button>
            <div style={{fontWeight:900,fontSize:22,color:'#b87b2a',marginBottom:18,textAlign:'center'}}>Στοιχεία Χρήστη</div>
            {!editMode ? (
              <>
                <div style={{display:'flex',flexDirection:'column',gap:16,marginBottom:24}}>
                  <div><b>Email:</b> <span style={{color:'#7a4a1a'}}>{selectedUser.email}</span></div>
                  <div><b>Όνομα:</b> <span style={{color:'#7a4a1a'}}>{selectedUser.full_name}</span></div>
                  <div><b>Τηλέφωνο:</b> <span style={{color:'#7a4a1a'}}>{selectedUser.phone}</span></div>
                  <div><b>Ημ/νία Εγγραφής:</b> <span style={{color:'#7a4a1a'}}>{selectedUser.created_at}</span></div>
                  <div><b>Κατάσταση:</b> <span style={{color: selectedUser.active ? '#4caf50' : '#b82a2a', fontWeight:700}}>{selectedUser.active ? 'Ενεργός' : 'Ανενεργός'}</span></div>
                </div>
                <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:18,flexWrap:'wrap'}}>
                  <button onClick={handleEdit} style={{background:'#f6c77a',color:'#7a4a1a',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:800,fontSize:16,cursor:'pointer'}}>Επεξεργασία</button>
                  <button onClick={handleToggleActive} style={{background:selectedUser.active?'#b82a2a':'#4caf50',color:'#fff',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:800,fontSize:16,cursor:'pointer'}}>{selectedUser.active ? 'Απενεργοποίηση' : 'Ενεργοποίηση'}</button>
                  <button onClick={handleDelete} style={{background:'#b82a2a',color:'#fff',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:800,fontSize:16,cursor:'pointer'}}>Διαγραφή</button>
                  <button onClick={handleShowOrders} style={{background:'#e6f0ff',color:'#1a4a7a',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:800,fontSize:16,cursor:'pointer'}}>Προβολή Παραγγελιών</button>
                </div>
                {confirmDelete && (
                  <div style={{background:'#fff6ec',border:'1.5px solid #b82a2a',borderRadius:12,padding:18,margin:'0 auto 8px auto',maxWidth:320,textAlign:'center'}}>
                    <div style={{color:'#b82a2a',fontWeight:700,marginBottom:10}}>Είσαι σίγουρος ότι θέλεις να διαγράψεις τον χρήστη;</div>
                    <button onClick={confirmDeleteUser} style={{background:'#b82a2a',color:'#fff',border:'none',borderRadius:8,padding:'8px 18px',fontWeight:700,fontSize:15,cursor:'pointer',marginRight:10}}>Ναι, διαγραφή</button>
                    <button onClick={cancelDelete} style={{background:'#f6c77a',color:'#7a4a1a',border:'none',borderRadius:8,padding:'8px 18px',fontWeight:700,fontSize:15,cursor:'pointer'}}>Άκυρο</button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{display:'flex',flexDirection:'column',gap:16,marginBottom:24}}>
                  <div><b>Email:</b> <span style={{color:'#7a4a1a'}}>{selectedUser.email}</span></div>
                  <div>
                    <b>Όνομα:</b>
                    <input name="full_name" value={editForm.full_name} onChange={handleEditChange} style={{marginLeft:8,padding:'8px 10px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:15}} />
                  </div>
                  <div>
                    <b>Τηλέφωνο:</b>
                    <input name="phone" value={editForm.phone} onChange={handleEditChange} style={{marginLeft:8,padding:'8px 10px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:15}} />
                  </div>
                  <div><b>Ημ/νία Εγγραφής:</b> <span style={{color:'#7a4a1a'}}>{selectedUser.created_at}</span></div>
                </div>
                <div style={{display:'flex',gap:16,justifyContent:'center'}}>
                  <button onClick={handleEditSave} style={{background:'#4caf50',color:'#fff',border:'none',borderRadius:10,padding:'10px 28px',fontWeight:800,fontSize:16,cursor:'pointer'}}>Αποθήκευση</button>
                  <button onClick={handleEditCancel} style={{background:'#b82a2a',color:'#fff',border:'none',borderRadius:10,padding:'10px 28px',fontWeight:800,fontSize:16,cursor:'pointer'}}>Άκυρο</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Modal Παραγγελιών Χρήστη */}
      {showOrders && selectedUser && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={closeOrders}>
          <div style={{background:'#fff',borderRadius:18,padding:'40px 32px',minWidth:320,maxWidth:520,width:'95%',boxShadow:'0 8px 48px #b87b2a22',position:'relative'}} onClick={e=>e.stopPropagation()}>
            <button onClick={closeOrders} style={{position:'absolute',top:18,right:18,background:'none',border:'none',fontSize:26,color:'#b87b2a',cursor:'pointer',fontWeight:900}} title="Κλείσιμο">×</button>
            <div style={{fontWeight:900,fontSize:22,color:'#1a4a7a',marginBottom:18,textAlign:'center'}}>Παραγγελίες Χρήστη</div>
            {mockOrders[selectedUser.id] && mockOrders[selectedUser.id].length > 0 ? (
              <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #b87b2a11',fontSize:16}}>
                <thead>
                  <tr style={{background:'#e6f0ff',color:'#1a4a7a',fontWeight:700}}>
                    <th style={{padding:'10px 8px',textAlign:'left'}}>ID</th>
                    <th style={{padding:'10px 8px',textAlign:'left'}}>Ημ/νία</th>
                    <th style={{padding:'10px 8px',textAlign:'left'}}>Σύνολο</th>
                    <th style={{padding:'10px 8px',textAlign:'left'}}>Κατάσταση</th>
                    <th style={{padding:'10px 8px',textAlign:'center'}}>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders[selectedUser.id].map(o => (
                    <tr key={o.id} style={{borderBottom:'1px solid #e6f0ff'}}>
                      <td style={{padding:'8px 6px'}}>{o.id}</td>
                      <td style={{padding:'8px 6px'}}>{o.date}</td>
                      <td style={{padding:'8px 6px'}}>{o.total.toFixed(2)} €</td>
                      <td style={{padding:'8px 6px'}}>{o.status}</td>
                      <td style={{padding:'8px 6px',textAlign:'center'}}>
                        <button onClick={()=>handleViewOrder(o)} style={{background:'#b87b2a',color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:15,cursor:'pointer'}}>Προβολή</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{color:'#7a4a1a',fontWeight:600,textAlign:'center',marginTop:24}}>Δεν υπάρχουν παραγγελίες για αυτόν τον χρήστη.</div>
            )}
          </div>
        </div>
      )}
      {/* Modal Αναλυτικής Προβολής Παραγγελίας */}
      {selectedOrder && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={closeOrderDetails}>
          <div style={{background:'#fff',borderRadius:18,padding:'44px 36px',minWidth:320,maxWidth:480,width:'95%',boxShadow:'0 8px 48px #b87b2a22',position:'relative'}} onClick={e=>e.stopPropagation()}>
            <button onClick={closeOrderDetails} style={{position:'absolute',top:18,right:18,background:'none',border:'none',fontSize:26,color:'#b87b2a',cursor:'pointer',fontWeight:900}} title="Κλείσιμο">×</button>
            <div style={{fontWeight:900,fontSize:22,color:'#b87b2a',marginBottom:18,textAlign:'center'}}>Αναλυτικά Παραγγελίας</div>
            <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:18}}>
              <div><b>ID:</b> <span style={{color:'#7a4a1a'}}>{selectedOrder.id}</span></div>
              <div><b>Ημερομηνία:</b> <span style={{color:'#7a4a1a'}}>{selectedOrder.date}</span></div>
              <div><b>Κατάσταση:</b> <span style={{color: selectedOrder.status==='Ολοκληρώθηκε' ? '#4caf50' : '#b87b2a', fontWeight:700}}>{selectedOrder.status}</span></div>
              <div><b>Πληρωμή:</b> <span style={{color: mockOrderDetails[selectedOrder.id]?.paid ? '#4caf50' : '#b82a2a', fontWeight:700}}>{mockOrderDetails[selectedOrder.id]?.paid ? 'Ολοκληρώθηκε' : 'Εκκρεμεί'}</span></div>
            </div>
            <div style={{fontWeight:700,fontSize:17,color:'#7a4a1a',marginBottom:8}}>Προϊόντα:</div>
            <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:10,boxShadow:'0 2px 8px #b87b2a11',fontSize:15,marginBottom:18}}>
              <thead>
                <tr style={{background:'#f6c77a',color:'#7a4a1a',fontWeight:700}}>
                  <th style={{padding:'8px 6px',textAlign:'left'}}>Όνομα</th>
                  <th style={{padding:'8px 6px',textAlign:'center'}}>Ποσότητα</th>
                  <th style={{padding:'8px 6px',textAlign:'right'}}>Τιμή</th>
                </tr>
              </thead>
              <tbody>
                {mockOrderDetails[selectedOrder.id]?.products.map((p,i)=>(
                  <tr key={i} style={{borderBottom:'1px solid #f6c77a33'}}>
                    <td style={{padding:'7px 6px'}}>{p.name}</td>
                    <td style={{padding:'7px 6px',textAlign:'center'}}>{p.qty}</td>
                    <td style={{padding:'7px 6px',textAlign:'right'}}>{(p.price*p.qty).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{fontWeight:900,fontSize:18,color:'#b87b2a',textAlign:'right'}}>Σύνολο: {selectedOrder.total.toFixed(2)} €</div>
          </div>
        </div>
      )}
    </div>
  );
} 