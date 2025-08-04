import { NextResponse, NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
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
        is_urgent
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
      view_count: 0
    }

    // Enrich with static city and category data
    const enrichedJob = await enrichJobWithStaticData(baseJob)

    // Fetch poster information
    if (job.posted_by_id) {
      const { data: poster } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', job.posted_by_id)
        .single()

      if (poster) {
        // Use name if available, otherwise fall back to email
        const displayName = poster.name || poster.email || 'Unknown'
        const companyName = poster.name || poster.email || 'Individual'

        enrichedJob.postedBy = {
          id: poster.id,
          name: displayName,
          email: poster.email,
          phone: null // We can add this if available in the users table
        }
        enrichedJob.company = companyName
        enrichedJob.email = poster.email || enrichedJob.contact_email
      }
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
