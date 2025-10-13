import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Database } from '@/types/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    
    // Check for Authorization header first
    const authHeader = request.headers.get('authorization')
    
    let user = null
    
    // Get the authenticated user - try both auth header and cookies using the same pattern as create API
    if (authHeader) {
      // Create a client that uses the auth header
      const { createServerClient } = await import('@supabase/ssr')
      const supabaseWithAuth = createServerClient<Database>(
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
      
      const { data: authData, error: authError } = await supabaseWithAuth.auth.getUser()
      
      if (authError || !authData.user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = authData.user
    } else {
      // Fall back to cookie-based auth
      const supabaseServer = await createServerSupabaseClient()
      const { data: authData, error: authError } = await supabaseServer.auth.getUser()
      
      if (authError || !authData.user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = authData.user
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Create the appropriate supabase client for database operations
    const supabase = authHeader 
      ? await (async () => {
          const { createServerClient } = await import('@supabase/ssr')
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

    // Verify that the user owns this job (optional - you might want to allow viewing applications)
    const { data: job, error: jobError } = await supabase
      .from('job_listings')
      .select('posted_by_id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if user owns this job
    if (job.posted_by_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to view applications for this job' },
        { status: 403 }
      )
    }

    // Get applications for this job - using both cached and live data for reliability
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        updated_at,
        cover_letter,
        client_notes,
        user_id,
        applicant_name,
        applicant_email,
        applicant_avatar_url,
        applicant_rating,
        applicant_location,
        user:users(
          id,
          name,
          email,
          avatar_url,
          bio,
          location,
          skills,
          experience,
          average_rating
        )
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications:', error)
      return NextResponse.json(
        { success: false, error: `Failed to fetch applications: ${error.message}` },
        { status: 500 }
      )
    }

    // Transform the data to match the JobApplication interface
    // Use live data from users table with cached data as fallback for reliability
    const transformedApplications = (applications as any)?.map((app: any) => {
      // Prefer live user data from the join, fallback to cached data
      const userName = app.user?.name || app.applicant_name || 'Anonymous User'
      const userEmail = app.user?.email || app.applicant_email || null
      const avatarUrl = app.user?.avatar_url || app.applicant_avatar_url || null
      const userRating = app.user?.average_rating || app.applicant_rating || null
      const userLocation = app.user?.location || app.applicant_location || null
      
      return {
        id: app.id,
        jobId: jobId,
        userId: app.user?.id || app.user_id,
        status: app.status,
        message: app.cover_letter, // Map cover_letter to message
        clientNotes: app.client_notes,
        appliedAt: new Date(app.applied_at),
        createdAt: new Date(app.applied_at),
        updatedAt: new Date(app.updated_at),
        user: {
          id: app.user?.id || app.user_id,
          name: userName,
          email: userEmail,
          avatarUrl: avatarUrl, // Ensure we're using the correct field name
          bio: app.user?.bio,
          location: userLocation,
          skills: app.user?.skills,
          experience: app.user?.experience,
          averageRating: userRating
        }
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: transformedApplications,
      total: transformedApplications.length
    })

  } catch (error) {
    console.error('Error in job applications API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
