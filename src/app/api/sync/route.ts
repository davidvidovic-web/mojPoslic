import { NextRequest, NextResponse } from 'next/server'
import { syncUserToSupabase, syncJobToSupabase, initializeSync } from '@/lib/messaging/data-sync'

export async function POST(request: NextRequest) {
  try {
    const { action, userId, jobId } = await request.json()

    switch (action) {
      case 'sync-user':
        if (!userId) {
          return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }
        await syncUserToSupabase(userId)
        return NextResponse.json({ success: true, message: `User ${userId} synced successfully` })

      case 'sync-job':
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
        }
        await syncJobToSupabase(jobId)
        return NextResponse.json({ success: true, message: `Job ${jobId} synced successfully` })

      case 'initialize':
        await initializeSync()
        return NextResponse.json({ success: true, message: 'Data sync initialization completed' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'status') {
      return NextResponse.json({
        success: true,
        message: 'Data sync API is operational',
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
