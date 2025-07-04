import { NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { PrismaClient } from '@prisma/client'

const prismaForStats = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch stats for the current user's job listings
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      featuredJobs
    ] = await Promise.all([
      prismaForStats.jobListing.count({
        where: { postedById: userId }
      }),
      prismaForStats.jobListing.count({
        where: { 
          postedById: userId,
          status: 'active'
        }
      }),
      prismaForStats.application.count({
        where: {
          job: { postedById: userId }
        }
      }),
      prismaForStats.jobListing.count({
        where: { 
          postedById: userId,
          isFeatured: true
        }
      })
    ])

    // Calculate monthly applications (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const monthlyApplications = await prismaForStats.application.count({
      where: {
        job: { postedById: userId },
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    const stats = {
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews: 0, // Would need to implement view tracking
      featuredJobs,
      monthlyApplications
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching company stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  } finally {
    await prismaForStats.$disconnect()
  }
}
