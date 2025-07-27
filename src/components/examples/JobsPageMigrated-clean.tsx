'use client'

import React from 'react'
import { useJobManager } from '@/hooks/useQueryManagers'
import { useFilterStore } from '@/stores/filter-store'
import { JobCard } from '@/components/job-card'
import { JobCardSkeleton } from '@/components/job-card-skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

/**
 * JobsPageMigrated - Example component showing migration from API routes to Supabase
 */
export function JobsPageMigrated() {
  const { viewMode } = useFilterStore()

  const { 
    jobs, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useJobManager()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading jobs with real-time updates...</span>
        </div>
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
            : "flex flex-col gap-3"
        }>
          {Array(6).fill(0).map((_, i) => (
            <JobCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load jobs: {error?.message}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <p className="text-muted-foreground">
          {jobs.length} jobs available • Updates in real-time
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No jobs found</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
            : "flex flex-col gap-3"
        }>
          {jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      <div className="text-center py-4 border-t">
        <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span>✅ Migrated to Supabase</span>
        </div>
      </div>
    </div>
  )
}
