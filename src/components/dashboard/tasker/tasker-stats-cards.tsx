'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, DollarSign, Briefcase } from 'lucide-react'

interface JobApplication {
  id: string
  job_id: string
  appliedAt: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'completed'
  job?: {
    title: string
    salaryMin?: number
    salaryMax?: number
    salary?: string
  }
}

interface TaskerStatsCardsProps {
  applications: JobApplication[]
  completedJobs?: number
  totalEarnings?: number
}

export function TaskerStatsCards({ 
  applications, 
  completedJobs = 0, 
  totalEarnings = 0 
}: TaskerStatsCardsProps) {
  const activeJobs = applications.filter(app => app.status === 'SELECTED').length
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeJobs}</div>
          <p className="text-xs text-muted-foreground">Jobs you&apos;re working on</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedJobs}</div>
          <p className="text-xs text-muted-foreground">Successfully finished</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEarnings.toLocaleString()} BAM</div>
          <p className="text-xs text-muted-foreground">From completed work</p>
        </CardContent>
      </Card>
    </div>
  )
}
