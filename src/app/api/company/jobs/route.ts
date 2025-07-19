import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { getCityById } from '@/lib/job-helpers'

const prismaForJobs = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch job listings posted by the current user (company)
    const jobs = await prismaForJobs.jobListing.findMany({
      where: {
        postedById: session.user.id
      },
      include: {
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

    // Get view counts for all jobs
    const jobIds = jobs.map((job: { id: string }) => job.id)
    const viewCounts: Record<string, number> = {}
    
    try {
      // Get view counts for each job
      for (const jobId of jobIds) {
        const result = await prismaForJobs.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count FROM job_views WHERE job_id = ${jobId}
        `
        viewCounts[jobId] = Number(result[0]?.count || 0)
      }
    } catch (error) {
      console.error('Error fetching view counts:', error)
      // If view counts fail, we'll use 0 for all jobs
    }

    // Transform the data to match the expected format
    const formattedJobs = jobs.map((job) => {
      const city = getCityById(job.cityId)
      return {
        id: job.id,
        title: job.title,
        description: job.description,
        type: job.type,
        salary: job.salary,
        location: city?.name_en || 'Unknown',
        createdAt: job.createdAt.toISOString(),
        status: job.status,
        applicationsCount: job.applications.length,
        viewsCount: viewCounts[job.id] || 0
      }
    })

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
