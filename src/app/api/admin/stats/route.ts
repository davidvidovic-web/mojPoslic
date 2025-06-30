import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get user statistics
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    })

    // Get job statistics
    const totalJobs = await prisma.jobListing.count()
    const activeJobs = await prisma.jobListing.count({
      where: { isActive: true }
    })
    const featuredJobs = await prisma.jobListing.count({
      where: { isFeatured: true }
    })

    // Get recent growth (users created in last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    const previousUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    })

    // Calculate growth percentage
    let growthPercentage = 0
    if (previousUsers > 0) {
      growthPercentage = Math.round(((recentUsers - previousUsers) / previousUsers) * 100)
    } else if (recentUsers > 0) {
      growthPercentage = 100
    }

    // Transform user stats
    const userCounts = {
      total: 0,
      admin: 0,
      employer: 0,
      employee: 0
    }

    userStats.forEach(stat => {
      userCounts.total += stat._count.id
      if (stat.role === 'admin') userCounts.admin = stat._count.id
      if (stat.role === 'employer') userCounts.employer = stat._count.id
      if (stat.role === 'employee') userCounts.employee = stat._count.id
    })

    const stats = {
      users: userCounts,
      jobs: {
        total: totalJobs,
        active: activeJobs,
        featured: featuredJobs
      },
      growth: {
        percentage: growthPercentage,
        recentUsers,
        previousUsers
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
