import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = new PrismaClient()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        profileSetupCompleted: true,
        emailVerified: true
      }
    })

    await prisma.$disconnect()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine what the user needs to complete
    const needsRole = !user.role
    const needsProfile = user.role && !user.profileSetupCompleted
    const isComplete = user.role && user.profileSetupCompleted && user.emailVerified

    return NextResponse.json({
      needsRole,
      needsProfile,
      isComplete,
      userState: {
        role: user.role,
        profileSetupCompleted: user.profileSetupCompleted,
        emailVerified: user.emailVerified
      }
    })

  } catch (error) {
    console.error('Registration status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
