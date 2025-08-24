import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch users from database
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching users from user_profiles table...');
      
      // Get users from our custom user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } else {
        console.log('Successfully fetched users:', data);
        // Format users for display
        const formattedUsers = (data || []).map(user => ({
          id: user.user_id, // Use user_id as the main ID
          profile_id: user.id, // Keep profile ID for updates
          email: user.email,
          name: user.full_name || 'Δεν υπάρχει όνομα',
          phone: user.phone || 'Δεν υπάρχει',
          role: user.role || 'customer', // Default role
          created_at: new Date(user.created_at).toLocaleDateString('el-GR'),
          active: true
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId) => {
    console.log('🚀 fetchUserOrders called for userId:', userId);
    try {
      setOrdersLoading(true);
      
      // Find the user first to get their email
      const currentUser = users.find(u => u.id === userId);
      console.log('👤 Found user:', currentUser);
      if (!currentUser) {
        setUserOrders([]);
        setOrdersLoading(false);
        return;
      }

      // Search orders by customer_email since we don't have user_id field yet
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', currentUser.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        setUserOrders([]);
      } else {
        // Format orders for display and fetch items for each order
        const formattedOrders = [];
        
        for (const order of data || []) {
          console.log('🔍 Fetching items for order:', order.id);
          
          // Fetch order items with product details for each order
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              products (
                id,
                name,
                description,
                image_url,
                category,
                subcategory
              )
            `)
            .eq('order_id', order.id);

          console.log('📦 Order items response:', { orderItems, itemsError });

          if (itemsError) {
            console.error('Error fetching order items:', itemsError);
          }

          const formattedItems = (orderItems || []).map(item => ({
            id: item.id,
            product_id: item.product_id,
            name: item.products?.name || 'Άγνωστο προϊόν',
            description: item.products?.description || '',
            image_url: item.products?.image_url || '',
            category: item.products?.category || '',
            subcategory: item.products?.subcategory || '',
            quantity: item.quantity,
            price: parseFloat(item.price),
            total: parseFloat(item.price) * parseInt(item.quantity)
          }));

          console.log('✅ Formatted items for order', order.id, ':', formattedItems);

          formattedOrders.push({
            id: order.id,
            date: new Date(order.created_at).toLocaleDateString('el-GR'),
            total: parseFloat(order.total),
            status: order.status,
            customer_name: order.customer_name,
            items: formattedItems
          });
        }
        
        setUserOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
      setUserOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const statusLabels = {
    'completed': 'Ολοκληρώθηκε',
    'pending': 'Εκκρεμεί',
    'processing': 'Σε εξέλιξη',
    'cancelled': 'Ακυρώθηκε',
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
      name: selectedUser.name,
      phone: selectedUser.phone === 'Δεν υπάρχει' ? '' : selectedUser.phone,
      role: selectedUser.role
    });
    setEditMode(true);
  };
  
  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };
  
  const handleEditSave = async () => {
    try {
      console.log('Updating user profile:', selectedUser.profile_id, editForm);
      
      // Update user profile in the database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editForm.name,
          phone: editForm.phone || null,
          role: editForm.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.profile_id);

      if (error) {
        console.error('Error updating user profile:', error);
        alert('Σφάλμα κατά την ενημέρωση του χρήστη!');
        return;
      }

      // Update local state
      const updatedUser = { 
        ...selectedUser, 
        name: editForm.name,
        phone: editForm.phone || 'Δεν υπάρχει',
        role: editForm.role
      };
      
      setSelectedUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
    setEditMode(false);
      
      alert('Ο χρήστης ενημερώθηκε επιτυχώς!');
      
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Σφάλμα κατά την ενημέρωση του χρήστη!');
    }
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
  
  const confirmDeleteUser = async () => {
    try {
      console.log('Deleting user profile:', selectedUser.profile_id);
      
      // Delete from user_profiles table (this will NOT delete the auth user)
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', selectedUser.profile_id);

      if (error) {
        console.error('Error deleting user profile:', error);
        alert('Σφάλμα κατά τη διαγραφή του χρήστη!');
        return;
      }

      // Update local state
    setUsers(us => us.filter(u => u.id !== selectedUser.id));
    setShowModal(false);
    setSelectedUser(null);
    setConfirmDelete(false);
    document.body.style.overflow = '';
      
      alert('Ο χρήστης διαγράφηκε επιτυχώς!');
      
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Σφάλμα κατά τη διαγραφή του χρήστη!');
    }
  };
  
  const cancelDelete = () => setConfirmDelete(false);

  const handleShowOrders = () => {
    fetchUserOrders(selectedUser.id);
    setShowOrders(true);
  };
  
  const closeOrders = () => {
    setShowOrders(false);
    setUserOrders([]);
  };
  
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
              <th style={{padding:'14px 12px',textAlign:'left'}}>Ρόλος</th>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Ημ/νία Εγγραφής</th>
              <th style={{padding:'14px 12px',textAlign:'center'}}>Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{textAlign:'center',padding:'32px',color:'#b87b2a',fontWeight:700}}>Φόρτωση χρηστών...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign:'center',padding:'32px',color:'#b87b2a',fontWeight:700}}>Δεν βρέθηκαν χρήστες.</td></tr>
            ) : users.map(u => (
              <tr key={u.id} style={{borderBottom:'1px solid #f6c77a55'}}>
                <td style={{padding:'12px 10px'}}>{u.email}</td>
                <td style={{padding:'12px 10px'}}>{u.name}</td>
                <td style={{padding:'12px 10px'}}>{u.phone}</td>
                <td style={{padding:'12px 10px'}}>
                  <span style={{
                    color: u.role === 'admin' ? '#b87b2a' : u.role === 'superadmin' ? '#7a4a1a' : '#666',
                    fontWeight: u.role === 'admin' || u.role === 'superadmin' ? '700' : '500',
                    textTransform: 'capitalize'
                  }}>
                    {u.role === 'customer' ? 'Πελάτης' : u.role === 'admin' ? 'Διαχειριστής' : 'Σούπερ Διαχειριστής'}
                  </span>
                </td>
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
                  <div><b>Όνομα:</b> <span style={{color:'#7a4a1a'}}>{selectedUser.name}</span></div>
                  <div><b>Τηλέφωνο:</b> <span style={{color:'#7a4a1a'}}>{selectedUser.phone}</span></div>
                  <div><b>Ημ/νία Εγγραφής:</b> <span style={{color:'#7a4a1a'}}>{selectedUser.created_at}</span></div>
                  <div><b>Κατάσταση:</b> <span style={{color: selectedUser.active ? '#4caf50' : '#b82a2a', fontWeight:700}}>{selectedUser.active ? 'Ενεργός' : 'Ανενεργός'}</span></div>
                  <div><b>Ρόλος:</b> <span style={{color:'#7a4a1a'}}>{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</span></div>
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
                    <input name="name" value={editForm.name} onChange={handleEditChange} style={{marginLeft:8,padding:'8px 10px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:15}} />
                  </div>
                  <div>
                    <b>Τηλέφωνο:</b>
                    <input name="phone" value={editForm.phone} onChange={handleEditChange} style={{marginLeft:8,padding:'8px 10px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:15}} />
                  </div>
                  <div>
                    <b>Ρόλος:</b>
                    <select name="role" value={editForm.role} onChange={handleEditChange} style={{marginLeft:8,padding:'8px 10px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:15}}>
                      <option value="customer">Πελάτης</option>
                      <option value="admin">Διαχειριστής</option>
                      <option value="superadmin">Σούπερ Διαχειριστής</option>
                    </select>
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
            {ordersLoading ? (
              <div style={{color:'#7a4a1a',fontWeight:600,textAlign:'center',marginTop:24}}>Φόρτωση παραγγελιών...</div>
            ) : userOrders.length > 0 ? (
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
                  {userOrders.map(o => (
                    <tr key={o.id} style={{borderBottom:'1px solid #e6f0ff'}}>
                      <td style={{padding:'8px 6px'}}>ORD-{String(o.id).padStart(3, '0')}</td>
                      <td style={{padding:'8px 6px'}}>{o.date}</td>
                      <td style={{padding:'8px 6px'}}>{o.total.toFixed(2)} €</td>
                      <td style={{padding:'8px 6px'}}>{statusLabels[o.status] || o.status}</td>
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
              <div><b>ID:</b> <span style={{color:'#7a4a1a'}}>ORD-{String(selectedOrder.id).padStart(3, '0')}</span></div>
              <div><b>Ημερομηνία:</b> <span style={{color:'#7a4a1a'}}>{selectedOrder.date}</span></div>
              <div><b>Κατάσταση:</b> <span style={{color: selectedOrder.status==='completed' ? '#4caf50' : '#b87b2a', fontWeight:700}}>{statusLabels[selectedOrder.status] || selectedOrder.status}</span></div>
              <div><b>Πελάτης:</b> <span style={{color:'#7a4a1a'}}>{selectedOrder.customer_name || 'Άγνωστος πελάτης'}</span></div>
            </div>
            <div style={{fontWeight:700,fontSize:17,color:'#7a4a1a',marginBottom:8}}>Προϊόντα:</div>
            <div style={{background:'#fff6ec',padding:16,borderRadius:10,marginBottom:18}}>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, index) => (
                  <div key={index} style={{display:'flex',alignItems:'center',gap:12,marginBottom:index < selectedOrder.items.length - 1 ? 12 : 0,padding:8,background:'white',borderRadius:8}}>
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        style={{width:60,height:60,objectFit:'cover',borderRadius:6}}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,color:'#333',marginBottom:4}}>{item.name}</div>
                      <div style={{fontSize:13,color:'#666',marginBottom:2}}>{item.category} {item.subcategory && `• ${item.subcategory}`}</div>
                      <div style={{fontSize:13,color:'#7a4a1a'}}>Ποσότητα: {item.quantity} × {item.price.toFixed(2)}€ = {item.total.toFixed(2)}€</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{textAlign:'center',color:'#7a4a1a',fontStyle:'italic'}}>
                  Δεν βρέθηκαν προϊόντα για αυτή την παραγγελία.
                </div>
              )}
            </div>
            <div style={{fontWeight:900,fontSize:18,color:'#b87b2a',textAlign:'right'}}>Σύνολο: {selectedOrder.total.toFixed(2)} €</div>
          </div>
        </div>
      )}
    </div>
  );
} 