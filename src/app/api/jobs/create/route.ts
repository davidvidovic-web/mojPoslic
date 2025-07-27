import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'    // Store the key directly in the database (no UUID lookup needed)
    const cityKey = cityFromStatic.key
    const categoryKey = categoryFromStatic.key
    
    // Also get the display names for database storage (both locales)
    // Ensure we always have values for required fields
    const cityName = cityFromStatic.name_en || cityFromStatic.name_bs || cityFromStatic.name || cityKey
    const cityNameBs = cityFromStatic.name_bs || cityFromStatic.name_en || cityFromStatic.name || cityKey
    const cityNameEn = cityFromStatic.name_en || cityFromStatic.name_bs || cityFromStatic.name || cityKey
    
    const categoryName = categoryFromStatic.name_en || categoryFromStatic.name_bs || categoryFromStatic.name || categoryKey
    const categoryNameBs = categoryFromStatic.name_bs || categoryFromStatic.name_en || categoryFromStatic.name || categoryKey
    const categoryNameEn = categoryFromStatic.name_en || categoryFromStatic.name_bs || categoryFromStatic.name || categoryKey

    console.log('Jobs Create API: Prepared names:', {
      city: { key: cityKey, name_bs: cityNameBs, name_en: cityNameEn },
      category: { key: categoryKey, name_bs: categoryNameBs, name_en: categoryNameEn }
    })

        // Prepare job data for insertion
    const jobData = {function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Check for Authorization header first
    const authHeader = request.headers.get('authorization')
    console.log('Jobs Create API: Authorization header:', authHeader ? 'present' : 'missing')
    
    let user = null
    
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
        console.log('Jobs Create API: Auth header auth failed:', authError)
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = authData.user
      console.log('Jobs Create API: Authenticated user via auth header:', user.email)
    } else {
      // Fall back to cookie-based auth
      const supabaseServer = await createServerSupabaseClient()
      const { data: authData, error: authError } = await supabaseServer.auth.getUser()
      
      if (authError || !authData.user) {
        console.log('Jobs Create API: Cookie auth failed:', authError)
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = authData.user
      console.log('Jobs Create API: Authenticated user via cookies:', user.email)
    }

    // Validate required fields
    const { 
      title, 
      description, 
      city_id, 
      category_id,
      type = 'quick_job'
    } = body

    console.log('Jobs Create API: Request data:', { 
      title: title?.substring(0, 50), 
      city_id, 
      category_id, 
      type 
    })

    if (!title || !description || !city_id || !category_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, city_id, category_id' },
        { status: 400 }
      )
    }

    // Load static data to validate that the keys exist
    const citiesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/static/cities.json`)
    const citiesData = await citiesResponse.json()
    
    const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/static/categories.json`)
    const categoriesData = await categoriesResponse.json()

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
      return NextResponse.json(
        { success: false, error: `Invalid city_id: ${city_id}` },
        { status: 400 }
      )
    }

    if (!categoryFromStatic) {
      return NextResponse.json(
        { success: false, error: `Invalid category_id: ${category_id}` },
        { status: 400 }
      )
    }

    // Store the key directly in the database (no UUID lookup needed)
    const cityKey = cityFromStatic.key
    const categoryKey = categoryFromStatic.key
    
    // Also get the display names for database storage (both locales)
    // Ensure we always have values for required fields
    const cityName = cityFromStatic.name_en || cityFromStatic.name_bs || cityFromStatic.name || cityKey
    const cityNameBs = cityFromStatic.name_bs || cityFromStatic.name_en || cityFromStatic.name || cityKey
    const cityNameEn = cityFromStatic.name_en || cityFromStatic.name_bs || cityFromStatic.name || cityKey
    
    const categoryName = categoryFromStatic.name_en || categoryFromStatic.name_bs || categoryFromStatic.name || categoryKey
    const categoryNameBs = categoryFromStatic.name_bs || categoryFromStatic.name_en || categoryFromStatic.name || categoryKey
    const categoryNameEn = categoryFromStatic.name_en || categoryFromStatic.name_bs || categoryFromStatic.name || categoryKey

    console.log('Jobs Create API: Prepared names:', {
      city: { key: cityKey, name_bs: cityNameBs, name_en: cityNameEn },
      category: { key: categoryKey, name_bs: categoryNameBs, name_en: categoryNameEn }
    })

        // Prepare job data for insertion
    const jobData = {
      title: title.trim(),
      description: description.trim(),
      job_type: type as 'quick_job' | 'full_time' | 'part_time' | 'remote',
      city_id: cityKey, // Store the key directly (e.g., "banja-luka")
      city_name: cityName, // Store the display name (e.g., "Banja Luka")
      city_name_bs: cityNameBs, // Store the Bosnian name
      city_name_en: cityNameEn, // Store the English name
      category_id: categoryKey, // Store the key directly (e.g., "majstorski-radovi")
      category_name: categoryName, // Store the display name (e.g., "Majstorski radovi")
      category_name_bs: categoryNameBs, // Store the Bosnian name
      category_name_en: categoryNameEn, // Store the English name
      posted_by_id: user.id,
      requirements: body.requirements?.trim() || null,
      benefits: body.benefits?.trim() || null,
      salary_type: body.salaryType || null,
      salary_min: body.salaryMin || null,
      salary_max: body.salaryMax || null,
      application_url: body.application_url?.trim() || body.website?.trim() || null,
      contact_info: JSON.stringify({
        website: body.website?.trim() || null,
        email: body.email?.trim() || user.email,
        contact_email: body.contact_email?.trim() || body.email?.trim() || user.email
      }),
      exact_location: body.job_address?.trim() || null,
      latitude: body.job_latitude || null,
      longitude: body.job_longitude || null,
      is_active: true,
      is_featured: false,
      status: 'active' as 'active' | 'inactive' | 'completed' | 'expired',
      created_at: new Date().toISOString(),
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    }

    // Insert the job using Supabase
    const { data, error } = await supabase
      .from('job_listings')
      .insert([jobData])
      .select(`
        id,
        title,
        description,
        job_type,
        city_id,
        city_name,
        city_name_bs,
        city_name_en,
        category_id,
        category_name,
        category_name_bs,
        category_name_en,
        posted_by_id,
        requirements,
        benefits,
        salary_type,
        salary_min,
        salary_max,
        contact_info,
        exact_location,
        latitude,
        longitude,
        is_active,
        is_featured,
        status,
        created_at,
        updated_at,
        application_deadline,
        application_url
      `)
      .single()

    if (error) {
      console.error('Error creating job:', error)
      return NextResponse.json(
        { success: false, error: `Failed to create job: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('Error in job creation API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
