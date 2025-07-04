import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 })
    }

    // Get job type statistics from actual jobs
    const jobTypeStats = await prisma.jobListing.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    }) as Array<{ type: string; _count: { type: number } }>

    // Define job types with metadata (matching the order from job-utils.ts)
    const jobTypesData = [
      { key: 'quick_job', nameEN: 'Quick Job', nameBS: 'Brzi Posao', description: 'Short-term tasks and gigs', isPopular: true, sortOrder: 1 },
      { key: 'full_time', nameEN: 'Full Time', nameBS: 'Puno Radno Vrijeme', description: 'Full-time permanent positions', isPopular: true, sortOrder: 2 },
      { key: 'part_time', nameEN: 'Part Time', nameBS: 'Skraćeno Radno Vrijeme', description: 'Part-time positions', isPopular: true, sortOrder: 3 },
      { key: 'remote', nameEN: 'Remote', nameBS: 'Rad na Daljinu', description: 'Work from anywhere positions', isPopular: true, sortOrder: 4 },
      { key: 'contract', nameEN: 'Contract', nameBS: 'Ugovorni Rad', description: 'Contract-based work', isPopular: false, sortOrder: 5 },
      { key: 'freelance', nameEN: 'Freelance', nameBS: 'Freelance', description: 'Independent contractor work', isPopular: false, sortOrder: 6 },
      { key: 'internship', nameEN: 'Internship', nameBS: 'Praksa', description: 'Learning and training positions', isPopular: false, sortOrder: 7 },
      { key: 'temporary', nameEN: 'Temporary', nameBS: 'Privremeni Rad', description: 'Short-term temporary positions', isPopular: false, sortOrder: 8 }
    ]

    // Combine with job counts
    const jobTypes = jobTypesData.map(jobType => {
      const stats = jobTypeStats.find(stat => stat.type === jobType.key)
      // In Prisma groupBy, _count contains the aggregated counts
      const count = stats?._count?.type || 0
      return {
        ...jobType,
        jobCount: count
      }
    })

    return NextResponse.json(jobTypes)
  } catch (error) {
    console.error('Error fetching job types:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
