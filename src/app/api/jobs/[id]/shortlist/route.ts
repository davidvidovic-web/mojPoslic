import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { ApplicationStatus } from '@/types/application'

const prisma = new PrismaClient()

// GET /api/jobs/[id]/shortlist - Get shortlisted applications for a job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Verify job ownership
    const job = await prisma.jobListing.findFirst({
      where: {
        id: jobId,
        postedById: session.user.id
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or access denied' },
        { status: 404 }
      )
    }

    // Get shortlisted applications
    const shortlistedApplications = await prisma.application.findMany({
      where: {
        jobId: jobId,
        status: ApplicationStatus.SHORTLISTED
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatarUrl: true,
            bio: true,
            skills: true,
            experience: true,
            location: true,
            // Include review stats
            reviewsReceived: {
              select: {
                rating: true
              }
            }
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate average ratings for users (simplified for now)
    const applicationsWithRatings = shortlistedApplications.map(application => application)

    return NextResponse.json({
      success: true,
      applications: applicationsWithRatings,
      count: applicationsWithRatings.length
    })

  } catch (error) {
    console.error('Get shortlist error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shortlisted applications' },
      { status: 500 }
    )
  }
}

// POST /api/jobs/[id]/shortlist - Add applications to shortlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Verify job ownership
    const job = await prisma.jobListing.findFirst({
      where: {
        id: jobId,
        postedById: session.user.id
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or access denied' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { applicationIds, clientNotes } = body

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: 'Application IDs array is required' },
        { status: 400 }
      )
    }

    // Update applications to shortlisted status
    const updateData: {
      status: ApplicationStatus
      shortlistedAt: Date
      reviewedAt: Date
      updatedAt: Date
      clientNotes?: string
    } = {
      status: ApplicationStatus.SHORTLISTED,
      shortlistedAt: new Date(),
      reviewedAt: new Date(), // Mark as reviewed when shortlisted
      updatedAt: new Date()
    }

    if (clientNotes) {
      updateData.clientNotes = clientNotes
    }

    const result = await prisma.application.updateMany({
      where: {
        id: { in: applicationIds },
        jobId: jobId,
        status: {
          in: [ApplicationStatus.PENDING, ApplicationStatus.REVIEWED]
        }
      },
      data: updateData
    })

    // Fetch updated applications
    const updatedApplications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
        jobId: jobId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully shortlisted ${result.count} applications`,
      applications: updatedApplications,
      updated: result.count
    })

  } catch (error) {
    console.error('Shortlist applications error:', error)
    return NextResponse.json(
      { error: 'Failed to shortlist applications' },
      { status: 500 }
    )
  }
}
