const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'eur', orderData } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: currency,
      metadata: {
        orderId: orderData?.orderId || '',
        customerName: orderData?.customerName || '',
        customerEmail: orderData?.customerEmail || '',
        items: JSON.stringify(orderData?.items || [])
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(400).json({ 
      error: {
        message: error.message 
      }
    });
  }
});

// Confirm payment success
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({ 
        success: true, 
        paymentIntent: paymentIntent 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment not completed' 
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(400).json({ 
      error: {
        message: error.message 
      }
    });
  }
});

// Get payment details
router.get('/payment/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json(paymentIntent);
  } catch (error) {
    console.error('Error retrieving payment:', error);
    res.status(400).json({ 
      error: {
        message: error.message 
      }
    });
  }
});

module.exports = router;
