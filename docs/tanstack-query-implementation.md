# TanStack Query Implementation Guide

## Overview

This guide provides concrete implementation examples for migrating mojPoslić from context-based data fetching to TanStack Query. We'll show exact patterns for queries, mutations, and optimistic updates.

## Core Query Setup

### Query Client Configuration (`src/lib/query-client.ts`)

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        console.error('Mutation error:', error)
        // Global error handling
      },
    },
  },
})

// Query keys factory for consistency
export const queryKeys = {
  // Jobs
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters: JobFilters) => [...queryKeys.jobs.lists(), filters] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    applications: (jobId: string) => [...queryKeys.jobs.detail(jobId), 'applications'] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: UserFilters) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (id: string) => [...queryKeys.users.detail(id), 'profile'] as const,
  },
  
  // Categories
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
    subcategories: (parentId: string) => [...queryKeys.categories.all, 'subcategories', parentId] as const,
  },
  
  // Cities
  cities: {
    all: ['cities'] as const,
    list: () => [...queryKeys.cities.all, 'list'] as const,
  },
  
  // Stats
  stats: {
    all: ['stats'] as const,
    dashboard: (userId: string) => [...queryKeys.stats.all, 'dashboard', userId] as const,
    admin: () => [...queryKeys.stats.all, 'admin'] as const,
  },
}

// Types for filters
export interface JobFilters {
  search?: string
  city?: string
  category?: string
  subcategory?: string
  type?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UserFilters {
  search?: string
  role?: string
  page?: number
  limit?: number
}
```

### API Layer (`src/lib/api.ts`)

```typescript
// Enhanced API layer with proper error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new ApiError(
      error.message || `HTTP ${response.status}`,
      response.status,
      error.code
    )
  }

  return response.json()
}

// Job API functions
export const jobsApi = {
  getJobs: (filters: JobFilters): Promise<PaginatedResponse<Job>> =>
    apiRequest(`/jobs?${new URLSearchParams(filters as any)}`),
    
  getJob: (id: string): Promise<Job> =>
    apiRequest(`/jobs/${id}`),
    
  createJob: (data: CreateJobData): Promise<Job> =>
    apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  updateJob: (id: string, data: UpdateJobData): Promise<Job> =>
    apiRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  deleteJob: (id: string): Promise<void> =>
    apiRequest(`/jobs/${id}`, { method: 'DELETE' }),
    
  getJobApplications: (jobId: string): Promise<JobApplication[]> =>
    apiRequest(`/jobs/${jobId}/applications`),
}

