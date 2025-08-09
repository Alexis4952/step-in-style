const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://ylvwegrtvuyrjekcyvyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdndlZ3J0dnV5cmpla2N5dnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDY1OTQsImV4cCI6MjA2NzMyMjU5NH0.Na4S5H1t9fjrOvAZapn8nk_QuDnxAUtSBWCNK4cVlWQ'
);

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Check if products table exists and has data
    console.log('\n📦 Checking products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
    } else {
      console.log(`✅ Found ${products?.length || 0} products in database`);
      if (products && products.length > 0) {
        console.log('📋 Products found:');
        products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} - Stock: ${product.stock} - Available: ${product.available}`);
        });
      }
    }
    
    // Test 2: Check if orders table exists
    console.log('\n📦 Checking orders table...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');
    
    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
    } else {
      console.log(`✅ Found ${orders?.length || 0} orders in database`);
    }
    
    // Test 3: Check if users table exists
    console.log('\n👥 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log(`✅ Found ${users?.length || 0} users in database`);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection(); 