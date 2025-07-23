import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Client confirms work completion
export async function POST(
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
    const { clientNotes } = body

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get job assignment with related data
    const jobAssignment = await prisma.jobAssignment.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            postedById: true
          }
        },
        selectedApplication: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!jobAssignment) {
      return NextResponse.json({ error: 'Job assignment not found' }, { status: 404 })
    }

    // Check if the current user is the job poster (client)
    if (jobAssignment.job.postedById !== user.id) {
      return NextResponse.json({ error: 'Only the job poster can confirm work completion' }, { status: 403 })
    }

    // Check if work has been marked as completed by tasker
    if (jobAssignment.contractStatus !== 'WORK_COMPLETED') {
      return NextResponse.json({ error: 'Work must be marked as completed by the tasker first' }, { status: 400 })
    }

    // Update job assignment to confirm completion
    const updatedAssignment = await prisma.jobAssignment.update({
      where: { id },
      data: {
        contractStatus: 'COMPLETED',
        clientConfirmedAt: new Date(),
        completedAt: new Date(),
        clientNotes: clientNotes || null
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            postedById: true
          }
        },
        selectedApplication: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Update the main job status to completed
    await prisma.jobListing.update({
      where: { id: jobAssignment.job.id },
      data: {
        status: 'completed'
      }
    })

    // Create notification for tasker
    await prisma.notification.create({
      data: {
        userId: jobAssignment.selectedApplication.user.id,
        type: 'JOB_UPDATE',
        title: 'Work Confirmed',
        content: `Your work on "${jobAssignment.job.title}" has been confirmed as completed. You can now rate your experience with the client.`,
        data: {
          jobId: jobAssignment.job.id,
          jobAssignmentId: id,
          status: 'COMPLETED'
        }
      }
    })

    return NextResponse.json({ 
      jobAssignment: updatedAssignment,
      message: 'Work completion confirmed successfully. The job is now completed and both parties can rate each other.'
    })

  } catch (error) {
    console.error('Error confirming work completion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
