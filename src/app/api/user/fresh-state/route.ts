import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get fresh user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        role: true, 
        profileSetupCompleted: true 
      }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        role: dbUser.role,
        profileSetupCompleted: dbUser.profileSetupCompleted
      }
    })
  } catch (error) {
    console.error('Error fetching fresh user state:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
