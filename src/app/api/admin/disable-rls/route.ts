import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    // Create admin client with service role key (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase service role key. This endpoint requires admin access.',
      }, { status: 500 })
    }

    // Create admin client that can bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Temporarily disabling RLS for messaging tables...')

    // Disable RLS temporarily
    const sqlCommands = [
      'ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;', 
      'ALTER TABLE messages DISABLE ROW LEVEL SECURITY;',
      'DROP POLICY IF EXISTS "conversations_allow_all" ON conversations;',
      'DROP POLICY IF EXISTS "conversation_participants_allow_all" ON conversation_participants;',
      'DROP POLICY IF EXISTS "messages_allow_all" ON messages;'
    ]

    const results = []
    for (const sql of sqlCommands) {
      try {
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { query: sql })
        results.push({ sql, success: !error, error: error?.message, data })
        if (error) {
          console.error(`Failed to execute: ${sql}`, error)
        } else {
          console.log(`Successfully executed: ${sql}`)
        }
      } catch (err) {
        console.error(`Error executing: ${sql}`, err)
        results.push({ sql, success: false, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'RLS temporarily disabled for messaging tables',
      results
    })

  } catch (error) {
    console.error('Error disabling RLS:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
