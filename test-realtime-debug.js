// Test script to debug realtime issues
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testRealtimeSetup() {
  console.log('Testing Supabase realtime setup...')
  
  try {
    // Test basic connection
    console.log('1. Testing basic Supabase connection...')
    const { data: testData, error: testError } = await supabase
      .from('conversations')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError)
      return
    }
    console.log('✅ Basic connection works')
    
    // Test realtime subscription
    console.log('2. Testing realtime subscription...')
    const channel = supabase
      .channel('test-conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        console.log('📡 Received realtime event:', payload)
      })
      .subscribe((status, err) => {
        console.log('📡 Subscription status:', status)
        if (err) {
          console.error('❌ Subscription error:', err)
        } else if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime subscription successful')
          // Clean up after test
          setTimeout(() => {
            supabase.removeChannel(channel)
            console.log('🧹 Test completed, channel removed')
            process.exit(0)
          }, 3000)
        }
      })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testRealtimeSetup()
