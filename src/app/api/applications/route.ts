import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get all applications with job info for debugging
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        job_id,
        user_id,
        status,
        applied_at,
        job_listings (
          id,
          title,
          application_count
        )
      `)
      .order('applied_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    // Group by job_id to get counts
    const jobApplicationCounts = applications?.reduce((acc: Record<string, number>, app) => {
      if (app.job_id) {
        acc[app.job_id] = (acc[app.job_id] || 0) + 1
      }
      return acc
    }, {}) || {}

    return NextResponse.json({
      applications,
      applicationCounts: jobApplicationCounts,
      total: applications?.length || 0
    })
    
  } catch (error) {
    console.error('Error in applications GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth header for token-based auth
    const authHeader = request.headers.get('authorization')
    
    // Create supabase client with proper auth handling
    const supabase: any = authHeader 
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

    // Create service role client for admin operations (like updating counts)
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

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
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
      .select('name, email, role')
      .eq('id', user.id)
      .single()

    if (userProfileError) {
      console.warn('Could not fetch user profile for notification:', userProfileError)
    }

    // Check if user is a client (clients cannot apply to jobs)
    if (userProfile?.role === 'client') {
      return NextResponse.json(
        { success: false, error: 'Clients cannot apply to jobs' },
        { status: 403 }
      )
    }

    // Use profile name if available, fallback to auth metadata, then email
    const applicantDisplayName = userProfile?.name || user.user_metadata?.name || user.email

    // Fetch user cached data for application
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('name, email, phone, avatar_url, average_rating, location')
      .eq('id', user.id)
      .single()

    if (userDataError) {
      console.warn('Could not fetch user data for cached fields:', userDataError)
    }

    // Fetch job cached data for application
    const { data: jobData, error: jobDataError } = await supabase
      .from('job_listings')
      .select('title, job_type, city_name, category_name, poster_name, salary_min, salary_max')
      .eq('id', jobId)
      .single()

    if (jobDataError) {
      console.warn('Could not fetch job data for cached fields:', jobDataError)
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

    // Create the application with cached data (since triggers are disabled)
    const { data: newApplication, error: insertError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        user_id: user.id,
        cover_letter: coverLetter || null,
        client_notes: clientNotes || null,
        status: 'PENDING',
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Cached applicant data (provide fallbacks for required fields)
        applicant_name: userData?.name || 'User',
        applicant_email: userData?.email || user.email || '',
        applicant_phone: userData?.phone || null,
        applicant_avatar_url: userData?.avatar_url || null,
        applicant_rating: userData?.average_rating || null,
        applicant_location: userData?.location || null,
        // Cached job data (provide fallbacks for required fields)
        job_title: jobData?.title || 'Job',
        job_type: (jobData?.job_type as 'quick_job' | 'full_time' | 'part_time' | 'remote' | undefined) || 'quick_job',
        job_city_name: jobData?.city_name || '',
        job_category_name: jobData?.category_name || '',
        job_poster_name: jobData?.poster_name || '',
        job_salary_min: jobData?.salary_min || null,
        job_salary_max: jobData?.salary_max || null
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

    // Manually update statistics (instead of using triggers)
    try {
      // Manually update job application count
      const { data: jobDataForCount, error: jobFetchError } = await supabase
        .from('job_listings')
        .select('application_count, posted_by_id, title')
        .eq('id', jobId)
        .single()
      
      if (jobFetchError) {
        console.error('❌ Failed to fetch job data:', jobFetchError)
      } else {
        // Update job application count using service role to bypass RLS
        const { error: updateError } = await supabaseService
          .from('job_listings')
          .update({ 
            application_count: (jobDataForCount.application_count || 0) + 1,
            last_application_at: new Date().toISOString()
          })
          .eq('id', jobId)
        
        if (updateError) {
          console.error('❌ Failed to update job application count:', updateError)
        }
      }
      
      // Note: RPC functions temporarily disabled due to TypeScript issues
      // await supabase.rpc('update_job_application_stats', { job_uuid: jobId })
      // await supabase.rpc('update_user_application_stats', { user_uuid: user.id })
      
      // Get job details for notification
      const { data: jobDataForNotification, error: jobDataError } = await supabase
        .from('job_listings')
        .select('posted_by_id, title')
        .eq('id', jobId)
        .single()
      
      if (jobDataError) {
        console.error('❌ Failed to fetch job data for notification:', jobDataError)
      }

      if (jobDataForNotification?.posted_by_id) {
        // Note: Statistics update temporarily disabled
                // await supabase.rpc('update_user_application_stats', { user_uuid: jobData.posted_by_id })
        
        // Create a service role client for notification creation (to bypass RLS)
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
        
        // Create notification for job owner
        const { error: notificationError } = await supabaseService
          .from('notifications')
          .insert({
            user_id: jobDataForNotification.posted_by_id,
            type: 'JOB_APPLICATION',
            title: 'New job application',
            message: `Someone has applied to your job "${jobDataForNotification.title}"`,
            data: {
              job_id: jobId,
              application_id: newApplication.id,
              applicant_name: applicantDisplayName,
              job_title: jobDataForNotification.title,
              applicant_id: user.id
            },
            is_read: false
          })
          .select()
          .single()

        if (notificationError) {
          console.error('❌ Failed to create notification:', notificationError)
        }
        
        try {
          // Send email notification using edge function
          await supabaseService.functions.invoke('send-notification', {
            body: {
              userId: jobDataForNotification.posted_by_id,
              type: 'JOB_APPLICATION',
              title: 'New job application',
              message: `${applicantDisplayName} has applied to your job "${jobDataForNotification.title}"`,
              data: {
                jobId,
                applicationId: newApplication.id,
                applicantName: applicantDisplayName,
                jobTitle: jobDataForNotification.title,
                jobPosterUuid: jobDataForNotification.posted_by_id,
                applicantId: user.id
              }
            }
          })
        } catch (emailError) {
          console.error('❌ Failed to send email notification:', emailError)
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
