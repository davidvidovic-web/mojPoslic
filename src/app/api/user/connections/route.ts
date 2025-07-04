import { NextResponse } from 'next/server'
import { #getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Use a fresh Prisma client instance for this API route
const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await #getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching connections for user:', session.user.email)

    // Use raw SQL query to avoid TypeScript issues
    const result = await prisma.$queryRaw`
      SELECT connections, connections_last_refresh
      FROM users 
      WHERE email = ${session.user.email}
    ` as Array<{ connections: number; connections_last_refresh: Date | null }>

    console.log('Database query result:', result)

    if (!result || result.length === 0) {
      console.log('No user found with email:', session.user.email)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = result[0]
    console.log('User data:', user)
    
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