// User API functions
export const usersApi = {
  getUsers: (filters: UserFilters): Promise<PaginatedResponse<User>> =>
    apiRequest(`/users?${new URLSearchParams(filters as any)}`),
    
  getUser: (id: string): Promise<User> =>
    apiRequest(`/users/${id}`),
    
  updateProfile: (id: string, data: UpdateProfileData): Promise<User> =>
    apiRequest(`/users/${id}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Categories API
export const categoriesApi = {
  getCategories: (): Promise<Category[]> =>
    apiRequest('/categories'),
    
  getSubcategories: (parentId: string): Promise<Category[]> =>
    apiRequest(`/categories/${parentId}/subcategories`),
}

// Cities API
export const citiesApi = {
  getCities: (): Promise<City[]> =>
    apiRequest('/cities'),
}

// Stats API
export const statsApi = {
  getDashboardStats: (userId: string): Promise<DashboardStats> =>
    apiRequest(`/stats/dashboard/${userId}`),
    
  getAdminStats: (): Promise<AdminStats> =>
    apiRequest('/stats/admin'),
}
```

## Query Hooks

### Jobs Queries (`src/hooks/queries/use-jobs.ts`)

```typescript
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api'
import { queryKeys, type JobFilters } from '@/lib/query-client'
import { toast } from 'sonner'

// Get paginated jobs with filters
export function useJobsQuery(filters: JobFilters = {}) {
  return useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: () => jobsApi.getJobs(filters),
    keepPreviousData: true, // Smooth transitions between pages
    staleTime: 2 * 60 * 1000, // 2 minutes for job lists
  })
}

// Get single job details
export function useJobQuery(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: () => jobsApi.getJob(jobId),
    enabled: enabled && !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes for job details
  })
}

// Infinite scroll for job lists
export function useInfiniteJobsQuery(filters: JobFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      jobsApi.getJobs({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasNextPage) {
        return allPages.length + 1
      }
      return undefined
    },
    staleTime: 2 * 60 * 1000,
  })
}

// Get job applications
export function useJobApplicationsQuery(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobs.applications(jobId),
    queryFn: () => jobsApi.getJobApplications(jobId),
    enabled: enabled && !!jobId,
    staleTime: 1 * 60 * 1000, // 1 minute for applications
  })
}

// Create job mutation
export function useCreateJobMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: jobsApi.createJob,
    onSuccess: (newJob) => {
      // Invalidate and refetch job lists
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
      
      // Optimistically add to cache
      queryClient.setQueryData(queryKeys.jobs.detail(newJob.id), newJob)
      
      toast.success('Job posted successfully!')
    },
    onError: (error: ApiError) => {
      toast.error(`Failed to post job: ${error.message}`)
    },
  })
}

// Update job mutation with optimistic updates
export function useUpdateJobMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobData }) =>
      jobsApi.updateJob(id, data),
    
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.detail(id) })
      
      // Snapshot previous value
      const previousJob = queryClient.getQueryData(queryKeys.jobs.detail(id))
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.jobs.detail(id), (old: Job | undefined) => 
        old ? { ...old, ...data } : old
      )
      
      return { previousJob }
    },
    
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousJob) {
        queryClient.setQueryData(queryKeys.jobs.detail(id), context.previousJob)
      }
      toast.error(`Failed to update job: ${error.message}`)
    },
    
    onSuccess: (updatedJob) => {
      // Update job in lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.jobs.lists() },
        (oldData: PaginatedResponse<Job> | undefined) => {
          if (!oldData) return oldData
          
          return {
            ...oldData,
            data: oldData.data.map(job => 
              job.id === updatedJob.id ? updatedJob : job
            )
          }
        }
      )
      
      toast.success('Job updated successfully!')
    },
    
    onSettled: (data, error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(id) })
    },
  })
}

// Delete job mutation
export function useDeleteJobMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: jobsApi.deleteJob,
    
    onMutate: async (jobId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.lists() })
      
      // Snapshot previous data
      const previousQueries = queryClient.getQueriesData({ queryKey: queryKeys.jobs.lists() })
      
      // Optimistically remove from all job lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.jobs.lists() },
        (oldData: PaginatedResponse<Job> | undefined) => {
          if (!oldData) return oldData
          
          return {
            ...oldData,
            data: oldData.data.filter(job => job.id !== jobId),
            total: oldData.total - 1,
          }
        }
      )
      
      return { previousQueries }
    },
    
    onError: (error, jobId, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(`Failed to delete job: ${error.message}`)
    },
    
    onSuccess: (_, jobId) => {
      // Remove job detail from cache
      queryClient.removeQueries({ queryKey: queryKeys.jobs.detail(jobId) })
      toast.success('Job deleted successfully!')
    },
    
    onSettled: () => {
      // Refetch job lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
    },
  })
}

// Custom hook for job management with integrated filter store
export function useJobManager() {
  const { 
    jobSearch, 
    jobCityFilter, 
    jobCategoryFilter, 
    jobSubcategoryFilter, 
    jobTypeFilter,
    currentPage,
    itemsPerPage 
  } = useFilterStore()
  
  const filters: JobFilters = {
    search: jobSearch || undefined,
    city: jobCityFilter !== 'all' ? jobCityFilter : undefined,
    category: jobCategoryFilter !== 'all' ? jobCategoryFilter : undefined,
    subcategory: jobSubcategoryFilter !== 'all' ? jobSubcategoryFilter : undefined,
    type: jobTypeFilter !== 'all' ? jobTypeFilter : undefined,
    page: currentPage,
    limit: itemsPerPage,
  }
  
  const jobsQuery = useJobsQuery(filters)
  const createMutation = useCreateJobMutation()
  const updateMutation = useUpdateJobMutation()
  const deleteMutation = useDeleteJobMutation()
  
  return {
    // Query data
    jobs: jobsQuery.data?.data || [],
    totalJobs: jobsQuery.data?.total || 0,
    totalPages: Math.ceil((jobsQuery.data?.total || 0) / itemsPerPage),
    
    // Query states
    isLoading: jobsQuery.isLoading,
    isError: jobsQuery.isError,
    error: jobsQuery.error,
    isFetching: jobsQuery.isFetching,
    
    // Mutations
    createJob: createMutation.mutate,
    updateJob: updateMutation.mutate,
    deleteJob: deleteMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    
    // Utility functions
    refetch: jobsQuery.refetch,
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
    },
  }
}
```

### Categories and Cities Queries (`src/hooks/queries/use-reference-data.ts`)

```typescript
import { useQuery } from '@tanstack/react-query'
import { categoriesApi, citiesApi } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'

// Categories query - long cache time since they rarely change
export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: categoriesApi.getCategories,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

// Subcategories query
export function useSubcategoriesQuery(parentId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.categories.subcategories(parentId),
    queryFn: () => categoriesApi.getSubcategories(parentId),
    enabled: enabled && !!parentId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

// Cities query - long cache time
export function useCitiesQuery() {
  return useQuery({
    queryKey: queryKeys.cities.list(),
    queryFn: citiesApi.getCities,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

// Combined reference data hook
export function useReferenceData() {
  const categoriesQuery = useCategoriesQuery()
  const citiesQuery = useCitiesQuery()
  
  return {
    categories: categoriesQuery.data || [],
    cities: citiesQuery.data || [],
    isLoadingCategories: categoriesQuery.isLoading,
    isLoadingCities: citiesQuery.isLoading,
    isLoading: categoriesQuery.isLoading || citiesQuery.isLoading,
    error: categoriesQuery.error || citiesQuery.error,
  }
}
```

### User and Profile Queries (`src/hooks/queries/use-users.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/lib/api'
import { queryKeys, type UserFilters } from '@/lib/query-client'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

// Get users list (admin)
export function useUsersQuery(filters: UserFilters = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersApi.getUsers(filters),
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

// Get single user
export function useUserQuery(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => usersApi.getUser(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get current user profile
export function useCurrentUserQuery() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.users.profile(user?.id || ''),
    queryFn: () => usersApi.getUser(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes for current user
  })
}

// Update profile mutation
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateProfileData }) =>
      usersApi.updateProfile(userId, data),
    
    onMutate: async ({ userId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) })
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData(queryKeys.users.detail(userId))
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.users.detail(userId), (old: User | undefined) => 
        old ? { ...old, ...data } : old
      )
      
      // Update current user profile if it's the same user
      if (userId === user?.id) {
        queryClient.setQueryData(queryKeys.users.profile(userId), (old: User | undefined) => 
          old ? { ...old, ...data } : old
        )
      }
      
      return { previousUser }
    },
    
    onError: (error, { userId }, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(userId), context.previousUser)
        if (userId === user?.id) {
          queryClient.setQueryData(queryKeys.users.profile(userId), context.previousUser)
        }
      }
      toast.error(`Failed to update profile: ${error.message}`)
    },
    
    onSuccess: (updatedUser, { userId }) => {
      toast.success('Profile updated successfully!')
      
      // Update user in lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.users.lists() },
        (oldData: PaginatedResponse<User> | undefined) => {
          if (!oldData) return oldData
          
          return {
            ...oldData,
            data: oldData.data.map(u => 
              u.id === updatedUser.id ? updatedUser : u
            )
          }
        }
      )
    },
    
    onSettled: (data, error, { userId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
      if (userId === user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(userId) })
      }
    },
  })
}
```

### Dashboard Stats Queries (`src/hooks/queries/use-stats.ts`)

```typescript
import { useQuery } from '@tanstack/react-query'
import { statsApi } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'
import { useAuth } from '@/contexts/auth-context'

