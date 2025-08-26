import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';

// Component για επιλογή νουμέρου που δείχνει μόνο διαθέσιμα sizes
export default function SizeSelector({ item, style = {}, className = '' }) {
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
      <div style={{ fontSize: '0.8rem', color: '#999' }}>
        Φόρτωση νουμέρων...
      </div>
    );
  }

  if (availableSizes.length === 0) {
    return (
      <div style={{ fontSize: '0.8rem', color: '#e74c3c', fontWeight: '600' }}>
        Εξαντλημένο
      </div>
    );
  }

  return (
    <div className={className}>
      <label style={{ fontSize: '0.8rem', color: '#b87b2a', fontWeight: '600' }}>
        Νούμερο:
      </label>
      <select 
        value={item.selectedSize || ''} 
        onChange={(e) => updateItemSize(item.id, e.target.value)}
        style={{
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid #f6c77a',
          fontSize: '0.8rem',
          backgroundColor: 'white',
          color: '#2d1c0b',
          marginTop: '4px',
          width: '100%',
          maxWidth: '80px',
          ...style
        }}
      >
        <option value="">Επιλέξτε...</option>
        {availableSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      
      {!item.selectedSize && (
        <div style={{ fontSize: '0.7rem', color: '#e74c3c', marginTop: '2px' }}>
          Απαιτείται!
        </div>
      )}
    </div>
  );
}
