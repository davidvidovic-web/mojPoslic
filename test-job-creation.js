const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testJobCreation() {
  console.log('🧪 Testing job creation API...');
  
  try {
    // First, let's make sure we can fetch the static data
    const citiesResponse = await fetch('http://localhost:3000/static/cities.json');
    const citiesData = await citiesResponse.json();
    console.log('✅ Cities data loaded:', citiesData.cities.length, 'cities');
    
    const categoriesResponse = await fetch('http://localhost:3000/static/categories.json');
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories data loaded:', categoriesData.categories.length, 'categories');
    
    // Test with a known city and category
    const testCity = citiesData.cities.find(c => c.key === 'banja-luka');
    const testCategory = categoriesData.categories.find(c => c.key === 'majstorski-radovi');
    
    if (!testCity || !testCategory) {
      console.error('❌ Test data not found:', { 
        hasCity: !!testCity, 
        hasCategory: !!testCategory 
      });
      return;
    }
    
    console.log('🔍 Test data:', {
      city: { key: testCity.key, name_bs: testCity.name_bs, name_en: testCity.name_en },
      category: { key: testCategory.key, name_bs: testCategory.name_bs, name_en: testCategory.name_en }
    });
    
    // Test job data
    const jobData = {
      title: 'Test Job for Database Schema',
      description: 'This is a test job to verify the database schema works with localized names.',
      type: 'quick_job',
      city_id: testCity.key,
      category_id: testCategory.key,
      email: 'test@example.com'
    };
    
    console.log('📤 Sending job creation request...');
    
    // Make the API call (this would need authentication in real usage)
    const response = await fetch('http://localhost:3000/api/jobs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In real usage, you'd need: 'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(jobData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Job creation successful!');
      console.log('📋 Created job:', result.data);
    } else {
      console.log('❌ Job creation failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Only run if server is available
testJobCreation();
