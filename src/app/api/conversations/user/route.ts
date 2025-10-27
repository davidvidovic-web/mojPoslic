import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Get user's conversations
export async function GET(request: NextRequest) {
  try {
    // Get auth header for token-based auth or use cookie-based auth
    const authHeader = request.headers.get('authorization')
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = authHeader 
      ? await (async () => {
          return createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                get: () => undefined,
                set: () => {},
                remove: () => {},
              },
              global: {
                headers: {
                  'Authorization': authHeader
                }
              }
            }
          )
        })()
      : await createServerSupabaseClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // First get all applications by this user (as tasker)
    const { data: userApplications } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', user.id)

    // Get all jobs posted by this user (as client)
    const { data: userJobs } = await supabase
      .from('job_listings')
      .select('id')
      .eq('posted_by', user.id)

    const applicationIds = userApplications?.map(app => app.id) || []
    const jobIds = userJobs?.map(job => job.id) || []

    // Get conversations for applications or jobs this user is involved in
    let conversations, error

    if (applicationIds.length > 0 && jobIds.length > 0) {
      const result = await supabase
        .from('conversations')
        .select(`
          id,
          job_id,
          application_id,
          title,
          created_at,
          updated_at,
          created_by_id
        `)
        .or(`application_id.in.(${applicationIds.join(',')}),job_id.in.(${jobIds.join(',')})`)
        .order('created_at', { ascending: false })
      conversations = result.data
      error = result.error
    } else if (applicationIds.length > 0) {
      const result = await supabase
        .from('conversations')
        .select(`
          id,
          job_id,
          application_id,
          title,
          created_at,
          updated_at,
          created_by_id
        `)
        .in('application_id', applicationIds)
        .order('created_at', { ascending: false })
      conversations = result.data
      error = result.error
    } else if (jobIds.length > 0) {
      const result = await supabase
        .from('conversations')
        .select(`
          id,
          job_id,
          application_id,
          title,
          created_at,
          updated_at,
          created_by_id
        `)
        .in('job_id', jobIds)
        .order('created_at', { ascending: false })
      conversations = result.data
      error = result.error
    } else {
      // No conversations for this user
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    // Add unread counts to conversations (simplified for now)
    const conversationsWithUnread = (conversations || []).map((conversation) => ({
      ...conversation,
      unread_count: 0 // TODO: Calculate actual unread count
    }))

    return NextResponse.json({
      success: true,
      data: conversationsWithUnread
    })

  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
