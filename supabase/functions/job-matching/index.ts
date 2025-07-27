import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobMatchRequest {
  userId: string
  limit?: number
  includeSkillsMatch?: boolean
}

interface JobMatch {
  jobId: string
  similarityScore: number
  jobDetails: any
  reasonsForMatch: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, limit = 10, includeSkillsMatch = true }: JobMatchRequest = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile with preferences
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select(`
        *,
        user_skills (
          skill:skills (*)
        )
      `)
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get active job listings with related data
    const { data: jobs, error: jobsError } = await supabaseClient
      .from('job_listings')
      .select(`
        *,
        city:cities (*),
        category:categories (*),
        posted_by:users (name, profile_image_url),
        job_skills (
          skill:skills (*)
        ),
        applications (user_id)
      `)
      .eq('status', 'active')
      .eq('is_active', true)
      .neq('posted_by_id', userId) // Don't match user's own jobs

    if (jobsError) {
      throw jobsError
    }

    // Calculate similarity scores
    const jobMatches: JobMatch[] = []

    for (const job of jobs || []) {
      // Skip if user already applied
      const hasApplied = job.applications?.some((app: any) => app.user_id === userId)
      if (hasApplied) continue

      let similarityScore = 0
      const reasonsForMatch: string[] = []

      // 1. Skills matching (40% weight)
      if (includeSkillsMatch && user.user_skills && job.job_skills) {
        const userSkillIds = user.user_skills.map((us: any) => us.skill.id)
        const jobSkillIds = job.job_skills.map((js: any) => js.skill.id)
        const matchingSkills = userSkillIds.filter((id: string) => jobSkillIds.includes(id))
        
        if (matchingSkills.length > 0) {
          const skillsMatchPercentage = matchingSkills.length / Math.max(jobSkillIds.length, 1)
          similarityScore += 0.4 * skillsMatchPercentage
          reasonsForMatch.push(`${matchingSkills.length} matching skills`)
        }
      }

      // 2. Location matching (30% weight)
      if (user.location && job.city_id?.toString() === user.location) {
        similarityScore += 0.3
        reasonsForMatch.push('Location match')
      }

      // 3. Job type preference (20% weight)
      if (user.preferred_job_types && user.preferred_job_types.includes(job.job_type)) {
        similarityScore += 0.2
        reasonsForMatch.push('Job type preference match')
      }

      // 4. Salary range matching (10% weight)
      if (user.desired_salary_min && user.desired_salary_max && job.salary_min && job.salary_max) {
        const userSalaryRange = user.desired_salary_max - user.desired_salary_min
        const jobSalaryRange = job.salary_max - job.salary_min
        const overlapMin = Math.max(user.desired_salary_min, job.salary_min)
        const overlapMax = Math.min(user.desired_salary_max, job.salary_max)
        
        if (overlapMax > overlapMin) {
          const overlap = overlapMax - overlapMin
          const maxRange = Math.max(userSalaryRange, jobSalaryRange)
          const salaryMatchScore = overlap / maxRange
          similarityScore += 0.1 * salaryMatchScore
          reasonsForMatch.push('Salary range compatible')
        }
      }

      // 5. Recency bonus (boost for newer jobs)
      const daysSincePosted = (Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)
      const recencyBonus = Math.max(0, (7 - daysSincePosted) / 7) * 0.1
      similarityScore += recencyBonus

      if (daysSincePosted <= 3) {
        reasonsForMatch.push('Recently posted')
      }

      // Only include jobs with reasonable similarity
      if (similarityScore > 0.1) {
        jobMatches.push({
          jobId: job.id,
          similarityScore,
          jobDetails: {
            id: job.id,
            title: job.title,
            description: job.description,
            job_type: job.job_type,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            salary_type: job.salary_type,
            city: job.city,
            category: job.category,
            posted_by: job.posted_by,
            created_at: job.created_at,
            application_deadline: job.application_deadline,
            requirements: job.requirements,
            job_skills: job.job_skills?.map((js: any) => js.skill),
            connections_required: job.connections_required
          },
          reasonsForMatch
        })
      }
    }

    // Sort by similarity score and limit results
    const sortedMatches = jobMatches
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit)

    // Log the matching activity
    if (sortedMatches.length > 0) {
      await supabaseClient
        .from('user_sessions')
        .upsert({
          user_id: userId,
          session_data: {
            last_job_match: new Date().toISOString(),
            matches_found: sortedMatches.length
          },
          updated_at: new Date().toISOString()
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        matches: sortedMatches,
        total: sortedMatches.length,
        user_profile: {
          name: user.name,
          skills_count: user.user_skills?.length || 0,
          location: user.location,
          preferred_job_types: user.preferred_job_types
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in job-matching function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
