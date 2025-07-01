import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prismaForStats = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch stats for the current user's job listings
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      featuredJobs
    ] = await Promise.all([
      prismaForStats.jobListing.count({
        where: { postedById: session.user.id }
      }),
      prismaForStats.jobListing.count({
        where: { 
          postedById: session.user.id,
          status: 'active'
        }
      }),
      prismaForStats.application.count({
        where: {
          job: { postedById: session.user.id }
        }
      }),
      prismaForStats.jobListing.count({
        where: { 
          postedById: session.user.id,
          isFeatured: true
        }
      })
    ])

    // Calculate monthly applications (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const monthlyApplications = await prismaForStats.application.count({
      where: {
        job: { postedById: session.user.id },
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
