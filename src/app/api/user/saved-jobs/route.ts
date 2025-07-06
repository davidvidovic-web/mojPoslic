import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    if (!prisma) {
      // Fallback for edge runtime or when Prisma is not available
      return NextResponse.json({
        savedJobs: []
      })
    }

    // Fetch saved jobs with job details
    const savedJobs = await prisma.savedJob.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        job: {
          include: {
            city: true,
            category: true,
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
    const transformedJobs = savedJobs.map(savedJob => ({
      ...savedJob.job,
      posted_by: savedJob.job.postedById,
      posted_at: savedJob.job.createdAt,
      applicationCount: savedJob.job._count.applications,
      savedAt: savedJob.createdAt
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
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
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
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
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
  }
}
