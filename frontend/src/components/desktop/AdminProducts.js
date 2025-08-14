import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const statusColors = {
  'Ενεργό': '#4caf50',
  'Ανενεργό': '#b82a2a',
};
// Κατηγορίες θα φορτώνονται από τη βάση
const defaultCategories = ['Παπούτσια', 'Τσάντες', 'Παντόφλες', 'Αξεσουάρ', 'Ζώνες', 'Κασκόλ', 'Γάντια', 'Σκούφος', 'Πορτοφόλια', 'Μαντήλια', 'Εσάρπες'];
const brands = ['Step in Style', 'Nike', 'Adidas', 'Puma', 'Converse', 'New Balance'];
const colors = ['Λευκό', 'Μαύρο', 'Γκρι', 'Μπλε', 'Κόκκινο', 'Πράσινο', 'Κίτρινο', 'Μπεζ', 'Καφέ', 'Μωβ', 'Ροζ', 'Χρυσό', 'Ασημί', 'Πολύχρωμο'];

// Συνάρτηση για μετατροπή χρωμάτων σε hex codes
const getColorHex = (colorName) => {
  const colorMap = {
    'Λευκό': '#FFFFFF',
    'Μαύρο': '#000000',
    'Γκρι': '#808080',
    'Μπλε': '#0000FF',
    'Κόκκινο': '#FF0000',
    'Πράσινο': '#008000',
    'Κίτρινο': '#FFFF00',
    'Μπεζ': '#F5F5DC',
    'Καφέ': '#A52A2A',
    'Μωβ': '#800080',
    'Ροζ': '#FFC0CB',
    'Χρυσό': '#FFD700',
    'Ασημί': '#C0C0C0',
    'Πολύχρωμο': '#FF69B4'
  };
  return colorMap[colorName] || '#CCCCCC';
};

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
  const [categories, setCategories] = useState(defaultCategories);
  const [subcategories, setSubcategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Παπούτσια');
  const [subcategory, setSubcategory] = useState('');
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
  const [form, setForm] = useState({ name: '', sku: '', price: '', old_price: '', stock: '', subcategory: '', status: 'Ενεργό', description: '' });
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const galleryInputRef = useRef();
  // 1. State για τα carousels
  const [carousels, setCarousels] = useState([]);
  
  // State για διαχείριση αποθέματος ανά μέγεθος
  const [inventory, setInventory] = useState({});
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedProductForInventory, setSelectedProductForInventory] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState(null);

  // Fetch categories and subcategories from Supabase
  const fetchCategories = async () => {
    try {
      // Φόρτωση κατηγοριών
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug, description, display_order')
        .eq('is_active', true)
        .order('display_order');
      
      if (categoriesError) {
        console.error('Σφάλμα κατά τη φόρτωση κατηγοριών:', categoriesError);
        setCategories(defaultCategories);
      } else {
        const categoryNames = categoriesData.map(cat => cat.name);
        setCategories(categoryNames);
      }
      
      // Φόρτωση υποκατηγοριών
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select(`
          id, 
          name, 
          display_order,
          categories!inner(id, name)
        `)
        .eq('is_active', true)
        .order('display_order');
      
      if (subcategoriesError) {
        console.error('Σφάλμα κατά τη φόρτωση υποκατηγοριών:', subcategoriesError);
        setSubcategories([]);
      } else {
        setSubcategories(subcategoriesData || []);
      }
    } catch (err) {
      console.error('Σφάλμα κατά τη φόρτωση κατηγοριών:', err);
      setCategories(defaultCategories);
      setSubcategories([]);
    }
  };

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
  
  useEffect(() => { 
    fetchCategories();
    fetchProducts(); 
  }, []);

  // Συναρτήσεις για διαχείριση αποθέματος ανά μέγεθος
  const fetchInventory = async (productId) => {
    try {
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('product_id', productId)
        .order('size');
      
      if (error) throw error;
      
      const inventoryMap = {};
      data.forEach(item => {
        inventoryMap[item.size] = item.quantity;
      });
      return inventoryMap;
    } catch (err) {
      console.error('Σφάλμα κατά τη φόρτωση αποθέματος:', err);
      return {};
    }
  };

  const openInventoryModal = async (product) => {
    setSelectedProductForInventory(product);
    const inventoryData = await fetchInventory(product.id);
    setInventory(inventoryData);
    setShowInventoryModal(true);
  };

  const closeInventoryModal = () => {
    setShowInventoryModal(false);
    setSelectedProductForInventory(null);
    setInventory({});
  };

  const openProductModal = async (product) => {
    setSelectedProductForView(product);
    setShowProductModal(true);
    
    // Φόρτωση αποθέματος για το προϊόν
    try {
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('product_id', product.id)
        .order('size');
      
      if (error) throw error;
      
      const inventoryMap = {};
      data.forEach(item => {
        inventoryMap[item.size] = item.quantity;
      });
      setInventory(inventoryMap);
    } catch (err) {
      console.error('Σφάλμα κατά τη φόρτωση αποθέματος:', err);
      setInventory({});
    }
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProductForView(null);
    setInventory({});
  };

  const updateInventory = async () => {
    if (!selectedProductForInventory) return;
    
    setLoading(true);
    try {
      // Διαγραφή υπάρχοντος αποθέματος
      await supabase
        .from('product_inventory')
        .delete()
        .eq('product_id', selectedProductForInventory.id);
      
      // Εισαγωγή νέου αποθέματος
      const inventoryEntries = Object.entries(inventory)
        .filter(([size, quantity]) => quantity > 0)
        .map(([size, quantity]) => ({
          product_id: selectedProductForInventory.id,
          size: size,
          quantity: parseInt(quantity)
        }));
      
      if (inventoryEntries.length > 0) {
        const { error } = await supabase
          .from('product_inventory')
          .insert(inventoryEntries);
        
        if (error) throw error;
      }
      
      closeInventoryModal();
      
      // Ανανέωση λίστας προϊόντων για να ενημερωθεί η μπάρα αποθέματος
      await fetchProducts();
      
      // Ενημέρωση του προϊόντος στη λίστα με το νέο total_stock
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === selectedProductForInventory.id 
            ? { ...p, total_stock: Object.values(inventory).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0) }
            : p
        )
      );
    } catch (err) {
      setError('Σφάλμα κατά την ενημέρωση αποθέματος: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryChange = (size, quantity) => {
    setInventory(prev => ({
      ...prev,
      [size]: parseInt(quantity) || 0
    }));
  };

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
        subcategory: product.subcategory || '',
        status: product.status || 'Ενεργό',
        description: product.description || ''
      });
      setCategory(product.category || 'Παπούτσια');
      setSubcategory(product.subcategory || '');
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
      setGalleryFiles([]); // Καθάρισε τα νέα αρχεία όταν κάνεις edit
      // 2. Στο openModal, όταν κάνεις edit, διάβασε το carousels
      setCarousels(Array.isArray(product.carousels) ? product.carousels : (typeof product.carousels === 'string' ? [product.carousels] : []));
    } else {
      setForm({ name: '', sku: '', price: '', old_price: '', stock: '', subcategory: '', status: 'Ενεργό', description: '' });
      setCategory('Παπούτσια');
      setSubcategory('');
      setBrand('Step in Style');
      setCustomBrand('');
      setColor('Λευκό');
      setCustomColor('');
      setSizes([]);
      setGalleryPreviews([]);
      setGalleryFiles([]);
      setCarousels([]);
    }
    setError('');
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditProduct(null);
    setForm({ name: '', sku: '', price: '', old_price: '', stock: '', subcategory: '', status: 'Ενεργό', description: '' });
    setCategory('Παπούτσια');
    setSubcategory('');
    setBrand('Step in Style');
    setCustomBrand('');
    setColor('Λευκό');
    setCustomColor('');
    setSizes([]);
    setGalleryPreviews([]);
    setGalleryFiles([]);
    setCarousels([]);
    setError('');
  };

  // Add/Edit product (Supabase)
  const handleSave = async () => {
    if (!form.name || !form.sku || !brand || !form.price || !category) {
      setError('Συμπλήρωσε όλα τα υποχρεωτικά πεδία!');
      return;
    }
    
    // Έλεγχος για εικόνες: μόνο για νέα προϊόντα
    if (!editProduct && galleryFiles.length === 0 && galleryPreviews.length === 0) {
      setError('Πρόσθεσε τουλάχιστον μία εικόνα!');
      return;
    }
    
    setLoading(true);
    setError('');
    let supabaseError = null;
    let galleryUrls = [];
    
    try {
      // Upload νέες εικόνες στο Supabase Storage
      for (let file of galleryFiles) {
        const url = await uploadImageToSupabase(file);
        galleryUrls.push(url);
      }
    } catch (err) {
      setError('Σφάλμα upload εικόνας: ' + err.message);
      setLoading(false);
      return;
    }
    
    // Συνδυασμός νέων και υπάρχουσων εικόνων
    const finalGalleryUrls = [...galleryUrls, ...galleryPreviews];
    
    // Prepare data
    const dataToSave = {
      name: form.name,
      sku: form.sku,
      brand: brand === 'custom' ? customBrand : brand,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      ...(editProduct ? {} : { stock: Number(form.stock) || 0 }), // Μόνο για νέα προϊόντα
      category,
      subcategory: subcategory || form.subcategory,
      status: form.status,
      color: color === 'custom' ? customColor : color,
      description: form.description,
      image_url: finalGalleryUrls[0] || (editProduct ? editProduct.image_url : ''),
      gallery: finalGalleryUrls,
      sizes: sizes.join(','),
      carousels,
    };
    
    console.log('Data to save:', dataToSave);
    console.log('Edit mode:', !!editProduct);
    if (editProduct) {
      console.log('Updating product ID:', editProduct.id);
      const { error } = await supabase
        .from('products')
        .update(dataToSave)
        .eq('id', editProduct.id);
      if (error) {
        supabaseError = error;
        setError('Σφάλμα ενημέρωσης προϊόντος: ' + error.message);
        console.error('Supabase update error:', error);
      } else {
        console.log('Product updated successfully!');
      }
    } else {
      console.log('Inserting new product');
      const { error } = await supabase
        .from('products')
        .insert([dataToSave]);
      if (error) {
        supabaseError = error;
        setError('Σφάλμα προσθήκης προϊόντος: ' + error.message);
        console.error('Supabase insert error:', error);
      } else {
        console.log('Product inserted successfully!');
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
    setGalleryFiles(prevFiles => [...prevFiles, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  // Επιλογή μεγεθών (multi-select)
  const handleSizeToggle = size => {
    setSizes(sizes => sizes.includes(size) ? sizes.filter(s => s !== size) : [...sizes, size]);
  };

  // Προσθήκη function για αφαίρεση εικόνας
  function removeGalleryImage(index) {
    // Αν η εικόνα είναι από τα νέα αρχεία
    if (index < galleryFiles.length) {
      setGalleryFiles(files => files.filter((_, i) => i !== index));
    } else {
      // Αν η εικόνα είναι από τις υπάρχουσες εικόνες
      const adjustedIndex = index - galleryFiles.length;
      setGalleryPreviews(previews => previews.filter((_, i) => i !== adjustedIndex));
    }
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
                onClick={() => openProductModal(p)}
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
                      <div style={{width:`${Math.min(100,Math.round(((p.total_stock || p.stock || 0)/10)*100))}%`,height:'100%',background:(p.total_stock || p.stock || 0)===0?'#b82a2a':(p.total_stock || p.stock || 0)<=3?'#f6c77a':'#4caf50',borderRadius:8,transition:'width 0.3s'}}></div>
                    </div>
                    <span style={{fontWeight:700,color:(p.total_stock || p.stock || 0)===0?'#b82a2a':(p.total_stock || p.stock || 0)<=3?'#b87b2a':'#4caf50',fontSize:15}}>{p.total_stock || p.stock || 0}</span>
                  </div>
                </td>
                <td style={{padding:'14px 0'}}>{p.category}</td>
                <td style={{padding:'14px 0'}}><span style={{background:statusColors[p.status],color:'#fff',borderRadius:8,padding:'4px 10px',fontWeight:700,fontSize:14}}>{p.status}</span></td>
                <td style={{padding:'14px 0',textAlign:'center'}}>
                  <button onClick={(e) => {e.stopPropagation(); openModal(p);}} style={{background:'#f6c77a',color:'#7a4a1a',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:15,cursor:'pointer',marginRight:8}}>Επεξεργασία</button>
                  <button onClick={(e) => {e.stopPropagation(); openInventoryModal(p);}} style={{background:'#4caf50',color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:15,cursor:'pointer',marginRight:8}}>Απόθεμα</button>
                  <button onClick={(e) => {e.stopPropagation(); handleDelete(p.id);}} style={{background:'#b82a2a',color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontWeight:700,fontSize:15,cursor:'pointer'}}>Διαγραφή</button>
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
                  {!editProduct && (
                    <div style={{flex:1}}>
                      <label style={{fontWeight:700}}>Απόθεμα</label>
                      <input type="number" placeholder="Απόθεμα" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}} />
                    </div>
                  )}
                  <div style={{flex:1}}>
                    <label style={{fontWeight:700}}>Υποκατηγορία/Φύλο</label>
                    <select value={subcategory} onChange={e=>setSubcategory(e.target.value)} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16}}>
                      <option value="">Επιλογή</option>
                      {category === 'Αξεσουάρ' ? (
                        subcategories
                          .filter(sub => sub.categories.name === 'Αξεσουάρ')
                          .map(subcategory => (
                            <option key={subcategory.name} value={subcategory.name}>
                              {subcategory.name}
                            </option>
                          ))
                      ) : (
                        <>
                          <option value="Γυναικεία">Γυναικεία</option>
                          <option value="Ανδρικά">Ανδρικά</option>
                          <option value="Unisex">Unisex</option>
                        </>
                      )}
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
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                  <select value={color} onChange={e=>setColor(e.target.value)} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16,flex:1}}>
                    {colors.map(c=>(<option key={c}>{c}</option>))}
                    <option value="custom">Άλλο (γράψε)</option>
                  </select>
                  {color !== 'custom' && (
                    <div 
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: getColorHex(color),
                        border: '3px solid #f6c77a',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      title={color}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        e.target.querySelector('span').style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        e.target.querySelector('span').style.opacity = '0';
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        bottom: -25,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#7a4a1a',
                        whiteSpace: 'nowrap',
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        pointerEvents: 'none'
                      }}>
                        {color}
                      </span>
                    </div>
                  )}
                </div>
                {color==='custom' && (
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <input type="text" placeholder="Χρώμα" value={customColor} onChange={e=>setCustomColor(e.target.value)} style={{padding:'12px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16,flex:1}} />
                    {customColor && (
                      <div 
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: '#CCCCCC',
                          border: '3px solid #f6c77a',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        title={customColor}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                      />
                    )}
                  </div>
                )}
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
      
      {/* Modal Διαχείρισης Αποθέματος */}
      {showInventoryModal && selectedProductForInventory && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',overflow:'auto'}} onClick={closeInventoryModal}>
          <div style={{background:'#fff',borderRadius:18,padding:0,minWidth:500,maxWidth:800,width:'98%',boxShadow:'0 8px 48px #b87b2a22',position:'relative',display:'flex',flexDirection:'column',maxHeight:'95vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:900,fontSize:24,color:'#b87b2a',padding:'36px 40px 0 40px',textAlign:'center',letterSpacing:0.5}}>
              Διαχείριση Αποθέματος - {selectedProductForInventory.name}
            </div>
            <div style={{borderTop:'1.5px solid #f6c77a',margin:'24px 0 0 0'}} />
            
            <div style={{padding:'36px 40px'}}>
              <div style={{background:'#fff6ec',padding:20,borderRadius:12,marginBottom:24}}>
                <div style={{fontWeight:700,color:'#b87b2a',marginBottom:8}}>Πληροφορίες Προϊόντος:</div>
                <div><strong>SKU:</strong> {selectedProductForInventory.sku}</div>
                <div><strong>Κατηγορία:</strong> {selectedProductForInventory.category}</div>
                <div><strong>Μεγέθη:</strong> {selectedProductForInventory.sizes || 'Μία'}</div>
                {selectedProductForInventory.color && (
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <strong>Χρώμα:</strong> 
                    <div 
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: getColorHex(selectedProductForInventory.color),
                        border: '2px solid #f6c77a',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      title={selectedProductForInventory.color}
                    />
                    <span>{selectedProductForInventory.color}</span>
                  </div>
                )}
              </div>
              
              <div style={{marginBottom:24}}>
                <label style={{fontWeight:700,display:'block',marginBottom:12}}>Απόθεμα ανά μέγεθος (αριθμός ζευγαριών):</label>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {selectedProductForInventory.sizes && selectedProductForInventory.sizes.includes(',') ? (
                    // Για παπούτσια με πολλαπλά μεγέθη
                    selectedProductForInventory.sizes.split(',').map(size => (
                      <div key={size.trim()} style={{display:'flex',alignItems:'center',gap:16}}>
                        <label style={{fontWeight:600,color:'#b87b2a',minWidth:'80px'}}>Μέγεθος {size.trim()}:</label>
                        <input 
                          type="number" 
                          min="0"
                          value={inventory[size.trim()] || 0}
                          onChange={(e) => handleInventoryChange(size.trim(), e.target.value)}
                          style={{padding:'10px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16,width:'120px'}}
                          placeholder="0"
                        />
                        <span style={{color:'#666',fontSize:14}}>ζεύγη</span>
                        {(inventory[size.trim()] || 0) > 0 && (
                          <span style={{color:'#4caf50',fontWeight:600,fontSize:14}}>✓ Διαθέσιμο</span>
                        )}
                      </div>
                    ))
                  ) : (
                    // Για προϊόντα με ένα μέγεθος (ζώνες, τσάντες, κλπ)
                    <div style={{display:'flex',alignItems:'center',gap:16}}>
                      <label style={{fontWeight:600,color:'#b87b2a',minWidth:'80px'}}>Ποσότητα:</label>
                      <input 
                        type="number" 
                        min="0"
                        value={inventory['Μία'] || 0}
                        onChange={(e) => handleInventoryChange('Μία', e.target.value)}
                        style={{padding:'10px',borderRadius:8,border:'1.5px solid #f6c77a',fontSize:16,width:'120px'}}
                        placeholder="0"
                      />
                      <span style={{color:'#666',fontSize:14}}>τεμάχια</span>
                    </div>
                  )}
                </div>
                <div style={{background:'#fff6ec',padding:12,borderRadius:8,marginTop:12}}>
                  <div style={{fontWeight:600,color:'#b87b2a',marginBottom:4}}>💡 Σημείωση:</div>
                  <div style={{fontSize:14,color:'#666'}}>
                    Βάλε τον ακριβή αριθμό ζευγαριών για κάθε μέγεθος. 
                    <br/>π.χ. 3 ζεύγη 36, 4 ζεύγη 37, 0 ζεύγη 38 (δεν έχουμε)
                  </div>
                </div>
              </div>
              
              <div style={{display:'flex',gap:16,justifyContent:'flex-end'}}>
                <button 
                  onClick={updateInventory} 
                  style={{background:'#4caf50',color:'#fff',border:'none',borderRadius:10,padding:'12px 32px',fontWeight:800,fontSize:17,cursor:'pointer'}} 
                  disabled={loading}
                >
                  {loading ? 'Αποθήκευση...' : 'Αποθήκευση Αποθέματος'}
                </button>
                <button 
                  onClick={closeInventoryModal} 
                  style={{background:'#b82a2a',color:'#fff',border:'none',borderRadius:10,padding:'12px 32px',fontWeight:800,fontSize:17,cursor:'pointer'}}
                >
                  Άκυρο
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Προβολής Προϊόντος */}
      {showProductModal && selectedProductForView && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',overflow:'auto'}} onClick={closeProductModal}>
          <div style={{background:'#fff',borderRadius:18,padding:0,minWidth:600,maxWidth:900,width:'98%',boxShadow:'0 8px 48px #b87b2a22',position:'relative',display:'flex',flexDirection:'column',maxHeight:'95vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:900,fontSize:24,color:'#b87b2a',padding:'36px 40px 0 40px',textAlign:'center',letterSpacing:0.5}}>
              Πληροφορίες Προϊόντος - {selectedProductForView.name}
            </div>
            <div style={{borderTop:'1.5px solid #f6c77a',margin:'24px 0 0 0'}} />
            
            <div style={{padding:'36px 40px'}}>
              {/* Εικόνα και βασικές πληροφορίες */}
              <div style={{display:'flex',gap:32,marginBottom:32}}>
                <div style={{flex:'0 0 200px'}}>
                  <img 
                    src={selectedProductForView.image_url} 
                    alt={selectedProductForView.name} 
                    style={{width:'100%',height:200,objectFit:'cover',borderRadius:12,boxShadow:'0 4px 16px #b87b2a22'}}
                  />
                </div>
                <div style={{flex:1}}>
                  <h2 style={{fontSize:28,fontWeight:900,color:'#b87b2a',marginBottom:16}}>{selectedProductForView.name}</h2>
                  <div style={{display:'flex',flexDirection:'column',gap:8,fontSize:16}}>
                    <div><strong>SKU:</strong> {selectedProductForView.sku}</div>
                    <div><strong>Μάρκα:</strong> {selectedProductForView.brand}</div>
                    <div><strong>Κατηγορία:</strong> {selectedProductForView.category}</div>
                    {selectedProductForView.subcategory && <div><strong>Υποκατηγορία:</strong> {selectedProductForView.subcategory}</div>}
                    <div><strong>Τιμή:</strong> {selectedProductForView.price}€</div>
                    {selectedProductForView.old_price && <div><strong>Παλιά Τιμή:</strong> <span style={{textDecoration:'line-through',color:'#b82a2a'}}>{selectedProductForView.old_price}€</span></div>}
                    {selectedProductForView.color && (
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <strong>Χρώμα:</strong> 
                        <div 
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: getColorHex(selectedProductForView.color),
                            border: '2px solid #f6c77a',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          title={selectedProductForView.color}
                        />
                        <span>{selectedProductForView.color}</span>
                      </div>
                    )}
                    <div><strong>Κατάσταση:</strong> <span style={{background:statusColors[selectedProductForView.status],color:'#fff',borderRadius:6,padding:'4px 8px',fontWeight:700,fontSize:14}}>{selectedProductForView.status}</span></div>
                  </div>
                </div>
              </div>

              {/* Απόθεμα ανά μέγεθος */}
              <div style={{background:'#fff6ec',padding:24,borderRadius:12,marginBottom:24}}>
                <h3 style={{fontSize:20,fontWeight:800,color:'#b87b2a',marginBottom:16}}>Απόθεμα ανά μέγεθος:</h3>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {selectedProductForView.sizes && selectedProductForView.sizes !== 'Μία' ? (
                    selectedProductForView.sizes.split(',').map(size => {
                      const quantity = inventory[size.trim()] || 0;
                      return quantity > 0 ? (
                        <div key={size.trim()} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f6c77a33'}}>
                          <span style={{fontWeight:600,color:'#b87b2a'}}>Μέγεθος {size.trim()}</span>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{width:60,height:8,background:'#e5d6c7',borderRadius:4,overflow:'hidden'}}>
                              <div style={{width:`${Math.min(100,Math.round((quantity/10)*100))}%`,height:'100%',background:quantity<=3?'#f6c77a':'#4caf50',borderRadius:4}}></div>
                            </div>
                            <span style={{fontWeight:700,color:quantity<=3?'#b87b2a':'#4caf50',minWidth:30,textAlign:'right'}}>{quantity}</span>
                            <span style={{color:'#666',fontSize:14}}>ζεύγη</span>
                          </div>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}>
                      <span style={{fontWeight:600,color:'#b87b2a'}}>Ποσότητα</span>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:60,height:8,background:'#e5d6c7',borderRadius:4,overflow:'hidden'}}>
                          <div style={{width:`${Math.min(100,Math.round(((inventory['Μία'] || 0)/10)*100))}%`,height:'100%',background:(inventory['Μία'] || 0)===0?'#b82a2a':(inventory['Μία'] || 0)<=3?'#f6c77a':'#4caf50',borderRadius:4}}></div>
                        </div>
                        <span style={{fontWeight:700,color:(inventory['Μία'] || 0)===0?'#b82a2a':(inventory['Μία'] || 0)<=3?'#b87b2a':'#4caf50',minWidth:30,textAlign:'right'}}>{inventory['Μία'] || 0}</span>
                        <span style={{color:'#666',fontSize:14}}>τεμάχια</span>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{marginTop:16,padding:12,background:'#fff',borderRadius:8,border:'1px solid #f6c77a'}}>
                  <div style={{fontWeight:600,color:'#b87b2a',marginBottom:4}}>📊 Σύνολο αποθέματος:</div>
                  <div style={{fontSize:18,fontWeight:700,color:'#4caf50'}}>
                    {Object.values(inventory).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0)} {selectedProductForView.sizes && selectedProductForView.sizes !== 'Μία' ? 'ζεύγη' : 'τεμάχια'}
                  </div>
                </div>
              </div>

              {/* Περιγραφή */}
              {selectedProductForView.description && (
                <div style={{marginBottom:24}}>
                  <h3 style={{fontSize:20,fontWeight:800,color:'#b87b2a',marginBottom:12}}>Περιγραφή:</h3>
                  <div style={{background:'#fff6ec',padding:16,borderRadius:8,lineHeight:1.6}}>
                    {selectedProductForView.description}
                  </div>
                </div>
              )}

              {/* Κουμπιά ενεργειών */}
              <div style={{display:'flex',gap:16,justifyContent:'center'}}>
                <button 
                  onClick={(e) => {e.stopPropagation(); closeProductModal(); openModal(selectedProductForView);}} 
                  style={{background:'#f6c77a',color:'#7a4a1a',border:'none',borderRadius:10,padding:'12px 32px',fontWeight:800,fontSize:17,cursor:'pointer'}}
                >
                  ✏️ Επεξεργασία
                </button>
                <button 
                  onClick={(e) => {e.stopPropagation(); closeProductModal(); openInventoryModal(selectedProductForView);}} 
                  style={{background:'#4caf50',color:'#fff',border:'none',borderRadius:10,padding:'12px 32px',fontWeight:800,fontSize:17,cursor:'pointer'}}
                >
                  📦 Διαχείριση Αποθέματος
                </button>
                <button 
                  onClick={closeProductModal} 
                  style={{background:'#666',color:'#fff',border:'none',borderRadius:10,padding:'12px 32px',fontWeight:800,fontSize:17,cursor:'pointer'}}
                >
                  ✕ Κλείσιμο
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 