import { NextRequest, NextResponse } from 'next/server'
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
