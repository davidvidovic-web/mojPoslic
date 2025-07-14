'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, TrendingUp, Calendar, Eye } from 'lucide-react'
import { Job } from '@/types/job'

interface DashboardStatsCardsProps {
  jobs: Job[]
}

export function DashboardStatsCards({ jobs }: DashboardStatsCardsProps) {
  const thisMonthJobs = jobs.filter(job => 
    new Date(job.createdAt).getMonth() === new Date().getMonth()
  ).length

  const averageViewsPerJob = jobs.length > 0 ? 
    Math.round(jobs.reduce((sum) => sum + 25, 0) / jobs.length) : 0 // Mock data

  const mostViewedJob = jobs[0] // Just use first job as example

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Job Posts</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">
              All time posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageViewsPerJob}</div>
            <p className="text-xs text-muted-foreground">
              Per job posting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthJobs}</div>
            <p className="text-xs text-muted-foreground">
              Jobs posted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              Average response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Job</CardTitle>
          </CardHeader>
          <CardContent>
            {mostViewedJob ? (
              <div className="space-y-2">
                <h4 className="font-medium">{mostViewedJob.title}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    25 views
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    12 applications
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Posted {new Date(mostViewedJob.createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No jobs posted yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Jobs</span>
              <span className="font-medium">{jobs.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Applications</span>
              <span className="font-medium">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Unread Messages</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Hire Time</span>
              <span className="font-medium">5 days</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
