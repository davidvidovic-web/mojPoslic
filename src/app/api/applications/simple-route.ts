import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get auth header for token-based auth or use cookie-based auth
    const authHeader = request.headers.get('authorization')
    
    const supabase = authHeader 
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

    // Get request body
    const body = await request.json()
    const { jobId, coverLetter, clientNotes } = body

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Check if user already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing application:', checkError)
      return NextResponse.json(
        { success: false, error: 'Failed to check existing application' },
        { status: 500 }
      )
    }

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied to this job' },
        { status: 400 }
      )
    }

    // Create the application - SIMPLE INSERT, NO TRIGGERS
    const { data: newApplication, error: insertError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        user_id: user.id,
        cover_letter: coverLetter || null,
        client_notes: clientNotes || null,
        status: 'pending',
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating application:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // Manually update statistics (instead of using triggers)
    try {
      // Update job statistics
      await supabase.rpc('update_job_application_stats', { job_uuid: jobId })
      
      // Update user statistics  
      await supabase.rpc('update_user_application_stats', { user_uuid: user.id })
      
      // Also update the job poster's statistics
      const { data: jobData } = await supabase
        .from('job_listings')
        .select('posted_by_id')
        .eq('id', jobId)
        .single()
      
      if (jobData?.posted_by_id) {
        await supabase.rpc('update_user_application_stats', { user_uuid: jobData.posted_by_id })
      }
    } catch (statsError) {
      console.error('Error updating statistics:', statsError)
      // Don't fail the request if stats update fails
    }

    return NextResponse.json({
      success: true,
      data: newApplication
    })

  } catch (error) {
    console.error('Application creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
