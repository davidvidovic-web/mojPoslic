'use client'

import { useJobs } from '@/hooks/use-jobs'
import { useApplications as useApplicationsQuery, useUserApplications as useUserApplicationsQuery, useApplyToJob as useCreateApplicationMutation, useUpdateApplication as useUpdateApplicationMutation } from './use-applications'
import { useCities, useCategories } from '@/hooks/use-static-data'
import { useFilterStore } from '@/stores/filter-store'
import { useRealtimeJobs, useRealtimeJobApplications } from './queries/useRealtimeJobs'
import type { JobFilters } from '@/types/job'

/**
 * Job Manager Hook - Enhanced with real-time features
 * Uses existing Prisma-based API routes + adds real-time Supabase subscriptions
 */
export function useJobManager() {
  const { 
    jobSearch, 
    jobCityFilter, 
    jobCategoryFilter, 
    jobTypeFilter,
    currentPage,
    itemsPerPage
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

  // Build filters from Zustand store
  const filters: JobFilters = {
    search: jobSearch || undefined,
    city: jobCityFilter !== 'all' ? jobCityFilter : undefined,
    category: jobCategoryFilter !== 'all' ? jobCategoryFilter : undefined,
    type: mapJobType(jobTypeFilter),
  }

  // Use our optimized Supabase-based hooks
  const { jobs, loading, error, refetch } = useJobs(filters)

  // Add real-time subscriptions (this will invalidate cache when changes occur)
  useRealtimeJobs()

  return {
    // Query data
    jobs: jobs || [],
    totalJobs: jobs?.length || 0,
    totalPages: Math.ceil((jobs?.length || 0) / itemsPerPage),
    
    // Query states
    isLoading: loading,
    isError: !!error,
    error: error,
    isFetching: loading,
    
    // Note: Mutations removed - should be handled separately via dedicated hooks
    // createJob, updateJob, deleteJob can be added back if needed
    
    // Utility functions
    refetch: refetch,
    hasNextPage: (jobs?.length || 0) > (currentPage * itemsPerPage),
    hasPreviousPage: currentPage > 1,
  }
}

/**
 * Application Manager Hook - Enhanced with real-time features
 */
export function useApplicationManager(jobId?: string, userId?: string) {
  // Use user-specific applications query if userId is provided, otherwise use general query
  const applicationsQuery = userId 
    ? useUserApplicationsQuery(userId) 
    : useApplicationsQuery() 
  const applyMutation = useCreateApplicationMutation()
  const updateMutation = useUpdateApplicationMutation()

  // Enable real-time updates for job applications (always call hook, but conditionally subscribe)
  useRealtimeJobApplications(jobId || '')

  return {
    // Query data
    applications: applicationsQuery.data || [],
    
    // Query states
    isLoading: applicationsQuery.isLoading,
    isError: applicationsQuery.isError,
    error: applicationsQuery.error,
    
    // Mutations
    applyToJob: applyMutation.mutate,
    updateApplication: updateMutation.mutate,
    
    // Mutation states
    isApplying: applyMutation.isPending,
    isUpdating: updateMutation.isPending,
    
    // Utility functions
    refetch: applicationsQuery.refetch,
  }
}

/**
 * Static Data Manager Hook - Uses optimized static data hooks
 */
export function useStaticDataManager() {
  const { cities, loading: citiesLoading } = useCities()
  const { categories, loading: categoriesLoading } = useCategories()

  return {
    // Cities data
    cities: cities || [],
    citiesLoading,
    citiesError: null, // Static data errors handled internally
    
    // Categories data
    categories: categories || [],
    categoriesLoading,
    categoriesError: null, // Static data errors handled internally
    
    // Helper functions for compatibility
    getCities: () => cities || [],
    getCategories: () => categories || [],
    getCityById: (id: string) => cities?.find((city) => city.id === id),
    getCategoryById: (id: string) => categories?.find((cat) => cat.id === id),
  }
}

/**
 * Job Acceptance Manager Hook - Enhanced with real-time features
 * Manages active job assignments and tasker job acceptance
 */
export function useJobAcceptanceManager() {
  // TODO: Implement optimized active jobs hook when needed
  // const { activeJobs, loading } = useActiveJobs(userId)

  return {
    // Query data
    activeJobs: [],
    
    // Query states
    isLoading: false,
    isError: false,
    error: null,
    
    // Utility functions
    refetch: () => {},
    hasActiveJobs: () => false,
    getActiveJob: () => undefined,
  }
}
