import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise, createPaymentIntent } from './services/stripeService';
import CheckoutSizeSelector from './components/CheckoutSizeSelector';
import { supabase } from './supabaseClient';
import './App.css';

// Stripe Card Styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },
  },
};

// Checkout Form Component (with Stripe)
function CheckoutForm() {
  const { cart, total, clearCart, updateItemSize } = useCart();
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: '',
    city: '',
    zipCode: ''
  });
  
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Έλεγχος αν υπάρχουν παπούτσια χωρίς νούμερο
  const hasShoesWithoutSize = () => {
    return cart.some(item => 
      item.category === 'Παπούτσια' && (!item.selectedSize || item.selectedSize === '')
    );
  };

  // Validation
  const validateForm = () => {
    // Έλεγχος για παπούτσια χωρίς νούμερο
    const shoesWithoutSize = cart.filter(item => 
      item.category === 'Παπούτσια' && (!item.selectedSize || item.selectedSize === '')
    );
    
    if (shoesWithoutSize.length > 0) {
      setError(`Παρακαλώ επιλέξτε νούμερο για τα παπούτσια: ${shoesWithoutSize.map(item => item.name).join(', ')}`);
      return false;
    }
    
    if (!customerInfo.name.trim()) {
      setError('Παρακαλώ εισάγετε το όνομά σας');
      return false;
    }
    if (!customerInfo.email.trim()) {
      setError('Παρακαλώ εισάγετε το email σας');
      return false;
    }
    if (!customerInfo.phone.trim()) {
      setError('Παρακαλώ εισάγετε το τηλέφωνό σας');
      return false;
    }
    if (!customerInfo.address.trim()) {
      setError('Παρακαλώ εισάγετε τη διεύθυνσή σας');
      return false;
    }
    if (!customerInfo.city.trim()) {
      setError('Παρακαλώ εισάγετε την πόλη');
      return false;
    }
    
    // Account creation validation
    if (createAccount && !user) {
      if (!password) {
        setError('Παρακαλώ εισάγετε κωδικό πρόσβασης');
        return false;
      }
      if (password.length < 6) {
        setError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Οι κωδικοί δεν ταιριάζουν');
        return false;
      }
    }
    
    setError('');
    return true;
  };



  // Handle form submission with Stripe payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!stripe || !elements) {
      setError('Το σύστημα πληρωμών δεν είναι έτοιμο. Παρακαλώ δοκιμάστε ξανά.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      let finalUserId = user?.id;

      // If user wants to create account and isn't logged in
      if (createAccount && !user) {
        const { data: authData, error: authError } = await register(
          customerInfo.email, 
          password, 
          { 
            full_name: customerInfo.name, 
            phone: customerInfo.phone 
          }
        );
        
        if (authError) {
          throw new Error('Σφάλμα κατά τη δημιουργία λογαριασμού: ' + authError);
        }
        
        finalUserId = authData.user?.id;
      }

      // Prepare order data
      const orderData = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.qty,
          price: parseFloat(item.price),
          selectedSize: item.selectedSize || null,
          category: item.category || null
        }))
      };

      // Create payment intent
      const { clientSecret, paymentIntentId } = await createPaymentIntent(total, orderData);

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: {
              line1: customerInfo.address,
              city: customerInfo.city,
              postal_code: customerInfo.zipCode,
              country: 'GR'
            }
          }
        }
      });

      if (stripeError) {
        throw new Error('Σφάλμα πληρωμής: ' + stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        let result;
        
        if (user) {
          // Εγγεγραμμένος χρήστης - αποθήκευση στη Supabase
          console.log('💾 Saving order for registered user to Supabase...');
          
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
              customer_name: customerInfo.name,
              customer_email: customerInfo.email,
              customer_phone: customerInfo.phone,
              customer_address: `${customerInfo.address}, ${customerInfo.city} ${customerInfo.zipCode}`,
              items: cart.map(item => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.qty,
                price: parseFloat(item.price),
                selectedSize: item.selectedSize || null,
                category: item.category || null
              })),
              total: total,
              status: 'pending',
              order_type: 'registered',
              payment_status: 'completed',
              payment_method: 'stripe',
              payment_id: paymentIntentId,
              payment_amount: total,
              user_id: user.id
            })
            .select()
            .single();

          if (orderError) {
            console.error('Supabase order error:', orderError);
            console.error('Order error details:', JSON.stringify(orderError, null, 2));
            throw new Error('Σφάλμα κατά τη δημιουργία παραγγελίας στη βάση δεδομένων: ' + (orderError.message || orderError.details || 'Unknown error'));
          }

          result = {
            success: true,
            order: {
              ...orderData,
              order_number: `ORD-${String(orderData.id).padStart(8, '0')}`
            }
          };
          
        } else {
          // Guest χρήστης - αποθήκευση στη Supabase
          console.log('💾 Saving guest order to Supabase...');
          
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
              customer_name: customerInfo.name,
              customer_email: customerInfo.email,
              customer_phone: customerInfo.phone,
              customer_address: `${customerInfo.address}, ${customerInfo.city} ${customerInfo.zipCode}`,
              items: cart.map(item => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.qty,
                price: parseFloat(item.price),
                selectedSize: item.selectedSize || null,
                category: item.category || null
              })),
              total: total,
              status: 'pending',
              order_type: 'guest',
              payment_status: 'completed',
              payment_method: 'stripe',
              payment_id: paymentIntentId,
              payment_amount: total,
              user_id: null // Guest users don't have user_id
            })
            .select()
            .single();

          if (orderError) {
            console.error('Supabase guest order error:', orderError);
            console.error('Guest order error details:', JSON.stringify(orderError, null, 2));
            throw new Error('Σφάλμα κατά τη δημιουργία παραγγελίας στη βάση δεδομένων: ' + (orderError.message || orderError.details || 'Unknown error'));
          }

          result = {
            success: true,
            order: {
              ...orderData,
              order_number: `ORD-${String(orderData.id).padStart(8, '0')}`
            }
          };
        }

        const order = result.order;
        
        // Clear cart and navigate to success
        clearCart();
        navigate('/order-success', { 
          state: { 
            orderId: order.id,
            orderNumber: order.order_number || `ORD-${order.id}`,
            email: customerInfo.email,
            isGuest: !user,
            paymentIntentId: paymentIntentId,
            paymentStatus: 'completed'
          } 
        });
      } else {
        throw new Error('Η πληρωμή δεν ολοκληρώθηκε επιτυχώς');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message || 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-empty">
          <h2>Το καλάθι σας είναι άδειο</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Συνέχεια Αγορών
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Ολοκλήρωση Παραγγελίας</h1>
      </div>

      <div className="checkout-content">
        {/* Order Summary */}
        <div className="checkout-summary">
          <h3>Περίληψη Παραγγελίας</h3>
          <div className="order-items">
            {cart.map(item => (
              <div key={item.id} className="order-item">
                <img src={item.image} alt={item.name} className="order-item-image" />
                <div className="order-item-details">
                  <h4>{item.name}</h4>
                  <p>Ποσότητα: {item.qty}</p>
                  
                  {/* Size Selector για παπούτσια */}
                  <CheckoutSizeSelector item={item} />
                  
                  <p className="order-item-price">{(parseFloat(item.price) * item.qty).toFixed(2)}€</p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <h3>Σύνολο: {total.toFixed(2)}€</h3>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="checkout-form-container">
          <form onSubmit={handleSubmit} className="checkout-form">
            <h3>Στοιχεία Παραγγελίας</h3>
            
            {error && <div className="error-message">{error}</div>}

            {/* Customer Information */}
            <div className="form-section">
              <h4>Προσωπικά Στοιχεία</h4>
              
              <div className="form-group">
                <label>Ονοματεπώνυμο *</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={loading || !!user}
                  />
                </div>

                <div className="form-group">
                  <label>Τηλέφωνο *</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="form-section">
              <h4>Διεύθυνση Παράδοσης</h4>
              
              <div className="form-group">
                <label>Διεύθυνση *</label>
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Οδός και αριθμός"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Πόλη *</label>
                  <input
                    type="text"
                    value={customerInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Ταχυδρομικός Κώδικας</label>
                  <input
                    type="text"
                    value={customerInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Account Creation Option */}
            {!user && (
              <div className="form-section">
                <div className="account-option">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      disabled={loading}
                    />
                    <span className="checkmark"></span>
                    Θέλω να δημιουργήσω λογαριασμό για παρακολούθηση παραγγελιών
                  </label>
                </div>

                {createAccount && (
                  <div className="account-fields">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Κωδικός Πρόσβασης *</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          minLength={6}
                          disabled={loading}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Επιβεβαίωση Κωδικού *</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength={6}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Information */}
            <div className="form-section">
              <h4>Στοιχεία Πληρωμής</h4>
              <div className="payment-card-container">
                <label>Στοιχεία Κάρτας *</label>
                <div className="stripe-card-element">
                  <CardElement options={cardElementOptions} />
                </div>
                <div className="payment-icons">
                  <span>💳 Δεκτές κάρτες: Visa, Mastercard, American Express</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="btn-secondary"
                disabled={loading}
              >
                Επιστροφή στο Καλάθι
              </button>
              
              <button
                type="submit"
                className="btn-primary checkout-submit"
                disabled={loading || hasShoesWithoutSize()}
                style={{
                  opacity: (loading || hasShoesWithoutSize()) ? 0.5 : 1,
                  cursor: (loading || hasShoesWithoutSize()) ? 'not-allowed' : 'pointer',
                  backgroundColor: (loading || hasShoesWithoutSize()) ? '#666' : ''
                }}
              >
                {loading 
                  ? 'Επεξεργασία...' 
                  : hasShoesWithoutSize() 
                    ? '⚠️ Επιλέξτε νούμερα παπουτσιών'
                    : `Ολοκλήρωση Παραγγελίας (${total.toFixed(2)}€)`
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main CheckoutPage Component with Stripe Elements Provider
export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
