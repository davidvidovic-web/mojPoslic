import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { formatConnectionAction } from '@/lib/connections'

// Use a fresh Prisma client instance for this API route
const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get connection history using raw SQL to avoid TypeScript issues
    const history = await prisma.$queryRaw`
      SELECT 
        id,
        action,
        amount,
        description,
        job_id,
        created_at
      FROM connection_history 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 50
    ` as Array<{
      id: string
      action: string
      amount: number
      description: string | null
      job_id: string | null
      created_at: Date
    }>

    // Format the history for display
    const formattedHistory = history.map(entry => ({
      id: entry.id,
      action: entry.action,
      actionLabel: formatConnectionAction(entry.action as any), // Use 'any' to avoid type issues
      amount: entry.amount,
      description: entry.description,
      jobId: entry.job_id,
      createdAt: entry.created_at,
      isPositive: entry.amount > 0,
      isNegative: entry.amount < 0
    }))

    return NextResponse.json({ 
      history: formattedHistory
    })
  } catch (error) {
    console.error('Error fetching connection history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
