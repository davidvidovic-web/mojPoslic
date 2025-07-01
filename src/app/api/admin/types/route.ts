import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// Job types from the Prisma enum
const JOB_TYPES = [
  {
    key: 'quick_job' as const,
    nameEN: 'Quick Job',
    nameBS: 'Brzi Posao',
    description: 'Short-term or immediate work opportunities',
    isPopular: true,
    sortOrder: 1
  },
  {
    key: 'full_time' as const,
    nameEN: 'Full Time',
    nameBS: 'Puno Radno Vrijeme',
    description: 'Full-time permanent positions',
    isPopular: true,
    sortOrder: 2
  },
  {
    key: 'part_time' as const,
    nameEN: 'Part Time',
    nameBS: 'Nepuno Radno Vrijeme',
    description: 'Part-time positions',
    isPopular: true,
    sortOrder: 3
  },
  {
    key: 'remote' as const,
    nameEN: 'Remote',
    nameBS: 'Rad na Daljinu',
    description: 'Remote work opportunities',
    isPopular: true,
    sortOrder: 4
  },
  {
    key: 'contract' as const,
    nameEN: 'Contract',
    nameBS: 'Ugovorni Rad',
    description: 'Contract-based work',
    isPopular: false,
    sortOrder: 5
  }
] as const

// GET - Get all job types for admin management
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get job counts for each type
    const jobTypesWithCounts = []
    
    for (const type of JOB_TYPES) {
      try {
        const jobCount = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM job_listings WHERE type = ${type.key}
        ` as { count: bigint }[]
        
        jobTypesWithCounts.push({
          ...type,
          jobCount: Number(jobCount[0]?.count || 0)
        })
      } catch (error) {
        console.error(`Error counting jobs for type ${type.key}:`, error)
        jobTypesWithCounts.push({
          ...type,
          jobCount: 0
        })
      }
    }

    return NextResponse.json(jobTypesWithCounts)
  } catch (error) {
    console.error('Error fetching job types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job types' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST/PUT - Since these are enum values, we only return the static list
// In a real app, you might store type metadata in a separate table
export async function POST() {
  return NextResponse.json(
    { error: 'Job types are predefined enum values and cannot be created' },
    { status: 400 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Job types are predefined enum values and cannot be modified' },
    { status: 400 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Job types are predefined enum values and cannot be deleted' },
    { status: 400 }
  )
}
