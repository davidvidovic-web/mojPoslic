// Test the job query fix
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecaukelsfokqzgvhonrk.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testJobQuery() {
  console.log('Testing job query...')
  
  try {
    // Test basic query first (no joins)
    console.log('1. Testing basic query...')
    const { data: basicData, error: basicError } = await supabase
      .from('job_listings')
      .select('*')
      .eq('posted_by_id', '75bb6746-00b3-4102-9509-5dab397dc5f3')
      .order('created_at', { ascending: false })

    if (basicError) {
      console.error('❌ Basic query failed:', basicError)
      return
    } else {
      console.log('✅ Basic query successful!')
      console.log('📊 Results:', basicData?.length || 0, 'jobs found')
    }

    // Test with category join
    console.log('2. Testing with category join...')
    const { data: joinData, error: joinError } = await supabase
      .from('job_listings')
      .select(`
        *,
        categories(name)
      `)
      .eq('posted_by_id', '75bb6746-00b3-4102-9509-5dab397dc5f3')
      .order('created_at', { ascending: false })

    if (joinError) {
      console.error('❌ Join query failed:', joinError)
    } else {
      console.log('✅ Join query successful!')
      console.log('📊 Results:', joinData?.length || 0, 'jobs found')
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

testJobQuery()
