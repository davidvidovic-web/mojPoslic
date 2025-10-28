'use client'

import { useTranslations } from 'next-intl'
import { Job } from '@/types/job'

interface ClientQuickStatsProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
}

export function ClientQuickStats({ jobs, applicationCounts }: ClientQuickStatsProps) {
  const t = useTranslations()
  
  const activeJobs = jobs.filter(job => job.status === 'active').length
  const completedJobs = jobs.filter(job => job.status === 'completed').length
  const totalApplications = Object.values(applicationCounts).reduce((sum, count) => sum + count, 0)
  
  // Calculate jobs with active applications (jobs that have received applications)
  const jobsWithApplications = Object.values(applicationCounts).filter(count => count > 0).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Active Jobs */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.stats.activeJobs')}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {activeJobs}
          </h3>
        </div>
      </div>

      {/* Completed Jobs */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.stats.completedJobs')}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {completedJobs}
          </h3>
        </div>
      </div>

      {/* Total Applications */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.stats.totalApplications')}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {totalApplications}
          </h3>
        </div>
      </div>

      {/* Jobs with Applications */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.client.stats.jobsWithApplications')}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {jobsWithApplications}
          </h3>
        </div>
      </div>
    </div>
  )
}
