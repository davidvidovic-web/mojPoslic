'use client'

import { useJobManager } from '@/hooks/useQueryManagers'
import { useUserAppliedJobsQuery } from '@/hooks/queries/useJobs'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useFilterStore } from '@/stores/filter-store'
import { JobCard } from '@/components/job-card'
import { JobCardSkeleton } from '@/components/job-card-skeleton'
import { JobFilters } from '@/components/job-list/job-filters'
import { JobsViewControls } from '@/components/job-list/jobs-view-controls'
import { JobsEmptyState } from '@/components/job-list/jobs-empty-state'
import { JobsPagination } from '@/components/job-list/jobs-pagination'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'
import type { Job } from '@/types/job'

export function JobList() {
  const t = useTranslations('common.messages')
  const { user } = useSupabaseAuth()
  const {
    viewMode,
  } = useFilterStore()

    // Use the new Supabase-based job manager - works for both authenticated and public users
  const { 
    jobs, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useJobManager()
  
  // Fetch user's applied jobs for display indication (only if user is logged in and auth is loaded)
  const { data: appliedJobIds = new Set() } = useUserAppliedJobsQuery(user?.id)

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <JobFilters />

      {/* Active Filters & View Controls */}
      <JobsViewControls refreshJobs={refetch} />

      {/* Results Section */}
      {isLoading ? (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            : "flex flex-col gap-3"
        }>
          {Array(6).fill(0).map((_, i) => (
            <JobCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive" className="my-4">
          <AlertDescription>
            {t('somethingWentWrong')}: {typeof error === 'string' ? error : t('tryAgainLater')}
          </AlertDescription>
        </Alert>
      ) : !jobs || jobs.length === 0 ? (
        <JobsEmptyState />
      ) : (
        <>
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              : "flex flex-col gap-3"
          }>
            {jobs.map((job: Job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                viewMode={viewMode} 
                hasApplied={user ? appliedJobIds.has(job.id) : false}
              />
            ))}
          </div>
          
          {/* Pagination */}
          <JobsPagination totalItems={jobs.length} />
        </>
      )}
    </div>
  )
}
