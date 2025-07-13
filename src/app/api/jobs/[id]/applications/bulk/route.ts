import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { ApplicationStatus } from '@/types/application'

const prisma = new PrismaClient()

export async function PATCH(
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
    const { applicationIds, action, status, feedback, clientNotes } = body

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: 'Application IDs array is required' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    const updateData: {
      updatedAt: Date
      status?: ApplicationStatus
      reviewedAt?: Date
      shortlistedAt?: Date
      rejectedAt?: Date
      feedback?: string
      clientNotes?: string
    } = {
      updatedAt: new Date()
    }

    // Prepare update data based on action
    switch (action) {
      case 'review':
        if (!status || !Object.values(ApplicationStatus).includes(status)) {
          return NextResponse.json(
            { error: 'Valid status is required for review action' },
            { status: 400 }
          )
        }
        updateData.status = status
        updateData.reviewedAt = new Date()
        if (feedback) updateData.feedback = feedback
        if (clientNotes) updateData.clientNotes = clientNotes
        break

      case 'shortlist':
        updateData.status = ApplicationStatus.SHORTLISTED
        updateData.shortlistedAt = new Date()
        updateData.reviewedAt = updateData.reviewedAt || new Date()
        if (clientNotes) updateData.clientNotes = clientNotes
        break

      case 'reject':
        updateData.status = ApplicationStatus.REJECTED
        updateData.rejectedAt = new Date()
        updateData.reviewedAt = updateData.reviewedAt || new Date()
        if (feedback) updateData.feedback = feedback
        if (clientNotes) updateData.clientNotes = clientNotes
        break

      case 'move_to_reviewed':
        updateData.status = ApplicationStatus.REVIEWED
        updateData.reviewedAt = new Date()
        if (clientNotes) updateData.clientNotes = clientNotes
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: review, shortlist, reject, move_to_reviewed' },
          { status: 400 }
        )
    }

    // Perform bulk update
    const result = await prisma.application.updateMany({
      where: {
        id: { in: applicationIds },
        jobId: jobId
      },
      data: updateData
    })

    // Fetch updated applications for response
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
            avatarUrl: true,
            bio: true,
            skills: true,
            experience: true,
            location: true
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
      }
    })

    // TODO: Send notifications to affected users
    // This would be implemented with the notification system

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.count} applications`,
      applications: updatedApplications,
      updated: result.count
    })

  } catch (error) {
    console.error('Bulk application update error:', error)
    return NextResponse.json(
      { error: 'Failed to update applications' },
      { status: 500 }
    )
  }
}
