/**
 * Simple test to check if Supabase connection is working
 */

const { createClient } = await import('@supabase/supabase-js')

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection')
  
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('📋 Environment Variables:')
    console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('\n❌ Missing required Supabase environment variables')
      console.log('   Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
      process.exit(1)
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test connection by checking if conversations table exists
    console.log('\n🔍 Testing Supabase table access...')
    const { data, error } = await supabase
      .from('conversations')
      .select('id')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('❌ Conversations table does not exist in Supabase')
        console.log('   This means the messaging tables haven\'t been created yet')
        console.log('   The messaging system will not work until these are set up')
        return false
      } else {
        console.log('❌ Supabase connection error:', error.message)
        return false
      }
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('✅ Conversations table exists and is accessible')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Run the test
testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Supabase messaging system is ready!')
    } else {
      console.log('\n⚠️  Supabase messaging system needs setup')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('\n💥 Test crashed:', error)
    process.exit(1)
  })