// Dashboard stats for current user
export function useDashboardStatsQuery() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.stats.dashboard(user?.id || ''),
    queryFn: () => statsApi.getDashboardStats(user!.id),
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute - stats should be fresh
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  })
}

// Admin stats
export function useAdminStatsQuery() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  
  return useQuery({
    queryKey: queryKeys.stats.admin(),
    queryFn: statsApi.getAdminStats,
    enabled: isAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refetch every 10 minutes
  })
}
```

## Component Integration Examples

### Job List Component Migration

```typescript
// src/components/jobs/job-list.tsx
'use client'

import { useJobManager } from '@/hooks/queries/use-jobs'
import { useFilterStore } from '@/stores/filter-store'
import { JobCard } from './job-card'
import { JobCardSkeleton } from './job-card-skeleton'
import { JobsEmptyState } from './job-list/jobs-empty-state'
import { JobFilters } from './job-list/job-filters'
import { JobsPagination } from './job-list/jobs-pagination'

export function JobList() {
  const {
    jobs,
    totalJobs,
    totalPages,
    isLoading,
    isError,
    error,
    isFetching,
  } = useJobManager()
  
  const { currentPage, hasActiveJobFilters } = useFilterStore()
  
  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading jobs: {error?.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <JobFilters />
      
      {/* Loading indicator for filtering */}
      {isFetching && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Updating jobs...
          </div>
        </div>
      )}
      
      {/* Job count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            'Loading jobs...'
          ) : (
            <>
              Showing {jobs.length} of {totalJobs} jobs
              {hasActiveJobFilters && ' (filtered)'}
            </>
          )}
        </p>
      </div>
      
      {/* Job grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <JobsEmptyState hasFilters={hasActiveJobFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <JobsPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </>
      )}
    </div>
  )
}
```

### Dashboard Component Migration

```typescript
// src/components/dashboard/client-dashboard.tsx
'use client'

import { useJobManager } from '@/hooks/queries/use-jobs'
import { useDashboardStatsQuery } from '@/hooks/queries/use-stats'
import { useNavigationStore } from '@/stores/navigation-store'
import { useDialogStore } from '@/stores/dialog-store'
import { useFilterStore } from '@/stores/filter-store'

export function ClientDashboard() {
  const { data: stats, isLoading: isLoadingStats } = useDashboardStatsQuery()
  const { currentDashboardTab, setDashboardTab } = useNavigationStore()
  const { isJobPostDialogOpen, openJobPostDialog, closeJobPostDialog } = useDialogStore()
  
  // Filter jobs to show only user's jobs
  const { setJobSearch } = useFilterStore()
  
  const {
    jobs: userJobs,
    totalJobs,
    isLoading: isLoadingJobs,
    createJob,
    isCreating,
  } = useJobManager()

  const handleJobPosted = () => {
    closeJobPostDialog()
    // Jobs will automatically refresh due to query invalidation
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your job postings and applications
          </p>
        </div>
        
        <Button 
          onClick={openJobPostDialog}
          disabled={isCreating}
          className="bg-foreground hover:bg-foreground/90"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Active Jobs"
            value={stats?.activeJobs || 0}
            icon={<Briefcase className="h-4 w-4" />}
          />
          <StatsCard
            title="Applications"
            value={stats?.totalApplications || 0}
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Connections"
            value={stats?.connections || 0}
            icon={<Zap className="h-4 w-4" />}
          />
          <StatsCard
            title="Messages"
            value={stats?.unreadMessages || 0}
            icon={<MessageSquare className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <Tabs value={currentDashboardTab} onValueChange={setDashboardTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardOverview stats={stats} />
        </TabsContent>

        <TabsContent value="jobs">
          <UserJobsList jobs={userJobs} isLoading={isLoadingJobs} />
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationsList />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesList />
        </TabsContent>
      </Tabs>

      {/* Job Post Dialog */}
      <Dialog open={isJobPostDialogOpen} onOpenChange={closeJobPostDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a New Job</DialogTitle>
          </DialogHeader>
          <MultiStepJobForm onJobPosted={handleJobPosted} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

## Error Handling and Loading States

### Global Error Boundary

```typescript
// src/components/error-boundary.tsx
'use client'

import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
        <p className="text-gray-600">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  const { reset } = useQueryErrorResetBoundary()
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={reset}
    >
      {children}
    </ErrorBoundary>
  )
}
```

### Loading States Hook

```typescript
// src/hooks/use-loading-states.ts
import { useIsFetching, useIsMutating } from '@tanstack/react-query'

export function useLoadingStates() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  
  return {
    isAnyLoading: isFetching > 0 || isMutating > 0,
    isFetching: isFetching > 0,
    isMutating: isMutating > 0,
    
    // Specific loading states
    isJobsLoading: useIsFetching({ queryKey: ['jobs'] }) > 0,
    isUsersLoading: useIsFetching({ queryKey: ['users'] }) > 0,
    isStatsLoading: useIsFetching({ queryKey: ['stats'] }) > 0,
  }
}
```

## Performance Optimizations

### Prefetching

```typescript
// src/hooks/use-prefetch.ts
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { jobsApi, categoriesApi, citiesApi } from '@/lib/api'

export function usePrefetch() {
  const queryClient = useQueryClient()
  
  const prefetchJobDetails = (jobId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.jobs.detail(jobId),
      queryFn: () => jobsApi.getJob(jobId),
      staleTime: 5 * 60 * 1000,
    })
  }
  
  const prefetchReferenceData = () => {
    // Prefetch categories and cities on app initialization
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(),
      queryFn: categoriesApi.getCategories,
      staleTime: 24 * 60 * 60 * 1000,
    })
    
    queryClient.prefetchQuery({
      queryKey: queryKeys.cities.list(),
      queryFn: citiesApi.getCities,
      staleTime: 24 * 60 * 60 * 1000,
    })
  }
  
  return {
    prefetchJobDetails,
    prefetchReferenceData,
  }
}
```

### Background Refetching

```typescript
// src/hooks/use-background-sync.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { useUIPreferencesStore } from '@/stores/ui-preferences-store'

export function useBackgroundSync() {
  const queryClient = useQueryClient()
  const { autoRefreshJobs, refreshInterval } = useUIPreferencesStore()
  
  useEffect(() => {
    if (!autoRefreshJobs) return
    
    const interval = setInterval(() => {
      // Background refetch job lists
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.jobs.lists(),
        refetchType: 'inactive', // Only refetch if not currently fetching
      })
      
      // Background refetch stats
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.stats.all,
        refetchType: 'inactive',
      })
    }, refreshInterval * 1000)
    
    return () => clearInterval(interval)
  }, [queryClient, autoRefreshJobs, refreshInterval])
}
```

## Migration Timeline

### Week 1: Foundation
- [ ] Install TanStack Query
- [ ] Set up QueryClient configuration
- [ ] Create API layer
- [ ] Update root layout with QueryClientProvider

### Week 2: Core Queries
- [ ] Implement jobs queries and mutations
- [ ] Migrate job list components
- [ ] Add reference data queries (categories, cities)

### Week 3: User & Stats
- [ ] Implement user queries
- [ ] Add dashboard stats queries
- [ ] Migrate dashboard components

### Week 4: Advanced Features
- [ ] Add infinite scroll for job lists
- [ ] Implement optimistic updates
- [ ] Add background sync
- [ ] Performance optimizations

### Week 5: Testing & Polish
- [ ] Add error boundaries
- [ ] Test optimistic updates
- [ ] Performance testing
- [ ] Remove deprecated contexts

This implementation provides a solid foundation for modern, performant data fetching in the mojPoslić application.
