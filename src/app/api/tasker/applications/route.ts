import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { getCityById, getCategoryById } from '@/lib/job-helpers'

export async function GET() {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const transformedApplications = await Promise.all(applications.map(async (application) => {
      const city = application.job.cityId ? await getCityById(application.job.cityId) : null
      const category = application.job.categoryId ? await getCategoryById(application.job.categoryId) : null
      
      return {
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
          city: city ? {
            id: city.id,
            key: city.key,
            name: city.name_en || city.name_bs
          } : null,
          category: category ? {
            id: category.id,
            key: category.key,
            name: category.name_en || category.name_bs
          } : null,
          postedBy: application.job.postedBy
        }
      }
    }))

    return NextResponse.json(transformedApplications)
  } catch (error) {
    console.error('Error fetching tasker applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
