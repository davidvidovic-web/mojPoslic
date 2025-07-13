import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { ContractStatus } from '@/types/application'

const prisma = new PrismaClient()

// GET /api/assignments/[id] - Get assignment details
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
    const assignmentId = id

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    // Get assignment with access control
    const assignment = await prisma.jobAssignment.findFirst({
      where: {
        id: assignmentId,
        OR: [
          // Job poster can access
          { job: { postedById: session.user.id } },
          // Assigned tasker can access
          { selectedApplication: { userId: session.user.id } }
        ]
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            type: true,
            description: true,
            salary: true,
            salaryMin: true,
            salaryMax: true,
            startDate: true,
            duration: true,
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                companyName: true,
                phone: true
              }
            }
          }
        },
        selectedApplication: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                avatarUrl: true,
                phone: true,
                location: true,
                bio: true,
                skills: true,
                experience: true
              }
            }
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      assignment
    })

  } catch (error) {
    console.error('Get assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}

// PATCH /api/assignments/[id] - Update assignment (contract status, etc.)
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
    const assignmentId = id

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { contractStatus, startDate, agreedSalary, notes } = body

    // Get assignment with access control
    const assignment = await prisma.jobAssignment.findFirst({
      where: {
        id: assignmentId,
        OR: [
          // Job poster can update
          { job: { postedById: session.user.id } },
          // Assigned tasker can update contract status (accept/decline)
          { selectedApplication: { userId: session.user.id } }
        ]
      },
      include: {
        job: {
          select: {
            postedById: true
          }
        },
        selectedApplication: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or access denied' },
        { status: 404 }
      )
    }

    // Prepare update data based on user role
    const updateData: {
      contractStatus?: ContractStatus
      startDate?: Date
      agreedSalary?: number
      notes?: string
      updatedAt: Date
    } = {
      updatedAt: new Date()
    }

    const isJobPoster = assignment.job.postedById === session.user.id
    const isAssignedTasker = assignment.selectedApplication.userId === session.user.id

    // Contract status updates
    if (contractStatus && Object.values(ContractStatus).includes(contractStatus)) {
      // Both parties can update contract status
      updateData.contractStatus = contractStatus
    }

    // Only job poster can update these fields
    if (isJobPoster) {
      if (startDate) {
        updateData.startDate = new Date(startDate)
      }
      if (agreedSalary !== undefined) {
        updateData.agreedSalary = parseInt(agreedSalary)
      }
      if (notes !== undefined) {
        updateData.notes = notes
      }
    } else if (isAssignedTasker) {
      // Tasker can only update contract status (accept/decline)
      if (contractStatus && contractStatus !== ContractStatus.PENDING) {
        updateData.contractStatus = contractStatus
      } else if (Object.keys(body).some(key => !['contractStatus'].includes(key))) {
        return NextResponse.json(
          { error: 'Taskers can only update contract status' },
          { status: 403 }
        )
      }
    }

    // Update assignment
    const updatedAssignment = await prisma.jobAssignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            type: true,
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        selectedApplication: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true
              }
            }
          }
        }
      }
    })

    // TODO: Send notifications based on status change
    // - Contract accepted/declined notifications
    // - Start date confirmations
    // - Completion notifications

    return NextResponse.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    })

  } catch (error) {
    console.error('Update assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    )
  }
}
