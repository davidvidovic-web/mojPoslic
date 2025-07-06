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
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get today's date range (start and end of day)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfDay = new Date(today.getTime())
    const endOfDay = new Date(today.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours

    console.log('=== Today Count API Debug ===')
    console.log('Start of day:', startOfDay.toISOString())
    console.log('End of day:', endOfDay.toISOString())
    console.log('User ID:', user.id)

    // Count jobs posted today by this user
    const todayJobCount = await prisma.jobListing.count({
      where: {
        postedById: user.id,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    console.log('Today job count found:', todayJobCount)
    console.log('Will cost connections:', todayJobCount >= 1)

    return NextResponse.json({ 
      count: todayJobCount,
      willCostConnections: todayJobCount >= 1, // First job free, subsequent cost connections
      connectionCost: todayJobCount >= 1 ? 3 : 0
    })
  } catch (error) {
    console.error('Error getting today job count:', error)
    return NextResponse.json(
      { error: 'Failed to get today job count' },
      { status: 500 }
    )
  }
}
