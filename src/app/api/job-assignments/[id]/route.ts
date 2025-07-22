import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get job assignment details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get job assignment with full details
    const jobAssignment = await prisma.jobAssignment.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                companyName: true
              }
            }
          }
        },
        selectedApplication: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                skills: true,
                experience: true,
                location: true,
                bio: true
              }
            }
          }
        }
      }
    })

    if (!jobAssignment) {
      return NextResponse.json({ error: 'Job assignment not found' }, { status: 404 })
    }

    // Check access permissions
    const isTasker = jobAssignment.selectedApplication.user.id === user.id
    const isClient = jobAssignment.job.postedById === user.id
    const isAdmin = user.role === 'admin'

    if (!isTasker && !isClient && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ 
      jobAssignment,
      userRole: isTasker ? 'tasker' : isClient ? 'client' : 'admin'
    })

  } catch (error) {
    console.error('Error fetching job assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
