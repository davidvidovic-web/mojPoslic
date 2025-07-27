import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's role to ensure they are a tasker
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userData.role !== 'tasker') {
      return NextResponse.json({ error: "Access denied - not a tasker" }, { status: 403 });
    }

    // Get active job assignments for this tasker
    // Active jobs are applications that have been selected/accepted
    const { data: activeJobs, error: jobsError } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        cover_letter,
        job_id,
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
          application_deadline,
          posted_by_id,
          users!job_listings_posted_by_id_fkey (
            id,
            name,
            email
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'SELECTED')
      .order('applied_at', { ascending: false })

    if (jobsError) {
      console.error("Active jobs fetch error:", jobsError);
      return NextResponse.json(
        { error: "Failed to fetch active jobs" },
        { status: 500 }
      );
    }

    // Transform the data to match expected frontend format
    const transformedActiveJobs = (activeJobs || []).map(app => ({
      id: app.id,
      applicationId: app.id,
      jobId: app.job_id,
      status: app.status,
      startedAt: app.applied_at, // Using applied_at as start date for now
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
        deadline: app.job_listings.application_deadline,
        postedBy: app.job_listings.posted_by_id,
        client: app.job_listings.users ? {
          id: app.job_listings.users.id,
          name: app.job_listings.users.name,
          email: app.job_listings.users.email
        } : null
      } : null
    }))

    return NextResponse.json({ 
      activeJobs: transformedActiveJobs,
      total: transformedActiveJobs.length 
    });

  } catch (error) {
    console.error("Get active jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
