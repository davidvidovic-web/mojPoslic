'use client'

import { Job } from '@/types/job'
import { JobCard } from './job-card'
import { Briefcase, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface JobsListSectionProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
  selectedApplicants?: Record<string, { name: string; id: string; avatarUrl?: string } | null>
  onDelete: (jobId: string) => void
  onEdit?: (job: Job) => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
  onViewProfile?: (candidateId: string) => void
  onMessageCandidate?: (candidateId: string, jobId: string) => void
  isLoading?: boolean
}

export function JobsListSection({ 
  jobs, 
  applicationCounts,
  selectedApplicants = {},
  onDelete, 
  onEdit,
  onFeature,
  onViewProfile,
  onMessageCandidate,
  isLoading = false 
}: JobsListSectionProps) {
  const t = useTranslations('jobs')
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center mx-auto mb-4">
          <Briefcase className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No jobs posted yet</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Click &quot;Post a Job&quot; to create your first job posting and start finding qualified candidates.
        </p>
      </div>
    )
  }

  // Separate featured and regular jobs
  const featuredJobs = jobs.filter(job => job.is_featured)
  const regularJobs = jobs.filter(job => !job.is_featured)

  return (
    <div className="space-y-8">
      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 dark:bg-yellow-950/30 rounded-full">
              <Star className="w-4 h-4 text-yellow-600 fill-current" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('sections.featuredJobs', { count: featuredJobs.length })}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/20 to-transparent"></div>
          </div>
          
          <div className="space-y-6">
            {featuredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applicationCount={applicationCounts[job.id] || 0}
                selectedCandidate={selectedApplicants[job.id] || null}
                onDelete={onDelete}
                onEdit={onEdit}
                onFeature={onFeature}
                onViewProfile={onViewProfile}
                onMessageCandidate={onMessageCandidate}
                hideFeaturedBadge={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Jobs Section */}
      {regularJobs.length > 0 && (
        <div className="space-y-4">
          {featuredJobs.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                <Briefcase className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('sections.regularJobs', { count: regularJobs.length })}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
            </div>
          )}
          
          <div className="space-y-6">
            {regularJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applicationCount={applicationCounts[job.id] || 0}
                selectedCandidate={selectedApplicants[job.id] || null}
                onDelete={onDelete}
                onEdit={onEdit}
                onFeature={onFeature}
                onViewProfile={onViewProfile}
                onMessageCandidate={onMessageCandidate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
