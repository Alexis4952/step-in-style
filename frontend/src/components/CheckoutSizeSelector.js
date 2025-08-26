import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';

// Component για επιλογή νουμέρου στο checkout που δείχνει μόνο διαθέσιμα sizes
export default function CheckoutSizeSelector({ item }) {
  const { updateItemSize, getAvailableSizes } = useCart();
  const [availableSizes, setAvailableSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSizes = async () => {
      if (item.category === 'Παπούτσια') {
        setLoading(true);
        const sizes = await getAvailableSizes(item.id);
        setAvailableSizes(sizes);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchSizes();
  }, [item.id, item.category, getAvailableSizes]);

  if (item.category !== 'Παπούτσια') {
    return null; // Δεν εμφανίζουμε size selector για μη-παπούτσια
  }

  if (loading) {
    return (
      <div className="checkout-size-selector">
        <label>Νούμερο: *</label>
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#999'
        }}>
          Φόρτωση νουμέρων...
        </div>
      </div>
    );
  }

  if (availableSizes.length === 0) {
    return (
      <div className="checkout-size-selector">
        <label>Νούμερο: *</label>
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: '#ffeaa7', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#e17055',
          fontWeight: '600',
          border: '2px solid #fdcb6e'
        }}>
          ⚠️ Εξαντλημένο - Επικοινωνήστε μαζί μας
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-size-selector">
      <label>Νούμερο: *</label>
      <select 
        value={item.selectedSize || ''} 
        onChange={(e) => updateItemSize(item.id, e.target.value)}
        required
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: '2px solid #f6c77a',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '0.9rem',
          backgroundColor: 'white',
          color: '#2d1c0b',
          marginTop: '8px',
          width: '100%',
          maxWidth: '120px'
        }}
      >
        <option value="">Επιλέξτε...</option>
        {availableSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      
      {!item.selectedSize && (
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#e74c3c', 
          marginTop: '4px',
          fontWeight: '600'
        }}>
          Απαιτείται για να συνεχίσετε!
        </div>
      )}
      
      {item.selectedSize && (
        <div style={{ 
          color: '#00b894', 
          fontWeight: '600', 
          fontSize: '0.85rem', 
          marginTop: '4px' 
        }}>
          ✓ Επιλεγμένο: {item.selectedSize}
        </div>
      )}
    </div>
  );
}
