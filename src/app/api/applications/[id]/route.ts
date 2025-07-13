import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { ApplicationStatus } from '@/types/application'

const prisma = new PrismaClient()

// GET - Get single application details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get application with full details
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            city: true,
            category: true,
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                companyName: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            skills: true,
            experience: true,
            location: true,
            bio: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check access permissions
    const isApplicant = application.userId === user.id
    const isJobPoster = application.job.postedById === user.id
    const isAdmin = user.role === 'admin'

    if (!isApplicant && !isJobPoster && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Filter sensitive data based on user role
    const responseData = {
      ...application,
      // Hide client notes from applicant
      clientNotes: isApplicant && !isAdmin ? undefined : application.clientNotes
    }

    return NextResponse.json({ application: responseData })

  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update application status/notes
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, clientNotes, feedback } = body

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get application to verify permissions
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            postedById: true
          }
        },
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
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const isJobPoster = application.job.postedById === user.id
    const isAdmin = user.role === 'admin'

    if (!isJobPoster && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Prepare update data
    const updateData: {
      status?: ApplicationStatus
      clientNotes?: string
      feedback?: string
      reviewedAt?: Date
      shortlistedAt?: Date
      selectedAt?: Date
      rejectedAt?: Date
    } = {}
    const now = new Date()

    if (status && Object.values(ApplicationStatus).includes(status)) {
      updateData.status = status
      
      // Set appropriate timestamp based on status
      switch (status) {
        case ApplicationStatus.REVIEWED:
          updateData.reviewedAt = now
          break
        case ApplicationStatus.SHORTLISTED:
          updateData.shortlistedAt = now
          break
        case ApplicationStatus.SELECTED:
          updateData.selectedAt = now
          break
        case ApplicationStatus.REJECTED:
          updateData.rejectedAt = now
          break
      }
    }

    if (clientNotes !== undefined) {
      updateData.clientNotes = clientNotes
    }

    if (feedback !== undefined) {
      updateData.feedback = feedback
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Create notification for applicant if status changed
    if (status && status !== application.status) {
      const statusMessages: Partial<Record<ApplicationStatus, string>> = {
        [ApplicationStatus.REVIEWED]: 'Your application is being reviewed',
        [ApplicationStatus.SHORTLISTED]: 'You\'ve been shortlisted!',
        [ApplicationStatus.SELECTED]: 'Congratulations! You\'ve been selected',
        [ApplicationStatus.REJECTED]: 'Application update'
      }

      const message = statusMessages[status as ApplicationStatus]
      if (message) {
        await prisma.notification.create({
          data: {
            userId: application.user.id,
            type: 'JOB_UPDATE',
            title: 'Application Status Update',
            content: `${message} for ${application.job.title}`,
            data: {
              jobId: application.job.id,
              applicationId: id,
              newStatus: status
            }
          }
        })
      }
    }

    return NextResponse.json({ 
      application: updatedApplication,
      message: 'Application updated successfully'
    })

  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
