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

    // Get current date for monthly calculations
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch all transactions for calculations
    const allTransactions = await prisma.stripeTransaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Calculate total revenue (successful transactions only)
    const successfulTransactions = allTransactions.filter(t => t.status === 'succeeded')
    const totalRevenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Calculate monthly revenue
    const monthlyTransactions = successfulTransactions.filter(t => 
      new Date(t.createdAt) >= firstDayOfMonth
    )
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Calculate transaction stats
    const totalTransactions = allTransactions.length
    const successfulCount = successfulTransactions.length
    const failedTransactions = allTransactions.filter(t => 
      t.status === 'failed' || t.status === 'canceled'
    ).length

    // Calculate average transaction value
    const averageTransactionValue = successfulCount > 0 
      ? Math.round(totalRevenue / successfulCount) 
      : 0

    // Calculate top paying users
    const userSpending = new Map()
    successfulTransactions.forEach(transaction => {
      const userId = transaction.userId
      if (!userSpending.has(userId)) {
        userSpending.set(userId, {
          userId,
          userName: transaction.user.name,
          userEmail: transaction.user.email,
          totalSpent: 0,
          transactionCount: 0
        })
      }
      const userData = userSpending.get(userId)
      userData.totalSpent += transaction.amount
      userData.transactionCount += 1
    })

    const topPayingUsers = Array.from(userSpending.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    const stats = {
      totalRevenue,
      monthlyRevenue,
      totalTransactions,
      successfulTransactions: successfulCount,
      failedTransactions,
      averageTransactionValue,
      topPayingUsers
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching billing stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
