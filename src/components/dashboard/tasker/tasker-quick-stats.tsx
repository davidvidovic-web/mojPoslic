'use client'

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
      <div className="bg-white dark:bg-gray-950 rounded-[calc(var(--radius)*1.5)] border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-[calc(var(--radius)*1.5)] bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.total}
            </div>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t('dashboard.stats.applications')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.tasker.stats.pendingReview', { count: stats.pending })}
        </p>
      </div>

      {/* Shortlisted */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-[calc(var(--radius)*1.5)] border border-yellow-200 dark:border-yellow-800 p-6 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-[calc(var(--radius)*1.5)] bg-yellow-100 dark:bg-yellow-950/40 flex items-center justify-center">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">
              {stats.shortlisted}
            </div>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
          {t('dashboard.tasker.stats.shortlisted')}
        </h3>
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          {t('dashboard.tasker.stats.waitingForInterview')}
        </p>
      </div>

      {/* Active Applications */}
      <div className="bg-white dark:bg-gray-950 rounded-[calc(var(--radius)*1.5)] border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-[calc(var(--radius)*1.5)] bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.pending + stats.accepted}
            </div>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t('dashboard.tasker.stats.activeApplications')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.tasker.stats.accepted', { count: stats.accepted })}
        </p>
      </div>

      {/* Completed Jobs */}
      <div className="bg-white dark:bg-gray-950 rounded-[calc(var(--radius)*1.5)] border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-[calc(var(--radius)*1.5)] bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.completed}
            </div>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t('dashboard.stats.completedJobs')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.tasker.stats.thisMonth')}
        </p>
      </div>

      {/* Total Earnings */}
      <div className="bg-white dark:bg-gray-950 rounded-[calc(var(--radius)*1.5)] border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-[calc(var(--radius)*1.5)] bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 font-medium">BAM</div>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t('dashboard.stats.totalEarnings')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.tasker.stats.allTime')}
        </p>
      </div>
    </div>
  )
}
