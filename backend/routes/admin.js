const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// GET dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Get total orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');

    if (ordersError) throw ordersError;

    // Get total revenue
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    // Get new customers this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const { data: newCustomers, error: customersError } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', new Date(currentYear, currentMonth, 1).toISOString())
      .lt('created_at', new Date(currentYear, currentMonth + 1, 1).toISOString());

    if (customersError) throw customersError;

    // Get available products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('available', true);

    if (productsError) throw productsError;

    // Get low stock products (less than 5 items)
    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from('products')
      .select('*')
      .lt('stock', 5)
      .gt('stock', 0);

    if (lowStockError) throw lowStockError;

    // Get pending orders
    const { data: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'processing']);

    if (pendingError) throw pendingError;

    const stats = {
      totalOrders: orders?.length || 0,
      totalRevenue: totalRevenue.toFixed(2),
      newCustomersThisMonth: newCustomers?.length || 0,
      availableProducts: products?.length || 0,
      lowStockProducts: lowStockProducts?.length || 0,
      pendingOrders: pendingOrders?.length || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET recent orders
router.get('/dashboard/recent-orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Format the data for frontend
    const formattedOrders = data?.map(order => ({
      id: order.id,
      customer: `${order.users?.first_name || ''} ${order.users?.last_name || ''}`.trim() || order.users?.email || 'Unknown',
      date: new Date(order.created_at).toLocaleDateString('el-GR'),
      total: `${order.total?.toFixed(2)}€`,
      status: order.status,
      items: order.items || []
    })) || [];

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
});

// GET low stock products
router.get('/dashboard/low-stock', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('name, stock')
      .lt('stock', 5)
      .gt('stock', 0)
      .order('stock', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// GET pending orders
router.get('/dashboard/pending-orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the data for frontend
    const formattedOrders = data?.map(order => ({
      id: order.id,
      customer: `${order.users?.first_name || ''} ${order.users?.last_name || ''}`.trim() || order.users?.email || 'Unknown',
      date: new Date(order.created_at).toLocaleDateString('el-GR'),
      total: `${order.total?.toFixed(2)}€`,
      status: order.status
    })) || [];

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ error: 'Failed to fetch pending orders' });
  }
});

// GET revenue data for chart (last 6 months)
router.get('/dashboard/revenue-chart', async (req, res) => {
  try {
    const months = [];
    const currentDate = new Date();
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        startDate: date.toISOString(),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString()
      });
    }

    const revenueData = [];

    for (const monthData of months) {
      const { data, error } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', monthData.startDate)
        .lt('created_at', monthData.endDate)
        .eq('status', 'completed');

      if (error) throw error;

      const monthRevenue = data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      
      const monthNames = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαϊ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
      
      revenueData.push({
        month: monthNames[monthData.month],
        value: Math.round(monthRevenue)
      });
    }

    res.json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    res.status(500).json({ error: 'Failed to fetch revenue chart data' });
  }
});

module.exports = router; 