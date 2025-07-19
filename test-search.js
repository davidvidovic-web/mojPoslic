// Simple test script to check search API
const fetch = require('node-fetch');

const testQueries = [
  'grcka 32',
  'grcka banja luka',
  'Grcka 32',
  'Grcka banja luka',
  'Vase Pelagica 10',
  'Banja Luka'
];

async function testSearch(query) {
  try {
    console.log(`\n🔍 Testing query: "${query}"`);
    
    const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}&limit=1&countrycodes=ba`);
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ Results: ${data.length}`);
    
    if (data.length > 0) {
      console.log(`📍 ${data[0].display_name}`);
      console.log(`🗺️  Lat: ${data[0].lat}, Lng: ${data[0].lon}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing search API...\n');
  
  for (const query of testQueries) {
    await testSearch(query);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
  }
}

runTests();
