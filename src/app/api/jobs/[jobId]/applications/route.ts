import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Database } from '@/types/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    console.log('📥 Applications API called for job:', jobId)
    
    // Check for Authorization header first
    const authHeader = request.headers.get('authorization')
    console.log('Job Applications API: Authorization header:', authHeader ? 'present' : 'missing')
    
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
        console.log('Job Applications API: Auth header auth failed:', authError)
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = authData.user
      console.log('Job Applications API: Authenticated user via auth header:', user.email)
    } else {
      // Fall back to cookie-based auth
      const supabaseServer = await createServerSupabaseClient()
      const { data: authData, error: authError } = await supabaseServer.auth.getUser()
      
      if (authError || !authData.user) {
        console.log('Job Applications API: Cookie auth failed:', authError)
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = authData.user
      console.log('Job Applications API: Authenticated user via cookies:', user.email)
    }

    if (!user) {
      console.log('Job Applications API: No authenticated user found')
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

    // Get applications for this job
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        updated_at,
        cover_letter,
        client_notes,
        user:users(
          id,
          name,
          email,
          avatar_url,
          bio,
          location,
          skills,
          experience
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
    const transformedApplications = (applications as any)?.map((app: any) => ({
      id: app.id,
      jobId: jobId,
      userId: app.user?.id,
      status: app.status,
      message: app.cover_letter, // Map cover_letter to message
      clientNotes: app.client_notes,
      appliedAt: new Date(app.applied_at),
      createdAt: new Date(app.applied_at),
      updatedAt: new Date(app.updated_at),
      user: app.user ? {
        id: app.user.id,
        name: app.user.name,
        email: app.user.email,
        avatar_url: app.user.avatar_url,
        bio: app.user.bio,
        location: app.user.location,
        skills: app.user.skills,
        experience: app.user.experience
      } : undefined
    })) || []

    console.log('📊 Applications API result:', {
      jobId,
      rawCount: applications?.length || 0,
      transformedCount: transformedApplications.length,
      sampleApp: transformedApplications[0]
    })

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
