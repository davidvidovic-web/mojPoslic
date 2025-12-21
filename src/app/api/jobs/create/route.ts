import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Check for Authorization header first
    const authHeader = request.headers.get('authorization')
    
    let user = null
    let authenticatedSupabase = null
    
    // Get the authenticated user - try both cookies and auth header
    if (authHeader) {
      // Create a client that uses the auth header
      const { createServerClient } = await import('@supabase/ssr')
      const supabaseWithAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: () => undefined,
            set: () => {},
            remove: () => {},
          },
          global: {
            headers: {
              'Authorization': authHeader
            }
          }
        }
      )
      
      const { data: authData, error: authError } = await supabaseWithAuth.auth.getUser()
      
      if (authError || !authData.user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = authData.user
      authenticatedSupabase = supabaseWithAuth
    } else {
      // Fall back to cookie-based auth
      const supabaseServer = await createServerSupabaseClient()
      const { data: authData, error: authError } = await supabaseServer.auth.getUser()
      
      if (authError || !authData.user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = authData.user
      authenticatedSupabase = supabaseServer
    }

    const {
      title,
      description,
      type,
      city_id,
      category_id,
      requirements,
      benefits,
      salaryType,
      salaryMin,
      salaryMax,
      application_url,
      website,
      email,
      contact_email,
      job_address,
      job_latitude,
      job_longitude,
      is_featured,
      // Schedule and timing fields
      start_date,
      start_time,
      duration,
      duration_days,
      // Transportation fields
      transportation,
      transportation_amount,
      has_parking,
      public_transport_info,
      // Additional job fields
      application_deadline,
      is_urgent,
      performance_bonus
    } = body

    // Validate required fields
    if (!title || !description || !city_id || !category_id) {
      console.error('❌ Missing required fields:', { title: !!title, description: !!description, city_id, category_id })
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, city_id, category_id' },
        { status: 400 }
      )
    }

    // Load static data to validate that the keys exist
    // Import the data directly instead of fetching to avoid URL issues
    let citiesData, categoriesData
    try {
      // Try to import the static data directly from the file system
      const fs = await import('fs')
      const path = await import('path')
      
      const citiesPath = path.join(process.cwd(), 'public', 'static', 'cities.json')
      const categoriesPath = path.join(process.cwd(), 'public', 'static', 'categories.json')
      
      citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'))
      categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
    } catch (fsError) {
      console.error('Failed to read static files directly, trying fetch:', fsError)
      
      // Fallback to fetch with better URL construction
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXT_PUBLIC_SITE_URL 
        || 'http://localhost:3000'
      
      try {
        const [citiesResponse, categoriesResponse] = await Promise.all([
          fetch(`${baseUrl}/static/cities.json`),
          fetch(`${baseUrl}/static/categories.json`)
        ])
        
        if (!citiesResponse.ok || !categoriesResponse.ok) {
          throw new Error(`Failed to fetch static data: cities ${citiesResponse.status}, categories ${categoriesResponse.status}`)
        }
        
        citiesData = await citiesResponse.json()
        categoriesData = await categoriesResponse.json()
      } catch (fetchError) {
        console.error('Failed to fetch static data:', fetchError)
        return NextResponse.json(
          { success: false, error: 'Failed to load validation data' },
          { status: 500 }
        )
      }
    }

    // Validate the city and category keys exist in static data
    let cityFromStatic
    if (/^\d+$/.test(String(city_id))) {
      // Legacy numeric ID - find by id (for backward compatibility)
      cityFromStatic = citiesData.cities.find((c: { id: string }) => c.id === String(city_id))
    } else {
      // Key string - find by key (new format)
      cityFromStatic = citiesData.cities.find((c: { key: string }) => c.key === String(city_id))
    }

    let categoryFromStatic
    if (/^\d+$/.test(String(category_id))) {
      // Legacy numeric ID - find by id (for backward compatibility)
      categoryFromStatic = categoriesData.categories.find((c: { id: string }) => c.id === String(category_id))
      // Also check subcategories for legacy numeric IDs like "1-1"
      if (!categoryFromStatic) {
        for (const cat of categoriesData.categories) {
          if (cat.subcategories) {
            const subcat = cat.subcategories.find((sub: { id: string }) => sub.id === String(category_id))
            if (subcat) {
              categoryFromStatic = subcat
              break
            }
          }
        }
      }
    } else {
      // Key string - find by key (new format)
      categoryFromStatic = categoriesData.categories.find((c: { key: string }) => c.key === String(category_id))
      // Also check subcategories for keys
      if (!categoryFromStatic) {
        for (const cat of categoriesData.categories) {
          if (cat.subcategories) {
            const subcat = cat.subcategories.find((sub: { key: string }) => sub.key === String(category_id))
            if (subcat) {
              categoryFromStatic = subcat
              break
            }
          }
        }
      }
    }

    if (!cityFromStatic) {
      console.error('❌ Invalid city_id:', city_id, 'Available cities:', citiesData.cities.map((c: { id: string; key: string }) => ({ id: c.id, key: c.key })))
      return NextResponse.json(
        { success: false, error: `Invalid city_id: ${city_id}` },
        { status: 400 }
      )
    }

    if (!categoryFromStatic) {
      console.error('❌ Invalid category_id:', category_id, 'Available categories:', categoriesData.categories.map((c: { id: string; key: string }) => ({ id: c.id, key: c.key })))
      return NextResponse.json(
        { success: false, error: `Invalid category_id: ${category_id}` },
        { status: 400 }
      )
    }

    // Store the key directly in the database (no UUID lookup needed)
    const cityKey = cityFromStatic.key
    const categoryKey = categoryFromStatic.key
    
    // Get the display names for database storage (cached fields)
    const cityName = cityFromStatic.name_en || cityFromStatic.name_bs || cityFromStatic.name || cityKey
    const cityNameBs = cityFromStatic.name_bs || cityFromStatic.name_en || cityFromStatic.name || cityKey
    const cityNameEn = cityFromStatic.name_en || cityFromStatic.name_bs || cityFromStatic.name || cityKey
    
    const categoryName = categoryFromStatic.name_en || categoryFromStatic.name_bs || categoryFromStatic.name || categoryKey
    const categoryNameBs = categoryFromStatic.name_bs || categoryFromStatic.name_en || categoryFromStatic.name || categoryKey
    const categoryNameEn = categoryFromStatic.name_en || categoryFromStatic.name_bs || categoryFromStatic.name || categoryKey

    // Prepare job data for insertion
    const jobData = {
      title,
      description,
      job_type: type,
      city_id: cityKey,
      category_id: categoryKey,
      posted_by_id: user.id,
      requirements: requirements || null,
      benefits: benefits || null,
      salary_type: salaryType || null,
      salary_min: salaryMin || null,
      salary_max: salaryMax || null,
      // Set salary_amount based on available salary data
      salary_amount: (() => {
        if (salaryType === 'fixed' && salaryMin) return salaryMin
        if (salaryType === 'negotiable') return null
        if (salaryMin && salaryMax) return Math.round((salaryMin + salaryMax) / 2) // Average
        return salaryMin || salaryMax || null
      })(),
      contact_info: email || contact_email || null,
      contact_email: contact_email || email || null,
      application_url: application_url || website || null,
      // Map location fields correctly (form sends job_address, job_latitude, job_longitude)
      exact_location: job_address || null,
      latitude: job_latitude || null,
      longitude: job_longitude || null,
      // Schedule and timing fields from the form
      start_date: start_date || null,
      start_time: start_time || null,
      duration: duration || null,
      duration_days: duration_days || null,
      // Transportation fields from the form
      transportation: transportation || null,
      transportation_amount: transportation_amount || null,
      has_parking: has_parking || false,
      public_transport_info: public_transport_info || null,
      // Additional job fields
      application_deadline: application_deadline || null,
      is_urgent: is_urgent || false,
      performance_bonus: performance_bonus || false,
      is_active: true,
      is_featured: is_featured || false,
      status: 'active' as const,
      // Cached city data for performance
      city_name: cityName,
      city_name_bs: cityNameBs,
      city_name_en: cityNameEn,
      // Cached category data for performance
      category_name: categoryName,
      category_name_bs: categoryNameBs,
      category_name_en: categoryNameEn,
            // Cached poster data for performance (phone and avatar come from users table)
      poster_name: user.user_metadata?.name || user.email || 'User',
      poster_email: user.email || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // If the job is featured, deduct 6 connections from the user's balance
    if (is_featured) {
      const { data: userProfile, error: profileError } = await authenticatedSupabase
        .from('users')
        .select('connections')
        .eq('id', user.id)
        .single()

      if (profileError || !userProfile) {
        console.error('❌ Failed to fetch user profile:', profileError)
        return NextResponse.json(
          { success: false, error: 'Failed to check user connections' },
          { status: 500 }
        )
      }

      if (userProfile.connections < 6) {
        console.error('❌ Insufficient connections:', userProfile.connections, '< 6')
        return NextResponse.json(
          { success: false, error: 'Insufficient connections. You need 6 connections to feature a job.' },
          { status: 400 }
        )
      }

      // Deduct 6 connections
      const { error: deductError } = await authenticatedSupabase
        .from('users')
        .update({ connections: userProfile.connections - 6 })
        .eq('id', user.id)

      if (deductError) {
        return NextResponse.json(
          { success: false, error: 'Failed to deduct connections' },
          { status: 500 }
        )
      }
    }

    // Insert the job into Supabase using the authenticated client
    const { data: insertedJob, error: insertError } = await authenticatedSupabase
      .from('job_listings')
      .insert([jobData])
      .select(`
        *,
        posted_by:users(
          id, name, email, avatar_url
        )
      `)
      .single()

    if (insertError) {
      console.error('Jobs Create API: Database insertion error:', insertError)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to create job: ${insertError.message}`,
          details: insertError 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: insertedJob,
      message: 'Job created successfully'
    })

  } catch (error) {
    console.error('Jobs Create API: Unexpected error:', error)
    
    // More detailed error logging for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
