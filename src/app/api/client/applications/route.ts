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

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all applications for jobs posted by this user
    const applications = await prisma.application.findMany({
      where: {
        job: {
          postedById: user.id
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
            bio: true,
            skills: true,
            experience: true,
            website: true,
            position: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            type: true,
            status: true,
            postedById: true
          }
        },
        // Include job assignment data for selected applications
        assignment: {
          select: {
            id: true,
            contractStatus: true,
            notes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      applications
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
