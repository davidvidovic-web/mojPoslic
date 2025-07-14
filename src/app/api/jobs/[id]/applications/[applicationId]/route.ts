import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, applicationId } = await params
    const jobId = id
    const body = await request.json()
    const { action, status, feedback, clientNotes } = body

    if (!jobId || !applicationId) {
      return NextResponse.json(
        { error: 'Job ID and Application ID are required' },
        { status: 400 }
      )
    }

    // Verify the job belongs to the current user and application exists
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobId: jobId,
        job: {
          postedById: session.user.id
        }
      },
      include: {
        job: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found or you do not have permission to modify it' },
        { status: 404 }
      )
    }

    const now = new Date()
    const updateData: {
      updatedAt: Date
      status?: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
      reviewedAt?: Date | null
      shortlistedAt?: Date | null
      rejectedAt?: Date | null
      selectedAt?: Date | null
      feedback?: string
      clientNotes?: string
    } = {
      updatedAt: now
    }

    // Set status and timestamp based on action
    switch (action) {
      case 'REVIEW':
        updateData.status = 'REVIEWED'
        updateData.reviewedAt = now
        break
      case 'SHORTLIST':
        updateData.status = 'SHORTLISTED'
        updateData.shortlistedAt = now
        if (!application.reviewedAt) updateData.reviewedAt = now
        break
      case 'REJECT':
        updateData.status = 'REJECTED'
        updateData.rejectedAt = now
        if (!application.reviewedAt) updateData.reviewedAt = now
        if (feedback) updateData.feedback = feedback
        break
      case 'SELECT':
        updateData.status = 'SELECTED'
        updateData.selectedAt = now
        if (!application.reviewedAt) updateData.reviewedAt = now
        if (!application.shortlistedAt) updateData.shortlistedAt = now
        break
      case 'MOVE_TO_PENDING':
        updateData.status = 'PENDING'
        updateData.reviewedAt = null
        updateData.shortlistedAt = null
        updateData.rejectedAt = null
        updateData.selectedAt = null
        break
      default:
        if (status) {
          updateData.status = status
          if (status === 'REVIEWED' && !application.reviewedAt) updateData.reviewedAt = now
          if (status === 'SHORTLISTED' && !application.shortlistedAt) updateData.shortlistedAt = now
          if (status === 'REJECTED' && !application.rejectedAt) updateData.rejectedAt = now
          if (status === 'SELECTED' && !application.selectedAt) updateData.selectedAt = now
        }
        break
    }

    if (clientNotes !== undefined) {
      updateData.clientNotes = clientNotes
    }

    if (feedback !== undefined) {
      updateData.feedback = feedback
    }

    // Update application in transaction
    const updatedApplication = await prisma.$transaction(async (tx) => {
      // If selecting this candidate, optionally reject others
      if (action === 'SELECT' || status === 'SELECTED') {
        // This could be made optional based on job settings
        await tx.application.updateMany({
          where: {
            jobId: jobId,
            id: { not: applicationId },
            status: { not: 'REJECTED' }
          },
          data: {
            status: 'REJECTED',
            rejectedAt: now,
            feedback: 'Position has been filled'
          }
        })
      }

      // Update the application
      return tx.application.update({
        where: {
          id: applicationId
        },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              phone: true,
              location: true,
              bio: true,
              skills: true,
              experience: true
            }
          },
          job: {
            select: {
              id: true,
              title: true,
              company: true
            }
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      application: updatedApplication
    })

  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
