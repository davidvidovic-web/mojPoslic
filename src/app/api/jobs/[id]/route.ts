import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const jobId = id

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Fetch the job first
    const job = await prisma.jobListing.findFirst({
      where: {
        id: jobId,
        isActive: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Fetch city separately
    const city = job.cityId ? await prisma.city.findUnique({
      where: { id: job.cityId }
    }) : null

    // Fetch category separately
    const category = job.categoryId ? await prisma.category.findUnique({
      where: { id: job.categoryId }
    }) : null

    // Fetch posted by user
    const postedBy = await prisma.user.findUnique({
      where: { id: job.postedById },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

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
        name_bs: city.nameBS,
        name_en: city.nameEN,
        name: city.nameEN || city.nameBS // Convenience field
      } : null,
      category: category ? {
        id: category.id,
        key: category.key,
        name_bs: category.nameBS,
        name_en: category.nameEN,
        name: category.nameEN || category.nameBS // Convenience field
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
    const session = await getServerSession(authOptions)
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
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
      },
      include: {
        applications: true // Include applications to check count
      }
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found or you do not have permission to edit it' },
        { status: 404 }
      )
    }

    // Check if job has applications - if so, don't allow editing
    if (existingJob.applications && existingJob.applications.length > 0) {
      return NextResponse.json(
        { error: 'Cannot edit job that has received applications' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      company,
      cityId,
      categoryId,
      type,
      description,
      salaryType,
      salaryMin,
      salaryMax,
      email,
      website,
      startDate,
      startTime,
      duration,
      transportation,
      transportation_amount,
      expiresAt,
      jobAddress,
      jobLatitude,
      jobLongitude,
      requirements,
      benefits,
      tags
    } = body

    // Validate required fields
    if (!title || !company || !cityId || !type || !description || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update the job
    const updatedJob = await prisma.jobListing.update({
      where: {
        id: jobId
      },
      data: {
        title,
        company,
        cityId,
        categoryId: categoryId || null,
        type,
        description,
        salaryType: salaryType || null,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        contactEmail: email,
        applicationUrl: website || null,
        startDate: startDate ? new Date(startDate) : null,
        startTime: startTime || null,
        duration: duration || null,
        transportation: transportation || null,
        transportationAmount: transportation_amount || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        jobAddress: jobAddress || null,
        jobLatitude: jobLatitude ? Number(jobLatitude) : null,
        jobLongitude: jobLongitude ? Number(jobLongitude) : null,
        requirements: requirements || null,
        benefits: benefits || null,
        tags: tags || null,
        updatedAt: new Date()
      },
      include: {
        city: true,
        category: true,
        postedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedJob)
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
