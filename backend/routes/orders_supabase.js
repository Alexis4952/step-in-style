const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}${random}`;
};

// POST /api/orders/guest - Δημιουργία guest παραγγελίας με payment info
router.post('/guest', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items,
      total,
      order_type = 'guest',
      payment_status = 'pending',
      payment_method = 'stripe',
      payment_id = null,
      payment_amount = null
    } = req.body;

    // Validation
    if (!customer_name || !customer_email || !customer_phone || !customer_address) {
      return res.status(400).json({
        success: false,
        error: 'Όλα τα στοιχεία πελάτη είναι υποχρεωτικά'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Η παραγγελία πρέπει να περιέχει τουλάχιστον ένα προϊόν'
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Το σύνολο της παραγγελίας πρέπει να είναι μεγαλύτερο από 0'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return res.status(400).json({
        success: false,
        error: 'Μη έγκυρη διεύθυνση email'
      });
    }

    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Create new order in Supabase
    const { data: newOrder, error: orderError } = await supabase
      .from('guest_orders')
      .insert([
        {
          order_number: orderNumber,
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          items: JSON.stringify(items),
          total: parseFloat(total),
          status: 'pending',
          order_type,
          payment_status,
          payment_method,
          payment_id,
          payment_amount: payment_amount ? parseFloat(payment_amount) : parseFloat(total),
          payment_date: payment_status === 'completed' ? new Date().toISOString() : null
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Supabase order creation error:', orderError);
      return res.status(500).json({
        success: false,
        error: 'Σφάλμα κατά τη δημιουργία της παραγγελίας στη βάση δεδομένων'
      });
    }

    // Create admin notification in orders table (we can add a separate notifications table later)
    console.log('✅ ΝΕΑ GUEST ΠΑΡΑΓΓΕΛΙΑ:');
    console.log('🆔 Order ID:', newOrder.id);
    console.log('📋 Order Number:', orderNumber);
    console.log('👤 Πελάτης:', customer_name);
    console.log('📧 Email:', customer_email);
    console.log('📞 Τηλέφωνο:', customer_phone);
    console.log('🏠 Διεύθυνση:', customer_address);
    console.log('💰 Σύνολο:', total + '€');
    console.log('💳 Payment Status:', payment_status);
    console.log('🔗 Payment ID:', payment_id || 'N/A');
    console.log('📦 Προϊόντα:', items.length);
    console.log('─'.repeat(50));

    res.status(201).json({
      success: true,
      message: 'Η παραγγελία δημιουργήθηκε επιτυχώς!',
      order: {
        id: newOrder.id,
        order_number: orderNumber,
        status: 'pending',
        payment_status,
        total: parseFloat(total)
      }
    });

  } catch (error) {
    console.error('Σφάλμα κατά τη δημιουργία παραγγελίας:', error);
    res.status(500).json({
      success: false,
      error: 'Παρουσιάστηκε σφάλμα κατά τη δημιουργία της παραγγελίας'
    });
  }
});

// GET /api/orders - Ανάκτηση παραγγελιών για admin panel
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search = '' } = req.query;
    
    let query = supabase.from('guest_orders').select('*');
    
    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Filter by search
    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,order_number.ilike.%${search}%`);
    }
    
    // Order by created_at (newest first)
    query = query.order('created_at', { ascending: false });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + parseInt(limit) - 1);
    
    const { data: orders, error, count } = await query;
    
    if (error) {
      console.error('Supabase orders fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Σφάλμα κατά την ανάκτηση των παραγγελιών'
      });
    }
    
    // Parse items JSON for each order
    const ordersWithParsedItems = orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));
    
    res.json({
      success: true,
      orders: ordersWithParsedItems,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Σφάλμα κατά την ανάκτηση παραγγελιών:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά την ανάκτηση των παραγγελιών'
    });
  }
});

// GET /api/orders/:id - Ανάκτηση συγκεκριμένης παραγγελίας
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: order, error } = await supabase
      .from('guest_orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Η παραγγελία δεν βρέθηκε'
      });
    }
    
    // Parse items JSON
    const orderWithParsedItems = {
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    };
    
    res.json({
      success: true,
      order: orderWithParsedItems
    });
  } catch (error) {
    console.error('Σφάλμα κατά την ανάκτηση παραγγελίας:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά την ανάκτηση της παραγγελίας'
    });
  }
});

// PUT /api/orders/:id - Ενημέρωση στάτους παραγγελίας
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;
    
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;
    
    const { data: updatedOrder, error } = await supabase
      .from('guest_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !updatedOrder) {
      return res.status(404).json({
        success: false,
        error: 'Η παραγγελία δεν βρέθηκε'
      });
    }
    
    console.log(`📋 Order ${updatedOrder.order_number} updated:`, updateData);
    
    res.json({
      success: true,
      message: 'Η παραγγελία ενημερώθηκε επιτυχώς',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Σφάλμα κατά την ενημέρωση παραγγελίας:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά την ενημέρωση της παραγγελίας'
    });
  }
});

// PUT /api/orders/:id/payment - Ενημέρωση payment info
router.put('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_id, payment_amount } = req.body;
    
    const updateData = {
      payment_status,
      payment_id,
      payment_amount: payment_amount ? parseFloat(payment_amount) : null,
      payment_date: payment_status === 'completed' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedOrder, error } = await supabase
      .from('guest_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !updatedOrder) {
      return res.status(404).json({
        success: false,
        error: 'Η παραγγελία δεν βρέθηκε'
      });
    }
    
    console.log(`💳 Payment updated for order ${updatedOrder.order_number}:`, updateData);
    
    res.json({
      success: true,
      message: 'Τα στοιχεία πληρωμής ενημερώθηκαν επιτυχώς',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Σφάλμα κατά την ενημέρωση πληρωμής:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά την ενημέρωση της πληρωμής'
    });
  }
});

// DELETE /api/orders/:id - Διαγραφή παραγγελίας
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('guest_orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase order deletion error:', error);
      return res.status(500).json({
        success: false,
        error: 'Σφάλμα κατά τη διαγραφή της παραγγελίας'
      });
    }
    
    res.json({
      success: true,
      message: 'Η παραγγελία διαγράφηκε επιτυχώς'
    });
  } catch (error) {
    console.error('Σφάλμα κατά τη διαγραφή παραγγελίας:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά τη διαγραφή της παραγγελίας'
    });
  }
});

// GET /api/orders/track/:orderNumber - Παρακολούθηση παραγγελίας (για guests)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Απαιτείται email για παρακολούθηση παραγγελίας'
      });
    }
    
    const { data: order, error } = await supabase
      .from('guest_orders')
      .select('*')
      .eq('order_number', orderNumber)
      .eq('customer_email', email.toLowerCase())
      .single();
    
    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Η παραγγελία δεν βρέθηκε με αυτά τα στοιχεία'
      });
    }
    
    // Parse items and return limited info for tracking
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    
    res.json({
      success: true,
      order: {
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        total: order.total,
        created_at: order.created_at,
        items: items.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price
        }))
      }
    });
  } catch (error) {
    console.error('Σφάλμα κατά την παρακολούθηση παραγγελίας:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά την παρακολούθηση της παραγγελίας'
    });
  }
});

module.exports = router;
