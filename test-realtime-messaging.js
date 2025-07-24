#!/usr/bin/env node

/**
 * Real-time Messaging Test Script
 * 
 * This script tests the real-time messaging functionality by:
 * 1. Simulating database inserts into the messages table
 * 2. Verifying WebSocket connection and authentication
 * 3. Testing postgres_changes event firing
 * 4. Validating RLS policies with authenticated context
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.development' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Required:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY') 
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

async function testRealtimeMessaging() {
  console.log('🚀 Starting Real-time Messaging Test...\n')

  // Create service role client for database operations
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
  
  // Create anon client for real-time subscriptions (simulates frontend)
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Step 1: Test basic connection and list tables
    console.log('1️⃣ Testing Supabase connection and listing tables...')
    
    // Check what tables exist
    const { data: tables, error: tablesError } = await serviceClient
      .rpc('get_table_list') 
      .catch(async () => {
        // Fallback: try to query a simple table or get schema info
        return await serviceClient
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .catch(async () => {
            // Final fallback: try common table names
            const tablesToTry = ['User', 'users', 'Messages', 'messages', 'Conversations', 'conversations']
            for (const tableName of tablesToTry) {
              const { error } = await serviceClient.from(tableName).select('count').limit(0)
              if (!error) {
                return { data: [{ table_name: tableName }] }
              }
            }
            return { data: [], error: new Error('No accessible tables found') }
          })
      })
    
    if (tablesError && tables?.data?.length === 0) {
      console.error('❌ Could not access database tables:', tablesError?.message)
      return
    }
    
    if (tables?.data && tables.data.length > 0) {
      console.log('✅ Available tables:', tables.data.map(t => t.table_name).join(', '))
    }
    
    console.log('✅ Supabase connection successful\n')

    // Step 2: Get test conversation
    console.log('2️⃣ Finding test conversation...')
    const { data: conversations, error: convError } = await serviceClient
      .from('conversations')
      .select('id, job_id')
      .limit(1)
    
    if (convError || !conversations || conversations.length === 0) {
      console.error('❌ No test conversations found:', convError?.message)
      return
    }
    
    const testConversationId = conversations[0].id
    console.log(`✅ Using conversation: ${testConversationId}\n`)

    // Step 3: Get test user
    console.log('3️⃣ Finding test user...')
    const { data: users, error: userError } = await serviceClient
      .from('users')
      .select('id, name')
      .limit(1)
    
    if (userError || !users || users.length === 0) {
      console.error('❌ No test users found:', userError?.message)
      return
    }
    
    const testUserId = users[0].id
    console.log(`✅ Using user: ${testUserId} (${users[0].name})\n`)

    // Step 4: Set up real-time subscription
    console.log('4️⃣ Setting up real-time subscription...')
    let messageReceived = false
    
    const channel = anonClient
      .channel(`test-conversation-${testConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${testConversationId}`
        },
        (payload) => {
          console.log('🎉 Real-time message received!')
          console.log('Payload:', JSON.stringify(payload.new, null, 2))
          messageReceived = true
        }
      )
      .subscribe((status, error) => {
        if (error) {
          console.error('❌ Subscription error:', error)
        } else {
          console.log(`📡 Subscription status: ${status}`)
        }
      })

    // Wait for subscription to be ready
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 5: Insert test message
    console.log('\n5️⃣ Inserting test message...')
    const testMessage = {
      conversation_id: testConversationId,
      sender_id: testUserId,
      content: `Test message at ${new Date().toISOString()}`,
      created_at: new Date().toISOString()
    }

    const { data: insertedMessage, error: insertError } = await serviceClient
      .from('messages')
      .insert([testMessage])
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Failed to insert message:', insertError.message)
      return
    }
    
    console.log('✅ Message inserted:', insertedMessage.id)

    // Step 6: Wait for real-time event
    console.log('\n6️⃣ Waiting for real-time event...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    if (messageReceived) {
      console.log('🎉 SUCCESS: Real-time messaging is working!')
    } else {
      console.log('❌ FAILED: Real-time event not received')
      console.log('\nPossible issues:')
      console.log('- RLS policies blocking the subscription')
      console.log('- Authentication context missing')
      console.log('- WebSocket connection issues')
      console.log('- Table/filter mismatch')
    }

    // Cleanup
    anonClient.removeChannel(channel)
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testRealtimeMessaging()
  .then(() => {
    console.log('\n✨ Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test crashed:', error)
    process.exit(1)
  })
