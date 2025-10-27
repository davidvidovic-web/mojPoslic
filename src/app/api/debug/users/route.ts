import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Test with the specific UUID you mentioned
    const testUserId = 'ba4bd4f1-fa3b-474c-8e25-a2833040df76'
    
    
    // Try to fetch the specific user
    const { data: specificUser, error: specificUserError } = await supabase
      .from('users')
      .select('id, email, name, phone, created_at')
      .eq('id', testUserId)
      .single()
    
    
    // Get a few recent users to check table structure
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('Error fetching users:', error)
    }
    
    // Also get a few recent jobs to check posted_by_id values
    const { data: jobs, error: jobsError } = await supabase
      .from('job_listings')
      .select('id, title, posted_by_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (jobsError) {
      console.error('Error fetching jobs:', jobsError)
    }
    
    // Test a direct join to see if that works
    const { data: jobWithUser, error: joinError } = await supabase
      .from('job_listings')
      .select(`
        id,
        title,
        posted_by_id,
        users!posted_by_id (
          id,
          name,
          email
        )
      `)
      .eq('posted_by_id', testUserId)
      .limit(1)
    
    
    return NextResponse.json({
      testUserId,
      specificUser,
      specificUserError,
      users,
      usersError: error,
      jobs,
      jobsError,
      jobWithUser,
      joinError,
      summary: {
        userCount: users?.length || 0,
        jobCount: jobs?.length || 0,
        jobsWithPostedBy: jobs?.filter(j => j.posted_by_id).length || 0,
        specificUserFound: !!specificUser,
        directJoinWorked: !!jobWithUser
      }
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}