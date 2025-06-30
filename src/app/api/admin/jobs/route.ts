import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

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

    const jobs = await prisma.jobListing.findMany({
      include: {
        city: {
          select: {
            id: true,
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

    // Transform data to match expected format
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      type: job.type,
      salary: job.salary,
      email: job.email,
      website: job.website,
      isActive: job.isActive,
      isFeatured: job.isFeatured,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      city: job.city ? {
        id: job.city.id,
        name: job.city.nameEN,
        name_en: job.city.nameEN,
        name_bs: job.city.nameBS
      } : null,
      category: null, // TODO: Add category support after schema fix
      postedBy: job.postedBy
    }))

    return NextResponse.json(transformedJobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request: NextRequest) {
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

    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    await prisma.jobListing.delete({
      where: { id: jobId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
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

    const { jobId, isActive, isFeatured } = await request.json()

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const updatedJob = await prisma.jobListing.update({
      where: { id: jobId },
      data: {
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof isFeatured === 'boolean' && { isFeatured })
      },
      include: {
        city: true,
        postedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true
          }
        }
      }
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
