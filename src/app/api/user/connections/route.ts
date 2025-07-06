import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { PrismaClient } from '@prisma/client'

// Use a fresh Prisma client instance for this API route
const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }


    // Use raw SQL query to avoid TypeScript issues
    const result = await prisma.$queryRaw`
      SELECT connections, connections_last_refresh
      FROM users 
      WHERE email = ${session.user.email}
    ` as Array<{ connections: number; connections_last_refresh: Date | null }>


    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = result[0]
    
    return NextResponse.json({ 
      connections: user.connections || 0,
      lastRefresh: user.connections_last_refresh
    })
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
