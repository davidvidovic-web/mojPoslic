import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the user's job applications
    const applications = await prisma.application.findMany({
      where: {
        userId: user.id
      },
      include: {
        job: {
          include: {
            city: {
              select: {
                id: true,
                key: true,
                nameEN: true,
                nameBS: true
              }
            },
            category: {
              select: {
                id: true,
                key: true,
                nameEN: true,
                nameBS: true
              }
            },
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                companyName: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const transformedApplications = applications.map((application: any) => ({
      id: application.id,
      job_id: application.jobId,
      appliedAt: application.createdAt.toISOString(),
      status: application.status,
      message: application.message || undefined,
      feedback: application.feedback || undefined,
      job: {
        ...application.job,
        createdAt: application.job.createdAt.toISOString(),
        posted_by: application.job.postedById,
        city: application.job.city ? {
          ...application.job.city,
          name: application.job.city.nameEN || application.job.city.nameBS
        } : null,
        category: application.job.category ? {
          ...application.job.category,
          name: application.job.category.nameEN || application.job.category.nameBS
        } : null,
        postedBy: application.job.postedBy
      }
    }))

    return NextResponse.json(transformedApplications)
  } catch (error) {
    console.error('Error fetching tasker applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
