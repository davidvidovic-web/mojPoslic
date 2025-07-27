require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQueries() {
  console.log('Testing dashboard queries...');
  
  try {
    // Test 1: Basic query without joins
    console.log('1. Basic job_listings query...');
    const { data: basic, error: basicError } = await supabase
      .from('job_listings')
      .select('*')
      .eq('posted_by_id', '75bb6746-00b3-4102-9509-5dab397dc5f3')
      .order('created_at', { ascending: false });
    
    if (basicError) {
      console.log('❌ Basic query failed:', basicError);
      return;
    } else {
      console.log('✅ Basic query successful! Found:', basic?.length || 0, 'jobs');
    }

    // Test 2: Cities table exists?
    console.log('2. Testing cities table...');
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name')
      .limit(1);
    
    if (citiesError) {
      console.log('❌ Cities query failed:', citiesError);
    } else {
      console.log('✅ Cities table accessible! Found:', cities?.length || 0, 'cities');
    }

    // Test 3: Job with city join
    console.log('3. Testing job with city join...');
    const { data: withCity, error: cityJoinError } = await supabase
      .from('job_listings')
      .select('*, city:cities(name)')
      .eq('posted_by_id', '75bb6746-00b3-4102-9509-5dab397dc5f3')
      .order('created_at', { ascending: false });
    
    if (cityJoinError) {
      console.log('❌ City join failed:', cityJoinError);
    } else {
      console.log('✅ City join successful! Found:', withCity?.length || 0, 'jobs');
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testQueries();
