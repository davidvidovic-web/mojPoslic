import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { #getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await #getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { status } = await request.json()
    
    // For now, we'll map status to isActive and description updates
    // This will be updated once the status field migration is complete
    let isActive = true
    let descriptionSuffix = ''
    
    if (status === 'completed') {
      isActive = false
      descriptionSuffix = '\n\n[Status: COMPLETED]'
    } else if (status === 'inactive') {
      isActive = false
      descriptionSuffix = '\n\n[Status: INACTIVE]'
    } else if (status === 'expired') {
      isActive = false
      descriptionSuffix = '\n\n[Status: EXPIRED]'
    } else if (status === 'active') {
      isActive = true
      descriptionSuffix = ''
    } else {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: active, inactive, completed, expired' },
        { status: 400 }
      )
    }

    // Check if job exists and user owns it
    const existingJob = await prisma.jobListing.findUnique({
      where: { id: params.id },
      select: { 
        id: true, 
        postedById: true, 
        title: true,
        isActive: true,
        description: true
      }
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if user owns the job or is admin
    const userRole = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    const isOwner = existingJob.postedById === session.user.id
    const isAdmin = userRole?.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only update the status of your own job listings' },
        { status: 403 }
      )
    }

    // Update job status
    const currentDescription = existingJob.description || ''
    
    // Remove any existing status markers
    const cleanDescription = currentDescription
      .replace(/\n\n\[Status: (COMPLETED|INACTIVE|EXPIRED|ACTIVE)\]/g, '')
      .trim()
    
    const updatedDescription = descriptionSuffix 
      ? cleanDescription + descriptionSuffix 
      : cleanDescription

    const updatedJob = await prisma.jobListing.update({
      where: { id: params.id },
      data: { 
        isActive,
        description: updatedDescription
      },
      select: {
        id: true,
        title: true,
        isActive: true,
        description: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Job status updated successfully',
      job: updatedJob
    })

  } catch (error) {
    console.error('Error updating job status:', error)
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET endpoint to retrieve current job status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.jobListing.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        isActive: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Extract status from description and isActive field
    let currentStatus = 'active'
    if (!job.isActive) {
      if (job.description?.includes('[Status: COMPLETED]')) {
        currentStatus = 'completed'
      } else if (job.description?.includes('[Status: INACTIVE]')) {
        currentStatus = 'inactive'
      } else if (job.description?.includes('[Status: EXPIRED]')) {
        currentStatus = 'expired'
      } else {
        currentStatus = 'inactive' // default for inactive jobs
      }
    }

    return NextResponse.json({
      ...job,
      status: currentStatus
    })
  } catch (error) {
    console.error('Error fetching job status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
