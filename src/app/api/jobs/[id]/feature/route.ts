import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { is_featured } = await request.json()
    const jobId = params.id

    // Verify that the user owns this job
    const job = await prisma.jobListing.findUnique({
      where: { id: jobId },
      select: { postedById: true, isFeatured: true }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.postedById !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only feature your own jobs' },
        { status: 403 }
      )
    }

    // Update the job's featured status
    const updatedJob = await prisma.jobListing.update({
      where: { id: jobId },
      data: { isFeatured: is_featured },
      select: { id: true, isFeatured: true }
    })

    return NextResponse.json({
      id: updatedJob.id,
      is_featured: updatedJob.isFeatured
    })

  } catch (error) {
    console.error('Error updating job featured status:', error)
    return NextResponse.json(
      { error: 'Failed to update job featured status' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}