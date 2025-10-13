'use client'

import { useTranslations } from 'next-intl'
import { Job } from "@/types/job"

interface JobApplication {
  id: string
  job_id: string
  appliedAt: string
  status: 'PENDING' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
  job: Job
}

interface ApplicationStats {
  total: number
  pending: number
  accepted: number
  rejected: number
}

interface TaskerQuickStatsProps {
  applications: JobApplication[]
  stats: ApplicationStats
}

export function TaskerQuickStats({ stats }: Omit<TaskerQuickStatsProps, 'applications'>) {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Applications */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.stats.applications')}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.total}
          </h3>
        </div>
      </div>

      {/* Pending Applications */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.tasker.stats.pendingApplications')}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.pending}
          </h3>
        </div>
      </div>

      {/* Selected Applications */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.tasker.stats.selectedApplications')}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.accepted}
          </h3>
        </div>
      </div>

      {/* Success Rate */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.tasker.stats.successRate')}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
          </h3>
        </div>
      </div>
    </div>
  )
}
