import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { ApplicationStatus } from '@/types/application'
import { getCityById, getCategoryById } from '@/lib/job-helpers'
import { MessagingIntegrationService } from '@/lib/messaging/messaging-integration'

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

    // Get city and category data from static data
    const city = getCityById(application.job.cityId)
    const category = application.job.categoryId ? getCategoryById(application.job.categoryId) : null

    // Check access permissions
    const isApplicant = application.userId === user.id
    const isJobPoster = application.job.postedById === user.id
    const isAdmin = user.role === 'admin'

    if (!isApplicant && !isJobPoster && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Filter sensitive data based on user role and add static data
    const responseData = {
      ...application,
      job: {
        ...application.job,
        city,
        category
      },
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

    // Map ACCEPTED to SELECTED since ACCEPTED is not in ApplicationStatus enum
    let mappedStatus = status
    if (status === 'ACCEPTED') {
      mappedStatus = ApplicationStatus.SELECTED
    }

    if (mappedStatus && Object.values(ApplicationStatus).includes(mappedStatus)) {
      updateData.status = mappedStatus
      
      // Set appropriate timestamp based on status
      switch (mappedStatus) {
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

    // Update application in transaction - include JobAssignment creation for SELECTED status
    let updatedApplication
    try {
      updatedApplication = await prisma.$transaction(async (tx) => {
        // If selecting this candidate, create job assignment and reject others
        if (mappedStatus === ApplicationStatus.SELECTED) {
          console.log('Creating job assignment and rejecting other applications...')
          
          // Check if job is already assigned to prevent double assignment
          const existingAssignment = await tx.jobAssignment.findUnique({
            where: { jobId: application.job.id }
          })

          if (existingAssignment) {
            console.log('Existing assignment found:', existingAssignment)
            throw new Error('Job is already assigned to another tasker')
          }

          // Reject other applications
          console.log('Rejecting other applications...')
          const rejectedResult = await tx.application.updateMany({
            where: {
              jobId: application.job.id,
              id: { not: id },
              status: { not: 'REJECTED' }
            },
            data: {
              status: 'REJECTED',
              rejectedAt: now,
              feedback: 'Position has been filled'
            }
          })
          console.log('Rejected applications count:', rejectedResult.count)

          // Create JobAssignment record when selecting a candidate
          console.log('About to create JobAssignment with data:', {
            jobId: application.job.id,
            selectedApplicationId: id,
            contractStatus: 'PENDING',
            assignedAt: now
          })
          
          const jobAssignment = await tx.jobAssignment.create({
            data: {
              jobId: application.job.id,
              selectedApplicationId: id,
              contractStatus: 'PENDING',
              assignedAt: now
            }
          })

          console.log('JobAssignment created successfully:', jobAssignment)
        }

        // Update the application
        return await tx.application.update({
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
      })
    } catch (error) {
      console.error('Transaction failed:', error)
      if (error instanceof Error && error.message === 'Job is already assigned to another tasker') {
        return NextResponse.json({ error: 'Job is already assigned to another tasker' }, { status: 409 })
      }
      throw error
    }

    // Create notification for applicant if status changed
    if (mappedStatus && mappedStatus !== application.status) {
      const statusMessages: Partial<Record<ApplicationStatus, string>> = {
        [ApplicationStatus.REVIEWED]: 'Your application is being reviewed',
        [ApplicationStatus.SHORTLISTED]: 'You\'ve been shortlisted!',
        [ApplicationStatus.SELECTED]: 'Congratulations! You\'ve been selected',
        [ApplicationStatus.REJECTED]: 'Application update'
      }

      const message = statusMessages[mappedStatus as ApplicationStatus]
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
              newStatus: mappedStatus
            }
          }
        })
      }
    }

    // Create conversation and send welcome message for shortlisted applications
    if (mappedStatus === ApplicationStatus.SHORTLISTED) {
      try {
        await MessagingIntegrationService.createJobConversationWithWelcome(
          application.job.id,
          user.id, // client ID
          application.user.id, // tasker/applicant ID
          application.job.title,
          'SHORTLISTED'
        )
      } catch (error) {
        console.error('Failed to create conversation for shortlisted application:', error)
        // Continue with response even if conversation creation fails
      }
    }

    // Handle other status changes with messaging
    if (mappedStatus && ['INTERVIEW_SCHEDULED', 'SELECTED'].includes(mappedStatus)) {
      try {
        await MessagingIntegrationService.handleApplicationStatusChange(
          id,
          mappedStatus,
          user.id,
          application.user.id,
          application.job.id,
          application.job.title
        )
      } catch (error) {
        console.error('Failed to handle status change messaging:', error)
        // Continue with response even if messaging fails
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
