const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ylvwegrtvuyrjekcyvyn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdndlZ3J0dnV5cmpla2N5dnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDY1OTQsImV4cCI6MjA2NzMyMjU5NH0.Na4S5H1t9fjrOvAZapn8nk_QuDnxAUtSBWCNK4cVlWQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('🔍 Δοκιμή σύνδεσης με τη βάση δεδομένων...');
  
  try {
    // Δοκιμή σύνδεσης
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Σφάλμα σύνδεσης:', error);
      return;
    }
    
    console.log('✅ Σύνδεση επιτυχής!');
    console.log(`📦 Βρέθηκαν ${data.length} προϊόντα`);
    
    if (data.length > 0) {
      console.log('📋 Πρώτο προϊόν:', data[0].name);
    }
    
  } catch (error) {
    console.error('❌ Κρίσιμο σφάλμα:', error);
  }
}

testDatabase();
