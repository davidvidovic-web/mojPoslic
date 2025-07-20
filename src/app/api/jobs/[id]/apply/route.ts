import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { getConnectionCost } from '@/lib/connections'
import { ApplicationStatus } from '@/types/application'
import { getCityById, getCategoryById } from '@/lib/job-helpers'

const prisma = new PrismaClient()

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, resume } = body

    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Validate job exists and is active
    const job = await prisma.jobListing.findFirst({
      where: {
        id,
        status: 'active',
        isActive: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found or no longer active' }, { status: 404 })
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, connections: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is trying to apply to their own job
    if (job.postedById === user.id) {
      return NextResponse.json({ error: 'Cannot apply to your own job' }, { status: 400 })
    }

    // Check if user has enough connections
    const connectionCost = getConnectionCost('JOB_APPLICATION')
    const currentConnections = user.connections || 0

    if (currentConnections < connectionCost) {
      return NextResponse.json({ 
        error: `Insufficient connections. You need ${connectionCost} connections to apply for jobs, but you only have ${currentConnections}.`,
        requiredConnections: connectionCost,
        currentConnections
      }, { status: 400 })
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId: id,
          userId: user.id
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 })
    }

    // Create application and spend connections in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the application with enhanced data
      const application = await tx.application.create({
        data: {
          jobId: id,
          userId: user.id,
          message: message || null,
          resume: resume || null,
          status: ApplicationStatus.PENDING
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              type: true,
              cityId: true,
              categoryId: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          }
        }
      })

      // Spend connections
      await tx.user.update({
        where: { id: user.id },
        data: { connections: { decrement: connectionCost } }
      })

      // Log connection usage
      await tx.$executeRaw`
        INSERT INTO connection_history (id, user_id, action, amount, description, job_id, created_at)
        VALUES (gen_random_uuid()::text, ${user.id}, 'JOB_APPLICATION'::"ConnectionAction", ${-connectionCost}, 'Applied for job', ${id}, NOW())
      `

      // Create notification for job poster
      await tx.notification.create({
        data: {
          userId: job.postedById,
          type: 'JOB_APPLICATION',
          title: 'New Job Application',
          content: `${session.user.name || session.user.email} applied for your job: ${job.title}`,
          data: {
            jobId: id,
            applicationId: application.id,
            applicantId: user.id
          }
        }
      })

      return application
    })

    // Add city and category data to the result
    const city = getCityById(result.job.cityId)
    const category = result.job.categoryId ? getCategoryById(result.job.categoryId) : null
    
    const enhancedResult = {
      ...result,
      job: {
        ...result.job,
        city: city ? {
          id: city.id,
          nameEN: city.name_en,
          nameBS: city.name_bs
        } : null,
        category: category ? {
          id: category.id,
          nameEN: category.name_en,
          nameBS: category.name_bs
        } : null
      }
    }

    return NextResponse.json({ 
      success: true, 
      application: enhancedResult,
      connectionsSpent: connectionCost,
      remainingConnections: currentConnections - connectionCost,
      message: 'Application submitted successfully!'
    })

  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ 
      error: 'Failed to submit application. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
