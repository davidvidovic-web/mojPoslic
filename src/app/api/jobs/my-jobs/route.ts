import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get the current session
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get jobs posted by the current user
    const jobs = await prisma.jobListing.findMany({
      where: {
        postedById: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all cities and categories to join manually
    const cities = await prisma.city.findMany({
      where: {
        isActive: true
      }
    })

    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      }
    })

    // Transform the jobs to match the expected format
    const transformedJobs = jobs.map(job => {
      const city = cities.find(c => c.id === job.cityId)
      const category = categories.find(c => c.id === job.categoryId)
      
      return {
        id: job.id,
        title: job.title,
        company: job.company,
        type: job.type,
        description: job.description,
        salary: job.salary,
        salaryType: job.salaryType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        email: job.contactEmail,
        website: job.applicationUrl,
        is_featured: job.isFeatured,
        is_active: job.isActive,
        tags: job.tags,
        posted_at: job.createdAt.toISOString(),
        created_at: job.createdAt.toISOString(),
        updated_at: job.updatedAt.toISOString(),
        start_date: job.startDate ? job.startDate.toISOString() : null,
        expires_at: job.expiresAt ? job.expiresAt.toISOString() : null,
        job_address: job.jobAddress,
        job_latitude: job.jobLatitude,
        job_longitude: job.jobLongitude,
        city_id: job.cityId,
        category_id: job.categoryId,
        posted_by: job.postedById,
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
    console.error('Error fetching user jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
