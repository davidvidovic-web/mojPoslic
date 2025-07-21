import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
