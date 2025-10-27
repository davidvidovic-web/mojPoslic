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

    // Get user profile to understand their preferences
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('preferred_job_types, skills, location')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error("User profile fetch error:", profileError);
      // Continue without user preferences
    }

    // Build query for recommended jobs
    let query = supabase
      .from('job_listings')
      .select(`
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
        status,
        created_at,
        deadline,
        posted_by,
        users!job_listings_posted_by_fkey (
          name,
          company_name
        )
      `)
      .eq('is_active', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // If user has preferred job types, filter by them
    if (userProfile?.preferred_job_types) {
      const preferredTypes = userProfile.preferred_job_types.split(', ') as ('quick_job' | 'full_time' | 'part_time' | 'remote')[];
      query = query.in('job_type', preferredTypes)
    }

    // Limit to recent jobs
    const { data: jobs, error: jobsError } = await query.limit(10)

    if (jobsError) {
      console.error("Recommended jobs fetch error:", jobsError);
      return NextResponse.json(
        { error: "Failed to fetch recommended jobs" },
        { status: 500 }
      );
    }

    // If we have user skills, we could add simple text matching
    let scoredJobs = (jobs || []).map(job => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(job as any),
      score: 1 // Basic score, could be enhanced with skill matching
    }))

    // Enhanced scoring based on user preferences
    if (userProfile?.skills) {
      const skillsStr = Array.isArray(userProfile.skills) ? userProfile.skills.join(',') : userProfile.skills
      const userSkills = skillsStr.toLowerCase().split(',').map((s: string) => s.trim())
      
      scoredJobs = scoredJobs.map(job => {
        let score = 1
        
        // Check if job description mentions user skills
        const jobText = (job.title + ' ' + job.description).toLowerCase()
        const skillMatches = userSkills.filter(skill => 
          skill.length > 2 && jobText.includes(skill)
        ).length
        
        score += skillMatches * 0.5
        
        // Prefer jobs in same location
        if (userProfile.location && job.location === userProfile.location) {
          score += 0.3
        }
        
        // Prefer remote jobs if no location match
        if (job.remote_allowed && (!userProfile.location || job.location !== userProfile.location)) {
          score += 0.2
        }
        
        return { ...job, score }
      })
    }

    // Sort by score and take top recommendations
    const recommendedJobs = scoredJobs
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        salaryCurrency: job.salary_currency,
        jobType: job.job_type,
        location: job.location,
        remoteAllowed: job.remote_allowed,
        category: job.category,
        status: job.status,
        createdAt: job.created_at,
        deadline: job.deadline,
        postedBy: job.posted_by,
        postedByUser: job.users ? {
          name: job.users.name,
          companyName: job.users.company_name
        } : null,
        recommendationScore: job.score
      }))

    return NextResponse.json({ 
      jobs: recommendedJobs,
      total: recommendedJobs.length,
      basedOn: {
        preferredJobTypes: userProfile?.preferred_job_types?.split(', ') || [],
        skills: userProfile?.skills || null,
        location: userProfile?.location || null
      }
    });

  } catch (error) {
    console.error("Get recommended jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
