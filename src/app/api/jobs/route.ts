import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Create a simple Prisma client for this endpoint
const simplePrisma = new PrismaClient()

export async function GET() {
  try {
    // Get basic job data first
    const jobs = await simplePrisma.jobListing.findMany({
      where: {
        isActive: true
      },
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
