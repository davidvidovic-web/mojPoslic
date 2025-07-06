import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { is_featured } = await request.json()
    
    if (typeof is_featured !== 'boolean') {
      return NextResponse.json({ error: 'Invalid is_featured value' }, { status: 400 })
    }

    // Check if the job exists and belongs to the user
    const job = await prisma.job_listings.findUnique({
      where: { id: params.id }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.posted_by !== session.user.id) {
      return NextResponse.json({ error: 'You can only feature your own jobs' }, { status: 403 })
    }

    // Update the job's featured status
    const updatedJob = await prisma.job_listings.update({
      where: { id: params.id },
      data: { is_featured }
    })

    return NextResponse.json({ 
      success: true, 
      is_featured: updatedJob.is_featured 
    })

  } catch (error) {
    console.error('Error updating job feature status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
