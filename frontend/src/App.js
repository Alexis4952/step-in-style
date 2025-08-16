import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';
import { FaUserCircle, FaShoppingCart, FaHeart, FaRegHeart, FaFacebook, FaInstagram, FaTag, FaStar, FaGift } from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import logo from './logo.svg';
import { CartProvider, useCart } from './CartContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import { supabase } from './supabaseClient';
import { AuthProvider, useAuth } from './AuthContext';
import AccountDashboard from './AccountDashboard';
import AccountSupport from './AccountSupport';
import ContactPage from './ContactPage';
import TermsPage from './TermsPage';
import ReturnsPolicyPage from './ReturnsPolicyPage';
import ProductPage from './ProductPage';
import AdminLoginPage from './AdminLoginPage';
// Προσθήκη imports για AdminLayout και AdminDashboard
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';
// 🔥 ULTRA MODERN MOBILE IMPORTS
import { useMobile, MobileNavbar, MobileHero, MobileProductCard, MobileCarouselsByTag } from './MobileApp';

const logoMain = process.env.PUBLIC_URL + '/step in style.jpg';

// Products Context
export const ProductsContext = createContext();

const defaultMockProducts = [];

export function Navbar({ hideLogo }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const mobile = useMobile();
  const navigate = useNavigate();
  
  const handleNavigation = (path) => {
    // Πρώτα scroll στην κορυφή
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Μετά navigate
    setTimeout(() => {
      navigate(path);
      // Και ξανά scroll μετά το navigation
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    }, 50);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.Navbar-avatar')) {
        setDropdownOpen(false);
      }
    };
    
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);
  
  // Αν είμαστε σε mobile, χρησιμοποιούμε το MobileNavbar
  if (mobile) {
    return <MobileNavbar />;
  }
  
  // Desktop Navbar
  return (
    <nav className={`premium-navbar${hideLogo ? ' navbar-no-logo' : ''}`}>
      {!hideLogo && (
      <div onClick={() => handleNavigation('/')} style={{cursor: 'pointer'}}>
        <img src={process.env.PUBLIC_URL + '/step in style.jpg'} alt="Step in Style logo" className="premium-logo" />
      </div>
      )}
      <div className="Navbar-right-card">
        <button className="Navbar-link" onClick={() => handleNavigation('/')} style={{background: 'none', border: 'none', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer'}}>Αρχική</button>
        <button className="Navbar-link" onClick={() => handleNavigation('/products')} style={{background: 'none', border: 'none', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer'}}>Προϊόντα</button>
        <div
          className="Navbar-avatar"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          tabIndex={0}
          style={{position:'relative'}}
        >
          <FaUserCircle size={28} color="#b87b2a" />
          {dropdownOpen && (
            <div className="Navbar-avatar-dropdown">
              {user ? (
                <>
                  <button className="avatar-dropdown-btn" style={{fontWeight:600}} onClick={() => handleNavigation('/account')}>Ο λογαριασμός μου</button>
                  <button className="avatar-dropdown-btn" onClick={logout} style={{color:'#b87b2a',fontWeight:600}}>Αποσύνδεση</button>
                </>
              ) : (
                <>
                  <button className="avatar-dropdown-btn" onClick={() => handleNavigation('/login')}>Σύνδεση</button>
                  <button className="avatar-dropdown-btn" onClick={() => handleNavigation('/register')}>Εγγραφή</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const mobile = useMobile();
  
  // Αν είμαστε σε mobile, χρησιμοποιούμε το MobileHero
  if (mobile) {
    return <MobileHero />;
  }
  
  // Desktop Hero
  return (
    <section className="Premium-hero">
      <div className="Hero-overlay">
        <div className="Hero-content">
          <h1 style={{textTransform: 'uppercase'}}>ΠΕΡΠΑΤΑ ΜΕ ΑΥΤΟΠΕΠΟΙΘΗΣΗ.</h1>
          <p>Step in Style – κάθε βήμα, μια ιστορία.</p>
          <Link to="/products">
            <button className="premium-btn">Ανακάλυψε τη συλλογή</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ProductCardWithLogo({ product }) {
  const { addToCart } = useCart();
  const mobile = useMobile();
  
  // Αν είμαστε σε mobile, χρησιμοποιούμε το MobileProductCard
  if (mobile) {
    return <MobileProductCard product={product} />;
  }
  
  // Desktop ProductCard
  return (
    <Link to={`/product/${product.id}`} style={{textDecoration:'none'}}>
    <div className="premium-card" style={{margin: 16, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <ProductImage src={product.image} alt={product.name} />
      <h3 style={{fontFamily: 'Montserrat', fontWeight: 700, fontSize: 20, color: '#2d1c0b', marginBottom: 8}}>{product.name}</h3>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom: 6}}>
        {product.oldPriceDisplay && (
          <span style={{textDecoration:'line-through',color:'#b82a2a',fontWeight:700,fontSize:18,marginRight:10}}>{product.oldPriceDisplay}</span>
        )}
        <span style={{color:'#b87b2a',fontWeight:900,fontSize:24}}>{product.priceDisplay}</span>
      </div>
      <div style={{color: '#7a4a1a', fontSize: 15, marginBottom: 10}}>{product.brand}</div>
      <button className="premium-product-btn" onClick={e => { e.preventDefault(); addToCart(product); }}>Προσθήκη στο καλάθι</button>
    </div>
    </Link>
  );
}

function OffersCarousel() {
  const { offers } = useContext(ProductsContext);
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1100, settings: { slidesToShow: 2 } },
      { breakpoint: 700, settings: { slidesToShow: 1 } }
    ]
  };
  if (offers.length === 0) return null;
  return (
    <section className="Products-section">
      <div className="Products-title">Οι Προσφορές μας</div>
      <Slider {...settings}>
        {offers.map(product => (
          <ProductCardWithLogo product={product} key={product.id} />
        ))}
      </Slider>
    </section>
  );
}

function FloatingCart() {
  const { cart, total, removeFromCart, updateQty, handleCheckout } = useCart();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <>
      <button className="FloatingCart" onClick={() => setOpen(o => !o)} aria-label="Άνοιγμα καλαθιού">
        <FaShoppingCart />
        {cart.length > 0 && <span className="cart-badge">{cart.reduce((sum, item) => sum + item.qty, 0)}</span>}
      </button>
      {open && (
        <div className="cart-sidebar-modal" onClick={() => setOpen(false)}>
          <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Το καλάθι μου</h3>
              <button className="cart-close-btn" onClick={() => setOpen(false)}>&times;</button>
            </div>
            {cart.length === 0 ? (
              <div className="cart-empty">Το καλάθι είναι άδειο.</div>
            ) : (
              <>
                <ul className="cart-list">
                  {cart.map(item => (
                    <li key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-brand">{item.brand}</div>
                        <div className="cart-item-price">{item.price} x {item.qty}</div>
                        <div className="cart-item-qty">
                          <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}>-</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                        </div>
                        <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>Αφαίρεση</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="cart-total">Σύνολο: <b>{total.toFixed(2)}€</b></div>
                {message && (
                  <div className={`cart-message ${message.includes('επιτυχώς') ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}
                <button 
                  className="cart-checkout-btn" 
                  onClick={async () => {
                    setLoading(true);
                    setMessage('');
                    const result = await handleCheckout();
                    setMessage(result.message);
                    setLoading(false);
                    if (result.success) {
                      setTimeout(() => {
                        setOpen(false);
                        setMessage('');
                      }, 2000);
                    }
                  }}
                  disabled={loading || cart.length === 0}
                >
                  {loading ? 'Επεξεργασία...' : 'Ολοκλήρωση Αγοράς'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ProductImage({ src, alt }) {
  const [error, setError] = useState(false);
  return error || !src ? (
    <div className="premium-image logo-image-fallback">
      <img src={logoMain} alt="logo" className="logo-fallback-img" />
    </div>
  ) : (
    <img 
      src={src} 
      alt={alt} 
      className="premium-image" 
      loading="lazy"
      onError={() => setError(true)} 
    />
  );
}

function ProductDetails({ product }) {
  const [mainImg, setMainImg] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('desc');
  const { addToCart } = useCart();
  const { mockProducts } = useContext(ProductsContext);
  // Προτάσεις: 4 random άλλα προϊόντα (όχι το ίδιο)
  const suggested = mockProducts.filter(p => p.id !== product.id);
  const suggestedProducts = suggested.sort(() => 0.5 - Math.random()).slice(0, 4);
  // Υπολογισμός ποσοστού έκπτωσης
  let discountPercent = null;
  if (product.oldPrice && product.price && product.oldPrice > product.price) {
    discountPercent = '-' + Math.round(100 * (product.oldPrice - product.price) / product.oldPrice) + '%';
  }
  return (
    <div className="premium-product-details-full">
      {/* Sidebar - μόνο σε desktop */}
      <aside className="premium-product-sidebar">
        <div className="sidebar-title">Δες και άλλα προϊόντα</div>
        <div className="sidebar-suggested-list">
          {suggestedProducts.map(p => (
            <Link to={`/product/${p.id}`} key={p.id} className="sidebar-suggested-card">
              <img src={p.image} alt={p.name} className="sidebar-suggested-img" loading="lazy" />
              <div className="sidebar-suggested-info">
                <div className="sidebar-suggested-name">{p.name}</div>
                <div className="sidebar-suggested-price">{p.price}{p.oldPrice && <span className="sidebar-suggested-old">{p.oldPrice}</span>}</div>
              </div>
            </Link>
          ))}
        </div>
      </aside>
      {/* Main panel */}
      <div className="premium-product-mainpanel">
        <div className="premium-product-maincard">
          <div className="ProductDetails premium-product-details">
            <div className="ProductDetails-gallery premium-product-gallery">
              <img src={mainImg} alt={product.name} className="ProductDetails-image premium-product-mainimg" loading="lazy" />
              <div className="ProductDetails-thumbs premium-product-thumbs">
          {product.images.map((img, i) => (
            <img key={i} src={img} alt="thumb" className={`thumb${mainImg===img?' selected':''}`} onClick={()=>setMainImg(img)} loading="lazy" />
          ))}
        </div>
      </div>
            <div className="ProductDetails-info premium-product-info">
        <h2>{product.name}</h2>
        <div className="ProductDetails-meta">
                <span><b>Brand:</b> {product.brand}</span>
                <span><b>SKU:</b> {product.sku}</span>
                <span><b>Διαθεσιμότητα:</b> <span className={product.stock > 0 ? 'in-stock' : 'out-stock'}>{product.stock > 0 ? 'Άμεσα διαθέσιμο' : 'Εξαντλημένο'}</span></span>
              </div>
              <div className="ProductDetails-price premium-product-price">
  {product.oldPriceDisplay && (
    <span style={{textDecoration:'line-through',color:'#b82a2a',fontWeight:700,fontSize:22,marginRight:14}}>{product.oldPriceDisplay}</span>
  )}
  <span style={{color:'#b87b2a',fontWeight:900,fontSize:28}}>{product.priceDisplay}</span>
</div>
              <div className="ProductDetails-sizes premium-product-sizes">
                <div style={{fontWeight:700,marginBottom:8}}>Επίλεξε μέγεθος:</div>
                {product.sizes && product.sizes.map(size => (
                  <button key={size} className={`ProductDetails-size premium-product-size-btn${selectedSize===size?' selected':''}`} onClick={()=>setSelectedSize(size)}>{size}</button>
                ))}
              </div>
              {/* Tabs */}
              <div className="premium-product-tabs">
                <button className={activeTab==='desc' ? 'active' : ''} onClick={()=>setActiveTab('desc')}>Περιγραφή</button>
                <button className={activeTab==='details' ? 'active' : ''} onClick={()=>setActiveTab('details')}>Λεπτομέρειες</button>
                <button className={activeTab==='care' ? 'active' : ''} onClick={()=>setActiveTab('care')}>Φροντίδα</button>
                <button className={activeTab==='returns' ? 'active' : ''} onClick={()=>setActiveTab('returns')}>Επιστροφές</button>
                <button className={activeTab==='reviews' ? 'active' : ''} onClick={()=>setActiveTab('reviews')}>Reviews</button>
              </div>
              <div className="premium-product-tab-content">
                {activeTab==='desc' && <div>{product.description}</div>}
                {activeTab==='details' && <div>
                  <div><b>Brand:</b> {product.brand}</div>
                  <div><b>SKU:</b> {product.sku}</div>
                  <div><b>Διαθεσιμότητα:</b> <span className={product.stock > 0 ? 'in-stock' : 'out-stock'}>{product.stock > 0 ? 'Άμεσα διαθέσιμο' : 'Εξαντλημένο'}</span></div>
                  <div><b>Υλικό:</b> {product.material}</div>
                </div>}
                {activeTab==='care' && <div>{product.care}</div>}
                {activeTab==='returns' && <div>{product.returns}</div>}
                {activeTab==='reviews' && <div style={{color:'#b87b2a',fontWeight:600}}>Δεν υπάρχουν ακόμα αξιολογήσεις.<br/>Γίνε ο πρώτος που θα αξιολογήσει το προϊόν!</div>}
              </div>
                              <button className="premium-product-btn" style={{marginTop:18}} onClick={()=>selectedSize && addToCart({...product, selectedSize})} disabled={!selectedSize}>Προσθήκη στο καλάθι</button>
                {!selectedSize && <div style={{color:'#b87b2a',marginTop:8,fontWeight:600}}>Επίλεξε μέγεθος για να συνεχίσεις</div>}
              </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function ProductsPage() {
  const { mockProducts } = useContext(ProductsContext);
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  

  
  // Εύρεση min/max τιμής
  const prices = mockProducts.map(p => Number(p.price)).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices, 1) : 1;
  const maxPrice = prices.length > 0 ? Math.max(...prices, 200) : 200;
  // State για τα φίλτρα
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false); // State για mobile filters
  
  useEffect(() => {
    if (prices.length > 0) setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);
  
  // Φόρτωση κατηγοριών και υποκατηγοριών από τη Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        
        // Φόρτωση κατηγοριών
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug, description, display_order')
          .eq('is_active', true)
          .order('display_order');
        
        if (categoriesError) {
          console.error('Σφάλμα κατά τη φόρτωση κατηγοριών:', categoriesError);
          setCategories([]);
        } else {
          setCategories(categoriesData || []);
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
        setCategories([]);
        setSubcategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);

  // Διάβασε το search parameter από το URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearch(searchFromUrl);
    }
  }, [searchParams]);

      // Εφαρμογή φίλτρων
    let filteredProducts = mockProducts.filter(product => {
      // Search
      if (search && !product.name.toLowerCase().includes(search.toLowerCase()) && !(product.sku && product.sku.toLowerCase().includes(search.toLowerCase()))) {
        return false;
      }
      // Κατηγορία - χρήση ονομάτων κατηγοριών από τη βάση
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }
      // Υποκατηγορία
      if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(product.subcategory)) {
        return false;
      }
      // Μέγεθος
      if (selectedSizes.length > 0 && !product.sizes.some(size => selectedSizes.includes(size))) {
        return false;
      }
      // Brand
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }
      // Διαθεσιμότητα
      if (availableOnly && !(product.stock > 0)) {
        return false;
      }
      // Τιμή
      const priceNum = Number(product.price);
      if (priceNum < priceRange[0] || priceNum > priceRange[1]) {
        return false;
      }
      return true;
    });

  

  // Ταξινόμηση
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'alpha-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'alpha-desc') return b.name.localeCompare(a.name);
    // Default: newest (μεγαλύτερο id πρώτο)
    return b.id - a.id;
  });

  // Προσδιορισμός "Νέων" προϊόντων (top 3 μεγαλύτερα id)
  const newestIds = [...mockProducts].sort((a,b)=>b.id-a.id).slice(0,3).map(p=>p.id);

  // Συλλογή όλων των brands
  const allBrands = Array.from(new Set(mockProducts.map(p => p.brand)));
  
  // Χρήση κατηγοριών από τη Supabase
  const displayCategories = categories.map(cat => cat.name);
  
  

  // Προσθήκη στο καλάθι (χωρίς αλλαγή stock εδώ)
  const handleAddToCart = (product) => {
    addToCart(product);
    setQuickViewProduct(null);
  };

  // Χειριστές φίλτρων
  const handleSizeClick = size => {
    setSelectedSizes(sizes => sizes.includes(size) ? sizes.filter(s => s !== size) : [...sizes, size]);
  };
  const handleBrandChange = brand => {
    setSelectedBrands(brands => brands.includes(brand) ? brands.filter(b => b !== brand) : [...brands, brand]);
  };
  const handleCategoryChange = category => {
    // Αν η κατηγορία είναι ήδη επιλεγμένη, την αφαιρούμε
    if (selectedCategories.includes(category)) {
      setSelectedCategories(categories => categories.filter(c => c !== category));
    } else {
      // Αν επιλέγουμε νέα κατηγορία, καθαρίζουμε όλες τις προηγούμενες
      setSelectedCategories([category]);
    }
    // Καθαρισμός υποκατηγοριών όταν αλλάζει κατηγορία
    setSelectedSubcategories([]);
  };
  
  const handleSubcategoryChange = subcategory => {
    setSelectedSubcategories(subcategories => subcategories.includes(subcategory) ? subcategories.filter(s => s !== subcategory) : [...subcategories, subcategory]);
  };
  const handleAvailableChange = () => setAvailableOnly(a => !a);
  const handlePriceChange = e => setPriceRange([priceRange[0], Number(e.target.value)]);
  const handlePriceMinChange = e => setPriceRange([Number(e.target.value), priceRange[1]]);
  const handleSortChange = e => setSortBy(e.target.value);

  // Προϊόντα που εμφανίζονται
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="products-outer-wrapper">
      <div className="products-top-title">Δείτε όλα τα προϊόντα μας</div>
      <section className="Products-section products-flex-wrapper">
        
        {/* Mobile Filters Toggle Button */}
        <div className="mobile-filters-toggle">
          <button 
            className={`filters-toggle-btn ${filtersOpen ? 'active' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <span className="toggle-icon">🔍</span>
            <span className="toggle-text">
              {filtersOpen ? 'Κρύψε Φίλτρα' : 'Εμφάνιση Φίλτρων'}
            </span>
            <span className={`toggle-arrow ${filtersOpen ? 'up' : 'down'}`}>▼</span>
          </button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`Products-sidebar products-sidebar-align-more ${filtersOpen ? 'mobile-open' : 'mobile-closed'}`}>
          <div className="sidebar-header">
            <h3>🔍 Φίλτρα Αναζήτησης</h3>
            <button 
              onClick={() => {
                setSelectedCategories([]);
                setSelectedSubcategories([]);
                setSelectedSizes([]);
                setSelectedBrands([]);
                setAvailableOnly(false);
                setPriceRange([minPrice, maxPrice]);
                setSearch('');
              }}
              className="clear-filters-btn"
            >
              Καθαρισμός
            </button>
          </div>
          
          <div className="filter-group">
            <div className="filter-label">
              <span className="filter-icon">📂</span>
              Κατηγορία
            </div>
            <select 
              value={selectedCategories[0] || ''} 
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  setSelectedCategories([value]);
                  setSelectedSubcategories([]); // Καθαρισμός υποκατηγοριών
                } else {
                  setSelectedCategories([]);
                  setSelectedSubcategories([]);
                }
              }}
              className="category-select"
            >
              <option value="">Όλες οι κατηγορίες</option>
              {displayCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Υποκατηγορίες - εμφανίζονται μόνο όταν επιλέγεται "Αξεσουάρ" */}
          {selectedCategories.includes('Αξεσουάρ') && (
            <div className="filter-group">
              <div className="filter-label">
                <span className="filter-icon">🔗</span>
                Υποκατηγορία
              </div>
              <select 
                value={selectedSubcategories[0] || ''} 
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    setSelectedSubcategories([value]);
                  } else {
                    setSelectedSubcategories([]);
                  }
                }}
                className="subcategory-select"
              >
                <option value="">Όλες οι υποκατηγορίες</option>
                {subcategories
                  .filter(sub => sub.categories.name === 'Αξεσουάρ')
                  .map(subcategory => (
                    <option key={subcategory.name} value={subcategory.name}>
                      {subcategory.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <div className="filter-label">
              <span className="filter-icon">👟</span>
              Μέγεθος
            </div>
            <div className="filter-sizes">
              {[36,37,38,39,40,41].map(size => (
                <button 
                  key={size} 
                  className={`filter-btn${selectedSizes.includes(String(size)) ? ' selected' : ''}`} 
                  onClick={() => handleSizeClick(String(size))}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-label">
              <span className="filter-icon">🏷️</span>
              Μάρκα
            </div>
            <div className="filter-brands">
              {allBrands.map(brand => (
                <label key={brand} className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedBrands.includes(brand)} 
                    onChange={() => handleBrandChange(brand)} 
                  />
                  <span className="checkmark"></span>
                  {brand}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-label">
              <span className="filter-icon">📦</span>
              Διαθεσιμότητα
            </div>
            <label className="filter-checkbox">
              <input 
                type="checkbox" 
                checked={availableOnly} 
                onChange={handleAvailableChange} 
              />
              <span className="checkmark"></span>
              Άμεσα διαθέσιμο
            </label>
          </div>

          <div className="filter-group">
            <div className="filter-label">
              <span className="filter-icon">💰</span>
              Τιμή
            </div>
            <div className="price-range-container">
              <div className="price-inputs">
                <input 
                  type="number" 
                  min={minPrice} 
                  max={priceRange[1]} 
                  value={priceRange[0]} 
                  onChange={handlePriceMinChange} 
                  className="price-input"
                  placeholder="Min"
                />
                <span className="price-separator">-</span>
                <input 
                  type="number" 
                  min={priceRange[0]} 
                  max={maxPrice} 
                  value={priceRange[1]} 
                  onChange={handlePriceChange} 
                  className="price-input"
                  placeholder="Max"
                />
              </div>
              <input 
                type="range" 
                min={minPrice} 
                max={maxPrice} 
                value={priceRange[1]} 
                onChange={handlePriceChange} 
                className="price-slider"
              />
            </div>
          </div>
        </aside>
        {/* Products Grid */}
        <div className="Products-main Products-content">
          <div className="products-toolbar" style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <div className="Products-title products-title-align" style={{marginBottom:0}}>Όλα τα Προϊόντα</div>
            <input
              className="products-search-bar"
              type="text"
              placeholder="Αναζήτηση..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{marginLeft: 8, minWidth: 120, width: 'auto', maxWidth: 200, borderRadius: 8, border: '1px solid #e5d6c7', padding: '8px 12px', fontSize: 14, fontFamily: 'Montserrat', background: '#fff6ec', color: '#7a4a1a', fontWeight: 500}}
            />
            <select className="sort-dropdown" value={sortBy} onChange={handleSortChange} style={{marginLeft: 'auto', marginBottom: 0, padding: '6px 8px', borderRadius: 6, border: '1px solid #e5d6c7', fontFamily: 'Montserrat', fontWeight: 600, color: '#b87b2a', background: '#fff6ec', fontSize: 12, minWidth: 80}}>
              <option value="newest">Νεότερα</option>
              <option value="price-asc">Φθηνότερα</option>
              <option value="price-desc">Ακριβότερα</option>
              <option value="alpha-asc">Αλφαβητικά (Α-Ω)</option>
              <option value="alpha-desc">Αλφαβητικά (Ω-Α)</option>
            </select>
          </div>
          <div className="products-count">Βρέθηκαν {filteredProducts.length} προϊόντα</div>
          <div className="Products-grid-2cols">
            {visibleProducts.map(product => (
              <div className="premium-card" key={product.id}>
                <ProductImage src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <div className="product-price">
                  {product.oldPriceDisplay && <span className="product-old-price">{product.oldPriceDisplay}</span>}
                  {product.priceDisplay ? product.priceDisplay : product.price}
                </div>
                <div className="product-brand">{product.brand}</div>
                <div className="product-card-actions">
                  <Link to={`/product/${product.id}`}><button className="premium-product-btn">Προβολή</button></Link>
                  <button className="quickview-btn" onClick={()=>setQuickViewProduct(product)}>Γρήγορη Προβολή</button>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div style={{display:'flex',justifyContent:'center',marginTop:32}}>
              <button className="load-more-btn" onClick={()=>setVisibleCount(c=>c+8)}>Φόρτωσε Περισσότερα</button>
            </div>
          )}
          {/* Quick View Modal */}
          {quickViewProduct && (
            <div className="quickview-modal-overlay" onClick={()=>setQuickViewProduct(null)}>
              <div className="quickview-modal" onClick={e=>e.stopPropagation()}>
                <button className="quickview-close" onClick={()=>setQuickViewProduct(null)}>&times;</button>
                <div className="quickview-modal-content">
                  <div className="quickview-modal-gallery">
                    <ProductImage src={quickViewProduct.image} alt={quickViewProduct.name} />
                  </div>
                  <div className="quickview-modal-info">
                    <h2>{quickViewProduct.name}</h2>
                    <div className="quickview-modal-meta">
                      <span>Brand: {quickViewProduct.brand}</span>
                      <span>SKU: {quickViewProduct.sku}</span>
                    </div>
                    <div className="quickview-modal-price">{quickViewProduct.oldPriceDisplay && <span style={{textDecoration:'line-through',color:'#b82a2a',fontSize:15,marginRight:8}}>{quickViewProduct.oldPriceDisplay}</span>}{quickViewProduct.priceDisplay ? quickViewProduct.priceDisplay : quickViewProduct.price}</div>
                    <div className="quickview-modal-sizes">
                      Μέγεθος: {quickViewProduct.sizes && quickViewProduct.sizes.map(size => <span key={size} className="quickview-size">{size}</span>)}
                    </div>
                    <div className="quickview-modal-desc">{quickViewProduct.description}</div>
                    <button className="premium-product-btn" style={{marginTop:18}} onClick={()=>handleAddToCart(quickViewProduct)}>Προσθήκη στο καλάθι</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductPageWrapper() {
  const { productId } = require('react-router-dom').useParams();
  return <ProductPage productId={productId} />;
}

function Footer() {
  const navigate = useNavigate();
  
  const handleNavigation = (path) => {
    // Πρώτα scroll στην κορυφή
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Μετά navigate
    setTimeout(() => {
      navigate(path);
      // Και ξανά scroll μετά το navigation
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    }, 50);
  };
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src={logoMain} alt="Step in Style logo" className="footer-logo" />
          <div className="footer-tagline" translate="no">Step in Style</div>
        </div>
        <div className="footer-links">
          <button onClick={() => handleNavigation('/')} style={{background: 'none', border: 'none', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none'}}>Αρχική</button>
          <button onClick={() => handleNavigation('/products')} style={{background: 'none', border: 'none', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none'}}>Προϊόντα</button>
          <button onClick={() => handleNavigation('/contact')} style={{background: 'none', border: 'none', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none'}}>Επικοινωνία</button>
          <button onClick={() => handleNavigation('/terms')} style={{background: 'none', border: 'none', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none'}}>Όροι Χρήσης</button>
          <button onClick={() => handleNavigation('/returns-policy')} style={{background: 'none', border: 'none', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none'}}>Πολιτική Επιστροφών</button>
        </div>
        <div className="footer-social">
          <a href="#" aria-label="Facebook"><FaFacebook size={24} /></a>
          <a href="#" aria-label="Instagram"><FaInstagram size={24} /></a>
        </div>
        <div className="footer-contact">
          <div>Email: info@stepinstyle.gr</div>
          <div>Τηλ: 210 1234567</div>
        </div>
      </div>
      <div className="footer-copyright">
        &copy; {new Date().getFullYear()} Step in Style. All rights reserved.
      </div>
    </footer>
  );
}

function MainApp({ offers, mockProducts, loading }) {
  const location = useLocation();
  // Εμφανίζω loading μόνο σε routes που χρειάζονται προϊόντα, ΠΟΤΕ σε /login ή /register
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');
  const isAdminPage = location.pathname.startsWith('/admin');
  const needsProducts = ["/", "/products"].includes(location.pathname) || location.pathname.startsWith("/product");
  
  // Βελτιστοποίηση: Εμφάνιση loading μόνο αν χρειάζεται και δεν έχουμε φορτώσει ακόμα
  if (loading && needsProducts && !isAuthPage && !isAdminPage) {
    return (
      <CartProvider>
        <ProductsContext.Provider value={{ offers, mockProducts, loading }}>
          {!location.pathname.startsWith('/admin') && <Navbar hideLogo={location.pathname.startsWith('/account')} />}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            fontSize: '18px',
            color: '#b87b2a',
            fontFamily: 'Montserrat'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}>Φόρτωση προϊόντων...</div>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid #f3f3f3', 
                borderTop: '3px solid #b87b2a', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
          </div>
          {!location.pathname.startsWith('/admin') && <Footer />}
        </ProductsContext.Provider>
      </CartProvider>
    );
  }
  return (
    <CartProvider>
      <ProductsContext.Provider value={{ offers, mockProducts, loading }}>
        {/* Εμφάνιση Navbar και Footer ΜΟΝΟ αν δεν είμαστε σε admin route */}
        {!location.pathname.startsWith('/admin') && <Navbar hideLogo={location.pathname.startsWith('/account')} />}
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="login" element={<AdminLoginPage />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
            {/* Προσθήκη και άλλων admin routes εδώ */}
          </Route>
          {/* User routes */}
          <Route path="/" element={<>
            <Hero />
            <CarouselsByTag mockProducts={mockProducts} />
          </>} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:productId" element={<ProductPageWrapper />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
          <Route path="/account" element={<AccountDashboard mockProducts={mockProducts} />} />
          <Route path="/account/support" element={<AccountSupport />} />
        </Routes>
        {!location.pathname.startsWith('/admin') && <FloatingCart />}
        {!location.pathname.startsWith('/admin') && <Footer />}
      </ProductsContext.Provider>
    </CartProvider>
  );
}

// Νέο component για μοναδική εμφάνιση προϊόντων στα carousels
function CarouselsUnique({ mockProducts }) {
  // Προσφορές: προϊόντα με oldPrice
  const offers = mockProducts.filter(p => p.oldPrice);
  // Δημοφιλή: προϊόντα χωρίς oldPrice, όχι ήδη στις προσφορές (π.χ. τα επόμενα 6)
  const popular = mockProducts.filter(p => !p.oldPrice).slice(0, 6);
  // Νέα: προϊόντα που δεν είναι ούτε στις προσφορές ούτε στα δημοφιλή
  const offerIds = new Set(offers.map(p => p.id));
  const popularIds = new Set(popular.map(p => p.id));
  const newest = mockProducts.filter(p => !offerIds.has(p.id) && !popularIds.has(p.id)).slice(0, 6);

  return (
    <div style={{paddingTop: 60, display: 'flex', flexDirection: 'column', gap: 40}}>
      {offers.length > 0 && <DiscountCarousel products={offers} />}
      {popular.length > 0 && <PopularCarousel products={popular} />}
      {newest.length > 0 && <NewProductsCarousel products={newest} />}
    </div>
  );
}

// Τροποποιώ τα carousels να παίρνουν products prop
function DiscountCarousel({ products }) {
  if (!products || products.length === 0) return null;
  const settings = {
    dots: true,
    infinite: products.length >= 3, // Μόνο αν έχουμε 3+ προϊόντα
    speed: 500,
    slidesToShow: Math.min(products.length, 3), // Δείξε όσα έχουμε, μέχρι 3
    slidesToScroll: 1,
    arrows: products.length > 3, // Βέλη μόνο αν έχουμε περισσότερα από 3
    responsive: [
      { 
        breakpoint: 1100, 
        settings: { 
          slidesToShow: Math.min(products.length, 2),
          infinite: products.length >= 2,
          arrows: products.length > 2
        } 
      },
      { 
        breakpoint: 700, 
        settings: { 
          slidesToShow: 1,
          infinite: products.length >= 1,
          arrows: products.length > 1
        } 
      }
    ]
  };
  return (
    <section className="Products-section">
      <div className="Products-title" style={{color:'#b87b2a',fontWeight:900, fontSize:'2.2rem', display:'flex',alignItems:'center',gap:16,marginBottom:36}}>
        <FaTag style={{fontSize:'2.1rem',color:'#b87b2a'}} /> Προϊόντα σε Έκπτωση
      </div>
      <Slider {...settings}>
        {products.map(product => (
          <ProductCardWithLogo product={product} key={product.id} />
        ))}
      </Slider>
    </section>
  );
}
function PopularCarousel({ products }) {
  if (!products || products.length === 0) return null;
  const settings = {
    dots: true,
    infinite: products.length >= 3, // Μόνο αν έχουμε 3+ προϊόντα
    speed: 500,
    slidesToShow: Math.min(products.length, 3), // Δείξε όσα έχουμε, μέχρι 3
    slidesToScroll: 1,
    arrows: products.length > 3, // Βέλη μόνο αν έχουμε περισσότερα από 3
    responsive: [
      { 
        breakpoint: 1100, 
        settings: { 
          slidesToShow: Math.min(products.length, 2),
          infinite: products.length >= 2,
          arrows: products.length > 2
        } 
      },
      { 
        breakpoint: 700, 
        settings: { 
          slidesToShow: 1,
          infinite: products.length >= 1,
          arrows: products.length > 1
        } 
      }
    ]
  };
  return (
    <section className="Products-section">
      <div className="Products-title" style={{color:'#b87b2a',fontWeight:900, fontSize:'2.2rem', display:'flex',alignItems:'center',gap:16,marginBottom:36}}>
        <FaStar style={{fontSize:'2.1rem',color:'#b87b2a'}} /> Δημοφιλή Προϊόντα
      </div>
      <Slider {...settings}>
        {products.map(product => (
          <ProductCardWithLogo product={product} key={product.id} />
        ))}
      </Slider>
    </section>
  );
}
function NewProductsCarousel({ products }) {
  if (!products || products.length === 0) return null;
  const settings = {
    dots: true,
    infinite: products.length >= 3, // Μόνο αν έχουμε 3+ προϊόντα
    speed: 500,
    slidesToShow: Math.min(products.length, 3), // Δείξε όσα έχουμε, μέχρι 3
    slidesToScroll: 1,
    arrows: products.length > 3, // Βέλη μόνο αν έχουμε περισσότερα από 3
    responsive: [
      { 
        breakpoint: 1100, 
        settings: { 
          slidesToShow: Math.min(products.length, 2),
          infinite: products.length >= 2,
          arrows: products.length > 2
        } 
      },
      { 
        breakpoint: 700, 
        settings: { 
          slidesToShow: 1,
          infinite: products.length >= 1,
          arrows: products.length > 1
        } 
      }
    ]
  };
  return (
    <section className="Products-section">
      <div className="Products-title" style={{color:'#b87b2a',fontWeight:900, fontSize:'2.2rem', display:'flex',alignItems:'center',gap:16,marginBottom:36}}>
        <FaGift style={{fontSize:'2.1rem',color:'#b87b2a'}} /> Νέα Προϊόντα
      </div>
      <Slider {...settings}>
        {products.map(product => (
          <ProductCardWithLogo product={product} key={product.id} />
        ))}
      </Slider>
    </section>
  );
}

function CarouselsByTag({ mockProducts }) {
  console.log('CarouselsByTag - mockProducts:', mockProducts?.length || 0);
  
  const mobile = useMobile();
  
  // Αν είμαστε σε mobile, χρησιμοποιούμε το MobileCarouselsByTag
  if (mobile) {
    return <MobileCarouselsByTag mockProducts={mockProducts} />;
  }
  
  // Desktop carousels
  const offers = mockProducts.filter(p => Array.isArray(p.carousels) && p.carousels.includes('offer'));
  const popular = mockProducts.filter(p => Array.isArray(p.carousels) && p.carousels.includes('popular'));
  const newest = mockProducts.filter(p => Array.isArray(p.carousels) && p.carousels.includes('new'));

  return (
    <div style={{paddingTop: 80, display: 'flex', flexDirection: 'column', gap: 40, minHeight: '60vh'}}>
      <DiscountCarousel products={offers} />
      <PopularCarousel products={popular} />
      <NewProductsCarousel products={newest} />
    </div>
  );
}

function App() {
  // Products state and fetch logic INSIDE the App component
  const [offers, setOffers] = useState([]);
  const [mockProducts, setMockProducts] = useState(defaultMockProducts);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Test query πρώτα
        console.log('Ξεκινάει η φόρτωση προϊόντων...');
        
        // Φόρτωση όλων των προϊόντων
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'Ενεργό')
          .order('id', { ascending: false });
        
        if (error) {
          console.error('Σφάλμα από Supabase:', error);
          setMockProducts(defaultMockProducts);
          setOffers([]);
          setLoading(false);
          setInitialLoadComplete(true);
          return;
        }
        
        if (!products || products.length === 0) {
          console.log('Δεν βρέθηκαν προϊόντα στη βάση δεδομένων');
          setMockProducts(defaultMockProducts);
          setOffers([]);
          setLoading(false);
          setInitialLoadComplete(true);
          return;
        }
        
        console.log('Φορτώθηκαν προϊόντα:', products.length);
        
        // Transform products to match our format
        const transformedProducts = products.map(product => {
          console.log('Transform product:', product.id, product.name, 'old_price:', product.old_price);
          return {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            priceDisplay: `${product.price}€`,
            oldPrice: product.old_price !== null && product.old_price !== undefined && product.old_price !== '' ? Number(product.old_price) : null,
            oldPriceDisplay: product.old_price !== null && product.old_price !== undefined && product.old_price !== '' ? `${product.old_price}€` : null,
            image: product.image_url,
            brand: product.brand || 'Step in Style',
            category: product.category || 'Παπούτσια',
            subcategory: product.subcategory || '',
            sizes: product.sizes ? product.sizes.split(',').map(s => s.trim()) : ['36', '37', '38', '39', '40', '41'],
            sku: product.sku || '',
            material: product.material || '',
            color: product.color || 'Λευκό',
            available: product.available !== false, // Default true αν δεν υπάρχει
            description: product.description || '',
            care: product.care_instructions || 'Φρόντισε το προϊόν σου με φροντίδα.',
            returns: 'Δωρεάν επιστροφή εντός 14 ημερών.',
            rating: product.rating || 4.5,
            images: [product.image_url], // Μόνο η κύρια εικόνα για αρχική σελίδα
            stock: product.total_stock || product.stock || 0,
            hasStock: (product.total_stock || product.stock || 0) > 0,
            carousels: (() => {
              if (Array.isArray(product.carousels)) {
                return product.carousels;
              } else if (typeof product.carousels === 'string') {
                try {
                  return JSON.parse(product.carousels);
                } catch {
                  return product.carousels.split(',').map(s => s.trim()).filter(Boolean);
                }
              }
              return [];
            })()
          };
        });
        
        setMockProducts(transformedProducts);
        const offerProducts = transformedProducts.filter(p => p.oldPrice);
        setOffers(offerProducts);
        setInitialLoadComplete(true);
        
        console.log('Τέλος φόρτωσης - transformedProducts:', transformedProducts.length);
        console.log('Offers:', offerProducts.length);
      } catch (error) {
        console.error('Σφάλμα φόρτωσης προϊόντων:', error);
        setMockProducts(defaultMockProducts);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <MainApp offers={offers} mockProducts={mockProducts} loading={loading} />
      </Router>
    </AuthProvider>
  );
}

export default App;
