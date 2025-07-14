'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, CheckCircle, DollarSign, Star } from "lucide-react"
import { Job } from "@/types/job"
import { useTranslations } from 'next-intl'

interface JobApplication {
  id: string
  job_id: string
  appliedAt: string
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
  job: Job
}

interface ApplicationStats {
  total: number
  pending: number
  shortlisted: number
  accepted: number
  completed: number
  rejected: number
  totalEarnings: number
}

interface TaskerQuickStatsProps {
  applications: JobApplication[]
  stats: ApplicationStats
}

export function TaskerQuickStats({ stats }: Omit<TaskerQuickStatsProps, 'applications'>) {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Total Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('dashboard.stats.applications')}
          </CardTitle>
          <Briefcase className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.tasker.stats.pendingReview', { count: stats.pending })}
          </p>
        </CardContent>
      </Card>

      {/* Shortlisted */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            {t('dashboard.tasker.stats.shortlisted')}
          </CardTitle>
          <Star className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
            {stats.shortlisted}
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            {t('dashboard.tasker.stats.waitingForInterview')}
          </p>
        </CardContent>
      </Card>

      {/* Active Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('dashboard.tasker.stats.activeApplications')}
          </CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.pending + stats.accepted}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.tasker.stats.accepted', { count: stats.accepted })}
          </p>
        </CardContent>
      </Card>

      {/* Completed Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('dashboard.stats.completedJobs')}
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.completed}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.tasker.stats.thisMonth')}
          </p>
        </CardContent>
      </Card>

      {/* Total Earnings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('dashboard.stats.totalEarnings')}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalEarnings.toLocaleString()} BAM
          </div>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.tasker.stats.allTime')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
