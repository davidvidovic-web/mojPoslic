import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user from Supabase Auth (secure way)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    return NextResponse.json({
      debug: {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userEmailConfirmed: user?.email_confirmed_at,
        authError: authError?.message,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Session debug error:', error)
    return NextResponse.json({
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
