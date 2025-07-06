import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const jobId = id

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Get current session
    const session = await auth()
    
    // Get client IP and user agent
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : realIP || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check if job exists
    const job = await prisma.jobListing.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Try to create a view record using raw SQL for now
    try {
      if (session?.user?.id) {
        // For logged in users, use userId and jobId unique constraint
        await prisma.$executeRaw`
          INSERT INTO job_views (id, job_id, user_id, ip_address, user_agent, created_at)
          VALUES (gen_random_uuid(), ${jobId}, ${session.user.id}, ${ipAddress}, ${userAgent}, NOW())
          ON CONFLICT (job_id, user_id) DO NOTHING
        `
      } else {
        // For anonymous users, use ipAddress and jobId unique constraint
        await prisma.$executeRaw`
          INSERT INTO job_views (id, job_id, ip_address, user_agent, created_at)
          VALUES (gen_random_uuid(), ${jobId}, ${ipAddress}, ${userAgent}, NOW())
          ON CONFLICT (job_id, ip_address) DO NOTHING
        `
      }

      return NextResponse.json({ success: true, message: 'View recorded' })
    } catch (error) {
      console.error('Error creating view record:', error)
      return NextResponse.json({ success: true, message: 'View already recorded or error occurred' })
    }

  } catch (error) {
    console.error('Error recording job view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
