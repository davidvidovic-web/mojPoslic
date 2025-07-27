import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Get current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If userId is provided, make sure it matches the authenticated user (security check)
    if (userId && userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user applications with basic data (cached fields will be added after migration)
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        cover_letter,
        job_id,
        user_id,
        job_listings!applications_job_id_fkey (
          id,
          title,
          description,
          salary_min,
          salary_max,
          currency,
          job_type,
          exact_location,
          status,
          created_at,
          posted_by_id,
          users!job_listings_posted_by_id_fkey (
            id,
            name,
            email,
            phone,
            avatar_url
          )
        ),
        users!applications_user_id_fkey (
          id,
          name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .order('applied_at', { ascending: false })

    if (applicationsError) {
      console.error("Applications fetch error:", applicationsError);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    // Transform the data to match expected frontend format with enhanced data
    const transformedApplications = (applications || []).map(app => ({
      id: app.id,
      status: app.status,
      appliedAt: app.applied_at,
      coverLetter: app.cover_letter,
      jobId: app.job_id,
      userId: app.user_id,
      
      // Job data (from joined table for now, will be cached fields after migration)
      job_title: app.job_listings?.title || '',
      job_salary_min: app.job_listings?.salary_min || null,
      job_salary_max: app.job_listings?.salary_max || null,
      job_currency: app.job_listings?.currency || null,
      job_type: app.job_listings?.job_type || '',
      job_location: app.job_listings?.exact_location || '',
      job_poster_name: app.job_listings?.users?.name || '',
      job_poster_email: app.job_listings?.users?.email || '',
      job_poster_phone: app.job_listings?.users?.phone || null,
      job_poster_avatar_url: app.job_listings?.users?.avatar_url || null,
      
      // Applicant data (from joined table for now, will be cached fields after migration)
      applicant_name: app.users?.name || '',
      applicant_email: app.users?.email || '',
      applicant_phone: app.users?.phone || null,
      applicant_avatar_url: app.users?.avatar_url || null,
      
      // Performance tracking (will be added after migration)
      response_time_hours: null, // TODO: Calculate based on application timestamps
      last_status_change_at: app.applied_at, // Use applied_at as initial value
      
      // Legacy format for backward compatibility
      job: app.job_listings ? {
        id: app.job_listings.id,
        title: app.job_listings.title,
        description: app.job_listings.description,
        salaryMin: app.job_listings.salary_min,
        salaryMax: app.job_listings.salary_max,
        currency: app.job_listings.currency,
        jobType: app.job_listings.job_type,
        location: app.job_listings.exact_location,
        status: app.job_listings.status,
        createdAt: app.job_listings.created_at,
        postedBy: app.job_listings.posted_by_id,
        postedByUser: app.job_listings.users ? {
          id: app.job_listings.users.id,
          name: app.job_listings.users.name,
          email: app.job_listings.users.email,
          phone: app.job_listings.users.phone,
          avatarUrl: app.job_listings.users.avatar_url
        } : null
      } : null,
      
      // Enhanced applicant data
      applicant: app.users ? {
        id: app.users.id,
        name: app.users.name,
        email: app.users.email,
        phone: app.users.phone,
        avatarUrl: app.users.avatar_url
      } : null
    }))

    return NextResponse.json({ 
      applications: transformedApplications,
      total: transformedApplications.length 
    });

  } catch (error) {
    console.error("Get user applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
