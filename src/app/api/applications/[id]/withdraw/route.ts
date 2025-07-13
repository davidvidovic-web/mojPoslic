import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { ApplicationStatus } from '@/types/application'

const prisma = new PrismaClient()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get application to verify ownership
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            postedById: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Only the applicant can withdraw their own application
    if (application.userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if application can be withdrawn
    if (application.status === ApplicationStatus.SELECTED) {
      return NextResponse.json({ 
        error: 'Cannot withdraw application - you have been selected for this job' 
      }, { status: 400 })
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      return NextResponse.json({ 
        error: 'Application has already been withdrawn' 
      }, { status: 400 })
    }

    // Withdraw the application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.WITHDRAWN,
        withdrawnAt: new Date()
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true
          }
        }
      }
    })

    // Create notification for job poster
    await prisma.notification.create({
      data: {
        userId: application.job.postedById,
        type: 'JOB_UPDATE',
        title: 'Application Withdrawn',
        content: `${user.name || session.user.email} withdrew their application for ${application.job.title}`,
        data: {
          jobId: application.job.id,
          applicationId: id,
          applicantId: user.id
        }
      }
    })

    return NextResponse.json({ 
      application: updatedApplication,
      message: 'Application withdrawn successfully'
    })

  } catch (error) {
    console.error('Error withdrawing application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
