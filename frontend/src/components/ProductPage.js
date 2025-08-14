import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductPage.css';
// import { ProductsContext } from './desktop/App';
import Slider from 'react-slick';
import { ProductCardWithLogo } from './desktop/App';
import { useCart } from '../CartContext';
import { supabase } from '../supabaseClient';

export default function ProductPage({ productId: propProductId }) {
  const { productId } = useParams();
  // const { mockProducts } = useContext(ProductsContext);
  const mockProducts = []; // Temporary empty array
  const id = Number(propProductId || productId);
  
  // State για το προϊόν από τη βάση δεδομένων
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [mainImg, setMainImg] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeTab, setActiveTab] = useState('desc');
  const [inventory, setInventory] = useState({});
  const { addToCart } = useCart();

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

  // Φόρτωση προϊόντος από τη βάση δεδομένων
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        setError('Το προϊόν δεν βρέθηκε');
        setLoading(false);
        return;
      }
      
      // Μετατροπή σε format συμβατό με το υπάρχον κώδικα
      const transformedProduct = {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        priceDisplay: `${data.price}€`,
        oldPrice: data.old_price !== null && data.old_price !== undefined && data.old_price !== '' ? Number(data.old_price) : null,
        oldPriceDisplay: data.old_price !== null && data.old_price !== undefined && data.old_price !== '' ? `${data.old_price}€` : null,
        image: data.image_url,
        brand: data.brand,
        category: data.category,
        subcategory: data.subcategory,
        sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()) : ['36', '37', '38', '39', '40', '41'],
        sku: data.sku,
        material: data.material,
        color: data.color,
        available: data.available,
        description: data.description,
        care: data.care_instructions || 'Φρόντισε το προϊόν σου με φροντίδα.',
        returns: 'Δωρεάν επιστροφή εντός 14 ημερών.',
        rating: data.rating || 4.5,
        images: data.gallery ? (Array.isArray(data.gallery) ? data.gallery : [data.image_url]) : [data.image_url],
        stock: data.total_stock || data.stock || 0,
        hasStock: (data.total_stock || data.stock || 0) > 0,
        carousels: Array.isArray(data.carousels) ? data.carousels : []
      };
      
      setProduct(transformedProduct);
      setMainImg(transformedProduct.images[0]);
      
    } catch (err) {
      console.error('Σφάλμα κατά τη φόρτωση προϊόντος:', err);
      setError('Σφάλμα κατά τη φόρτωση προϊόντος');
    } finally {
      setLoading(false);
    }
  };

  // Συνάρτηση για φόρτωση αποθέματος
  const fetchInventory = async () => {
    if (!product) return;
    
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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchInventory();
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      // Reset states όταν αλλάζει το προϊόν
      setSelectedSize(null);
      setSelectedColor(product.color || null);
      setActiveTab('desc');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

  // Auto-select μοναδικό μέγεθος όταν φορτώνει το inventory
  useEffect(() => {
    if (product && Object.keys(inventory).length > 0) {
      let sizesArray = [];
      if (product.sizes) {
        if (typeof product.sizes === 'string') {
          sizesArray = product.sizes.split(',');
        } else if (Array.isArray(product.sizes)) {
          sizesArray = product.sizes;
        }
      }
      
      // Αν υπάρχει μόνο ένα διαθέσιμο μέγεθος, κάνε auto-select
      const availableSizes = Object.keys(inventory).filter(size => inventory[size] > 0);
      if (availableSizes.length === 1 && !selectedSize) {
        setSelectedSize(availableSizes[0]);
      }
    }
  }, [inventory, product, selectedSize]);

  // Προτεινόμενα: 3 άλλα προϊόντα από τη βάση
  const [suggested, setSuggested] = useState([]);
  
  useEffect(() => {
    const fetchSuggested = async () => {
      if (!product) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .neq('id', product.id)
          .limit(3)
          .order('id', { ascending: false });
        
        if (error) throw error;
        
                 const transformedSuggested = data.map(item => ({
           id: item.id,
           name: item.name,
           price: Number(item.price),
           priceDisplay: `${item.price}€`,
           oldPrice: item.old_price !== null && item.old_price !== undefined && item.old_price !== '' ? Number(item.old_price) : null,
           oldPriceDisplay: item.old_price !== null && item.old_price !== undefined && item.old_price !== '' ? `${item.old_price}€` : null,
           image: item.image_url,
           brand: item.brand,
           category: item.category,
           subcategory: item.subcategory,
           sizes: item.sizes ? item.sizes.split(',').map(s => s.trim()) : ['36', '37', '38', '39', '40', '41'],
           sku: item.sku,
           material: item.material,
           color: item.color,
           available: item.available,
           description: item.description,
           care: item.care_instructions || 'Φρόντισε το προϊόν σου με φροντίδα.',
           returns: 'Δωρεάν επιστροφή εντός 14 ημερών.',
           rating: item.rating || 4.5,
           images: item.gallery ? (Array.isArray(item.gallery) ? item.gallery : [item.image_url]) : [item.image_url],
           stock: item.total_stock || item.stock || 0,
           hasStock: (item.total_stock || item.stock || 0) > 0,
           carousels: Array.isArray(item.carousels) ? item.carousels : []
         }));
        
        setSuggested(transformedSuggested);
      } catch (err) {
        console.error('Σφάλμα κατά τη φόρτωση προτεινόμενων:', err);
        setSuggested([]);
      }
    };
    
    fetchSuggested();
  }, [product]);

  if (loading) {
    return <div style={{padding: 40, textAlign: 'center', color: '#b87b2a', fontWeight: 700, fontSize: 20}}>Φόρτωση προϊόντος...</div>;
  }

  if (error || !product) {
    return <div style={{padding: 40, textAlign: 'center', color: '#b82a2a', fontWeight: 700, fontSize: 20}}>{error || 'Το προϊόν δεν βρέθηκε.'}</div>;
  }

  return (
    <div className="product-hero-bg">
      <div className="product-hero-overlay" />
      <div className="product-main-bigcard">
                 <div className="product-main-bigcard-flex">
           {/* Gallery */}
          <div className="product-gallery-vertical">
            <div className="product-thumbs-vertical">
              {product.images.map((img, i) => (
                <img key={i} src={img} alt="thumb" className={`thumb${mainImg===img?' selected':''}`} onClick={()=>setMainImg(img)} />
              ))}
            </div>
            <div className="product-mainimg-hero">
              <img src={mainImg} alt={product.name} />
            </div>
          </div>
          {/* Info + Tabs */}
          <div className="product-info-floating-card">
            <div className="product-brand-badge">{product.brand}</div>
            <h1 className="product-title-hero">{product.name}</h1>
                         <div className="product-meta-hero">
               <span>SKU: {product.sku}</span>
               <span className={(() => {
                 // Έλεγχος διαθεσιμότητας από το νέο σύστημα αποθέματος
                 const totalAvailable = Object.values(inventory).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
                 return totalAvailable > 0 ? 'in-stock' : 'out-stock';
               })()}>
                 {(() => {
                   const totalAvailable = Object.values(inventory).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
                   return totalAvailable > 0 ? 'Άμεσα διαθέσιμο' : 'Μη διαθέσιμο';
                 })()}
               </span>
             </div>
                         <div className="product-price-hero">
               {product.oldPriceDisplay && (
                 <span style={{textDecoration:'line-through',color:'#b82a2a',fontWeight:700,fontSize:22,marginRight:14}}>{product.oldPriceDisplay}</span>
               )}
               <span style={{color:'#b87b2a',fontWeight:900,fontSize:28}}>{product.priceDisplay}</span>
             </div>
             
             {/* Color Picker */}
             {product.color && (
               <div className="product-color-hero">
                 <div style={{fontWeight: 700, marginBottom: 8, color: '#2d1c0b'}}>Χρώμα:</div>
                 <div 
                   className="color-circle"
                   style={{
                     backgroundColor: getColorHex(product.color)
                   }}
                 >
                   <span className="color-name">
                     {product.color}
                   </span>
                 </div>
               </div>
             )}
                                                   {(() => {
                            // Ασφαλής επεξεργασία του sizes
                            let sizesArray = [];
                            if (product.sizes) {
                              if (typeof product.sizes === 'string') {
                                sizesArray = product.sizes.split(',');
                              } else if (Array.isArray(product.sizes)) {
                                sizesArray = product.sizes;
                              }
                            }
                            
                            // Έλεγχος αν υπάρχουν διαθέσιμα μεγέθη
                            const hasAvailableSizes = sizesArray.some(size => (inventory[String(size).trim()] || 0) > 0);
                            
                            // Εμφάνιση μεγεθών μόνο αν υπάρχουν περισσότερα από 1 διαθέσιμα μεγέθη
                            return sizesArray.length > 1 && hasAvailableSizes ? (
                              <div className="product-sizes-hero">
                                <div>Μέγεθος:</div>
                                {sizesArray.map(size => {
                                  const sizeStr = String(size).trim();
                                  const availableQuantity = inventory[sizeStr] || 0;
                                  const isAvailable = availableQuantity > 0;
                                  return isAvailable ? (
                                    <button 
                                      key={sizeStr} 
                                      className={`size-btn-hero${selectedSize===sizeStr?' selected':''}`} 
                                      onClick={()=>setSelectedSize(sizeStr)}
                                      title="Διαθέσιμο"
                                    >
                                      {sizeStr}
                                      <span className="size-stock-indicator">✓</span>
                                    </button>
                                  ) : null;
                                })}
                              </div>
                            ) : null;
                          })()}
                                                                                                                                                                                                                <button 
                              className="add-to-cart-hero" 
                              disabled={(() => {
                                // Έλεγχος αν υπάρχει συνολικό απόθεμα
                                const totalAvailable = Object.values(inventory).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
                                if (totalAvailable === 0) return true; // Απενεργοποιημένο αν δεν υπάρχει απόθεμα
                                
                                // Έλεγχος για προϊόντα με πολλαπλά μεγέθη
                                let sizesArray = [];
                                if (product.sizes) {
                                  if (typeof product.sizes === 'string') {
                                    sizesArray = product.sizes.split(',');
                                  } else if (Array.isArray(product.sizes)) {
                                    sizesArray = product.sizes;
                                  }
                                }
                                
                                // Αν υπάρχουν περισσότερα από 1 μεγέθη, απαιτείται επιλογή
                                return sizesArray.length > 1 && !selectedSize;
                              })()} 
                              onClick={() => {
                                let sizesArray = [];
                                if (product.sizes) {
                                  if (typeof product.sizes === 'string') {
                                    sizesArray = product.sizes.split(',');
                                  } else if (Array.isArray(product.sizes)) {
                                    sizesArray = product.sizes;
                                  }
                                }
                                
                                                                 // Αν υπάρχει μόνο ένα μέγεθος ή δεν υπάρχουν μεγέθη, χρησιμοποίησε το πρώτο διαθέσιμο
                                 if (sizesArray.length <= 1) {
                                   const availableSize = Object.keys(inventory).find(size => inventory[size] > 0);
                                   addToCart({ ...product, selectedSize: availableSize || 'Μία', selectedColor: selectedColor });
                                 } else {
                                   // Αν υπάρχουν πολλαπλά μεγέθη, χρησιμοποίησε το επιλεγμένο
                                   selectedSize && addToCart({ ...product, selectedSize, selectedColor: selectedColor });
                                 }
                              }}
                            >
                              Προσθήκη στο καλάθι
                            </button>
                           {(() => {
                             let sizesArray = [];
                             if (product.sizes) {
                               if (typeof product.sizes === 'string') {
                                 sizesArray = product.sizes.split(',');
                               } else if (Array.isArray(product.sizes)) {
                                 sizesArray = product.sizes;
                               }
                             }
                             
                             // Εμφάνιση μηνύματος μόνο αν υπάρχουν περισσότερα από 1 μεγέθη και δεν έχει επιλεγεί
                             return sizesArray.length > 1 && !selectedSize ? (
                               <div className="choose-size-msg">Επίλεξε μέγεθος για να συνεχίσεις</div>
                             ) : null;
                           })()}
             
             {/* Tabs και περιεχόμενο ΜΕΣΑ στην κάρτα */}
            <div className="product-tabs-hero">
              <button className={activeTab==='desc' ? 'active' : ''} onClick={()=>setActiveTab('desc')}>Περιγραφή</button>
              <button className={activeTab==='details' ? 'active' : ''} onClick={()=>setActiveTab('details')}>Λεπτομέρειες</button>
              <button className={activeTab==='care' ? 'active' : ''} onClick={()=>setActiveTab('care')}>Φροντίδα</button>
              <button className={activeTab==='returns' ? 'active' : ''} onClick={()=>setActiveTab('returns')}>Επιστροφές</button>
              <button className={activeTab==='reviews' ? 'active' : ''} onClick={()=>setActiveTab('reviews')}>Reviews</button>
            </div>
            <div className={`product-tab-content-hero tab-${activeTab}`}>
              {activeTab==='desc' && <div>{product.description}</div>}
              {activeTab==='details' && <div>
                <div><b>Brand:</b> {product.brand}</div>
                <div><b>SKU:</b> {product.sku}</div>
                <div><b>Υλικό:</b> {product.material}</div>
              </div>}
              {activeTab==='care' && <div>{product.care}</div>}
              {activeTab==='returns' && <div>{product.returns}</div>}
              {activeTab==='reviews' && <div className="no-reviews-hero">Δεν υπάρχουν ακόμα αξιολογήσεις.<br/>Γίνε ο πρώτος που θα αξιολογήσει το προϊόν!</div>}
            </div>
          </div>
        </div>
      </div>
      {/* Προτεινόμενα Carousel κάτω από την κάρτα */}
      <div className="suggested-carousel-section">
        <div className="suggested-carousel-title">Προτεινόμενα προϊόντα</div>
        <Slider
          dots={true}
          infinite={true}
          speed={500}
          slidesToShow={3}
          slidesToScroll={1}
          arrows={true}
          responsive={[
            { breakpoint: 1100, settings: { slidesToShow: 2 } },
            { breakpoint: 700, settings: { slidesToShow: 1 } }
          ]}
        >
          {suggested.map((product) => (
            <ProductCardWithLogo product={product} key={product.id} />
          ))}
        </Slider>
      </div>
    </div>
  );
} 