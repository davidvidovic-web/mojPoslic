import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { ApplicationStatus, ContractStatus } from '@/types/application'

const prisma = new PrismaClient()

// POST /api/jobs/[id]/assign - Assign job to selected candidate
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

    const body = await request.json()
    const { selectedApplicationId, startDate, agreedSalary, notes } = body

    if (!selectedApplicationId) {
      return NextResponse.json(
        { error: 'Selected application ID is required' },
        { status: 400 }
      )
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

    // Check if job is already assigned
    const existingAssignment = await prisma.jobAssignment.findUnique({
      where: { jobId }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Job is already assigned to another candidate' },
        { status: 400 }
      )
    }

    // Verify the selected application exists and is shortlisted
    const selectedApplication = await prisma.application.findFirst({
      where: {
        id: selectedApplicationId,
        jobId: jobId,
        status: { in: [ApplicationStatus.SHORTLISTED, ApplicationStatus.REVIEWED] }
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

    if (!selectedApplication) {
      return NextResponse.json(
        { error: 'Selected application not found or not eligible for assignment' },
        { status: 404 }
      )
    }

    // Perform assignment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update selected application status
      const updatedApplication = await tx.application.update({
        where: { id: selectedApplicationId },
        data: {
          status: ApplicationStatus.SELECTED,
          selectedAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create job assignment
      const assignment = await tx.jobAssignment.create({
        data: {
          jobId,
          selectedApplicationId,
          contractStatus: ContractStatus.PENDING,
          startDate: startDate ? new Date(startDate) : undefined,
          agreedSalary: agreedSalary ? parseInt(agreedSalary) : undefined,
          notes
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              type: true
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

      // Reject all other applications for this job
      await tx.application.updateMany({
        where: {
          jobId,
          id: { not: selectedApplicationId },
          status: {
            in: [
              ApplicationStatus.PENDING,
              ApplicationStatus.REVIEWED,
              ApplicationStatus.SHORTLISTED
            ]
          }
        },
        data: {
          status: ApplicationStatus.REJECTED,
          rejectedAt: new Date(),
          feedback: 'Position has been filled',
          updatedAt: new Date()
        }
      })

      // Update job status to completed/assigned (you might want to add this status)
      await tx.jobListing.update({
        where: { id: jobId },
        data: {
          status: 'completed', // You might need to add this to JobStatus enum
          updatedAt: new Date()
        }
      })

      return { assignment, updatedApplication }
    })

    // TODO: Send notifications to all applicants
    // - Congratulations to selected candidate
    // - Rejection notifications to others

    return NextResponse.json({
      success: true,
      message: 'Job successfully assigned',
      assignment: result.assignment,
      selectedApplication: result.updatedApplication
    })

  } catch (error) {
    console.error('Job assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to assign job' },
      { status: 500 }
    )
  }
}

// GET /api/jobs/[id]/assign - Get job assignment details
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

    // Verify job ownership or if user is the assigned tasker
    const job = await prisma.jobListing.findFirst({
      where: {
        id: jobId,
        OR: [
          { postedById: session.user.id },
          {
            assignment: {
              selectedApplication: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or access denied' },
        { status: 404 }
      )
    }

    // Get assignment details
    const assignment = await prisma.jobAssignment.findUnique({
      where: { jobId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            type: true,
            description: true,
            salary: true,
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                companyName: true
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
                location: true
              }
            }
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Job assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      assignment
    })

  } catch (error) {
    console.error('Get job assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job assignment' },
      { status: 500 }
    )
  }
}
