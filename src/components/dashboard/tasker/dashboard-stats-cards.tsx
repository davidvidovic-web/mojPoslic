'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, TrendingUp, Calendar, Eye } from 'lucide-react'
import { Job } from '@/types/job'
import { useTranslations } from 'next-intl'

interface DashboardStatsCardsProps {
  jobs: Job[]
}

export function DashboardStatsCards({ jobs }: DashboardStatsCardsProps) {
  const t = useTranslations('dashboard.tasker.quickStats')
  
  const thisMonthJobs = jobs.filter(job => 
    new Date(job.createdAt).getMonth() === new Date().getMonth()
  ).length

  const averageViewsPerJob = 0 // Views data not available yet

  const mostViewedJob = jobs[0] // Just use first job as example

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalJobPosts')}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('allTimePosts')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('averageViews')}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageViewsPerJob}</div>
            <p className="text-xs text-muted-foreground">
              {t('perJobPosting')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('thisMonth')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthJobs}</div>
            <p className="text-xs text-muted-foreground">
              {t('jobsPosted')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('responseRate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              {t('averageResponse')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('topPerformingJob')}</CardTitle>
          </CardHeader>
          <CardContent>
            {mostViewedJob ? (
              <div className="space-y-2">
                <h4 className="font-medium">{mostViewedJob.title}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    0 {t('views')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    0 {t('applications')}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('posted')} {new Date(mostViewedJob.createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">{t('noJobsPostedYet')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('activeJobs')}</span>
              <span className="font-medium">{jobs.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('totalApplications')}</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('unreadMessages')}</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('averageHireTime')}</span>
              <span className="font-medium">0 {t('days')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
