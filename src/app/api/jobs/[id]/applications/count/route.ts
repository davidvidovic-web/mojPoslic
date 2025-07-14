import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const jobId = id
    const session = await auth()

    // Get job and count applications (public information)
    const job = await prisma.jobListing.findUnique({
      where: { id: jobId },
      select: { 
        id: true,
        postedById: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Basic count is public
    const result: {
      count: number
      applicationCount: number
      newApplicationsCount?: number
      reviewedCount?: number
      shortlistedCount?: number
      selectedCount?: number
      rejectedCount?: number
      withdrawnCount?: number
    } = { 
      count: job._count.applications,
      applicationCount: job._count.applications
    }

    // If the user owns this job, provide detailed breakdown
    if (session?.user?.id && session.user.id === job.postedById) {
      const applications = await prisma.application.findMany({
        where: { jobId },
        select: { status: true }
      })

      const statusCounts = {
        newApplicationsCount: applications.filter(app => app.status === 'PENDING').length,
        reviewedCount: applications.filter(app => app.status === 'REVIEWED').length,
        shortlistedCount: applications.filter(app => app.status === 'SHORTLISTED').length,
        selectedCount: applications.filter(app => app.status === 'SELECTED').length,
        rejectedCount: applications.filter(app => app.status === 'REJECTED').length,
        withdrawnCount: applications.filter(app => app.status === 'WITHDRAWN').length
      }

      Object.assign(result, statusCounts)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching applicant count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
