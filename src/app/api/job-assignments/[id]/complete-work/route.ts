import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Tasker marks work as completed
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
    const { completionNotes } = body

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

    // Check if the current user is the assigned tasker
    if (jobAssignment.selectedApplication.user.id !== user.id) {
      return NextResponse.json({ error: 'Only the assigned tasker can mark work as completed' }, { status: 403 })
    }

    // Check if work is already completed or confirmed
    // @ts-expect-error - New enum values not yet reflected in types
    if (jobAssignment.contractStatus === 'WORK_COMPLETED' || 
        // @ts-expect-error
        jobAssignment.contractStatus === 'CONFIRMED_COMPLETED' || 
        jobAssignment.contractStatus === 'COMPLETED') {
      return NextResponse.json({ error: 'Work has already been marked as completed' }, { status: 400 })
    }

    // Update job assignment to mark work as completed
    const updatedAssignment = await prisma.jobAssignment.update({
      where: { id },
      data: {
        // @ts-expect-error - New enum values and fields not yet reflected in types
        contractStatus: 'WORK_COMPLETED',
        // @ts-expect-error
        workCompletedAt: new Date(),
        // @ts-expect-error
        completionNotes: completionNotes || null
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

    // Create notification for client
    await prisma.notification.create({
      data: {
        userId: jobAssignment.job.postedById,
        type: 'JOB_UPDATE',
        title: 'Work Completed',
        content: `${user.name} has marked the work as completed for "${jobAssignment.job.title}". Please review and confirm completion.`,
        data: {
          jobId: jobAssignment.job.id,
          jobAssignmentId: id,
          status: 'WORK_COMPLETED'
        }
      }
    })

    return NextResponse.json({ 
      jobAssignment: updatedAssignment,
      message: 'Work marked as completed successfully. Waiting for client confirmation.'
    })

  } catch (error) {
    console.error('Error marking work as completed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
