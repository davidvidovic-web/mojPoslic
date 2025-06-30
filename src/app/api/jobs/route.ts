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

    // Manually join the data
    const transformedJobs = jobs.map(job => {
      const city = cities.find(c => c.id === job.cityId)
      
      return {
        ...job,
        posted_at: job.createdAt.toISOString(),
        // start_date: job.startDate ? job.startDate.toISOString() : null, // TODO: Enable after schema sync
        start_date: null, // TODO: Add startDate field after schema sync
        // job_address: job.jobAddress, // TODO: Enable after schema sync
        // job_latitude: job.jobLatitude, // TODO: Enable after schema sync  
        // job_longitude: job.jobLongitude, // TODO: Enable after schema sync
        job_address: null, // TODO: Add location fields after schema sync
        job_latitude: null,
        job_longitude: null,
        city_id: job.cityId,
        category_id: null, // Will be null for now until schema is fixed
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
        category: null // Will be null for now until schema is fixed
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
