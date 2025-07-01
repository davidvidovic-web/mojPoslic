'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Eye, Calendar } from 'lucide-react'
import { Job } from '@/types/job'

interface DashboardStatsCardsProps {
  jobs: Job[]
}

export function DashboardStatsCards({ jobs }: DashboardStatsCardsProps) {
  const thisMonthJobs = jobs.filter(job => 
    new Date(job.created_at).getMonth() === new Date().getMonth()
  ).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{jobs.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{jobs.length}</div>
          <p className="text-xs text-muted-foreground">All jobs are active</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{thisMonthJobs}</div>
          <p className="text-xs text-muted-foreground">Jobs posted</p>
        </CardContent>
      </Card>
    </div>
  )
}
