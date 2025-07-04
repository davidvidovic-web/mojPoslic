import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile completion status
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        username: true,
        emailVerified: true,
        profileSetupCompleted: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate profile completion
    const hasBasicInfo = Boolean(user.name && user.role)
    const hasUsername = Boolean(user.username)
    const isEmailVerified = Boolean(user.emailVerified)
    const hasCompletedProfile = Boolean(user.profileSetupCompleted)

    const profileStatus = {
      isComplete: hasBasicInfo && hasUsername && isEmailVerified,
      hasBasicInfo,
      hasUsername,
      isEmailVerified,
      hasCompletedProfile,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        username: user.username
      }
    }

    return NextResponse.json(profileStatus)
  } catch (error) {
    console.error('Profile status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}