import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const jobId = id

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Check if the job exists and belongs to the current user
    const job = await prisma.jobListing.findFirst({
      where: {
        id: jobId,
        postedById: session.user.id
      },
      include: {
        applications: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                phone: true,
                location: true,
                bio: true,
                skills: true,
                experience: true,
                position: true,
                website: true,
                createdAt: true,
                reviewsReceived: {
                  select: {
                    rating: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or you do not have permission to view it' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      jobId: job.id,
      applicationCount: job.applications.length,
      canEdit: job.applications.length === 0,
      applications: job.applications
    })
  } catch (error) {
    console.error('Error fetching job applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job applications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
