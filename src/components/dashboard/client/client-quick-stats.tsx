'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, MessageCircle, Calendar } from 'lucide-react'
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
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{activeJobs}</div>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t('dashboard.stats.activeJobs')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.stats.currentlyHiring')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalApplications}</div>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t('dashboard.stats.totalApplications')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.stats.acrossAllJobs')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">0</div>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t('dashboard.stats.newMessages')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.stats.fromApplicants')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{thisMonthJobs}</div>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t('dashboard.stats.thisMonth')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.stats.jobsPosted')}
        </p>
      </div>
    </div>
  )
}
