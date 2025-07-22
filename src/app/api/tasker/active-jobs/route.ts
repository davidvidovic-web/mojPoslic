import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all active job assignments for the current user (tasker)
    const activeJobs = await prisma.jobAssignment.findMany({
      where: {
        selectedApplication: {
          userId: session.user.id
        },
        contractStatus: { in: ['PENDING', 'ACCEPTED'] } // Active statuses
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            description: true,
            salary: true,
            salaryType: true,
            salaryMin: true,
            salaryMax: true,
            startDate: true,
            startTime: true,
            duration: true,
            jobAddress: true,
            createdAt: true,
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
          select: {
            id: true,
            appliedAt: true,
            selectedAt: true,
            message: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    // Transform the data for better frontend consumption
    const transformedJobs = activeJobs.map(assignment => ({
      assignmentId: assignment.id,
      jobId: assignment.jobId,
      title: assignment.job.title,
      company: assignment.job.company,
      description: assignment.job.description,
      salary: assignment.job.salary,
      salaryType: assignment.job.salaryType,
      salaryMin: assignment.job.salaryMin,
      salaryMax: assignment.job.salaryMax,
      agreedSalary: assignment.agreedSalary,
      startDate: assignment.startDate || assignment.job.startDate,
      startTime: assignment.job.startTime,
      duration: assignment.job.duration,
      jobAddress: assignment.job.jobAddress,
      contractStatus: assignment.contractStatus,
      assignedAt: assignment.assignedAt,
      appliedAt: assignment.selectedApplication.appliedAt,
      selectedAt: assignment.selectedApplication.selectedAt,
      applicationMessage: assignment.selectedApplication.message,
      notes: assignment.notes,
      client: {
        id: assignment.job.postedBy.id,
        name: assignment.job.postedBy.name,
        email: assignment.job.postedBy.email,
        companyName: assignment.job.postedBy.companyName
      }
    }))

    return NextResponse.json({
      success: true,
      activeJobs: transformedJobs,
      total: transformedJobs.length
    })

  } catch (error) {
    console.error('Error fetching active jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
