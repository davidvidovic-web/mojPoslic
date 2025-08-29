import { supabase } from '@/lib/supabase'

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔑 Anon Key prefix:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
    
    // Test 1: Basic connection
    const { error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Test 2: Auth connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('⚠️ Auth check (no user logged in):', authError.message)
    } else {
      console.log('👤 Current user:', user ? 'Logged in' : 'Not logged in')
    }
    
    // Test 3: Realtime connection
    const channel = supabase.channel('test-connection')
    const subscription = channel.subscribe((status) => {
      console.log('📡 Realtime status:', status)
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime connection successful!')
        channel.unsubscribe()
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime connection failed')
        channel.unsubscribe()
      }
    })
    
    // Cleanup after 3 seconds
    setTimeout(() => {
      subscription.unsubscribe()
    }, 3000)
    
    return true
  } catch (error) {
    console.error('💥 Connection test failed:', error)
    return false
  }
}

// Auto-run test in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  testSupabaseConnection()
}
