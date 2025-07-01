import { NextRequest, NextResponse } from 'next/server'
import { performAutomaticMonthlyRefresh, shouldRunMonthlyRefresh } from '@/lib/monthly-refresh'

/**
 * API endpoint for automatic monthly connections refresh
 * Can be called by cron jobs, serverless functions, or manual triggers
 * 
 * Example usage:
 * - POST /api/admin/monthly-refresh (force refresh)
 * - GET /api/admin/monthly-refresh (check if refresh should run today)
 */

export async function POST(request: NextRequest) {
  try {
    // Check for authorization (optional - you might want to add API key validation)
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.CRON_API_KEY
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Monthly refresh triggered via API')
    
    const result = await performAutomaticMonthlyRefresh()
    
    return NextResponse.json({
      success: result.success,
      message: `Monthly refresh completed. Refreshed ${result.refreshedUsers} users.`,
      refreshedUsers: result.refreshedUsers,
      errors: result.errors,
      timestamp: new Date().toISOString()
    }, {
      status: result.success ? 200 : 500
    })
    
  } catch (error) {
    console.error('Error in monthly refresh API:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500
    })
  }
}

export async function GET() {
  try {
    const shouldRun = shouldRunMonthlyRefresh()
    const today = new Date()
    
    return NextResponse.json({
      shouldRunToday: shouldRun,
      currentDate: today.toISOString().split('T')[0],
      dayOfMonth: today.getDate(),
      message: shouldRun 
        ? 'Monthly refresh should run today (1st of the month)'
        : `Monthly refresh not scheduled for today (day ${today.getDate()})`
    })
    
  } catch (error) {
    console.error('Error checking monthly refresh status:', error)
    
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500
    })
  }
}
