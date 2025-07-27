require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testFixedQueries() {
  console.log('Testing optimized queries...');
  
  try {
    // Test 1: Basic job listings query (should work now)
    console.log('1. Testing basic job listings...');
    const { data: jobs, error: jobError } = await supabase
      .from('job_listings')
      .select('*')
      .eq('posted_by_id', '75bb6746-00b3-4102-9509-5dab397dc5f3')
      .order('created_at', { ascending: false });
    
    if (jobError) {
      console.log('❌ Job query failed:', jobError);
    } else {
      console.log('✅ Job query successful! Found:', jobs?.length || 0, 'jobs');
    }

    // Test 2: Job with user join (should work)
    console.log('2. Testing job with user join...');
    const { data: jobsWithUser, error: userJoinError } = await supabase
      .from('job_listings')
      .select(`
        *,
        posted_by:users(name, avatar_url)
      `)
      .eq('posted_by_id', '75bb6746-00b3-4102-9509-5dab397dc5f3')
      .order('created_at', { ascending: false });
    
    if (userJoinError) {
      console.log('❌ User join query failed:', userJoinError);
    } else {
      console.log('✅ User join query successful! Found:', jobsWithUser?.length || 0, 'jobs');
    }
    
    // Test 3: Test if static data files exist
    console.log('3. Testing static data availability...');
    try {
      const response = await fetch('/api/static/cities');
      const citiesData = await response.json();
      console.log('✅ Static cities data available! Count:', citiesData?.cities?.length || 0);
    } catch (staticError) {
      console.log('❌ Static cities data unavailable:', staticError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFixedQueries();
