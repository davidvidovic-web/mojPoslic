import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type TransactionWithUser = {
  id: string
  stripePaymentIntentId: string
  userId: string
  amount: number
  currency: string
  status: string
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

    // Check if Prisma client is available
    if (!prisma) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
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

    // Fetch all transactions with user details
    const transactions: TransactionWithUser[] = await client.stripeTransaction.findMany({
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
    const formattedTransactions = transactions.map((transaction: TransactionWithUser) => ({
      id: transaction.id,
      stripePaymentIntentId: transaction.stripePaymentIntentId,
      userId: transaction.userId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
      user: {
        id: transaction.user.id,
        name: transaction.user.name,
        email: transaction.user.email,
        role: transaction.user.role
      }
    }))

    return NextResponse.json(formattedTransactions)
  } catch (error) {
    console.error('Error fetching billing transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
