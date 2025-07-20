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

    // Get user with deletion request
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        deletionRequest: {
          select: {
            scheduledDeletion: true,
            requestedAt: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      deletionRequest: user.deletionRequest 
    })
  } catch (error) {
    console.error('Error fetching deletion status:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch deletion status' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
