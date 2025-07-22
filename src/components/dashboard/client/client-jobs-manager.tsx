'use client'

import { Job } from '@/types/job'
import { Button } from '@/components/ui/button'
import { JobsListSection } from './jobs-list-section'
import { 
  Briefcase, 
  Users, 
  TrendingUp,
  Plus,
  BarChart3
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ClientJobsManagerProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
  onPostNewJob?: () => void
  loading?: boolean
}

export function ClientJobsManager({ 
  jobs, 
  applicationCounts, 
  onEdit, 
  onDelete, 
  onFeature,
  onPostNewJob,
  loading = false 
}: ClientJobsManagerProps) {
  const t = useTranslations()
  
  // Calculate statistics
  const totalJobs = jobs.length
  const activeJobs = jobs.filter(job => job.is_active !== false).length
  const totalApplications = Object.values(applicationCounts).reduce((sum, count) => sum + count, 0)
  const featuredJobs = jobs.filter(job => job.is_featured).length

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center lg:text-left">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>

        {/* Stats Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Jobs List Loading */}
        <JobsListSection
          jobs={[]}
          applicationCounts={{}}
          onDelete={() => {}}
          onEdit={onEdit}
          onFeature={onFeature}
          isLoading={true}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('dashboard.client.jobs.title') || 'My Jobs'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('dashboard.client.jobs.description') || 'Manage your job postings and track applications'}
          </p>
        </div>
        <Button onClick={onPostNewJob} className="rounded-xl w-fit lg:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t('dashboard.client.jobs.postNew') || 'Post New Job'}
        </Button>
      </div>

      {/* Quick Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalJobs}</div>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('dashboard.stats.totalJobs') || 'Total Jobs'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activeJobs} {t('dashboard.stats.active') || 'active'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalApplications}</div>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('dashboard.stats.totalApplications') || 'Total Applications'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.stats.acrossAllJobs') || 'Across all jobs'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{featuredJobs}</div>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('dashboard.stats.featuredJobs') || 'Featured Jobs'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.stats.premiumListings') || 'Premium listings'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {totalApplications > 0 ? Math.round(totalApplications / totalJobs) : 0}
              </div>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('dashboard.stats.avgApplications') || 'Avg Applications'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.stats.perJob') || 'Per job'}
          </p>
        </div>
      </div>

      {/* Jobs List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('dashboard.client.jobs.yourJobs') || 'Your Job Postings'}
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {totalJobs} {totalJobs === 1 ? 'job' : 'jobs'}
          </div>
        </div>

        <JobsListSection
          jobs={jobs}
          applicationCounts={applicationCounts}
          onDelete={onDelete}
          onEdit={onEdit}
          onFeature={onFeature}
          isLoading={false}
        />
      </div>
    </div>
  )
}
