import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { MessagingIntegrationService } from '@/lib/messaging/messaging-integration'
import { emailService } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(
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
    const { agreedSalary, startDate, notes } = body

    if (!jobId || !applicationId) {
      return NextResponse.json(
        { error: 'Job ID and Application ID are required' },
        { status: 400 }
      )
    }

    // Verify the job belongs to the current user and application exists
    console.log('Searching for application:', { applicationId, jobId, userId: session.user.id })
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobId: jobId,
        job: {
          postedById: session.user.id
        }
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            status: true,
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

    console.log('Application found:', application ? 'Yes' : 'No')

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found or you do not have permission to modify it' },
        { status: 404 }
      )
    }

    // Check if job is already assigned
    const existingAssignment = await prisma.jobAssignment.findUnique({
      where: { jobId: jobId }
    })

    console.log('Existing assignment:', existingAssignment ? 'Yes' : 'No')

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Job is already assigned to another tasker' },
        { status: 400 }
      )
    }

    const now = new Date()
    console.log('Starting job acceptance transaction...')

    // Execute acceptance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update application status to SELECTED
      console.log('Updating application to SELECTED...')
      const updatedApplication = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: 'SELECTED',
          selectedAt: now,
          updatedAt: now
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
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

      // Create job assignment
      console.log('Creating job assignment...')
      const jobAssignment = await tx.jobAssignment.create({
        data: {
          jobId: jobId,
          selectedApplicationId: applicationId,
          contractStatus: 'PENDING',
          startDate: startDate ? new Date(startDate) : null,
          agreedSalary: agreedSalary || null,
          notes: notes || null,
          assignedAt: now
        }
      })

      // Keep job active but mark it as assigned via the JobAssignment relationship
      // Don't change the job status to 'completed' yet - that should happen when work is actually completed
      console.log('Updating job timestamp...')
      await tx.jobListing.update({
        where: { id: jobId },
        data: {
          updatedAt: now
        }
      })

      // Reject all other pending applications
      console.log('Rejecting other applications...')
      await tx.application.updateMany({
        where: {
          jobId: jobId,
          id: { not: applicationId },
          status: { notIn: ['REJECTED', 'WITHDRAWN'] }
        },
        data: {
          status: 'REJECTED',
          rejectedAt: now,
          updatedAt: now,
          feedback: 'Position has been filled'
        }
      })

      console.log('Transaction completed successfully')
      return { updatedApplication, jobAssignment }
    })

    // Create conversation and send acceptance message
    try {
      await MessagingIntegrationService.createJobConversationWithWelcome(
        jobId,
        session.user.id, // client ID
        result.updatedApplication.user.id, // tasker ID
        result.updatedApplication.job.title,
        'ACCEPTED'
      )
    } catch (error) {
      console.error('Failed to create conversation for accepted application:', error)
      // Continue with response even if conversation creation fails
    }

    // Send acceptance notification email to tasker
    try {
      const jobTitle = result.updatedApplication.job.title
      const companyName = result.updatedApplication.job.company
      
      await emailService.sendNotificationEmail(
        result.updatedApplication.user.email,
        `🎉 Prihvaćeni ste za posao: ${jobTitle}`,
        `Čestitamo! Prihvaćeni ste za posao "${jobTitle}" u kompaniji ${companyName}. Poslodavac će vas uskoro kontaktirati sa daljim instrukcijama o početku rada.`,
        result.updatedApplication.user.name || undefined,
        'bs'
      )
    } catch (error) {
      console.error('Failed to send acceptance notification email:', error)
    }

    // Send rejection emails to other applicants
    try {
      const rejectedApplications = await prisma.application.findMany({
        where: {
          jobId: jobId,
          id: { not: applicationId },
          status: 'REJECTED'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      for (const rejectedApp of rejectedApplications) {
        try {
          await emailService.sendNotificationEmail(
            rejectedApp.user.email,
            `Ažuriranje prijave za: ${application.job.title}`,
            `Hvala vam na prijavi za posao "${application.job.title}". Nažalost, pozicija je popunjena. Želimo vam uspjeh u budućim prilikama!`,
            rejectedApp.user.name || undefined,
            'bs'
          )
        } catch (emailError) {
          console.error(`Failed to send rejection email to ${rejectedApp.user.email}:`, emailError)
        }
      }
    } catch (error) {
      console.error('Failed to send rejection notification emails:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'Tasker successfully accepted for the job',
      application: result.updatedApplication,
      assignment: result.jobAssignment
    })

  } catch (error) {
    console.error('Error accepting tasker for job:', error)
    return NextResponse.json(
      { error: 'Failed to accept tasker for job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
