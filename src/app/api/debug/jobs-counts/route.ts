import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  
  try {
    // Get all jobs with their counts
    const { data: jobs, error } = await supabase
      .from('job_listings')
      .select('id, title, view_count, application_count')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch jobs', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      jobs,
      summary: {
        total: jobs?.length || 0,
        withViews: jobs?.filter(j => (j.view_count || 0) > 0).length || 0,
        withApplications: jobs?.filter(j => (j.application_count || 0) > 0).length || 0,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}