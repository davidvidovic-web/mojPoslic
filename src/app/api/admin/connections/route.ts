import { NextRequest, NextResponse } from 'next/server'
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

    // Fetch all users with their connection balances
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        connections: true,
        companyName: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users for connections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { userId, amount, reason } = await request.json()

    if (!userId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid request. userId and amount are required.' }, { status: 400 })
    }

    // Update user connections
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        connections: {
          increment: amount
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        connections: true
      }
    })

    // Log the connection grant in history
    await prisma.connectionHistory.create({
      data: {
        userId: userId,
        action: 'ADMIN_ADJUSTMENT',
        amount: amount,
        description: reason || `Admin granted ${amount} connections`,
        createdAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: `Successfully added ${amount} connections to ${updatedUser.name || updatedUser.email}`
    })
  } catch (error) {
    console.error('Error granting connections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
