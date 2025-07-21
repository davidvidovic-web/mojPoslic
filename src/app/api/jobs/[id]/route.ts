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

    // Get current user session to check if they are the selected tasker
    const session = await auth()

    // Fetch the job
    const job = await getJobById(jobId)

    if (!job) {
      return errorResponse('Job not found', 404)
    }

    // Check if there's a job assignment and if current user is the selected tasker
    const jobAssignment = await prisma.jobAssignment.findUnique({
      where: { jobId },
      include: {
        selectedApplication: {
          include: {
            user: {
              select: { id: true }
            }
          }
        }
      }
    })

    const isSelectedTasker = !!(session?.user?.id && jobAssignment?.selectedApplication?.user?.id === session.user.id)

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
      // Blur contact information unless user is selected tasker or job owner
      email: (isSelectedTasker || session?.user?.id === job.postedById) ? job.email : 'Contact information available after job assignment',
      website: job.website,
      applicationUrl: job.applicationUrl,
      application_url: job.applicationUrl, // Alias for compatibility
      contactEmail: (isSelectedTasker || session?.user?.id === job.postedById) ? job.contactEmail : undefined,
      contact_email: (isSelectedTasker || session?.user?.id === job.postedById) ? job.contactEmail : undefined, // Alias for compatibility
      // Blur exact location unless user is selected tasker or job owner
      jobAddress: (isSelectedTasker || session?.user?.id === job.postedById) ? job.jobAddress : undefined,
      job_address: (isSelectedTasker || session?.user?.id === job.postedById) ? job.jobAddress : undefined, // Alias for compatibility
      jobLatitude: (isSelectedTasker || session?.user?.id === job.postedById) ? job.jobLatitude : undefined,
      job_latitude: (isSelectedTasker || session?.user?.id === job.postedById) ? job.jobLatitude : undefined, // Alias for compatibility
      jobLongitude: (isSelectedTasker || session?.user?.id === job.postedById) ? job.jobLongitude : undefined,
      job_longitude: (isSelectedTasker || session?.user?.id === job.postedById) ? job.jobLongitude : undefined, // Alias for compatibility
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
      // Blur poster contact info unless user is selected tasker or job owner
      postedBy: (isSelectedTasker || session?.user?.id === job.postedById) ? postedBy : {
        ...postedBy,
        phone: undefined
      },
      // Add assignment info for security checks on frontend
      isSelectedTasker,
      hasAssignment: !!jobAssignment
    }

    return NextResponse.json(transformedJob)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(
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

    const body = await request.json()

    // Check if the job exists and belongs to the current user
    const existingJob = await prisma.jobListing.findFirst({
      where: {
        id: jobId,
        postedById: session.user.id
      }
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found or you do not have permission to edit it' },
        { status: 404 }
      )
    }

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      title: body.title,
      company: body.company,
      description: body.description,
      type: body.type,
      salary: body.salary,
      salaryType: body.salaryType,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      email: body.email,
      website: body.website,
      contactEmail: body.contact_email,
      applicationUrl: body.application_url,
      tags: body.tags,
      startDate: body.start_date,
      startTime: body.start_time,
      duration: body.duration,
      transportation: body.transportation,
      transportationAmount: body.transportation_amount,
      hasParking: body.has_parking,
      publicTransportInfo: body.public_transport_info,
      jobAddress: body.job_address,
      jobLatitude: body.job_latitude,
      jobLongitude: body.job_longitude,
      requirements: body.requirements,
      benefits: body.benefits,
      isFeatured: body.is_featured,
      updatedAt: new Date()
    }

    // Handle city lookup if provided
    if (body.city) {
      const city = await prisma.city.findFirst({
        where: { key: body.city }
      })
      if (city) {
        updateData.cityId = city.id
      }
    }

    // Handle category lookup if provided
    if (body.category) {
      const category = await prisma.category.findFirst({
        where: { key: body.category }
      })
      if (category) {
        updateData.categoryId = category.id
      }
    }

    // Update the job
    const updatedJob = await prisma.jobListing.update({
      where: { id: jobId },
      data: updateData,
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Job updated successfully',
      job: updatedJob
    })

  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
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
