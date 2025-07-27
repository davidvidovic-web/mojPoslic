import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    
    // Count jobs created today
    const { count, error } = await supabase
      .from('job_listings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
    
    if (error) {
      console.error('Error fetching today job count:', error)
      return NextResponse.json(
        { error: 'Failed to fetch today job count' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      count: count || 0,
      date: today
    })
  } catch (error) {
    console.error('Error in today-count API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
