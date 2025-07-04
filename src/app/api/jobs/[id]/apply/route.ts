import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { PrismaClient } from '@prisma/client'
import { getConnectionCost } from '@/lib/connections'

const prisma = new PrismaClient()

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, resume } = await request.json()
    const jobId = params.id

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Get user info using raw SQL
    const userResult = await prisma.$queryRaw`
      SELECT id, connections 
      FROM users 
      WHERE email = ${session.user.email}
    ` as Array<{ id: string; connections: number }>

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult[0]

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
          jobId,
          userId: user.id
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 })
    }

    // Create application and spend connections in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the application
      const application = await tx.application.create({
        data: {
          jobId,
          userId: user.id,
          message: message || null,
          resume: resume || null,
          status: 'pending'
        }
      })

      // Spend connections using raw SQL
      await tx.$executeRaw`
        UPDATE users 
        SET connections = connections - ${connectionCost}
        WHERE id = ${user.id}
      `

      // Log connection usage using raw SQL
      await tx.$executeRaw`
        INSERT INTO connection_history (id, user_id, action, amount, description, job_id, created_at)
        VALUES (gen_random_uuid()::text, ${user.id}, 'JOB_APPLICATION'::"ConnectionAction", ${-connectionCost}, 'Applied for job', ${jobId}, NOW())
      `

      return application
    })

    return NextResponse.json({ 
      success: true, 
      application: result,
      connectionsSpent: connectionCost,
      remainingConnections: currentConnections - connectionCost
    })

  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
