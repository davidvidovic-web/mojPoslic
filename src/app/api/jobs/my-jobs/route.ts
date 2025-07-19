import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { enrichJobsWithStaticData } from '@/lib/job-helpers'

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

    // Transform the jobs to match the expected format
    const baseJobs = jobs.map(job => ({
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
      cityId: job.cityId,
      categoryId: job.categoryId,
    }))

    // Enrich with static city and category data
    const transformedJobs = await enrichJobsWithStaticData(baseJobs)

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
