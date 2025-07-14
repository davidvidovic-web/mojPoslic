'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, MessageSquare, Calendar } from 'lucide-react'
import { Job } from '@/types/job'
import { useTranslations } from 'next-intl'

interface ClientQuickStatsProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
}

export function ClientQuickStats({ jobs, applicationCounts }: ClientQuickStatsProps) {
  const t = useTranslations()
  
  const activeJobs = jobs.length // All jobs are considered active for now
  const totalApplications = Object.values(applicationCounts).reduce((sum, count) => sum + count, 0)
  const thisMonthJobs = jobs.filter(job => 
    new Date(job.createdAt).getMonth() === new Date().getMonth()
  ).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.stats.activeJobs')}</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeJobs}</div>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.stats.currentlyHiring')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.stats.totalApplications')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalApplications}</div>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.stats.acrossAllJobs')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.stats.newMessages')}</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.stats.fromApplicants')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.stats.thisMonth')}</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{thisMonthJobs}</div>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.stats.jobsPosted')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
