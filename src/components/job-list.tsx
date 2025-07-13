'use client'

import { useJobs } from '@/hooks/use-jobs'
import { useUserAppliedJobs } from '@/hooks/use-applications'
import { useAuth } from '@/contexts/auth-context'
import { useFilterStore } from '@/stores/filter-store'
import { JobCard } from '@/components/job-card'
import { JobCardSkeleton } from '@/components/job-card-skeleton'
import { JobFilters } from '@/components/job-list/job-filters'
import { JobsViewControls } from '@/components/job-list/jobs-view-controls'
import { JobsEmptyState } from '@/components/job-list/jobs-empty-state'
import { JobsPagination } from '@/components/job-list/jobs-pagination'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { JobFilters as JobFiltersType } from '@/types/job'

export function JobList() {
  const { user } = useAuth()
  const {
    jobSearch,
    jobCityFilter,
    jobCategoryFilter,
    jobSubcategoryFilter,
    jobTypeFilter,
    currentPage,
    itemsPerPage,
    viewMode,
    sortBy,
    sortOrder,
  } = useFilterStore()

  // Map the filter store types to JobFilters type
  const mapJobType = (type: string): 'quick_job' | 'full_time' | 'part_time' | 'remote' | 'all' | undefined => {
    if (type === 'all') return 'all';
    if (type === 'quick-job') return 'quick_job';
    if (type === 'full-time') return 'full_time';
    if (type === 'part-time') return 'part_time';
    if (type === 'remote') return 'remote';
    return undefined;
  };

  // Prepare filters for query
  const filters: JobFiltersType = {
    search: jobSearch,
    city: jobCityFilter !== 'all' ? jobCityFilter : undefined,
    category: jobCategoryFilter !== 'all' ? jobCategoryFilter : undefined,
    subcategory: jobSubcategoryFilter !== 'all' ? jobSubcategoryFilter : undefined,
    type: mapJobType(jobTypeFilter),
  }

  // Fetch jobs with TanStack Query
  const { data: jobs, isLoading, isError, error } = useJobs(filters)
  
  // Fetch user's applied jobs for display indication (only if user is logged in)
  const { data: appliedJobIds = new Set() } = useUserAppliedJobs()

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <JobFilters />

      {/* Active Filters & View Controls */}
      <JobsViewControls />

      {/* Results Section */}
      {isLoading ? (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "flex flex-col gap-3"
        }>
          {Array(6).fill(0).map((_, i) => (
            <JobCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive" className="my-4">
          <AlertDescription>
            Error loading jobs: {error?.message || 'Please try again later'}
          </AlertDescription>
        </Alert>
      ) : jobs?.length === 0 ? (
        <JobsEmptyState />
      ) : (
        <>
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-3"
          }>
            {jobs?.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                viewMode={viewMode} 
                hasApplied={user ? appliedJobIds.has(job.id) : false}
              />
            )) || []}
          </div>
          
          {/* Pagination */}
          <JobsPagination totalItems={jobs?.length || 0} />
        </>
      )}
    </div>
  )
}
