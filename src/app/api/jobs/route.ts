import { NextResponse, NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { enrichJobsWithStaticData } from '@/lib/job-helpers'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const search = searchParams.get('search')
    const city = searchParams.get('city')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    
    // Build query
    let query = supabase
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
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Search filter - search in title and description
    if (search && search.trim() !== '') {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // City filter
    if (city && city !== 'all') {
      query = query.eq('city_id', city)
    }

    // Category filter
    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    // Job type filter
    if (type && type !== 'all') {
      const validTypes = ['quick_job', 'full_time', 'part_time', 'remote']
      if (validTypes.includes(type)) {
        query = query.eq('job_type', type as 'quick_job' | 'full_time' | 'part_time' | 'remote')
      }
    }

    const { data: jobs, error } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch jobs', details: error.message },
        { status: 500 }
      )
    }

    if (!jobs || !Array.isArray(jobs)) {
      return NextResponse.json({ error: 'No jobs found' }, { status: 404 })
    }

    // Transform jobs to match expected structure
    const baseJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: '', // Will be enriched from user data
      salary: job.salary_amount?.toString() || '',
      salaryType: job.salary_type || '',
      type: job.job_type,
      cityId: job.city_id,
      categoryId: job.category_id,
      posted_at: job.created_at,
      start_date: null,
      job_address: job.exact_location,
      job_latitude: job.latitude,
      job_longitude: job.longitude,
      application_url: job.application_url,
      contact_email: job.contact_info,
      expires_at: job.application_deadline,
      is_featured: job.is_featured || false,
      is_active: job.is_active || false,
      user_id: job.posted_by_id,
      requirements: job.requirements,
      benefits: job.benefits,
      is_urgent: job.is_urgent || false,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      is_salary_negotiable: job.is_salary_negotiable || false,
      currency: job.currency,
      subcategory_id: job.subcategory_id
    }))

    // Enrich with static city and category data
    const transformedJobs = await enrichJobsWithStaticData(baseJobs)

    return NextResponse.json(transformedJobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
