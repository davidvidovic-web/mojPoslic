require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./src/lib/supabase');

async function testFixedJobQuery() {
  console.log('Testing fixed job query...');
  
  try {
    const { data, error } = await supabase
      .from('job_listings')
      .select('*,city:cities(name)')
      .eq('posted_by_id', '75bb6746-00b3-4102-9509-5dab397dc5f3')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Query failed:', error);
    } else {
      console.log('✅ Query successful!');
      console.log('📊 Found', data?.length || 0, 'jobs');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testFixedJobQuery();
