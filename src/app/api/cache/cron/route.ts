import { NextRequest, NextResponse } from 'next/server'

// This endpoint will be called by a cron job (vercel cron or external service)
// It should be secured with a secret token
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret if provided
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Call the cache update endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')
    const updateUrl = `${baseUrl}/api/cache/update`
    
    const response = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Daily cache update completed',
      updateResult: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Cache cron endpoint - POST to trigger daily update',
    endpoint: '/api/cache/cron',
    usage: 'Called daily by cron service to update cache files'
  })
}
