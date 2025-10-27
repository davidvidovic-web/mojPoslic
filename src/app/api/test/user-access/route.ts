import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
  try {
    // Test different ways to access users table
    const supabaseService = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        }
      }
    )

    const testUserId = 'ba4bd4f1-fa3b-474c-8e25-a2833040df76'

    // Test 1: Direct query with service role
    const { data: test1, error: error1 } = await supabaseService
      .from('users')
      .select('id, email, name, phone')
      .eq('id', testUserId)
      .single()

    // Test 2: Query all users to see if table is accessible
    const { data: test2, error: error2 } = await supabaseService
      .from('users')
      .select('id, email, name, phone')
      .limit(5)

    // Test 3: Check table permissions
    const { data: test3, error: error3 } = await supabaseService
      .from('users')
      .select('count(*)', { count: 'exact' })

    // Test 4: Try with RLS explicitly disabled (if possible)
    const { data: test4, error: error4 } = await supabaseService
      .rpc('get_user_by_id', { user_id: testUserId })
      .single()

    return NextResponse.json({
      testUserId,
      test1: { data: test1, error: error1 },
      test2: { data: test2, error: error2, count: test2?.length || 0 },
      test3: { data: test3, error: error3 },
      test4: { data: test4, error: error4 },
      summary: {
        serviceRoleWorking: !error1 && !!test1,
        canAccessTable: !error2,
        tableHasData: (test2?.length || 0) > 0,
        rpcWorking: !error4 && !!test4
      }
    })

  } catch (error) {
    console.error('Error in user access test:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}