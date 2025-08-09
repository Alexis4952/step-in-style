const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://ylvwegrtvuyrjekcyvyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdndlZ3J0dnV5cmpla2N5dnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDY1OTQsImV4cCI6MjA2NzMyMjU5NH0.Na4S5H1t9fjrOvAZapn8nk_QuDnxAUtSBWCNK4cVlWQ'
);

async function testDashboardStats() {
  try {
    console.log('🔍 Testing Dashboard Statistics...');
    
    // Test 1: Get total orders
    console.log('\n📦 Getting total orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
    } else {
      console.log(`✅ Total orders: ${orders?.length || 0}`);
    }

    // Test 2: Get total revenue
    console.log('\n💰 Calculating total revenue...');
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    console.log(`✅ Total revenue: ${totalRevenue.toFixed(2)}€`);

    // Test 3: Get new customers this month
    console.log('\n👥 Getting new customers this month...');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const { data: newCustomers, error: customersError } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', new Date(currentYear, currentMonth, 1).toISOString())
      .lt('created_at', new Date(currentYear, currentMonth + 1, 1).toISOString());

    if (customersError) {
      console.error('❌ Error fetching customers:', customersError);
    } else {
      console.log(`✅ New customers this month: ${newCustomers?.length || 0}`);
    }

    // Test 4: Get available products
    console.log('\n👟 Getting available products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('available', true);

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
    } else {
      console.log(`✅ Available products: ${products?.length || 0}`);
    }

    // Test 5: Get low stock products
    console.log('\n⚠️ Getting low stock products...');
    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from('products')
      .select('*')
      .lt('stock', 5)
      .gt('stock', 0);

    if (lowStockError) {
      console.error('❌ Error fetching low stock products:', lowStockError);
    } else {
      console.log(`✅ Low stock products: ${lowStockProducts?.length || 0}`);
    }

    // Test 6: Get pending orders
    console.log('\n⏳ Getting pending orders...');
    const { data: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'processing']);

    if (pendingError) {
      console.error('❌ Error fetching pending orders:', pendingError);
    } else {
      console.log(`✅ Pending orders: ${pendingOrders?.length || 0}`);
    }

    // Summary
    console.log('\n📊 DASHBOARD SUMMARY:');
    console.log(`📦 Total Orders: ${orders?.length || 0}`);
    console.log(`💰 Total Revenue: ${totalRevenue.toFixed(2)}€`);
    console.log(`👥 New Customers (month): ${newCustomers?.length || 0}`);
    console.log(`👟 Available Products: ${products?.length || 0}`);
    console.log(`⚠️ Low Stock Products: ${lowStockProducts?.length || 0}`);
    console.log(`⏳ Pending Orders: ${pendingOrders?.length || 0}`);

  } catch (error) {
    console.error('❌ Dashboard test failed:', error);
  }
}

testDashboardStats(); 