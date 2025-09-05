// Simple test script to trigger a notification
// This will help us test if realtime notifications are working

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function testNotificationCreation() {
  console.log('🧪 Testing notification creation...')
  
  try {
    // Create a test notification
    const testNotification = {
      user_id: '11111111-1111-1111-1111-111111111111', // Replace with actual user ID
      type: 'SYSTEM',
      title: 'Test Notification',
      message: 'This is a test notification to verify realtime functionality',
      data: { test: true }
    }
    
    console.log('📤 Creating test notification:', testNotification)
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(testNotification)
      .select()
    
    if (error) {
      console.error('❌ Failed to create test notification:', error)
      return
    }
    
    console.log('✅ Test notification created successfully:', data)
    console.log('📡 Check your browser console for realtime updates!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Get user ID from command line or use default test ID
const userId = process.argv[2] || '11111111-1111-1111-1111-111111111111'
console.log('Using user ID:', userId)

testNotificationCreation()
