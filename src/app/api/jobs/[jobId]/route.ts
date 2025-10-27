import { NextResponse, NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import { enrichJobWithStaticData } from '@/lib/job-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { jobId } = await params

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Fetch the job with all necessary fields
    const { data: job, error } = await supabase
      .from('job_listings')
      .select(`
        id,
        title,
        description,
        job_type,
        salary_amount,
        salary_min,
        salary_max,
        salary_type,
        is_salary_negotiable,
        currency,
        city_id,
        category_id,
        subcategory_id,
        created_at,
        application_deadline,
        exact_location,
        latitude,
        longitude,
        application_url,
        contact_info,
        is_featured,
        is_active,
        posted_by_id,
        requirements,
        benefits,
        is_urgent,
        view_count,
        application_count
      `)
      .eq('id', jobId)
      .single()

    if (error) {
      console.error('Error fetching job:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }
      return NextResponse.json(
        { error: 'Failed to fetch job', details: error.message },
        { status: 500 }
      )
    }

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Transform job to match expected structure
    const baseJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      company: '', // Will be enriched from user data
      posted_by_id: job.posted_by_id, // Include the poster ID
      salary: job.salary_amount?.toString() || '',
      salaryType: job.salary_type || '',
      type: job.job_type,
      job_type: job.job_type, // Ensure both fields are available
      cityId: job.city_id,
      categoryId: job.category_id,
      posted_at: job.created_at,
      created_at: job.created_at, // Ensure both fields are available
      start_date: null,
      start_time: null,
      duration: null,
      job_address: job.exact_location,
      job_latitude: job.latitude,
      job_longitude: job.longitude,
      application_url: job.application_url,
      contact_email: job.contact_info,
      email: job.contact_info,
      expires_at: job.application_deadline,
      is_featured: job.is_featured || false,
      is_active: job.is_active || false,
      user_id: job.posted_by_id,
      requirements: job.requirements,
      benefits: job.benefits,
      is_urgent: job.is_urgent || false,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salaryMin: job.salary_min, // Ensure both camelCase and snake_case
      salaryMax: job.salary_max,
      is_salary_negotiable: job.is_salary_negotiable || false,
      currency: job.currency,
      subcategory_id: job.subcategory_id,
      tags: [], // Initialize empty tags array
      website: null,
      transportation: null,
      transportation_amount: null,
      has_parking: null,
      public_transport_info: null,
      view_count: job.view_count || 0,
      application_count: job.application_count || 0
    }

    // Enrich with static city and category data
    const enrichedJob = await enrichJobWithStaticData(baseJob)

    // Fetch poster information
    if (job.posted_by_id) {
      // Use the public profile API to get user information with proper privacy handling
      try {
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : process.env.NEXT_PUBLIC_SITE_URL 
          || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')
        
        const publicProfileResponse = await fetch(`${baseUrl}/api/users/${job.posted_by_id}/public-profile?forJobContact=true`)
        
        if (publicProfileResponse.ok) {
          const publicProfile = await publicProfileResponse.json()
          
          // Use the public profile data
          const displayName = publicProfile.name || publicProfile.email || 'Unknown'
          const companyName = publicProfile.company_name || publicProfile.name || 'Individual'

          enrichedJob.postedBy = {
            id: publicProfile.id,
            name: displayName,
            email: publicProfile.showEmail ? publicProfile.email : null,
            phone: publicProfile.showPhone ? publicProfile.phone : null
          }
          enrichedJob.company = companyName
          enrichedJob.poster_name = displayName
          enrichedJob.email = publicProfile.showEmail ? publicProfile.email : enrichedJob.contact_email
        } else {
          console.error('Failed to fetch public profile:', publicProfileResponse.status)
          // Set fallback values
          enrichedJob.company = 'Individual'
          enrichedJob.poster_name = 'Unknown'
        }
      } catch (error) {
        console.error('Error fetching public profile:', error)
        // Set fallback values
        enrichedJob.company = 'Individual'
        enrichedJob.poster_name = 'Unknown'
      }
    } else {
      // Set fallback values when no posted_by_id
      enrichedJob.company = 'Individual'
      enrichedJob.poster_name = 'Unknown'
    }

    return NextResponse.json(enrichedJob)
  } catch (error) {
    console.error('Error fetching job:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const supabase = await createServerSupabaseClient()
  
  // Also create a service role client for updates that might be blocked by RLS
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
  
  try {
    const { jobId } = await params
    const body = await request.json()
    
    // Handle view count increment
    if (body.action === 'increment_view') {
      // First get the current view count
      const { data: currentJob, error: fetchError } = await supabase
        .from('job_listings')
        .select('view_count')
        .eq('id', jobId)
        .single()
      
      if (fetchError || !currentJob) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        )
      }
      
      const newViewCount = (currentJob.view_count || 0) + 1
      
      // Increment the view count using service role client to bypass RLS
      const { error } = await supabaseService
        .from('job_listings')
        .update({ 
          view_count: newViewCount,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select('view_count')
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to update view count' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ success: true, newViewCount })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
