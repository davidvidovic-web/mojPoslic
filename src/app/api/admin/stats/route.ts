import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 })
    }

    // Get user statistics
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    }) as Array<{ role: string; _count: { role: number } }>

    // Convert to the expected format
    const users = {
      total: 0,
      admin: 0,
      client: 0,
      tasker: 0,
      company: 0
    }

    userStats.forEach((stat) => {
      users.total += stat._count.role
      users[stat.role as keyof typeof users] = stat._count.role
    })

    // Get job statistics
    const totalJobs = await prisma.jobListing.count()
    const activeJobs = await prisma.jobListing.count({
      where: { isActive: true }
    })
    const featuredJobs = await prisma.jobListing.count({
      where: { isFeatured: true }
    })

    // Get growth statistics (last 30 days vs previous 30 days)
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

    const percentage = previousUsers > 0 
      ? Math.round(((recentUsers - previousUsers) / previousUsers) * 100)
      : recentUsers > 0 ? 100 : 0

    const stats = {
      users,
      jobs: {
        total: totalJobs,
        active: activeJobs,
        featured: featuredJobs
      },
      growth: {
        percentage,
        recentUsers,
        previousUsers
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
