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
        performance_bonus,
        view_count,
        application_count,

        city_name,
        city_name_bs,
        city_name_en,
        category_name,
        category_name_bs,
        category_name_en,
        poster_name,
        poster_email,
        
        start_date,
        start_time,
        duration,
        transportation,
        transportation_amount,
        has_parking,
        public_transport_info,
        contact_email
      `)
      .eq('id', jobId)
      .single()

    // Type assertion to handle database schema changes
    const jobData = job as any // eslint-disable-line @typescript-eslint/no-explicit-any

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

    if (!jobData) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Transform job to match expected structure
    const baseJob = {
      id: jobData.id,
      title: jobData.title,
      description: jobData.description,
      company: '', // Will be enriched from user data
      posted_by_id: jobData.posted_by_id, // Include the poster ID
      salary: jobData.salary_amount?.toString() || '',
      salaryType: jobData.salary_type || '',
      type: jobData.job_type,
      job_type: jobData.job_type, // Ensure both fields are available
      cityId: jobData.city_id,
      categoryId: jobData.category_id,
      posted_at: jobData.created_at,
      created_at: jobData.created_at, // Ensure both fields are available
      start_date: jobData.start_date || null,
      start_time: jobData.start_time || null,
      duration: jobData.duration || null,
      job_address: jobData.exact_location,
      job_latitude: jobData.latitude,
      job_longitude: jobData.longitude,
      application_url: jobData.application_url,
      contact_email: jobData.contact_email || null,
      email: jobData.contact_info,
      application_deadline: jobData.application_deadline,
      is_featured: jobData.is_featured || false,
      is_active: jobData.is_active || false,
      user_id: jobData.posted_by_id,
      requirements: jobData.requirements,
      benefits: jobData.benefits,
      is_urgent: jobData.is_urgent || false,
      performance_bonus: jobData.performance_bonus || false,
      salary_min: jobData.salary_min,
      salary_max: jobData.salary_max,
      salaryMin: jobData.salary_min, // Ensure both camelCase and snake_case
      salaryMax: jobData.salary_max,
      is_salary_negotiable: jobData.is_salary_negotiable || false,
      currency: jobData.currency,
      subcategory_id: jobData.subcategory_id,
      tags: [], // Initialize empty tags array
      website: null,
      transportation: jobData.transportation || null,
      transportation_amount: jobData.transportation_amount || null,
      has_parking: jobData.has_parking || false,
      public_transport_info: jobData.public_transport_info || null,
      // Cached city and category data
      city_name: jobData.city_name,
      city_name_bs: jobData.city_name_bs,
      city_name_en: jobData.city_name_en,
      category_name: jobData.category_name,
      category_name_bs: jobData.category_name_bs,
      category_name_en: jobData.category_name_en,
      poster_name: jobData.poster_name,
      poster_email: jobData.poster_email,
      view_count: jobData.view_count || 0,
      application_count: jobData.application_count || 0
    }

    // Enrich with static city and category data
    const enrichedJob = await enrichJobWithStaticData(baseJob)

    // Fetch poster information
    if (jobData.posted_by_id) {
      // Use the public profile API to get user information with proper privacy handling
      try {
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : process.env.NEXT_PUBLIC_SITE_URL 
          || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')
        
        const publicProfileResponse = await fetch(`${baseUrl}/api/users/${jobData.posted_by_id}/public-profile?forJobContact=true`)
        
        if (publicProfileResponse.ok) {
          const publicProfile = await publicProfileResponse.json()
          
          // Use the public profile data
          const displayName = publicProfile.name || publicProfile.email || 'Unknown'
          const companyName = publicProfile.company_name || publicProfile.name || displayName



          enrichedJob.postedBy = {
            id: publicProfile.id,
            name: displayName,
            email: publicProfile.showEmail ? publicProfile.email : null,
            phone: publicProfile.showPhone ? publicProfile.phone : null,
            avatar_url: publicProfile.avatar_url,
            role: 'user' // Default role, could be enhanced later
          }
          enrichedJob.company = companyName
          enrichedJob.poster_name = displayName
          enrichedJob.poster_avatar_url = publicProfile.avatar_url // Also set the cached field
          enrichedJob.email = publicProfile.showEmail ? publicProfile.email : enrichedJob.contact_email
        } else {
          console.error('Failed to fetch public profile:', publicProfileResponse.status)
          // Set fallback values using cached data but still create postedBy object
          enrichedJob.postedBy = {
            id: jobData.posted_by_id,
            name: enrichedJob.poster_name || 'Unknown',
            email: null,
            phone: null,
            avatar_url: null,
            role: 'user'
          }
          enrichedJob.company = enrichedJob.poster_name || 'Unknown'
          enrichedJob.poster_name = enrichedJob.poster_name || 'Unknown'
        }
      } catch (error) {
        console.error('Error fetching public profile:', error)
        // Set fallback values using cached data but still create postedBy object
        enrichedJob.postedBy = {
          id: jobData.posted_by_id,
          name: enrichedJob.poster_name || 'Unknown',
          email: null,
          phone: null,
          avatar_url: null,
          role: 'user'
        }
        enrichedJob.company = enrichedJob.poster_name || 'Unknown'
        enrichedJob.poster_name = enrichedJob.poster_name || 'Unknown'
      }
    } else {
      // Set fallback values when no posted_by_id using cached data
      // Note: No postedBy object created here since there's no posted_by_id
      enrichedJob.company = enrichedJob.poster_name || 'Unknown'
      enrichedJob.poster_name = enrichedJob.poster_name || 'Unknown'
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
