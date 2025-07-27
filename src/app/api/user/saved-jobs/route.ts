import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const jobId = searchParams.get('jobId')

    // Get current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If userId is provided, make sure it matches the authenticated user (security check)
    if (userId && userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If jobId is provided, check if this specific job is saved
    if (jobId) {
      const { data: savedJob, error: savedJobError } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .single()

      if (savedJobError && savedJobError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error("Saved job check error:", savedJobError);
        return NextResponse.json(
          { error: "Failed to check saved job" },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        isSaved: !!savedJob,
        savedJobId: savedJob?.id || null
      });
    }

    // Get all saved jobs for the user
    const { data: savedJobs, error: savedJobsError } = await supabase
      .from('saved_jobs')
      .select(`
        id,
        saved_at,
        job_id,
        job_listings!inner (
          id,
          title,
          description,
          salary_min,
          salary_max,
          salary_currency,
          job_type,
          location,
          remote_allowed,
          category,
          status as job_status,
          created_at,
          deadline,
          posted_by,
          users!job_listings_posted_by_fkey (
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false })

    if (savedJobsError) {
      console.error("Saved jobs fetch error:", savedJobsError);
      return NextResponse.json(
        { error: "Failed to fetch saved jobs" },
        { status: 500 }
      );
    }

    // Transform the data to match expected frontend format
    const transformedSavedJobs = (savedJobs || []).map(savedJob => ({
      id: savedJob.id,
      savedAt: savedJob.saved_at,
      jobId: savedJob.job_id,
      job: {
        id: savedJob.job_listings.id,
        title: savedJob.job_listings.title,
        description: savedJob.job_listings.description,
        salaryMin: savedJob.job_listings.salary_min,
        salaryMax: savedJob.job_listings.salary_max,
        salaryCurrency: savedJob.job_listings.salary_currency,
        jobType: savedJob.job_listings.job_type,
        location: savedJob.job_listings.location,
        remoteAllowed: savedJob.job_listings.remote_allowed,
        category: savedJob.job_listings.category,
        status: savedJob.job_listings.status,
        createdAt: savedJob.job_listings.created_at,
        deadline: savedJob.job_listings.deadline,
        postedBy: savedJob.job_listings.posted_by,
        postedByUser: savedJob.job_listings.users ? {
          name: savedJob.job_listings.users.name
        } : null
      }
    }))

    return NextResponse.json({ 
      savedJobs: transformedSavedJobs,
      total: transformedSavedJobs.length 
    });

  } catch (error) {
    console.error("Get saved jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { jobId } = await request.json()

    // Get current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('job_listings')
      .select('id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if already saved
    const { data: existingSave, error: existingError } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error("Check existing save error:", existingError);
      return NextResponse.json(
        { error: "Failed to check existing save" },
        { status: 500 }
      );
    }

    if (existingSave) {
      return NextResponse.json({ error: "Job already saved" }, { status: 409 });
    }

    // Save the job
    const { data: savedJob, error: saveError } = await supabase
      .from('saved_jobs')
      .insert({
        user_id: user.id,
        job_id: jobId,
        saved_at: new Date().toISOString()
      })
      .select()
      .single()

    if (saveError) {
      console.error("Save job error:", saveError);
      return NextResponse.json(
        { error: "Failed to save job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      savedJob: {
        id: savedJob.id,
        savedAt: savedJob.saved_at,
        jobId: savedJob.job_id
      }
    });

  } catch (error) {
    console.error("Save job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    // Get current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Delete the saved job
    const { error: deleteError } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', jobId)

    if (deleteError) {
      console.error("Delete saved job error:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove saved job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete saved job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
