import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import paymentService from './services/paymentService';
import notificationService from './services/notificationService';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { user } = useAuth();

  // Φόρτωση καλαθιού από localStorage κατά την εκκίνηση
  useEffect(() => {
    console.log('🛒 Loading cart from localStorage...');
    const savedCart = localStorage.getItem('step-in-style-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('🛒 Found saved cart:', parsedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('step-in-style-cart');
      }
    } else {
      console.log('🛒 No saved cart found');
    }
  }, []);

  // Αποθήκευση καλαθιού στο localStorage όταν αλλάζει
  useEffect(() => {
    if (cart.length > 0) {
      console.log('🛒 Saving cart to localStorage:', cart);
      localStorage.setItem('step-in-style-cart', JSON.stringify(cart));
    } else if (cart.length === 0) {
      // Μόνο αν το cart είναι άδειο και ΔΕΝ είναι η πρώτη φόρα που φορτώνει
      const savedCart = localStorage.getItem('step-in-style-cart');
      if (savedCart) {
        console.log('🛒 Cart is empty, removing from localStorage');
        localStorage.removeItem('step-in-style-cart');
      }
    }
  }, [cart]);

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

  // Καθάρισμα καλαθιού
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('step-in-style-cart');
  };

  // Δημιουργία παραγγελίας (χωρίς πληρωμή - για test)
  const createOrder = async (customerInfo = {}) => {
    if (!user) {
      throw new Error('Πρέπει να είστε συνδεδεμένος για να κάνετε παραγγελία');
    }

    if (cart.length === 0) {
      throw new Error('Το καλάθι είναι άδειο');
    }

    try {
      // 1. Δημιουργία παραγγελίας
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerInfo.name || user.user_metadata?.full_name || 'Άγνωστος Πελάτης',
          customer_email: user.email,
          total: total,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) {
        throw new Error('Σφάλμα κατά τη δημιουργία παραγγελίας: ' + orderError.message);
      }

      // 2. Προσθήκη order_items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.qty,
        price: parseFloat(item.price)
      }));

      console.log('📦 Creating order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw new Error('Σφάλμα κατά την προσθήκη προϊόντων: ' + itemsError.message);
      }

      console.log('✅ Order items created successfully');

      // 3. Μείωση αποθέματος
      for (const item of cart) {
        if (item.id && item.stock !== undefined && item.qty) {
          await supabase
            .from('products')
            .update({ stock: Math.max(0, item.stock - item.qty) })
            .eq('id', item.id);
        }
      }

      // 4. Αποστολή notifications
      await notificationService.sendOrderConfirmationEmail(orderData);
      await notificationService.sendAdminNewOrderAlert(orderData);

      // 5. Άδειασμα καλαθιού
      setCart([]);
      localStorage.removeItem('step-in-style-cart');

      return {
        success: true,
        orderId: orderData.id,
        message: 'Η παραγγελία ολοκληρώθηκε επιτυχώς!'
      };

    } catch (error) {
      console.error('Checkout error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  };

  // Checkout με πληρωμή (myPOS)
  const handleCheckoutWithPayment = async (customerInfo = {}) => {
    try {
      // 1. Δημιουργία παραγγελίας με status 'pending'
      const orderResult = await createOrder(customerInfo);
      if (!orderResult.success) {
        return orderResult;
      }

      // 2. Δημιουργία payment URL
      const paymentUrl = await paymentService.createPaymentUrl({
        orderId: orderResult.orderId,
        total: total,
        customerEmail: user.email,
        customerName: customerInfo.name || user.user_metadata?.full_name || 'Άγνωστος Πελάτης'
      });

      // 3. Redirect στη myPOS
      window.location.href = paymentUrl;

      return {
        success: true,
        orderId: orderResult.orderId,
        message: 'Ανακατεύθυνση για πληρωμή...'
      };

    } catch (error) {
      console.error('Checkout with payment error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  };

  // Άμεση παραγγελία (χωρίς πληρωμή - legacy για τώρα)
  const handleCheckout = createOrder;

  // Υπολογισμός συνόλου
  const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQty, 
      clearCart,
      total, 
      handleCheckout, 
      handleCheckoutWithPayment,
      createOrder 
    }}>
      {children}
    </CartContext.Provider>
  );
} 