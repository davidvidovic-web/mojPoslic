#!/usr/bin/env node

// Test script to verify message notifications are being created
// Run this after sending a message to check if notifications are working

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testMessageNotifications() {
  console.log('🔍 Testing message notifications...')
  
  try {
    // Check for recent NEW_MESSAGE notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'NEW_MESSAGE')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('❌ Error fetching notifications:', error)
      return
    }
    
    console.log(`✅ Found ${notifications.length} recent NEW_MESSAGE notifications:`)
    
    notifications.forEach((notification, index) => {
      console.log(`\n📨 Notification ${index + 1}:`)
      console.log(`  ID: ${notification.id}`)
      console.log(`  User: ${notification.user_id}`)
      console.log(`  Title: ${notification.title}`)
      console.log(`  Message: ${notification.message}`)
      console.log(`  Read: ${notification.is_read}`)
      console.log(`  Created: ${notification.created_at}`)
      if (notification.data) {
        console.log(`  Data:`, JSON.stringify(notification.data, null, 2))
      }
    })
    
    if (notifications.length === 0) {
      console.log('⚠️  No NEW_MESSAGE notifications found. Try sending a message first.')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testMessageNotifications()
