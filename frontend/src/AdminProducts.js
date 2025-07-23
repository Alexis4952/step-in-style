import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';

const statusColors = {
  'Ενεργό': '#4caf50',
  'Ανενεργό': '#b82a2a',
};
const categories = ['Παπούτσια', 'Τσάντες', 'Μαγιό', 'Παντόφλες', 'Αξεσουάρ'];
const brands = ['Step in Style', 'Nike', 'Adidas', 'Puma', 'Converse', 'New Balance'];
const colors = ['Λευκό', 'Μαύρο', 'Γκρι', 'Μπλε', 'Κόκκινο', 'Πράσινο', 'Κίτρινο', 'Μπεζ', 'Καφέ', 'Μωβ', 'Ροζ', 'Χρυσό', 'Ασημί', 'Πολύχρωμο'];

async function uploadImageToSupabase(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2,8)}.${fileExt}`;
  const { data, error } = await supabase.storage.from('product-images').upload(fileName, file, { upsert: false });
  if (error) throw error;
  // Get public URL
  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return urlData.publicUrl;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Παπούτσια');
  const [brand, setBrand] = useState('Step in Style');
  const [customBrand, setCustomBrand] = useState('');
  const [color, setColor] = useState('Λευκό');
  const [customColor, setCustomColor] = useState('');
  const [sizes, setSizes] = useState([]);
  const [availableSizes, setAvailableSizes] = useState(['34','35','36','37','38','39','40','41','42','43','44','45','46']);
  const [categoryFilter, setCategoryFilter] = useState('Όλες');
  const [statusFilter, setStatusFilter] = useState('Όλα');
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', price: '', old_price: '', stock: '', maxStock: '', subcategory: '', status: 'Ενεργό', description: '' });
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const galleryInputRef = useRef();
  // 1. State για τα carousels
  const [carousels, setCarousels] = useState([]);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    if (error) setError('Σφάλμα φόρτωσης προϊόντων!');
    setProducts(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchProducts(); }, []);

  // Filtering
  const filtered = products.filter(p =>
    (categoryFilter === 'Όλες' || p.category === categoryFilter) &&
    (brand === 'custom' ? p.brand === customBrand : p.brand === brand) &&
    (statusFilter === 'Όλα' || p.status === statusFilter) &&
    (
      (p.name||'').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku||'').toLowerCase().includes(search.toLowerCase()) ||
      (p.brand||'').toLowerCase().includes(search.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page-1)*perPage, page*perPage);

  // Modal open/close
  const openModal = (product=null) => {
    setEditProduct(product);
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        price: product.price || '',
        old_price: product.old_price || '',
        stock: product.stock || '',
        maxStock: product.maxStock || '',
        subcategory: product.subcategory || '',
        status: product.status || 'Ενεργό',
        description: product.description || ''
      });
      setCategory(product.category || 'Παπούτσια');
      setBrand(product.brand || 'Step in Style');
      setColor(product.color || 'Λευκό');
      setSizes(product.sizes ? (Array.isArray(product.sizes) ? product.sizes : String(product.sizes).split(',')) : []);
      // galleryPreviews: πάντα array
      let previews = [];
      if (Array.isArray(product.gallery)) {
        previews = product.gallery;
      } else if (typeof product.gallery === 'string' && product.gallery.length > 0) {
        try {
          const parsed = JSON.parse(product.gallery);
          if (Array.isArray(parsed)) previews = parsed;
          else previews = [product.gallery];
        } catch {
          previews = [product.gallery];
        }
      }
      setGalleryPreviews(previews);
      // 2. Στο openModal, όταν κάνεις edit, διάβασε το carousels
      setCarousels(Array.isArray(product.carousels) ? product.carousels : (typeof product.carousels === 'string' ? [product.carousels] : []));
    } else {
      setForm({ name: '', sku: '', price: '', old_price: '', stock: '', maxStock: '', subcategory: '', status: 'Ενεργό', description: '' });
      setCategory('Παπούτσια');
      setBrand('Step in Style');
      setColor('Λευκό');
      setSizes([]);
      setGalleryPreviews([]);
      // 3. Στο openModal, όταν κάνεις add, αρχικοποιήσε το carousels
      setCarousels([]);
    }
    setGalleryFiles([]);
    setError('');
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditProduct(null);
    setForm({ name: '', sku: '', price: '', old_price: '', stock: '', maxStock: '', subcategory: '', status: 'Ενεργό', description: '' });
    setCategory('Παπούτσια');
    setBrand('Step in Style');
    setColor('Λευκό');
    setSizes([]);
    setGalleryPreviews([]);
    setGalleryFiles([]);
    setError('');
  };

  // Add/Edit product (Supabase)
  const handleSave = async () => {
    if (!form.name || !form.sku || !brand || !form.price || !category || (galleryFiles.length === 0 && galleryPreviews.length === 0)) {
      setError('Συμπλήρωσε όλα τα υποχρεωτικά πεδία και ανέβασε τουλάχιστον μία εικόνα!');
      return;
    }
    setLoading(true);
    setError('');
    let supabaseError = null;
    let galleryUrls = [];
    try {
      // Upload images to Supabase Storage
      for (let file of galleryFiles) {
        const url = await uploadImageToSupabase(file);
        galleryUrls.push(url);
      }
    } catch (err) {
      setError('Σφάλμα upload εικόνας: ' + err.message);
      setLoading(false);
      return;
    }
    // Prepare data
    const dataToSave = {
      name: form.name,
      sku: form.sku,
      brand: brand === 'custom' ? customBrand : brand,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      stock: Number(form.stock),
      maxStock: form.maxStock ? Number(form.maxStock) : null,
      category,
      subcategory: form.subcategory,
      status: form.status,
      color: color === 'custom' ? customColor : color,
      description: form.description,
      image_url: galleryUrls[0],
      gallery: galleryUrls,
      sizes: sizes.join(','),
      // 3. Στο dataToSave, πρόσθεσε το carousels
      carousels,
    };
    if (editProduct) {
      const { error } = await supabase
        .from('products')
        .update(dataToSave)
        .eq('id', editProduct.id);
      if (error) {
        supabaseError = error;
        setError('Σφάλμα ενημέρωσης προϊόντος: ' + error.message);
        console.error('Supabase update error:', error);
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([dataToSave]);
      if (error) {
        supabaseError = error;
        setError('Σφάλμα προσθήκης προϊόντος: ' + error.message);
        console.error('Supabase insert error:', error);
      }
    }
    setLoading(false);
    if (supabaseError) return;
    closeModal();
    fetchProducts();
  };

  // Delete product (Supabase)
  const handleDelete = async (id) => {
    if (window.confirm('Θέλεις σίγουρα να διαγράψεις το προϊόν;')) {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) setError('Σφάλμα διαγραφής προϊόντος!');
      setLoading(false);
      fetchProducts();
    }
  };

  // File input for gallery
  const handleGalleryChange = e => {
    const files = Array.from(e.target.files);
    setGalleryFiles(files);
    setGalleryPreviews(files.map(file => URL.createObjectURL(file)));
  };

  // Επιλογή μεγεθών (multi-select)
  const handleSizeToggle = size => {
    setSizes(sizes => sizes.includes(size) ? sizes.filter(s => s !== size) : [...sizes, size]);
  };

  // Προσθήκη function για αφαίρεση εικόνας
  function removeGalleryImage(index) {
    setGalleryFiles(files => files.filter((_, i) => i !== index));
    setGalleryPreviews(previews => previews.filter((_, i) => i !== index));
  }

  // Responsive: grid on small screens
  const isMobile = window.innerWidth < 700;

  // View on site
  const handleViewOnSite = (id) => {
    window.open(`/product/${id}`, '_blank');
  };

  return (
    <div style={{maxWidth:1200,margin:'0 auto',fontFamily:'Montserrat'}}>
      <h1 style={{color:'#b87b2a',fontWeight:900,fontSize:'2.2rem',marginBottom:18}}>Διαχείριση Προϊόντων</h1>
      <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:24,flexWrap:'wrap'}}>
        <input
          type="text"
          placeholder="Αναζήτηση ονόματος, SKU ή brand..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{padding:'14px 18px',borderRadius:12,border:'1.5px solid #f6c77a',fontSize:17,minWidth:260,fontFamily:'Montserrat'}}
        />
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} style={{padding:'14px 18px',borderRadius:12,border:'1.5px solid #f6c77a',fontSize:17,fontFamily:'Montserrat'}}>
          <option>Όλες</option>
          {categories.map(c=>(<option key={c}>{c}</option>))}
        </select>
        <select value={brand} onChange={e=>setBrand(e.target.value)} style={{padding:'14px 18px',borderRadius:12,border:'1.5px solid #f6c77a',fontSize:17,fontFamily:'Montserrat'}}>
          <option>Όλες</option>
          {brands.map(b=>(<option key={b}>{b}</option>))}
          <option value="custom">Άλλη (γράψε)</option>
        </select>
        {brand==='custom' && <input type="text" placeholder="Μάρκα" value={customBrand} onChange={e=>setCustomBrand(e.target.value)} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}} />}
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{padding:'14px 18px',borderRadius:12,border:'1.5px solid #f6c77a',fontSize:17,fontFamily:'Montserrat'}}>
          <option>Όλα</option>
          <option>Ενεργό</option>
          <option>Ανενεργό</option>
        </select>
        <button onClick={()=>openModal()} style={{background:'#b87b2a',color:'#fff',border:'none',borderRadius:12,padding:'14px 32px',fontWeight:800,fontSize:18,cursor:'pointer',marginLeft:'auto'}}>+ Προσθήκη Προϊόντος</button>
      </div>
      {/* Premium Table/Grid */}
      {loading ? (
        <div style={{textAlign:'center',padding:40,color:'#b87b2a',fontWeight:700,fontSize:20}}>Φόρτωση προϊόντων...</div>
      ) : (
        <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:18,boxShadow:'0 2px 12px #b87b2a11',fontSize:17}}>
          <thead>
            <tr style={{background:'#f6c77a',color:'#7a4a1a',fontWeight:700}}>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Εικόνα</th>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Όνομα</th>
              <th style={{padding:'14px 12px',textAlign:'left'}}>SKU</th>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Brand</th>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Τιμή</th>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Απόθεμα</th>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Κατηγορία</th>
              <th style={{padding:'14px 12px',textAlign:'left'}}>Κατάσταση</th>
              <th style={{padding:'14px 12px',textAlign:'center'}}>Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{textAlign:'center',padding:'32px',color:'#b87b2a',fontWeight:700}}>Δεν βρέθηκαν προϊόντα.</td></tr>
            ) : paginated.map((p,i) => (
              <tr key={p.id} style={{borderBottom:'1px solid #f6c77a',background:i%2?'#fff':'#fff6ec',transition:'background 0.2s',cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.background='#ffe6c7'}
                onMouseLeave={e=>e.currentTarget.style.background=i%2?'#fff':'#fff6ec'}
              >
                <td style={{padding:'14px 0 14px 24px'}}>
                  <img src={p.image_url} alt={p.name} style={{width:54,height:54,objectFit:'cover',borderRadius:10,boxShadow:'0 2px 8px #b87b2a22',cursor:'pointer'}}
                    onClick={()=>{}}
                  />
                </td>
                <td style={{padding:'14px 0',fontWeight:700}}>{p.name}</td>
                <td style={{padding:'14px 0'}}>{p.sku}</td>
                <td style={{padding:'14px 0'}}>{p.brand}</td>
                <td style={{padding:'14px 0'}}>{p.price}€</td>
                <td style={{padding:'14px 0',minWidth:120}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{flex:1,background:'#e5d6c7',borderRadius:8,height:12,overflow:'hidden',position:'relative'}}>
                      <div style={{width:`${Math.min(100,Math.round((p.stock/(p.maxStock||10))*100))}%`,height:'100%',background:p.stock===0?'#b82a2a':p.stock<=3?'#f6c77a':'#4caf50',borderRadius:8,transition:'width 0.3s'}}></div>
                    </div>
                    <span style={{fontWeight:700,color:p.stock===0?'#b82a2a':p.stock<=3?'#b87b2a':'#4caf50',fontSize:15}}>{p.stock}</span>
                  </div>
                </td>
                <td style={{padding:'14px 0'}}>{p.category}</td>
                <td style={{padding:'14px 0'}}><span style={{background:statusColors[p.status],color:'#fff',borderRadius:8,padding:'4px 10px',fontWeight:700,fontSize:14}}>{p.status}</span></td>
                <td style={{padding:'14px 0',textAlign:'center'}}>
                  <button onClick={()=>openModal(p)} style={{background:'#f6c77a',color:'#7a4a1a',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:15,cursor:'pointer',marginRight:8}}>Επεξεργασία</button>
                  <button onClick={()=>handleDelete(p.id)} style={{background:'#b82a2a',color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:15,cursor:'pointer'}}>Διαγραφή</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Pagination */}
      <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:32}}>
        {Array.from({length: totalPages}, (_,i)=>(
          <button key={i} onClick={()=>setPage(i+1)} style={{background:page===i+1?'#b87b2a':'#fff',color:page===i+1?'#fff':'#b87b2a',border:'1.5px solid #b87b2a',borderRadius:8,padding:'8px 18px',fontWeight:700,fontSize:15,cursor:'pointer'}}>{i+1}</button>
        ))}
      </div>
      {/* Modal Προσθήκης/Επεξεργασίας */}
      {showModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',overflow:'auto'}} onClick={closeModal}>
          <div style={{background:'#fff',borderRadius:18,padding:0,minWidth:400,maxWidth:900,width:'98%',boxShadow:'0 8px 48px #b87b2a22',position:'relative',display:'flex',flexDirection:'column',maxHeight:'95vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:900,fontSize:24,color:'#b87b2a',padding:'36px 40px 0 40px',textAlign:'center',letterSpacing:0.5}}>{editProduct ? 'Επεξεργασία Προϊόντος' : 'Προσθήκη Προϊόντος'}</div>
            <div style={{borderTop:'1.5px solid #f6c77a',margin:'24px 0 0 0'}} />
            <form style={{display:'flex',flexDirection:'column',gap:18,alignItems:'stretch',padding:'36px 40px'}} onSubmit={e=>{e.preventDefault();handleSave();}}>
              <div style={{display:'flex',flexDirection:'column',gap:18}}>
                <label style={{fontWeight:700}}>Κατηγορία</label>
                <select value={category} onChange={e=>setCategory(e.target.value)} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}}>
                  {categories.map(c=>(<option key={c}>{c}</option>))}
                </select>
                <label style={{fontWeight:700}}>Τίτλος</label>
                <input type="text" placeholder="Όνομα" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}} />
                <label style={{fontWeight:700}}>SKU</label>
                <input type="text" placeholder="SKU" value={form.sku} onChange={e=>setForm(f=>({...f,sku:e.target.value}))} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}} />
                <label style={{fontWeight:700}}>Μάρκα</label>
                <select value={brand} onChange={e=>setBrand(e.target.value)} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}}>
                  {brands.map(b=>(<option key={b}>{b}</option>))}
                  <option value="custom">Άλλη (γράψε)</option>
                </select>
                {brand==='custom' && <input type="text" placeholder="Μάρκα" value={customBrand} onChange={e=>setCustomBrand(e.target.value)} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}} />}
                <div style={{display:'flex',gap:16}}>
                  <div style={{flex:1}}>
                    <label style={{fontWeight:700}}>Αρχική Τιμή</label>
                    <input type="number" placeholder="Αρχική Τιμή (€)" value={form.old_price} onChange={e=>setForm(f=>({...f,old_price:e.target.value}))} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}} />
                  </div>
                  <div style={{flex:1}}>
                    <label style={{fontWeight:700}}>Τιμή Προσφοράς</label>
                    <input type="number" placeholder="Τιμή Προσφοράς (€)" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}} />
                  </div>
                </div>
                <div style={{display:'flex',gap:16}}>
                  <div style={{flex:1}}>
                    <label style={{fontWeight:700}}>Απόθεμα</label>
                    <input type="number" placeholder="Απόθεμα" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}} />
                  </div>
                  <div style={{flex:1}}>
                    <label style={{fontWeight:700}}>Υποκατηγορία/Φύλο</label>
                    <select value={form.subcategory} onChange={e=>setForm(f=>({...f,subcategory:e.target.value}))} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}}>
                      <option value="">Επιλογή</option>
                      <option value="Γυναικεία">Γυναικεία</option>
                      <option value="Ανδρικά">Ανδρικά</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                </div>
                <label style={{fontWeight:700}}>Μεγέθη</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {availableSizes.map(size => (
                    <label key={size} style={{display:'flex',alignItems:'center',gap:4}}>
                      <input type="checkbox" checked={sizes.includes(size)} onChange={()=>handleSizeToggle(size)} /> {size}
                    </label>
                  ))}
                </div>
                <label style={{fontWeight:700}}>Χρώμα</label>
                <select value={color} onChange={e=>setColor(e.target.value)} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}}>
                  {colors.map(c=>(<option key={c}>{c}</option>))}
                  <option value="custom">Άλλο (γράψε)</option>
                </select>
                {color==='custom' && <input type="text" placeholder="Χρώμα" value={customColor} onChange={e=>setCustomColor(e.target.value)} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}} />}
                <label style={{fontWeight:700}}>Κατάσταση</label>
                <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}}>
                  <option>Ενεργό</option>
                  <option>Ανενεργό</option>
                </select>
                {/* Gallery, Περιγραφή, Κουμπιά στο τέλος - ΠΑΝΤΑ ΟΡΑΤΑ */}
                <div style={{background:'#fff6ec',padding:'24px 0 0 0',borderRadius:12,marginTop:8}}>
                  <label style={{fontWeight:700,marginTop:8}}>Gallery εικόνες</label>
                  <input type="file" accept="image/*" multiple ref={galleryInputRef} style={{marginBottom:8}} onChange={handleGalleryChange} />
                  {galleryPreviews.length > 0 && (
                    <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap',justifyContent:'center'}}>
                      {galleryPreviews.map((img,i)=>(
                        <div key={i} style={{position:'relative',display:'inline-block'}}>
                          <img src={img} alt="gallery" style={{width:54,height:54,objectFit:'cover',borderRadius:8,boxShadow:'0 2px 8px #b87b2a22'}} />
                          <button type="button" onClick={()=>removeGalleryImage(i)} style={{position:'absolute',top:-8,right:-8,background:'#b82a2a',color:'#fff',border:'none',borderRadius:'50%',width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,cursor:'pointer',fontSize:15,lineHeight:1,padding:0}} title="Αφαίρεση">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label style={{fontWeight:700,marginTop:12}}>Περιγραφή</label>
                  <textarea placeholder="Περιγραφή" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16,minHeight:100,width:'100%',marginBottom:8}} />
                  {error && <div style={{color:'#b82a2a',fontWeight:700,textAlign:'center',marginTop:8}}>{error}</div>}
                  <div style={{display:'flex',gap:16,marginTop:24,justifyContent:'flex-end'}}>
                    <button type="submit" style={{background:'#4caf50',color:'#fff',border:'none',borderRadius:10,padding:'12px 32px',fontWeight:800,fontSize:17,cursor:'pointer'}} disabled={loading}>{loading ? 'Αποθήκευση...' : 'Αποθήκευση'}</button>
                    <button type="button" onClick={closeModal} style={{background:'#b82a2a',color:'#fff',border:'none',borderRadius:10,padding:'12px 32px',fontWeight:800,fontSize:17,cursor:'pointer'}}>Άκυρο</button>
                  </div>
                </div>
                {/* 4. Στη φόρμα, πρόσθεσε τα checkbox */}
                <div style={{background:'#fff6ec',padding:'24px 0 0 0',borderRadius:12,marginTop:8}}>
                  <label style={{fontWeight:700,marginTop:8}}>Εμφάνιση σε:</label>
                  <div style={{display:'flex',gap:16,marginBottom:8}}>
                    <label style={{display:'flex',alignItems:'center',gap:4}}>
                      <input type="checkbox" checked={carousels.includes('popular')} onChange={e=>setCarousels(c=>e.target.checked?[...c,'popular']:c.filter(x=>x!=='popular'))} /> Δημοφιλή
                    </label>
                    <label style={{display:'flex',alignItems:'center',gap:4}}>
                      <input type="checkbox" checked={carousels.includes('offer')} onChange={e=>setCarousels(c=>e.target.checked?[...c,'offer']:c.filter(x=>x!=='offer'))} /> Σε έκπτωση
                    </label>
                    <label style={{display:'flex',alignItems:'center',gap:4}}>
                      <input type="checkbox" checked={carousels.includes('new')} onChange={e=>setCarousels(c=>e.target.checked?[...c,'new']:c.filter(x=>x!=='new'))} /> Νέα προϊόντα
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 