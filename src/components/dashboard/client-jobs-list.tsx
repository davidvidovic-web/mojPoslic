'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Users, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useUserJobsQuery } from '@/hooks/queries/useJobs'
import { useMultipleJobApplicantCounts } from '@/hooks/use-applications'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { Job } from '@/types/job'

// Extended job interface with application statistics
interface JobWithApplicationStats extends Job {
  applicationCount?: number
  newApplicationsCount?: number
  shortlistedCount?: number
  selectedCount?: number
}

export function ClientJobsList() {
  const { user } = useSupabaseAuth()
  
  // Use Supabase-powered hooks instead of manual fetch
  const { data: jobs = [], isLoading: loading } = useUserJobsQuery(user?.id || '')
  
  // Get application counts for all jobs
  const jobIds = jobs.map(job => job.id)
  const { data: applicationCounts = {} } = useMultipleJobApplicantCounts(jobIds)

  // Map jobs with application statistics
  const jobsWithStats: JobWithApplicationStats[] = jobs.map(job => ({
    ...job,
    applicationCount: applicationCounts[job.id] || 0,
    // For now, we'll use simple counts. Later we can enhance this with detailed breakdowns
    newApplicationsCount: 0,
    shortlistedCount: 0,
    selectedCount: 0,
  }))

  const getStatusBadge = (job: Job) => {
    // Map the database status to display status
    const isActive = job?.is_active ?? true
    
    if (isActive) {
      return <Badge className="bg-green-500/10 text-green-600 border border-green-500/20">Active</Badge>
    } else {
      return <Badge className="bg-gray-500/10 text-gray-600 border border-gray-500/20">Inactive</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No job postings yet</h3>
            <p className="text-gray-600 mb-4">Start by posting your first job to find great candidates.</p>
            <Link href="/jobs/post">
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Post a Job
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Your Job Postings
          <Badge variant="secondary">{jobsWithStats.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobsWithStats.map((job) => (
            <div
              key={job.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">{job.title}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(job)}
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Application Statistics */}
              {job.applicationCount !== undefined && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{job.applicationCount}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{job.newApplicationsCount || 0}</div>
                    <div className="text-xs text-muted-foreground">New</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{job.shortlistedCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Shortlisted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{job.selectedCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Selected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-600">
                      {job.applicationCount - (job.shortlistedCount || 0) - (job.selectedCount || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link href={`/jobs/${job.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View Job
                  </Button>
                </Link>
                
                {job.applicationCount && job.applicationCount > 0 ? (
                  <Link href={`/jobs/${job.id}/applications`}>
                    <Button size="sm">
                      <Users className="h-3 w-3 mr-1" />
                      Manage Applications ({job.applicationCount})
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" disabled>
                    <Users className="h-3 w-3 mr-1" />
                    No Applications Yet
                  </Button>
                )}

                {job.newApplicationsCount && job.newApplicationsCount > 0 && (
                  <Badge className="bg-red-500/10 text-red-600 border border-red-500/20">
                    {job.newApplicationsCount} new
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
