import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient, UserRole } from '@prisma/client'
import { z } from 'zod'

const setupProfileSchema = z.object({
  role: z.enum(['client', 'tasker', 'company', 'admin']),
  userId: z.string(),
})

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role, userId } = setupProfileSchema.parse(body)

    // Verify the userId matches the session user
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as UserRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileSetupCompleted: true,
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: 'Role updated successfully'
    })

  } catch (error) {
    console.error('Setup profile error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
