'use client'

import { Job } from '@/types/job'
import { JobCard } from './job-card'
import { Briefcase } from 'lucide-react'

interface JobsListSectionProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
  onDelete: (jobId: string) => void
  onEdit?: (job: Job) => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
  isLoading?: boolean
}

export function JobsListSection({ 
  jobs, 
  applicationCounts, 
  onDelete, 
  onEdit,
  onFeature,
  isLoading = false 
}: JobsListSectionProps) {
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

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          applicationCount={applicationCounts[job.id] || 0}
          onDelete={onDelete}
          onEdit={onEdit}
          onFeature={onFeature}
        />
      ))}
    </div>
  )
}
