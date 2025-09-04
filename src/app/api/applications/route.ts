import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    // Get auth header for token-based auth
    const authHeader = request.headers.get('authorization')
    
    console.log('🔐 Applications API - Auth check:', {
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? authHeader.substring(0, 20) + '...' : 'none'
    })
    
    // Create supabase client with proper auth handling
    const supabase = authHeader 
      ? createServerClient(
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
      : await createServerSupabaseClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('🔐 Applications API - User check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message
    })
    
    if (authError || !user) {
      console.error('Authentication failed:', authError)
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

    // Get the user's profile data for proper display name
    const { data: userProfile, error: userProfileError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()

    if (userProfileError) {
      console.warn('Could not fetch user profile for notification:', userProfileError)
    }

    // Use profile name if available, fallback to auth metadata, then email
    const applicantDisplayName = userProfile?.name || user.user_metadata?.name || user.email

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
      console.error('❌ Error creating application:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    console.log('✅ Application created successfully:', newApplication)

    // Manually update statistics (instead of using triggers)
    try {
      console.log('📊 Starting statistics and notification updates...')
      
      // Note: RPC functions temporarily disabled due to TypeScript issues
      // await supabase.rpc('update_job_application_stats', { job_uuid: jobId })
      // await supabase.rpc('update_user_application_stats', { user_uuid: user.id })
      console.log('✅ Statistics update skipped (temporarily disabled)')
      
      // Get job details for notification
      const { data: jobData, error: jobDataError } = await supabase
        .from('job_listings')
        .select('posted_by_id, title')
        .eq('id', jobId)
        .single()
      
      if (jobDataError) {
        console.error('❌ Failed to fetch job data for notification:', jobDataError)
      } else {
        console.log('✅ Job data fetched:', jobData)
      }

      if (jobData?.posted_by_id) {
        // Note: Statistics update temporarily disabled
        // await supabase.rpc('update_user_application_stats', { user_uuid: jobData.posted_by_id })
        
        console.log('📢 Creating notification for job poster:', {
          jobPosterUuid: jobData.posted_by_id,
          jobTitle: jobData.title,
          applicantId: user.id,
          applicantName: applicantDisplayName
        })
        
        // Create notification for the job poster (client) using authenticated client
        const { data: notificationData, error: notificationError } = await supabaseAuth
          .from('notifications')
          .insert({
            user_id: jobData.posted_by_id,
            type: 'JOB_APPLICATION',
            title: 'New Job Application',
            message: `Someone has applied to your job "${jobData.title}"`,
            data: {
              application_id: newApplication.id,
              job_id: jobId,
              job_title: jobData.title,
              applicant_id: user.id,
              applicant_name: applicantDisplayName
            }
          })
          .select()
        
        if (notificationError) {
          console.error('❌ Failed to create notification:', notificationError)
        } else {
          console.log('✅ Notification created successfully:', notificationData)
        }
      }
    } catch (statsError) {
      console.error('Error updating statistics or creating notification:', statsError)
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
