import { NextResponse, NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { enrichJobsWithStaticData } from '@/lib/job-helpers'

export async function GET(request: NextRequest) {
  try {
    // Log environment check
    console.log('Jobs API called - checking environment variables...')
    console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const supabase = await createServerSupabaseClient()
    
    if (!supabase) {
      console.error('Failed to create Supabase client')
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    console.log('Supabase client created successfully')

    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const search = searchParams.get('search')
    const city = searchParams.get('city')
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const type = searchParams.get('type')

    console.log('Query params:', { search, city, category, subcategory, type })

    // Use category and subcategory keys directly for filtering
    const categoryId = category
    const subcategoryId = subcategory

    // No conversion needed - the database stores keys directly
    // The UI sends keys like "majstorski-radovi" and the database has keys, so we can filter directly
    
    console.log('Building Supabase query...')
    
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
        is_urgent,
        view_count,
        application_count
      `)
      .eq('is_active', true)
      .eq('status', 'active')
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
    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId)
    }

    // Subcategory filter
    if (subcategoryId && subcategoryId !== 'all') {
      query = query.eq('subcategory_id', subcategoryId)
    }

    // Job type filter
    if (type && type !== 'all') {
      const validTypes = ['quick_job', 'full_time', 'part_time', 'remote']
      if (validTypes.includes(type)) {
        query = query.eq('job_type', type as 'quick_job' | 'full_time' | 'part_time' | 'remote')
      }
    }

    console.log('Executing Supabase query...')
    const { data: jobs, error } = await query

    if (error) {
      console.error('Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { error: 'Failed to fetch jobs', details: error.message },
        { status: 500 }
      )
    }

    console.log('Query successful, jobs count:', jobs?.length || 0)

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
      job_type: job.job_type, // Ensure both fields are available
      cityId: job.city_id,
      categoryId: job.category_id,
      posted_at: job.created_at,
      created_at: job.created_at, // Ensure both fields are available
      start_date: null,
      job_address: job.exact_location,
      job_latitude: job.latitude,
      job_longitude: job.longitude,
      application_url: job.application_url,
      contact_email: job.contact_info,
      application_deadline: job.application_deadline,
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
      subcategory_id: job.subcategory_id,
      view_count: job.view_count || 0,
      application_count: job.application_count || 0
    }))

    console.log('Enriching jobs with static data...')
    // Enrich with static city and category data
    const transformedJobs = await enrichJobsWithStaticData(baseJobs)
    console.log('Enrichment successful')

    return NextResponse.json(transformedJobs)
  } catch (error) {
    console.error('Unexpected error in jobs API:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cause: error instanceof Error && 'cause' in error ? (error as any).cause : undefined,
      hint: 'Check Vercel logs for: 1) Environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY), 2) Network connectivity to Supabase',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: error instanceof Error && 'code' in error ? (error as any).code : ''
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
