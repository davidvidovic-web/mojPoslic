'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Users } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Job {
  id: string
  title: string
  company: string
  type: string
  status: string
  createdAt: string
  applicationCount?: number
  newApplicationsCount?: number
  shortlistedCount?: number
  selectedCount?: number
}

export function ClientJobsList() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return

      try {
        // Fetch user's posted jobs
        const response = await fetch(`/api/user/jobs?userId=${user.id}`)
        
        if (response.ok) {
          const jobsData = await response.json()
          
          // Fetch application counts for each job
          const jobsWithCounts = await Promise.all(
            jobsData.map(async (job: Job) => {
              try {
                const countResponse = await fetch(`/api/jobs/${job.id}/applications/count`)
                if (countResponse.ok) {
                  const countData = await countResponse.json()
                  return { ...job, ...countData }
                }
                return job
              } catch (error) {
                console.error(`Error fetching count for job ${job.id}:`, error)
                return job
              }
            })
          )
          
          setJobs(jobsWithCounts)
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [user])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 border border-green-500/20">Active</Badge>
      case 'closed':
        return <Badge className="bg-gray-500/10 text-gray-600 border border-gray-500/20">Closed</Badge>
      case 'draft':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
              <Button>Post a Job</Button>
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
          <Badge variant="secondary">{jobs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">{job.title}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(job.status)}
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
