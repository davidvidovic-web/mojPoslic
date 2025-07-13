import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { ApplicationStatus } from '@/types/application'

const prisma = new PrismaClient()

// DELETE /api/jobs/[id]/shortlist/[applicationId] - Remove application from shortlist
export async function DELETE(
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

    if (!jobId || !applicationId) {
      return NextResponse.json({ 
        error: 'Job ID and Application ID are required' 
      }, { status: 400 })
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

    // Check if application exists and is shortlisted
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobId: jobId,
        status: ApplicationStatus.SHORTLISTED
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Shortlisted application not found' },
        { status: 404 }
      )
    }

    // Remove from shortlist (move back to reviewed status)
    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId
      },
      data: {
        status: ApplicationStatus.REVIEWED,
        shortlistedAt: null,
        updatedAt: new Date()
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

    return NextResponse.json({
      success: true,
      message: 'Application removed from shortlist',
      application: updatedApplication
    })

  } catch (error) {
    console.error('Remove from shortlist error:', error)
    return NextResponse.json(
      { error: 'Failed to remove application from shortlist' },
      { status: 500 }
    )
  }
}
