import { NextResponse, NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Create a simple Prisma client for this endpoint
const simplePrisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const search = searchParams.get('search')
    const city = searchParams.get('city')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    
    // Build where clause based on filters
    const where: {
      isActive: boolean
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        company?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
      }>
      cityId?: string
      categoryId?: string
      type?: 'quick_job' | 'full_time' | 'part_time' | 'remote'
    } = {
      isActive: true
    }
    
    // Search filter - search in title, company, description
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // City filter
    if (city && city !== 'all') {
      where.cityId = city
    }
    
    // Category filter
    if (category && category !== 'all') {
      where.categoryId = category
    }
    
    // Job type filter
    if (type && type !== 'all') {
      const typeMap: { [key: string]: string } = {
        'quick_job': 'quick_job',
        'full_time': 'full_time', 
        'part_time': 'part_time',
        'remote': 'remote'
      }
      const mappedType = typeMap[type] || type
      if (['quick_job', 'full_time', 'part_time', 'remote'].includes(mappedType)) {
        where.type = mappedType as 'quick_job' | 'full_time' | 'part_time' | 'remote'
      }
    }
    
    // Get filtered job data
    const jobs = await simplePrisma.jobListing.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all cities and categories to join manually
    const cities = await simplePrisma.city.findMany({
      where: {
        isActive: true
      }
    })

    const categories = await simplePrisma.category.findMany({
      where: {
        isActive: true
      }
    })

    // Manually join the data
    const transformedJobs = jobs.map(job => {
      const city = cities.find(c => c.id === job.cityId)
      const category = categories.find(c => c.id === job.categoryId)
      
      return {
        ...job,
        posted_at: job.createdAt.toISOString(),
        start_date: job.startDate ? job.startDate.toISOString() : null,
        job_address: job.jobAddress,
        job_latitude: job.jobLatitude, 
        job_longitude: job.jobLongitude,
        application_url: job.applicationUrl,
        contact_email: job.contactEmail,
        expires_at: job.expiresAt ? job.expiresAt.toISOString() : null,
        city_id: job.cityId,
        category_id: job.categoryId,
        is_featured: job.isFeatured, // Explicitly map isFeatured to is_featured
        city: city ? {
          id: city.id,
          key: city.key,
          name_bs: city.nameBS,
          name_en: city.nameEN,
          name: city.nameEN || city.nameBS,
          country: 'BA',
          state: '',
          is_special: city.isSpecial,
          sort_order: city.sortOrder,
          is_active: city.isActive
        } : undefined,
        category: category ? {
          id: category.id,
          key: category.key,
          name_bs: category.nameBS,
          name_en: category.nameEN,
          name: category.nameEN || category.nameBS,
          is_popular: category.isPopular,
          sort_order: category.sortOrder,
          is_active: category.isActive
        } : undefined
      }
    })

    return NextResponse.json(transformedJobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await simplePrisma.$disconnect()
  }
}
