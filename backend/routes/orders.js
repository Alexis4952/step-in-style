const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// File-based storage paths
const ORDERS_FILE = path.join(__dirname, '../data/orders.json');
const NOTIFICATIONS_FILE = path.join(__dirname, '../data/admin_notifications.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = path.join(__dirname, '../data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
};

// Helper functions for file operations
const readOrders = async () => {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeOrders = async (orders) => {
  await ensureDataDir();
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
};

const readNotifications = async () => {
  try {
    const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeNotifications = async (notifications) => {
  await ensureDataDir();
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
};

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}${random}`;
};

// POST /api/orders/guest - Δημιουργία guest παραγγελίας
router.post('/guest', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items,
      total,
      order_type = 'guest'
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

    // Read existing orders
    const orders = await readOrders();

    // Create new order
    const orderId = Date.now();
    const orderNumber = generateOrderNumber();
    
    const newOrder = {
      id: orderId,
      order_number: orderNumber,
      order_type,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items,
      total: parseFloat(total),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to orders array
    orders.push(newOrder);
    await writeOrders(orders);

    // Create admin notification
    try {
      const notifications = await readNotifications();
      const newNotification = {
        id: Date.now() + 1,
        title: 'Νέα Παραγγελία',
        message: `Νέα ${order_type === 'guest' ? 'guest ' : ''}παραγγελία από ${customer_name} - ${orderNumber}`,
        type: 'new_order',
        read: false,
        order_id: orderId,
        amount: parseFloat(total),
        created_at: new Date().toISOString()
      };
      
      notifications.push(newNotification);
      await writeNotifications(notifications);
    } catch (notificationError) {
      console.error('Σφάλμα κατά τη δημιουργία ειδοποίησης:', notificationError);
    }

    console.log('✅ ΝΕΑ ΠΑΡΑΓΓΕΛΙΑ:');
    console.log('🆔 Order ID:', orderId);
    console.log('📋 Order Number:', orderNumber);
    console.log('👤 Πελάτης:', customer_name);
    console.log('📧 Email:', customer_email);
    console.log('📞 Τηλέφωνο:', customer_phone);
    console.log('🏠 Διεύθυνση:', customer_address);
    console.log('💰 Σύνολο:', total + '€');
    console.log('📦 Προϊόντα:', items.length);
    console.log('🔄 Τύπος:', order_type);
    console.log('─'.repeat(50));

    res.status(201).json({
      success: true,
      message: 'Η παραγγελία δημιουργήθηκε επιτυχώς!',
      order: {
        id: orderId,
        order_number: orderNumber,
        status: 'pending',
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
    
    let orders = await readOrders();
    
    // Filter by status
    if (status && status !== 'all') {
      orders = orders.filter(order => order.status === status);
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(order => 
        order.customer_name.toLowerCase().includes(searchLower) ||
        order.customer_email.toLowerCase().includes(searchLower) ||
        order.order_number.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by created_at (newest first)
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = orders.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      orders: paginatedOrders,
      total: orders.length,
      page: parseInt(page),
      totalPages: Math.ceil(orders.length / limit)
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
    
    const orders = await readOrders();
    const order = orders.find(o => o.id == id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Η παραγγελία δεν βρέθηκε'
      });
    }
    
    res.json({
      success: true,
      order
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
    const { status } = req.body;
    
    const orders = await readOrders();
    const orderIndex = orders.findIndex(o => o.id == id);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Η παραγγελία δεν βρέθηκε'
      });
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updated_at = new Date().toISOString();
    
    await writeOrders(orders);
    
    console.log(`📋 Order ${orders[orderIndex].order_number} status updated to: ${status}`);
    
    res.json({
      success: true,
      message: 'Το στάτους της παραγγελίας ενημερώθηκε επιτυχώς',
      order: orders[orderIndex]
    });
  } catch (error) {
    console.error('Σφάλμα κατά την ενημέρωση παραγγελίας:', error);
    res.status(500).json({
      success: false,
      error: 'Σφάλμα κατά την ενημέρωση της παραγγελίας'
    });
  }
});

// DELETE /api/orders/:id - Διαγραφή παραγγελίας
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const orders = await readOrders();
    const filteredOrders = orders.filter(o => o.id != id);
    
    if (orders.length === filteredOrders.length) {
      return res.status(404).json({
        success: false,
        error: 'Η παραγγελία δεν βρέθηκε'
      });
    }
    
    await writeOrders(filteredOrders);
    
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
    
    const orders = await readOrders();
    const order = orders.find(o => 
      o.order_number === orderNumber && 
      o.customer_email.toLowerCase() === email.toLowerCase()
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Η παραγγελία δεν βρέθηκε με αυτά τα στοιχεία'
      });
    }
    
    // Return limited info for tracking
    res.json({
      success: true,
      order: {
        order_number: order.order_number,
        status: order.status,
        total: order.total,
        created_at: order.created_at,
        items: order.items.map(item => ({
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
