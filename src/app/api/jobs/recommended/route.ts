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

    // Get user profile information for better recommendations
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        location: true,
        skills: true,
        preferredJobTypes: true
      }
    })

    // Fetch jobs that the user hasn't applied to
    const userApplications = await prisma.application.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        jobId: true
      }
    })

    const appliedJobIds = userApplications.map(app => app.jobId)

    // Extract user's preferred location and skills
    const userLocation = user?.location?.toLowerCase()
    const userSkills = user?.skills?.toLowerCase().split(',').map(s => s.trim()) || []
    
    // Build recommendation query with location and skill preferences
    const whereConditions = {
      AND: [
        {
          id: {
            notIn: appliedJobIds
          }
        },
        {
          status: 'active' as const
        },
        {
          postedById: {
            not: session.user.id // Don't recommend user's own jobs
          }
        }
      ]
    }

    const recommendedJobs = await prisma.jobListing.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Get more initially to filter and rank
    })

    // Get cities and categories separately
    const cities = await prisma.city.findMany({
      where: { isActive: true }
    })

    const categories = await prisma.category.findMany({
      where: { isActive: true }
    })

    const postedByUsers = await prisma.user.findMany({
      where: {
        id: { in: recommendedJobs.map(job => job.postedById) }
      },
      select: {
        id: true,
        name: true,
        companyName: true,
        avatarUrl: true
      }
    })

    // Transform jobs with manual joins and score them
    const scoredJobs = recommendedJobs.map(job => {
      const city = cities.find(c => c.id === job.cityId)
      const category = categories.find(c => c.id === job.categoryId)
      const postedBy = postedByUsers.find(u => u.id === job.postedById)
      
      const transformedJob = {
        ...job,
        city: city ? {
          ...city,
          name: city.nameEN || city.nameBS // Add name property for compatibility
        } : null,
        category: category ? {
          ...category,
          name: category.nameEN || category.nameBS // Add name property for compatibility
        } : null,
        postedBy,
        _count: { applications: 0 } // We'll calculate this separately if needed
      }
      
      let score = 0
      
      // Location matching (highest priority)
      if (userLocation && city) {
        const jobLocation = (city.nameEN || city.nameBS).toLowerCase()
        if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
          score += 100 // High bonus for location match
        }
      }
      
      // Skills matching (check job title, description, and requirements)
      if (userSkills.length > 0) {
        const jobText = `${job.title} ${job.description} ${job.requirements || ''}`.toLowerCase()
        userSkills.forEach(skill => {
          if (skill && jobText.includes(skill)) {
            score += 50 // Bonus for each skill match
          }
        })
      }
      
      // Category preference (if we can infer from skills)
      if (category && userSkills.length > 0) {
        const categoryName = (category.nameEN || category.nameBS).toLowerCase()
        userSkills.forEach(skill => {
          if (skill && categoryName.includes(skill)) {
            score += 30 // Bonus for category match
          }
        })
      }
      
      // Recency bonus (newer jobs get slight preference)
      const daysSincePosted = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSincePosted <= 7) {
        score += Math.max(0, 10 - daysSincePosted) // Up to 10 points for recent jobs
      }
      
      return { job: transformedJob, score }
    })

    // Sort by score (highest first) and take top 3
    const topRecommendations = scoredJobs
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.job)

    return NextResponse.json({
      jobs: topRecommendations
    })
  } catch (error) {
    console.error('Error fetching recommended jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
