import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { enrichJobsWithStaticData } from '@/lib/job-helpers'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = new PrismaClient()

    try {
      // Get user profile information for better recommendations
      const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        location: true, // User's city/location for location-based recommendations
        skills: true, // User's skills for category/skill matching
        preferredJobTypes: true // User's preferred job types
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

    // Extract user's location and skills for better matching
    const userLocation = user?.location?.toLowerCase().trim()
    const userSkills = user?.skills?.toLowerCase().split(',').map(s => s.trim()).filter(s => s.length > 0) || []
    const userPreferredTypes = user?.preferredJobTypes?.toLowerCase().split(',').map(s => s.trim()).filter(s => s.length > 0) || []
    
    // Build recommendation query - prioritize jobs from user's city and categories
    const whereConditions = {
      AND: [
        {
          id: {
            notIn: appliedJobIds
          }
        },
        {
          isActive: true
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
      take: 50 // Get more initially to filter and rank better
    })

    const postedByUsers = await prisma.user.findMany({
      where: {
        id: { in: recommendedJobs.map((job: { postedById: string }) => job.postedById) }
      },
      select: {
        id: true,
        name: true,
        companyName: true,
        avatarUrl: true
      }
    })

    // First enrich with static data, then add user info and scoring
    const enrichedJobs = await enrichJobsWithStaticData(recommendedJobs)
    
    // Transform jobs with user info and score them
    const scoredJobs = enrichedJobs.map(enrichedJob => {
      const postedBy = postedByUsers.find((u: { id: string }) => u.id === enrichedJob.postedById)
      
      const transformedJob = {
        ...enrichedJob,
        postedBy,
        _count: { applications: 0 } // We'll calculate this separately if needed
      }
      
      const jobData = enrichedJob as unknown as { 
        title: string
        description: string
        requirements?: string
        type: string
        createdAt: Date
      } // Cast to access all job properties
      
      let score = 0
      
      // PRIORITY 1: City/Location matching (highest priority - 200 points)
      if (userLocation && transformedJob.city) {
        const jobLocation = (transformedJob.city.name_en || transformedJob.city.name_bs).toLowerCase().trim()
        // Exact city match gets full points
        if (jobLocation === userLocation) {
          score += 200
        }
        // Partial city match gets reduced points
        else if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
          score += 100
        }
      }
      
      // PRIORITY 2: Category matching based on skills (150 points max)
      if (transformedJob.category && userSkills.length > 0) {
        const categoryName = (transformedJob.category.name_en || transformedJob.category.name_bs).toLowerCase()
        let categoryScore = 0
        
        userSkills.forEach((skill: string) => {
          if (skill && categoryName.includes(skill)) {
            categoryScore += 30 // Up to 30 points per skill match in category
          }
        })
        
        // Bonus for exact category matches in common categories
        const commonCategories = ['development', 'design', 'writing', 'marketing', 'sales', 'admin', 'customer service']
        const categoryKey = transformedJob.category.key?.toLowerCase() || ''
        
        commonCategories.forEach(commonCat => {
          if (categoryKey.includes(commonCat)) {
            userSkills.forEach((skill: string) => {
              if (skill.includes(commonCat)) {
                categoryScore += 50 // Bonus for category alignment
              }
            })
          }
        })
        
        score += Math.min(categoryScore, 150) // Cap category score at 150
      }
      
      // PRIORITY 3: Skills matching in job content (100 points max)
      if (userSkills.length > 0) {
        const jobText = `${jobData.title} ${jobData.description} ${jobData.requirements || ''}`.toLowerCase()
        let skillScore = 0
        
        userSkills.forEach((skill: string) => {
          if (skill && jobText.includes(skill)) {
            skillScore += 25 // 25 points per skill match in job content
          }
        })
        
        score += Math.min(skillScore, 100) // Cap skill score at 100
      }
      
      // PRIORITY 4: Job type matching (50 points)
      if (userPreferredTypes.length > 0) {
        const jobType = jobData.type?.toLowerCase() || ''
        userPreferredTypes.forEach((preferredType: string) => {
          if (preferredType && jobType.includes(preferredType.replace('_', ' ').replace('-', ' '))) {
            score += 50
          }
        })
      }
      
      // PRIORITY 5: Recency bonus (25 points max)
      const daysSincePosted = Math.floor((Date.now() - new Date(jobData.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSincePosted <= 7) {
        score += Math.max(0, 25 - (daysSincePosted * 3)) // Decreasing points for older jobs
      }
      
      // FALLBACK: If no location/skills match, still give some base score for diversity
      if (score === 0) {
        score = 10 + Math.random() * 5 // Small random score to provide variety
      }
      
      return { job: transformedJob, score }
    })

    // Sort by score (highest first) and take top recommendations with some variety
    const sortedJobs = scoredJobs.sort((a, b) => b.score - a.score)
    
    // Get top recommendations but ensure city/category diversity
    type JobType = typeof scoredJobs[0]['job']
    const topRecommendations: JobType[] = []
    const usedCities = new Set<string>()
    const usedCategories = new Set<string>()
    
    // First pass: Get high-scoring jobs from user's city and categories
    for (const item of sortedJobs) {
      if (topRecommendations.length >= 3) break
      
      const cityKey = item.job.city?.key || 'unknown'
      const categoryKey = item.job.category?.key || 'unknown'
      
      // Prioritize jobs from user's city if we have location info
      if (userLocation && item.job.city) {
        const jobLocation = (item.job.city.name_en || item.job.city.name_bs).toLowerCase().trim()
        if (jobLocation === userLocation || jobLocation.includes(userLocation)) {
          topRecommendations.push(item.job)
          usedCities.add(cityKey)
          usedCategories.add(categoryKey)
          continue
        }
      }
      
      // Add jobs with good scores and category diversity
      if (item.score > 100 && !usedCategories.has(categoryKey)) {
        topRecommendations.push(item.job)
        usedCities.add(cityKey)
        usedCategories.add(categoryKey)
      }
    }
    
    // Second pass: Fill remaining slots with best available jobs
    for (const item of sortedJobs) {
      if (topRecommendations.length >= 3) break
      
      const cityKey = item.job.city?.key || 'unknown'
      const categoryKey = item.job.category?.key || 'unknown'
      
      // Avoid duplicates
      if (!topRecommendations.find(job => job.id === item.job.id)) {
        topRecommendations.push(item.job)
        usedCities.add(cityKey)
        usedCategories.add(categoryKey)
      }
    }

    return NextResponse.json({
      jobs: topRecommendations.slice(0, 3) // Ensure we return exactly 3 jobs
    })
    } catch (error) {
      console.error('Error fetching recommended jobs:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}
