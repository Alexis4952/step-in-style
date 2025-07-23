import React, { createContext, useContext, useState } from 'react';
import { supabase } from './supabaseClient';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Προσθήκη προϊόντος (αν υπάρχει, αυξάνει ποσότητα)
  const addToCart = (product) => {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
  };

  // Αφαίρεση προϊόντος
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Αλλαγή ποσότητας
  const updateQty = (id, qty) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty } : item));
  };

  // Checkout: Μείωση αποθέματος στη βάση
  const handleCheckout = async () => {
    for (const item of cart) {
      if (item.id && item.stock !== undefined && item.qty) {
        await supabase
          .from('products')
          .update({ stock: Math.max(0, item.stock - item.qty) })
          .eq('id', item.id);
      }
    }
    setCart([]); // Άδειασμα καλαθιού
  };

  // Υπολογισμός συνόλου
  const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, total, handleCheckout }}>
      {children}
    </CartContext.Provider>
  );
} 