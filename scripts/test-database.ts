import { supabase } from '../src/lib/supabase'

async function testDatabase() {
  console.log('🔍 Testing database connection and structure...')
  
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...')
    const { data: testData, error: testError } = await supabase
      .from('job_listings')
      .select('count(*)')
      .limit(1)
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError)
      return
    }
    console.log('✅ Basic connection successful')

    // Test job_listings table structure
    console.log('\n2. Testing job_listings table...')
    const { data: jobsData, error: jobsError } = await supabase
      .from('job_listings')
      .select('*')
      .limit(1)
    
    if (jobsError) {
      console.error('❌ Jobs table error:', jobsError)
    } else {
      console.log('✅ Jobs table accessible')
      if (jobsData && jobsData.length > 0) {
        console.log('Sample job columns:', Object.keys(jobsData[0]))
      }
    }

    // Test cities table
    console.log('\n3. Testing cities table...')
    const { data: citiesData, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .limit(1)
    
    if (citiesError) {
      console.error('❌ Cities table error:', citiesError)
    } else {
      console.log('✅ Cities table accessible')
      if (citiesData && citiesData.length > 0) {
        console.log('Sample city columns:', Object.keys(citiesData[0]))
      }
    }

    // Test categories table
    console.log('\n4. Testing categories table...')
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1)
    
    if (categoriesError) {
      console.error('❌ Categories table error:', categoriesError)
    } else {
      console.log('✅ Categories table accessible')
      if (categoriesData && categoriesData.length > 0) {
        console.log('Sample category columns:', Object.keys(categoriesData[0]))
      }
    }

    // Test foreign key relationships
    console.log('\n5. Testing foreign key relationships...')
    const { data: joinData, error: joinError } = await supabase
      .from('job_listings')
      .select(`
        id,
        title,
        city_id,
        category_id,
        cities!city_id(id, key, name_en),
        categories!category_id(id, key, name_en)
      `)
      .limit(1)
    
    if (joinError) {
      console.error('❌ Foreign key relationships error:', joinError)
    } else {
      console.log('✅ Foreign key relationships working')
      console.log('Sample joined data:', joinData)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testDatabase()
