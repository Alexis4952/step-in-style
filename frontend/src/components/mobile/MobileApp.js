import React, { useState, useEffect, useContext } from 'react';
import './MobileApp.css';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../../CartContext';
// import { ProductsContext } from '../desktop/App';

// Detect if it's mobile
export const isMobile = () => {
  return window.innerWidth <= 768;
};

export function MobileNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  
  return (
    <>
      <nav className="premium-navbar">
        {/* Mobile: Logo στα αριστερά - Clickable */}
        <Link to="/" className="navbar-brand-mobile">
          <img src={process.env.PUBLIC_URL + '/step in style.jpg'} alt="Step in Style" className="premium-logo" />
        </Link>
        
        {/* Mobile: Hamburger Menu */}
        <button 
          className={`hamburger-menu ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </nav>
      
      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>
      
      {/* Mobile Menu */}
      <div 
        className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
        style={{
          backgroundColor: '#ffffff',
          background: '#ffffff',
          backgroundImage: 'none'
        }}
      >
        {/* Close Button */}
        <button 
          className="mobile-menu-close"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="close-icon">
            <span></span>
            <span></span>
          </div>
        </button>
        
        <Link 
          to="/" 
          className="mobile-menu-item" 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            color: '#3d2914',
            fontSize: '1.1rem',
            fontWeight: '500',
            opacity: '1',
            visibility: 'visible',
            display: 'block',
            textDecoration: 'none',
            fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: '0.3px',
            lineHeight: '1.4'
          }}
        >
          🏠 Αρχική
        </Link>
        <Link 
          to="/products" 
          className="mobile-menu-item" 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            color: '#3d2914',
            fontSize: '1.1rem',
            fontWeight: '500',
            opacity: '1',
            visibility: 'visible',
            display: 'block',
            textDecoration: 'none',
            fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: '0.3px',
            lineHeight: '1.4'
          }}
        >
          👟 Προϊόντα
        </Link>
        {user ? (
          <>
            <Link 
              to="/account" 
              className="mobile-menu-item" 
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: '#2c2c2c',
                fontSize: '1.1rem',
                fontWeight: '600',
                opacity: '1',
                visibility: 'visible'
              }}
            >
              👤 Ο Λογαριασμός μου
            </Link>
            <button 
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }} 
              className="mobile-menu-item" 
              style={{
                background:'none', 
                border:'none', 
                textAlign:'left', 
                width:'100%',
                color: '#2c2c2c',
                fontSize: '1.1rem',
                fontWeight: '600',
                opacity: '1',
                visibility: 'visible'
              }}
            >
              🚪 Αποσύνδεση
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="mobile-menu-item" 
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: '#2c2c2c',
                fontSize: '1.1rem',
                fontWeight: '600',
                opacity: '1',
                visibility: 'visible'
              }}
            >
              🔑 Σύνδεση
            </Link>
            <Link 
              to="/register" 
              className="mobile-menu-item" 
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: '#2c2c2c',
                fontSize: '1.1rem',
                fontWeight: '600',
                opacity: '1',
                visibility: 'visible'
              }}
            >
              ✨ Εγγραφή
            </Link>
          </>
        )}
      </div>
    </>
  );
}

// 🎯 HERO OPTIONS - Αλλάζεις το heroVersion για να δεις διαφορετικό design!
const heroVersion = 3; // ΑΛΛΑΞΕ ΑΥΤΟΝ ΤΟΝ ΑΡΙΘΜΟ (1-10)

export function MobileHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  // const { mockProducts } = useContext(ProductsContext);
  const mockProducts = []; // Temporary empty array
  
  if (heroVersion === 1) {
    // 🏗️ HERO #1: Modern Card Stack με parallax effect
    return (
      <section className="hero-1">
        <div className="hero-1-bg">
          <div className="hero-1-card-stack">
            <div className="hero-1-card hero-1-card-back"></div>
            <div className="hero-1-card hero-1-card-middle"></div>
            <div className="hero-1-card hero-1-card-front">
              <div className="hero-1-content">
                <div className="hero-1-tag">STEP IN STYLE</div>
                <h1>Νέα Συλλογή<br/>2024</h1>
                <p>Ανακάλυψε τα πιο trendy παπούτσια</p>
                <Link to="/products" className="hero-1-btn">
                  Δες τη συλλογή →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (heroVersion === 2) {
    // 📱 HERO #2: Instagram Stories style με swipe dots
    const stories = [
      { title: "Sneakers", subtitle: "Urban Collection", bg: "#FF6B6B" },
      { title: "Boots", subtitle: "Winter Essentials", bg: "#4ECDC4" },
      { title: "Heels", subtitle: "Night Out", bg: "#45B7D1" }
    ];
    
    return (
      <section className="hero-2">
        <div className="hero-2-stories">
          {stories.map((story, index) => (
            <div 
              key={index}
              className={`hero-2-story ${index === currentSlide ? 'active' : ''}`}
              style={{backgroundColor: story.bg}}
            >
              <div className="hero-2-story-content">
                <h2>{story.title}</h2>
                <p>{story.subtitle}</p>
                <Link to="/products" className="hero-2-story-btn">Shop Now</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="hero-2-dots">
          {stories.map((_, index) => (
            <span 
              key={index}
              className={`hero-2-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>
    );
  }
  
  if (heroVersion === 3) {
    // 👠 HERO #3: E-commerce Style με δικά μας χρώματα
    return (
      <section className="hero-3-ecommerce">
              <div className="hero-3-header">
        <h1 className="hero-3-main-title">Step in Style</h1>
        <p className="hero-3-subtitle">Δωρεάν αποστολή<br/>με αγορές άνω των <strong>50€</strong></p>
      </div>

        <div className="hero-3-categories-wrapper">
          <div className="hero-3-categories">
            <div className="hero-3-category">
              <div className="hero-3-category-img">👟</div>
              <span>Παπούτσια</span>
            </div>
            <div className="hero-3-category">
              <div className="hero-3-category-img">👜</div>
              <span>Τσάντες</span>
            </div>
            <div className="hero-3-category">
              <div className="hero-3-category-img">🩴</div>
              <span>Παντόφλες</span>
            </div>
            <div className="hero-3-category">
              <div className="hero-3-category-img">📿</div>
              <span>Αξεσουάρ</span>
            </div>
            <div className="hero-3-category">
              <div className="hero-3-category-img">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 10h14c1 0 2 1 2 2v0c0 1-1 2-2 2H3c-1 0-2-1-2-2v0c0-1 1-2 2-2z" fill="#8B4513"/>
                  <rect x="15" y="9" width="4" height="6" rx="1" fill="#DAA520"/>
                  <circle cx="17" cy="12" r="0.8" fill="#8B4513"/>
                </svg>
              </div>
              <span>Ζώνες</span>
            </div>
            <div className="hero-3-category">
              <div className="hero-3-category-img">🧣</div>
              <span>Κασκόλ</span>
            </div>
            <div className="hero-3-category">
              <div className="hero-3-category-img">🧤</div>
              <span>Γάντια</span>
            </div>
            <div className="hero-3-category">
              <div className="hero-3-category-img">🧢</div>
              <span>Σκούφος</span>
            </div>
          </div>
        </div>


      </section>
    );
  }
  
  if (heroVersion === 4) {
    // ✨ HERO #4: Minimalist με large typography
    return (
      <section className="hero-4">
        <div className="hero-4-content">
          <div className="hero-4-number">01</div>
          <h1 className="hero-4-mega-title">STEP<br/>IN<br/>STYLE</h1>
          <div className="hero-4-line"></div>
          <p className="hero-4-text">
            Κάθε βήμα μια νέα αρχή.<br/>
            Κάθε παπούτσι μια ιστορία.
          </p>
          <Link to="/products" className="hero-4-minimal-btn">
            Δες τη συλλογή
          </Link>
        </div>
      </section>
    );
  }
  
  if (heroVersion === 5) {
    // 🛍️ HERO #5: E-commerce grid με featured products
    return (
      <section className="hero-5">
        <div className="hero-5-header">
          <h1>Bestsellers</h1>
          <p>Τα πιο αγαπημένα παπούτσια του μήνα</p>
        </div>
        <div className="hero-5-grid">
          <div className="hero-5-product hero-5-main">
            <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop" alt="Main Product" />
            <div className="hero-5-product-info">
              <h3>Nike Air Max</h3>
              <span className="hero-5-price">€89</span>
            </div>
          </div>
          <div className="hero-5-product">
            <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=150&h=150&fit=crop" alt="Product 2" />
            <span className="hero-5-price">€65</span>
          </div>
          <div className="hero-5-product">
            <img src="https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=150&h=150&fit=crop" alt="Product 3" />
            <span className="hero-5-price">€120</span>
          </div>
        </div>
        <Link to="/products" className="hero-5-view-all">Δες όλα →</Link>
      </section>
    );
  }
  
  if (heroVersion === 6) {
    // 🔺 HERO #6: Diagonal split με geometric shapes
    return (
      <section className="hero-6">
        <div className="hero-6-diagonal">
          <div className="hero-6-shape-1"></div>
          <div className="hero-6-shape-2"></div>
        </div>
        <div className="hero-6-content">
          <h1 className="hero-6-title">GEOMETRIC<br/>FASHION</h1>
          <p>Σχήματα που ξεχωρίζουν</p>
          <Link to="/products" className="hero-6-btn">Explore →</Link>
        </div>
      </section>
    );
  }
  
  if (heroVersion === 7) {
    // 🎠 HERO #7: Carousel hero με multiple slides
    const slides = [
      { title: "Summer Sale", subtitle: "Up to 50% off", color: "#FF9500" },
      { title: "New Arrivals", subtitle: "Fresh styles", color: "#007AFF" },
      { title: "Best Sellers", subtitle: "Customer favorites", color: "#34C759" }
    ];
    
    return (
      <section className="hero-7">
        <div className="hero-7-carousel">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`hero-7-slide ${index === currentSlide ? 'active' : ''}`}
              style={{background: slide.color}}
            >
              <h2>{slide.title}</h2>
              <p>{slide.subtitle}</p>
              <Link to="/products" className="hero-7-slide-btn">Shop</Link>
            </div>
          ))}
        </div>
        <div className="hero-7-controls">
          <button onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}>‹</button>
          <span>{currentSlide + 1}/{slides.length}</span>
          <button onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}>›</button>
        </div>
      </section>
    );
  }
  
  if (heroVersion === 8) {
    // 📱 HERO #8: TikTok-style vertical video look
    return (
      <section className="hero-8">
        <div className="hero-8-phone-frame">
          <div className="hero-8-video-area">
            <div className="hero-8-gradient-overlay"></div>
            <div className="hero-8-content">
              <h1>VIRAL<br/>STYLES</h1>
              <p>#ShoeTrends2024</p>
              <div className="hero-8-actions">
                <button className="hero-8-like">❤️ 12.3K</button>
                <button className="hero-8-share">📤 Share</button>
                <Link to="/products" className="hero-8-shop">🛒 Shop</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (heroVersion === 9) {
    // 📰 HERO #9: Magazine layout με article style
    return (
      <section className="hero-9">
        <div className="hero-9-magazine">
          <div className="hero-9-header">
            <span className="hero-9-issue">ISSUE #01</span>
            <span className="hero-9-date">WINTER 2024</span>
          </div>
          <h1 className="hero-9-headline">THE FUTURE OF FOOTWEAR</h1>
          <div className="hero-9-article">
            <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop" alt="Article" className="hero-9-thumb" />
            <div className="hero-9-text">
              <h3>Sustainable Fashion</h3>
              <p>Η νέα εποχή των οικολογικών παπουτσιών...</p>
              <Link to="/products" className="hero-9-read-more">Read More →</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (heroVersion === 10) {
    // 🎮 HERO #10: Gaming/App store style με buttons
    return (
      <section className="hero-10">
        <div className="hero-10-app-style">
          <div className="hero-10-icon">👟</div>
          <h1>Step in Style</h1>
          <div className="hero-10-rating">
            ⭐⭐⭐⭐⭐ <span>4.9</span>
          </div>
          <p className="hero-10-description">
            The ultimate shoe shopping experience. Discover, try, and buy the perfect pair.
          </p>
          <div className="hero-10-buttons">
            <Link to="/products" className="hero-10-primary">GET STARTED</Link>
            <button className="hero-10-secondary">LEARN MORE</button>
          </div>
          <div className="hero-10-features">
            <span>🚚 Free Shipping</span>
            <span>💳 Easy Returns</span>
            <span>📞 24/7 Support</span>
          </div>
        </div>
      </section>
    );
  }
  
  // Fallback - πρώτο design
  return (
    <section className="hero-1">
      <div className="hero-1-content">
        <h1>Hero #{heroVersion}</h1>
        <p>Αλλάξτε το heroVersion στο αρχείο!</p>
      </div>
    </section>
  );
}

export function MobileProductCard({ product }) {
  const { addToCart } = useCart();
  
  return (
    <Link to={`/product/${product.id}`} style={{textDecoration:'none'}}>
      <div className="premium-card">
        <img src={product.image || '/step in style.jpg'} alt={product.name} />
        <div className="premium-card-content">
          <h3>{product.name}</h3>
          <div className="price">{product.priceDisplay}</div>
          <button 
            className="premium-product-btn" 
            onClick={(e) => { 
              e.preventDefault(); 
              addToCart(product); 
            }}
          >
            🛒 Προσθήκη
          </button>
        </div>
      </div>
    </Link>
  );
}

// Mobile Carousels Component που ταιριάζει με το Hero
export function MobileCarouselsByTag({ mockProducts }) {
  if (!mockProducts || mockProducts.length === 0) return null;
  
  const offers = mockProducts.filter(p => Array.isArray(p.carousels) && p.carousels.includes('offer'));
  const popular = mockProducts.filter(p => Array.isArray(p.carousels) && p.carousels.includes('popular'));
  const newest = mockProducts.filter(p => Array.isArray(p.carousels) && p.carousels.includes('new'));

  return (
    <div className="mobile-carousels-container">
      {offers.length > 0 && <MobileOffersCarousel products={offers} />}
      {popular.length > 0 && <MobilePopularCarousel products={popular} />}
      {newest.length > 0 && <MobileNewProductsCarousel products={newest} />}
    </div>
  );
}

export function MobileOffersCarousel({ products }) {
  return (
    <section className="mobile-carousel-section">
      <div className="mobile-carousel-header">
        <h2 className="mobile-carousel-title">🔥 Προσφορές</h2>
        <span className="mobile-carousel-hint">← Σύρε για περισσότερα →</span>
      </div>
      <div className="mobile-carousel-products">
        {products.slice(0, 6).map(product => {
          // Υπολογισμός ποσοστού έκπτωσης
          let discountPercent = null;
          if (product.oldPrice && product.price && product.oldPrice > product.price) {
            discountPercent = Math.round(100 * (product.oldPrice - product.price) / product.oldPrice);
          }
          
          return (
            <div key={product.id} className="mobile-carousel-product-card">
              <div className="mobile-carousel-product-circle">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="mobile-carousel-product-img"
                />
                {/* Badge για έκπτωση */}
                {discountPercent && (
                  <div className="mobile-badges-container">
                    <span className="mobile-product-badge">-{discountPercent}%</span>
                  </div>
                )}
              </div>
              <div className="mobile-carousel-product-info">
                <h3>{product.name}</h3>
                <div className="mobile-carousel-product-price">
                  {product.oldPriceDisplay && (
                    <span className="mobile-carousel-old-price">{product.oldPriceDisplay}</span>
                  )}
                  <span className="mobile-carousel-new-price">{product.priceDisplay}</span>
                </div>
                <Link to={`/product/${product.id}`} className="mobile-carousel-view-btn">
                  Προβολή
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function MobilePopularCarousel({ products }) {
  return (
    <section className="mobile-carousel-section">
      <div className="mobile-carousel-header">
        <h2 className="mobile-carousel-title">⭐ Δημοφιλή</h2>
        <span className="mobile-carousel-hint">← Σύρε για περισσότερα →</span>
      </div>
      <div className="mobile-carousel-products">
        {products.slice(0, 6).map((product, index) => (
          <div key={product.id} className="mobile-carousel-product-card">
            <div className="mobile-carousel-product-circle">
              <img 
                src={product.image} 
                alt={product.name}
                className="mobile-carousel-product-img"
              />
              {/* Badge για δημοφιλή */}
              {index < 3 && (
                <div className="mobile-badges-container">
                  <span className="mobile-product-badge" style={{background: 'linear-gradient(135deg, #ff9500 0%, #ff8c00 100%)'}}>
                    #{index + 1}
                  </span>
                </div>
              )}
            </div>
            <div className="mobile-carousel-product-info">
              <h3>{product.name}</h3>
              <div className="mobile-carousel-product-price">
                {product.oldPriceDisplay && (
                  <span className="mobile-carousel-old-price">{product.oldPriceDisplay}</span>
                )}
                <span className="mobile-carousel-new-price">{product.priceDisplay}</span>
              </div>
              <Link to={`/product/${product.id}`} className="mobile-carousel-view-btn">
                Προβολή
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MobileNewProductsCarousel({ products }) {
  return (
    <section className="mobile-carousel-section">
      <div className="mobile-carousel-header">
        <h2 className="mobile-carousel-title">✨ Νέα Προϊόντα</h2>
        <span className="mobile-carousel-hint">← Σύρε για περισσότερα →</span>
      </div>
      <div className="mobile-carousel-products">
        {products.slice(0, 6).map((product, index) => (
          <div key={product.id} className="mobile-carousel-product-card">
            <div className="mobile-carousel-product-circle">
              <img 
                src={product.image} 
                alt={product.name}
                className="mobile-carousel-product-img"
              />
              {/* Badge για νέα προϊόντα */}
              {index < 2 && (
                <div className="mobile-badges-container">
                  <span className="mobile-product-badge" style={{background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'}}>
                    ΝΕΟ
                  </span>
                </div>
              )}
            </div>
            <div className="mobile-carousel-product-info">
              <h3>{product.name}</h3>
              <div className="mobile-carousel-product-price">
                {product.oldPriceDisplay && (
                  <span className="mobile-carousel-old-price">{product.oldPriceDisplay}</span>
                )}
                <span className="mobile-carousel-new-price">{product.priceDisplay}</span>
              </div>
              <Link to={`/product/${product.id}`} className="mobile-carousel-view-btn">
                Προβολή
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}



// Hook για να ελέγχουμε αν είμαστε σε mobile
export function useMobile() {
  const [mobile, setMobile] = useState(isMobile());
  
  useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return mobile;
}
