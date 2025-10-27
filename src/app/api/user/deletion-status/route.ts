import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {
            // Not needed for this use case
          },
          remove() {
            // Not needed for this use case
          },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Query for active deletion request
    const { data: deletionRequest, error: queryError } = await supabase
      .from('user_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (queryError && queryError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine
      console.error('Error querying deletion request:', queryError)
    }
    
    return NextResponse.json({
      deletionRequest: deletionRequest || null
    })

  } catch (error) {
    console.error('Error fetching deletion status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
