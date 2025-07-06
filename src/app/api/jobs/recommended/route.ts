import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      // Fallback for edge runtime or when Prisma is not available - return mock recommended jobs
      const mockRecommendedJobs = [
        {
          id: 'rec-job-1',
          title: 'React Developer',
          description: 'Looking for an experienced React developer for a modern web application.',
          company: 'Tech Innovations',
          salaryMin: 1000,
          salaryMax: 1500,
          salaryType: 'monthly',
          type: 'full_time',
          duration: '3-6 months',
          posted_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          posted_by: 'company-user-1',
          city: { id: '1', name: 'Sarajevo' },
          category: { id: '1', name: 'Web Development' }
        },
        {
          id: 'rec-job-2',
          title: 'Graphic Designer',
          description: 'Create stunning visual designs for marketing materials and web content.',
          company: 'Creative Studio',
          salaryMin: 600,
          salaryMax: 900,
          salaryType: 'monthly',
          type: 'part_time',
          duration: '1-2 months',
          posted_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          posted_by: 'company-user-2',
          city: { id: '2', name: 'Mostar' },
          category: { id: '2', name: 'Design' }
        },
        {
          id: 'rec-job-3',
          title: 'Content Writer',
          description: 'Write engaging content for blogs, websites, and social media platforms.',
          company: 'Digital Agency',
          salaryMin: 400,
          salaryMax: 700,
          salaryType: 'monthly',
          type: 'freelance',
          duration: '2-4 weeks',
          posted_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
          posted_by: 'company-user-3',
          city: { id: '3', name: 'Banja Luka' },
          category: { id: '3', name: 'Writing' }
        }
      ]

      return NextResponse.json({
        jobs: mockRecommendedJobs
      })
    }

    // Fetch recent jobs that the user hasn't applied to
    // This is a simplified recommendation system - in a real app you'd use more sophisticated logic
    const userApplications = await prisma.application.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        jobId: true
      }
    })

    const appliedJobIds = userApplications.map(app => app.jobId)

    const recommendedJobs = await prisma.jobListing.findMany({
      where: {
        AND: [
          {
            id: {
              notIn: appliedJobIds
            }
          },
          {
            status: 'active'
          },
          {
            postedById: {
              not: session.user.id // Don't recommend user's own jobs
            }
          }
        ]
      },
      include: {
        city: true,
        category: true,
        postedBy: {
          select: {
            id: true,
            name: true,
            companyName: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // Limit to 5 recommendations
    })

    return NextResponse.json({
      jobs: recommendedJobs
    })
  } catch (error) {
    console.error('Error fetching recommended jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
