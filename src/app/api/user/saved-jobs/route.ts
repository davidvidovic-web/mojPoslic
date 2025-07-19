import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { getCityById, getCategoryById } from '@/lib/job-helpers'

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Verify user can only access their own data
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch saved jobs with job details
    const savedJobs = await prisma.savedJob.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        job: {
          include: {
            postedBy: {
              select: {
                id: true,
                name: true,
                companyName: true,
                avatarUrl: true
              }
            },
            _count: {
              select: {
                applications: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const transformedJobs = await Promise.all(savedJobs.map(async (savedJob) => {
      const city = savedJob.job.cityId ? await getCityById(savedJob.job.cityId) : null
      const category = savedJob.job.categoryId ? await getCategoryById(savedJob.job.categoryId) : null
      
      return {
        ...savedJob.job,
        city: city ? {
          id: city.id,
          key: city.key,
          name: city.name_en || city.name_bs
        } : null,
        category: category ? {
          id: category.id,
          key: category.key,
          name: category.name_en || category.name_bs
        } : null,
        posted_by: savedJob.job.postedById,
        posted_at: savedJob.job.createdAt,
        applicationCount: savedJob.job._count.applications,
        savedAt: savedJob.createdAt
      }
    }))

    return NextResponse.json({
      savedJobs: transformedJobs
    })
  } catch (error) {
    console.error('Error fetching saved jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Check if job exists
    const job = await prisma.jobListing.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Create saved job (upsert to avoid duplicates)
    const savedJob = await prisma.savedJob.upsert({
      where: {
        jobId_userId: {
          jobId,
          userId: session.user.id
        }
      },
      update: {},
      create: {
        jobId,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      savedJob
    })
  } catch (error) {
    console.error('Error saving job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Remove saved job
    await prisma.savedJob.deleteMany({
      where: {
        jobId,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error unsaving job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
