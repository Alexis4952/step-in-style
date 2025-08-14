import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaFilter, FaSort, FaHeart, FaEye, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useMobile, MobileNavbar, MobileHero, MobileProductCard, MobileCarouselsByTag } from '../mobile/MobileApp';
import { useCart, CartProvider } from '../../CartContext';
import { useAuth, AuthProvider } from '../AuthContext';
import logoMain from '../logo.svg';
import Slider from 'react-slick';
import './App.css';

// 🎠 ORIGINAL CAROUSELS - BACK TO NORMAL
function CarouselsByTag({ mockProducts }) {
  const mobile = useMobile();
  
  if (mobile) {
    return <MobileCarouselsByTag mockProducts={mockProducts} />;
  }
  
  if (!mockProducts || mockProducts.length === 0) {
  return (
      <div className="home-carousels-container">
        <div className="carousels-status">
          <div className="status-content">
            <span className="status-icon">⏳</span>
            <span className="status-text">Φόρτωση προϊόντων...</span>
            </div>
        </div>
      </div>
    );
  }
  
  const discountedProducts = mockProducts.filter(p => p.oldPrice && p.oldPrice > p.price);
  const newProducts = [...mockProducts].sort((a, b) => b.id - a.id).slice(0, 6);
  const popularProducts = [...mockProducts]
    .filter(p => p.rating >= 4.0 || p.stock > 10)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);

  return (
    <div className="home-carousels-container">
      {/* 🔥 Προϊόντα σε Έκπτωση */}
      {discountedProducts.length > 0 && (
        <section className="home-carousel-section discount-carousel">
          <div className="carousel-header">
            <div className="carousel-title">
              <span className="carousel-icon">🔥</span>
              Προϊόντα σε Έκπτωση
            </div>
            <div className="carousel-subtitle">Απόκτησε τα αγαπημένα σου σε εξαιρετικές τιμές!</div>
          </div>
          
          <div className="carousel-content">
            <Slider 
              dots={true}
              infinite={discountedProducts.length > 3}
              speed={500}
              slidesToShow={Math.min(3, discountedProducts.length)}
              slidesToScroll={1}
              arrows={discountedProducts.length > 3}
              autoplay={discountedProducts.length > 3}
              autoplaySpeed={4000}
              pauseOnHover={true}
              responsive={[
                { breakpoint: 1400, settings: { slidesToShow: Math.min(3, discountedProducts.length), slidesToScroll: 1 } },
                { breakpoint: 1100, settings: { slidesToShow: Math.min(2, discountedProducts.length), slidesToScroll: 1 } },
                { breakpoint: 700, settings: { slidesToShow: 1, slidesToScroll: 1 } }
              ]}
            >
              {discountedProducts.map(product => (
                <div key={product.id} className="carousel-slide">
                  <ProductCardWithLogo product={product} />
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}

      {/* ✨ Νέα Προϊόντα */}
      {newProducts.length > 0 && (
        <section className="home-carousel-section new-products-carousel">
          <div className="carousel-header">
            <div className="carousel-title">
              <span className="carousel-icon">✨</span>
              Νέα Προϊόντα
            </div>
            <div className="carousel-subtitle">Ανακάλυψε τα τελευταία arrivals!</div>
          </div>
          
          <div className="carousel-content">
            <Slider 
              dots={true}
              infinite={newProducts.length > 3}
              speed={500}
              slidesToShow={Math.min(3, newProducts.length)}
              slidesToScroll={1}
              arrows={newProducts.length > 3}
              autoplay={newProducts.length > 3}
              autoplaySpeed={4500}
              pauseOnHover={true}
              responsive={[
                { breakpoint: 1400, settings: { slidesToShow: Math.min(3, newProducts.length), slidesToScroll: 1 } },
                { breakpoint: 1100, settings: { slidesToShow: Math.min(2, newProducts.length), slidesToScroll: 1 } },
                { breakpoint: 700, settings: { slidesToShow: 1, slidesToScroll: 1 } }
              ]}
            >
              {newProducts.map(product => (
                <div key={product.id} className="carousel-slide">
                  <ProductCardWithLogo product={product} />
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}

      {/* ⭐ Δημοφιλή Προϊόντα */}
      {popularProducts.length > 0 && (
        <section className="home-carousel-section popular-carousel">
          <div className="carousel-header">
            <div className="carousel-title">
              <span className="carousel-icon">⭐</span>
              Δημοφιλή Προϊόντα
            </div>
            <div className="carousel-subtitle">Τα προϊόντα που αγαπούν όλοι!</div>
          </div>
          
          <div className="carousel-content">
            <Slider 
              dots={true}
              infinite={popularProducts.length > 3}
              speed={500}
              slidesToShow={Math.min(3, popularProducts.length)}
              slidesToScroll={1}
              arrows={popularProducts.length > 3}
              autoplay={popularProducts.length > 3}
              autoplaySpeed={5000}
              pauseOnHover={true}
              responsive={[
                { breakpoint: 1400, settings: { slidesToShow: Math.min(3, popularProducts.length), slidesToScroll: 1 } },
                { breakpoint: 1100, settings: { slidesToShow: Math.min(2, popularProducts.length), slidesToScroll: 1 } },
                { breakpoint: 700, settings: { slidesToShow: 1, slidesToScroll: 1 } }
              ]}
            >
              {popularProducts.map(product => (
                <div key={product.id} className="carousel-slide">
                  <ProductCardWithLogo product={product} />
        </div>
              ))}
            </Slider>
      </div>
    </section>
      )}
    </div>
  );
}

// ORIGINAL PRODUCT CARD - BACK TO NORMAL
export function ProductCardWithLogo({ product }) {
  const { addToCart } = useCart();
  const mobile = useMobile();
  
  if (mobile) {
    return <MobileProductCard product={product} />;
  }
  
  return (
    <div className="product-card home-product-card">
      {/* Product Image with Link */}
      <Link to={`/product/${product.id}`} className="product-image-link">
        <div className="product-image-container">
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-image"
      loading="lazy"
          />
          



          {/* Rating Badge */}
          {product.rating && product.rating >= 4.5 && (
            <div className="product-badge rating-badge" style={{top: 'auto', bottom: '12px', left: '12px'}}>
              {product.rating}
            </div>
          )}
        </div>
      </Link>
      
      {/* Product Content */}
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-brand">{product.brand}</div>
        </div>
        
        <div className="price-section">
          {product.oldPriceDisplay && product.oldPrice > product.price && (
            <span className="old-price">{product.oldPriceDisplay}</span>
          )}
          <span className="current-price">{product.priceDisplay}</span>
        </div>
        
        <div className="product-actions">
          <Link to={`/product/${product.id}`} className="view-product-btn">
            Προβολή Προϊόντος
          </Link>
          
          <button 
            className="add-to-cart-btn" 
            onClick={() => addToCart(product)}
            disabled={!product.hasStock}
          >
            Προσθήκη στο Καλάθι
          </button>
        </div>
      </div>
      </div>
  );
}

// Main App Component - BACK TO ORIGINAL
function App() {
    return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const mobile = useMobile();
  
  if (mobile) {
    return <MobileNavbar />;
  }
  
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:productId" element={<ProductPageWrapper />} />
          <Route path="/account" element={<AccountDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Routes>
        <Footer />
        <FloatingCart />
      </div>
    </Router>
  );
}

// Home Page - BACK TO ORIGINAL
function HomePage() {
  const [mockProducts, setMockProducts] = useState([]);
  
  useEffect(() => {
    const products = [
      {
        id: 1,
        name: "ΦΛΑΤ ΠΕΔΙΛΑ",
        brand: "STEP IN STYLE",
        price: 57.5,
        oldPrice: 115,
        priceDisplay: "57.5€",
        oldPriceDisplay: "115€",
        image: "https://via.placeholder.com/300x200/FFE4E1/000000?text=Flat+Sandals",
        rating: 4.5,
        stock: 10,
        hasStock: true
      },
      {
        id: 2,
        name: "ΧΡΥΣΑ ΠΕΔΙΛΑ",
        brand: "STEP IN STYLE",
        price: 32.5,
        oldPrice: 65,
        priceDisplay: "32.5€",
        oldPriceDisplay: "65€",
        image: "https://via.placeholder.com/300x200/FFD700/000000?text=Gold+Sandals",
        rating: 4.5,
        stock: 15,
        hasStock: true
      },
      {
        id: 3,
        name: "ΠΕΔΙΛΑ ΦΛΑΤ",
        brand: "STEP IN STYLE",
        price: 25,
        oldPrice: 50,
        priceDisplay: "25€",
        oldPriceDisplay: "50€",
        image: "https://via.placeholder.com/300x200/98FB98/000000?text=Flat+Sandals",
        rating: 4.5,
        stock: 20,
        hasStock: true
      }
    ];
    setMockProducts(products);
  }, []);

  return (
    <>
      <Hero />
      <CarouselsByTag mockProducts={mockProducts} />
    </>
  );
}

// Other components - BACK TO ORIGINAL
function Header() {
  return (
    <header className="site-header">
      <div className="header-content">
        <div className="logo">
          <img src={logoMain} alt="Step in Style" />
        </div>
        <nav className="main-nav">
          <Link to="/">Αρχική</Link>
          <Link to="/products">Προϊόντα</Link>
          <Link to="/account">Λογαριασμός</Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Καλώς ήρθες στο Step in Style</h1>
        <p>Ανακάλυψε τα πιο όμορφα παπούτσια</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p>&copy; 2024 Step in Style. Όλα τα δικαιώματα διατηρούνται.</p>
      </div>
    </footer>
  );
}

function FloatingCart() {
  const { cart } = useCart();
  return (
    <button className="floating-cart">
      <FaShoppingCart />
      {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
    </button>
  );
}

function ProductsPage() {
  return <div>Products Page</div>;
}

function ProductPageWrapper() {
  const { productId } = useParams();
  return <div>Product {productId}</div>;
}

function AccountDashboard() {
  return <div>Account Dashboard</div>;
}

function AdminDashboard() {
  return <div>Admin Dashboard</div>;
}

function AdminLoginPage() {
  return <div>Admin Login</div>;
}

export default App;
