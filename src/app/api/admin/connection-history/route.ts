import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ConnectionHistoryWithUser = {
  id: string
  userId: string
  action: string
  amount: number
  description: string | null
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPrismaClient = () => prisma as any

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = getPrismaClient()

    // Check if user is admin
    const user = await client.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 })
    }

    // Fetch connection history with user details
    const connectionHistory: ConnectionHistoryWithUser[] = await client.connectionHistory.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data for consistent API response
    const formattedHistory = connectionHistory.map((entry: ConnectionHistoryWithUser) => ({
      id: entry.id,
      userId: entry.userId,
      action: entry.action,
      amount: entry.amount,
      description: entry.description,
      createdAt: entry.createdAt.toISOString(),
      user: {
        id: entry.user.id,
        name: entry.user.name,
        email: entry.user.email,
        role: entry.user.role
      }
    }))

    return NextResponse.json(formattedHistory)
  } catch (error) {
    console.error('Error fetching connection history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
