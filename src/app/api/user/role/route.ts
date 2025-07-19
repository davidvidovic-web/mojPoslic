import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()

    if (!role || !['tasker', 'client', 'company'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 })
    }

    // Update user role but keep profileSetupCompleted as false
    // Profile will be marked as completed after the profile setup form
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        role: role,
        // Don't set profileSetupCompleted here - will be set after profile setup
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileSetupCompleted: true,
        emailVerified: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
