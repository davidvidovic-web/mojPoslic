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
    const supabase: any = authHeader 
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

    // Get applications for this job - fetch basic application data
    // User data will be fetched separately to avoid RLS issues with joins
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
        applicant_location
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

    // Fetch user details separately to bypass potential RLS issues with joins
    const userIds = [...new Set(applications?.map(app => app.user_id).filter(Boolean))] as string[]
    const usersMap = new Map()
    
    
    if (userIds.length > 0) {
      // Use service role client to bypass RLS for reading public user profile data
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, name, email, avatar_url, bio, location, skills, experience')
        .in('id', userIds)
      
      if (!usersError && usersData) {
        usersData.forEach(user => {
          usersMap.set(user.id, user)
        })
      } else {
        console.error('Error fetching users separately:', usersError)
      }
    }

    // Transform the data to match the JobApplication interface
    // Use separately fetched user data, then fallback to join data, then cached data
    const transformedApplications = (applications as any)?.map((app: any) => {
      const userData = usersMap.get(app.user_id) || app.user || {}
      
      // Prefer separately fetched data, then join data, then cached data
      const userName = userData.name || app.applicant_name || 'Anonymous User'
      const userEmail = userData.email || app.applicant_email || null
      const avatarUrl = userData.avatar_url || app.applicant_avatar_url || null
      const userRating = userData.average_rating || app.applicant_rating || null
      const userLocation = userData.location || app.applicant_location || null
      
      return {
        id: app.id,
        jobId: jobId,
        userId: userData.id || app.user_id,
        status: app.status,
        message: app.cover_letter, // Map cover_letter to message
        clientNotes: app.client_notes,
        appliedAt: new Date(app.applied_at),
        createdAt: new Date(app.applied_at),
        updatedAt: new Date(app.updated_at),
        user: {
          id: userData.id || app.user_id,
          name: userName,
          email: userEmail,
          avatarUrl: avatarUrl,
          bio: userData.bio,
          location: userLocation,
          skills: userData.skills, // Now coming from separate query
          experience: userData.experience,
          averageRating: userRating,
          totalReviews: userData.total_reviews
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
