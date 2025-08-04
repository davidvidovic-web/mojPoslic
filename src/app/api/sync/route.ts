import { NextResponse } from 'next/server'
// import { syncUserToSupabase, syncJobToSupabase, initializeSync } from '@/lib/messaging/data-sync'

export async function POST() {
  try {
    // Temporarily disabled - data-sync module not found
    return NextResponse.json({ message: 'Sync temporarily disabled' }, { status: 503 })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync' },
      { status: 500 }
    )
  }
}
