'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, MessageCircle, Calendar } from 'lucide-react'
import { Job } from '@/types/job'

interface ClientQuickStatsProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
}

export function ClientQuickStats({ jobs, applicationCounts }: ClientQuickStatsProps) {
  const activeJobs = jobs.length // All jobs are considered active for now
  const totalApplications = Object.values(applicationCounts).reduce((sum, count) => sum + count, 0)
  const thisMonthJobs = jobs.filter(job => 
    new Date(job.createdAt).getMonth() === new Date().getMonth()
  ).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeJobs}</div>
          <p className="text-xs text-muted-foreground">
            Currently hiring
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalApplications}</div>
          <p className="text-xs text-muted-foreground">
            Across all jobs
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Messages</CardTitle>
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">
            From applicants
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
    </div>
  )
}
