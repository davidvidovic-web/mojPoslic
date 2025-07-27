import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Check if username exists (case-insensitive using ilike)
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('id')
      .ilike('username', username)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Username check error:', error)
      return NextResponse.json(
        { error: 'Failed to check username' },
        { status: 500 }
      )
    }

    return NextResponse.json({ exists: !!existingUser })
  } catch (error) {
    console.error('Username check error:', error)
    return NextResponse.json(
      { error: 'Failed to check username' },
      { status: 500 }
    )
  }
}
