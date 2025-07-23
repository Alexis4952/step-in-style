import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductPage.css';
import { ProductsContext } from './App';
import Slider from 'react-slick';
import { ProductCardWithLogo } from './App';
import { useCart } from './CartContext';

export default function ProductPage({ productId: propProductId }) {
  const { productId } = useParams();
  const { mockProducts } = useContext(ProductsContext);
  const id = Number(propProductId || productId);
  const product = mockProducts.find(p => p.id === id) || mockProducts[0];
  const [mainImg, setMainImg] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('desc');
  const { addToCart } = useCart();

  useEffect(() => {
    // Όταν αλλάζει το προϊόν, κάνε reset states και scroll στην κορυφή
    setMainImg(product.images[0]);
    setSelectedSize(null);
    setActiveTab('desc');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);
  // Προτεινόμενα: 3 άλλα προϊόντα
  const suggested = mockProducts.filter(p => p.id !== product.id).slice(0,3);

  if (!product) return <div style={{padding: 40}}>Το προϊόν δεν βρέθηκε.</div>;

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
              <span className={product.stock > 0 ? 'in-stock' : 'out-stock'}>{product.stock > 0 ? 'Άμεσα διαθέσιμο' : 'Εξαντλημένο'}</span>
            </div>
            <div className="product-price-hero">
              {product.oldPriceDisplay && (
                <span style={{textDecoration:'line-through',color:'#b82a2a',fontWeight:700,fontSize:22,marginRight:14}}>{product.oldPriceDisplay}</span>
              )}
              <span style={{color:'#b87b2a',fontWeight:900,fontSize:28}}>{product.priceDisplay}</span>
            </div>
            <div className="product-sizes-hero">
              <div>Μέγεθος:</div>
              {product.sizes.map(size => (
                <button key={size} className={`size-btn-hero${selectedSize===size?' selected':''}`} onClick={()=>setSelectedSize(size)}>{size}</button>
              ))}
            </div>
            <button className="add-to-cart-hero" disabled={!selectedSize} onClick={() => selectedSize && addToCart({ ...product, selectedSize })}>Προσθήκη στο καλάθι</button>
            {!selectedSize && <div className="choose-size-msg">Επίλεξε μέγεθος για να συνεχίσεις</div>}
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