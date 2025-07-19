import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type JobListingWithRelations = {
  id: string
  title: string
  company: string
  cityId: string
  categoryId: string | null
  type: string
  description: string
  requirements: string | null
  benefits: string | null
  salary: string | null
  salaryType: string | null
  salaryMin: number | null
  salaryMax: number | null
  email: string
  website: string | null
  applicationUrl: string | null
  contactEmail: string | null
  isFeatured: boolean
  tags: string | null
  startDate: Date | null
  startTime: string | null
  duration: string | null
  transportation: string
  transportationAmount: number | null
  expiresAt: Date | null
  status: string
  jobAddress: string | null
  jobLatitude: number | null
  jobLongitude: number | null
  isActive: boolean
  postedById: string
  createdAt: Date
  updatedAt: Date
  city: {
    id: string
    key: string
    nameEN: string
    nameBS: string
  }
  category: {
    id: string
    key: string
    nameEN: string
    nameBS: string
  }
  postedBy: {
    id: string
    name: string
    email: string
    companyName: string | null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPrismaClient = () => prisma as any

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Prisma client is available
    if (!prisma) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const client = getPrismaClient()

    // Check if user is admin
    const user = await client.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 })
    }

    // Fetch all jobs with related data
    const jobs: JobListingWithRelations[] = await client.jobListing.findMany({
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
            companyName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
