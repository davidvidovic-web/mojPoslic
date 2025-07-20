import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { 
  getJobById, 
  getCityById, 
  getCategoryById, 
  getUserBasicInfo,
  errorResponse
} from '../utils'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const jobId = id

    if (!jobId) {
      return errorResponse('Job ID is required', 400)
    }

    // Fetch the job
    const job = await getJobById(jobId)

    if (!job) {
      return errorResponse('Job not found', 404)
    }

    // Fetch related data
    const [city, category, postedBy] = await Promise.all([
      getCityById(job.cityId),
      getCategoryById(job.categoryId),
      getUserBasicInfo(job.postedById)
    ])

    // Transform the data to match the expected format
    const transformedJob = {
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      salary: job.salary,
      salaryType: job.salaryType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      type: job.type,
      jobType: job.type, // Alias for compatibility
      email: job.email,
      website: job.website,
      applicationUrl: job.applicationUrl,
      application_url: job.applicationUrl, // Alias for compatibility
      contactEmail: job.contactEmail,
      contact_email: job.contactEmail, // Alias for compatibility
      jobAddress: job.jobAddress,
      job_address: job.jobAddress, // Alias for compatibility
      jobLatitude: job.jobLatitude,
      job_latitude: job.jobLatitude, // Alias for compatibility
      jobLongitude: job.jobLongitude,
      job_longitude: job.jobLongitude, // Alias for compatibility
      startDate: job.startDate,
      start_date: job.startDate, // Alias for compatibility
      isFeatured: job.isFeatured,
      tags: job.tags,
      expiresAt: job.expiresAt,
      expires_at: job.expiresAt, // Alias for compatibility
      isActive: job.isActive,
      posted_by: job.postedById, // Alias for compatibility
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      posted_at: job.createdAt, // Alias for compatibility
      city: city ? {
        id: city.id,
        key: city.key,
        name_bs: city.name_bs,
        name_en: city.name_en,
        name: city.name_en || city.name_bs // Convenience field
      } : null,
      category: category ? {
        id: category.id,
        key: category.key,
        name_bs: category.name_bs,
        name_en: category.name_en,
        name: category.name_en || category.name_bs // Convenience field
      } : null,
      postedBy
    }

    return NextResponse.json(transformedJob)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the current session
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const jobId = id

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Check if the job exists and belongs to the current user
    const existingJob = await prisma.jobListing.findFirst({
      where: {
        id: jobId,
        postedById: session.user.id
      }
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    // Delete the job
    await prisma.jobListing.delete({
      where: {
        id: jobId
      }
    })

    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
