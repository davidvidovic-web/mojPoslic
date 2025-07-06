import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Verify user can only access their own data
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!prisma) {
      // Fallback for edge runtime or when Prisma is not available - return mock data for development
      const mockApplications = [
        {
          id: 'mock-app-1',
          job_id: 'mock-job-1',
          applied_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          status: 'accepted',
          job: {
            id: 'mock-job-1',
            title: 'Website Development',
            company: 'Tech Solutions LLC',
            salaryMin: 800,
            salaryMax: 1200,
            city: { name: 'Sarajevo' },
            category: { name: 'Web Development' },
            postedBy: { name: 'John Doe' }
          }
        },
        {
          id: 'mock-app-2',
          job_id: 'mock-job-2',
          applied_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          status: 'completed',
          job: {
            id: 'mock-job-2',
            title: 'Logo Design',
            company: 'Creative Agency',
            salaryMin: 300,
            salaryMax: 500,
            city: { name: 'Mostar' },
            category: { name: 'Design' },
            postedBy: { name: 'Jane Smith' }
          }
        },
        {
          id: 'mock-app-3',
          job_id: 'mock-job-3',
          applied_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: 'pending',
          job: {
            id: 'mock-job-3',
            title: 'Mobile App Testing',
            company: 'StartupXYZ',
            salaryMin: 400,
            salaryMax: 600,
            city: { name: 'Banja Luka' },
            category: { name: 'Testing' },
            postedBy: { name: 'Mike Johnson' }
          }
        },
        {
          id: 'mock-app-4',
          job_id: 'mock-job-4',
          applied_at: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
          status: 'completed',
          job: {
            id: 'mock-job-4',
            title: 'Content Writing',
            company: 'Digital Marketing Co',
            salaryMin: 200,
            salaryMax: 400,
            city: { name: 'Tuzla' },
            category: { name: 'Writing' },
            postedBy: { name: 'Sarah Wilson' }
          }
        }
      ]

      return NextResponse.json({
        applications: mockApplications,
        stats: {
          total: 4,
          pending: 1,
          accepted: 1,
          completed: 2,
          rejected: 0,
          totalEarnings: 700 // Average of completed jobs
        }
      })
    }

    // Fetch applications with job details
    const applications = await prisma.application.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        job: {
          include: {
            city: true,
            category: true,
            postedBy: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      completed: applications.filter(app => app.status === 'completed').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      totalEarnings: 0 // We'll calculate this based on completed jobs
    }

    // Calculate total earnings from completed jobs
    const completedJobs = applications.filter(app => app.status === 'completed')
    let totalEarnings = 0

    for (const application of completedJobs) {
      const job = application.job
      if (job.salaryMin) {
        // Use average of min and max, or just min if max is not available
        const salary = job.salaryMax ? (job.salaryMin + job.salaryMax) / 2 : job.salaryMin
        totalEarnings += salary
      }
    }

    stats.totalEarnings = Math.round(totalEarnings)

    return NextResponse.json({
      applications,
      stats
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
