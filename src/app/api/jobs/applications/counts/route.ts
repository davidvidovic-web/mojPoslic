import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobIds } = body

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json({ error: 'Invalid job IDs' }, { status: 400 })
    }

    // Get jobs with their application counts, but only for jobs the user owns or if user is admin
    const jobs = await prisma.jobListing.findMany({
      where: {
        AND: [
          { id: { in: jobIds } },
          session.user.role === 'admin' 
            ? {} 
            : { postedById: session.user.id }
        ]
      },
      select: {
        id: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    // Create a map of job ID to application count
    const counts: Record<string, number> = {}
    jobs.forEach(job => {
      counts[job.id] = job._count.applications
    })

    // Fill in missing jobs with 0 count (jobs user doesn't have access to)
    jobIds.forEach(jobId => {
      if (!(jobId in counts)) {
        counts[jobId] = 0
      }
    })

    return NextResponse.json({ counts })

  } catch (error) {
    console.error('Error fetching applicant counts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
