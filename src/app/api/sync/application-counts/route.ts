import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST() {
  try {
    // Create service role client for admin operations
    const supabaseService = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        }
      }
    )

    // Get all applications and count by job_id
    const { data: applications, error: appsError } = await supabaseService
      .from('applications')
      .select('job_id')

    if (appsError) {
      console.error('Error fetching applications:', appsError)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    // Count applications per job
    const applicationCounts = (applications || []).reduce((acc: Record<string, number>, app) => {
      if (app.job_id) {
        acc[app.job_id] = (acc[app.job_id] || 0) + 1
      }
      return acc
    }, {})

    console.log('Calculated application counts:', applicationCounts)

    // Get all jobs
    const { data: jobs, error: jobsError } = await supabaseService
      .from('job_listings')
      .select('id, title, application_count')

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError)
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }

    // Update each job's application count
    const updates = []
    for (const job of jobs || []) {
      const actualCount = applicationCounts[job.id] || 0
      if (job.application_count !== actualCount) {
        console.log(`Updating job ${job.title}: ${job.application_count} -> ${actualCount}`)
        
        const { error: updateError } = await supabaseService
          .from('job_listings')
          .update({ application_count: actualCount })
          .eq('id', job.id)

        if (updateError) {
          console.error(`Error updating job ${job.id}:`, updateError)
        } else {
          updates.push({
            jobId: job.id,
            title: job.title,
            oldCount: job.application_count,
            newCount: actualCount
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synchronized application counts for ${updates.length} jobs`,
      updates,
      totalApplications: applications?.length || 0,
      applicationCounts
    })

  } catch (error) {
    console.error('Error syncing application counts:', error)
    return NextResponse.json(
      { error: 'Failed to sync application counts' },
      { status: 500 }
    )
  }
}