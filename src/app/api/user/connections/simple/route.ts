import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'


export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return a simple response without database operations for now
    return NextResponse.json({ 
      connections: 20, // Hardcoded for testing
      lastRefresh: null,
      message: 'Simple connections endpoint working',
      user: session.user.email
    })
  } catch (error) {
    console.error('Error in connections endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
