import { NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to setup your profile' },
        { status: 401 }
      )
    }

    const { role } = await request.json()

    // Validate role
    if (!role || !['admin', 'client', 'tasker', 'company'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      )
    }

    // Update the user's role and mark profile setup as completed
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: role as UserRole,
        profileSetupCompleted: true,
      },
    })

    return NextResponse.json(
      { message: 'Profile setup completed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error setting up profile:', error)
    return NextResponse.json(
      { error: 'Failed to setup profile' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
