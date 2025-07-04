import { NextResponse } from 'next/server'
import { #getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prismaForJobs = new PrismaClient()

export async function GET() {
  try {
    const session = await #getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch job listings posted by the current user (company)
    const jobs = await prismaForJobs.jobListing.findMany({
      where: {
        postedById: session.user.id
      },
      include: {
        city: true,
        category: true,
        applications: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedJobs = jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      type: job.type,
      salary: job.salary,
      location: job.city.nameEN,
      createdAt: job.createdAt.toISOString(),
      status: job.status,
      applicationsCount: job.applications.length,
      viewsCount: 0 // This would need to be tracked separately
    }))

    return NextResponse.json(formattedJobs)
  } catch (error) {
    console.error('Error fetching company jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  } finally {
    await prismaForJobs.$disconnect()
  }
}
