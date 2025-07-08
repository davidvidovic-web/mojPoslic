/**
 * TanStack Query hooks for job data management
 * Replaces the legacy jobs-context.tsx
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Job, CreateJobData, JobFilters } from '@/types/job'
import { toast } from 'sonner'

// Query Keys
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobKeys.lists(), filters] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  user: (userId: string) => [...jobKeys.all, 'user', userId] as const,
  applications: (jobId: string) => [...jobKeys.all, 'applications', jobId] as const,
}

// API Functions
async function fetchJobs(filters?: JobFilters): Promise<Job[]> {
  const params = new URLSearchParams()
  
  if (filters?.search) params.append('search', filters.search)
  if (filters?.city) params.append('city', filters.city)
  if (filters?.category) params.append('category', filters.category)
  if (filters?.type) params.append('type', filters.type)
  if (filters?.subcategory) params.append('subcategory', filters.subcategory)
  
  const response = await fetch(`/api/jobs?${params}`)
  if (!response.ok) throw new Error('Failed to fetch jobs')
  return response.json()
}

async function fetchJob(id: string): Promise<Job> {
  const response = await fetch(`/api/jobs/${id}`)
  if (!response.ok) throw new Error('Failed to fetch job')
  return response.json()
}

async function fetchUserJobs(userId: string): Promise<Job[]> {
  const response = await fetch(`/api/jobs/user/${userId}`)
  if (!response.ok) throw new Error('Failed to fetch user jobs')
  return response.json()
}

async function createJob(data: CreateJobData): Promise<Job> {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create job')
  return response.json()
}

async function updateJob(id: string, data: Partial<CreateJobData>): Promise<Job> {
  const response = await fetch(`/api/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update job')
  return response.json()
}

async function deleteJob(id: string): Promise<void> {
  const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete job')
}

// Query Hooks
export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: jobKeys.list(filters || {}),
    queryFn: () => fetchJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime renamed to gcTime in v5)
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => fetchJob(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true, // Keep job details fresh
  })
}

export function useUserJobs(userId: string) {
  return useQuery({
    queryKey: jobKeys.user(userId),
    queryFn: () => fetchUserJobs(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes for user's own jobs
  })
}

// Mutation Hooks
export function useCreateJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createJob,
    onMutate: async (newJob) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: jobKeys.lists() })
      
      // Optimistically update the cache
      const previousJobs = queryClient.getQueryData(jobKeys.lists())
      queryClient.setQueryData(jobKeys.lists(), (old: Job[] = []) => [
        { ...newJob, id: 'temp-' + Date.now() } as Job,
        ...old
      ])
      
      return { previousJobs }
    },
    onSuccess: (newJob) => {
      // Invalidate and refetch all job lists
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      
      // Add the new job to cache
      queryClient.setQueryData(jobKeys.detail(newJob.id), newJob)
      
      toast.success('Job posted successfully!')
    },
    onError: (error, newJob, context) => {
      // Rollback optimistic update
      if (context?.previousJobs) {
        queryClient.setQueryData(jobKeys.lists(), context.previousJobs)
      }
      
      toast.error('Failed to post job. Please try again.')
      console.error('Job creation error:', error)
    },
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobData> }) =>
      updateJob(id, data),
    onSuccess: (updatedJob) => {
      // Update the specific job in cache
      queryClient.setQueryData(jobKeys.detail(updatedJob.id), updatedJob)
      
      // Invalidate job lists to reflect changes
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      
      toast.success('Job updated successfully!')
    },
    onError: (error) => {
      toast.error('Failed to update job. Please try again.')
      console.error('Job update error:', error)
    },
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: (_, deletedJobId) => {
      // Remove from all caches
      queryClient.removeQueries({ queryKey: jobKeys.detail(deletedJobId) })
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      
      toast.success('Job deleted successfully!')
    },
    onError: (error) => {
      toast.error('Failed to delete job. Please try again.')
      console.error('Job deletion error:', error)
    },
  })
}

// Helper hook for job applications count
export function useJobApplicationsCount(jobId: string) {
  return useQuery({
    queryKey: jobKeys.applications(jobId),
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/applications/count`)
      if (!response.ok) throw new Error('Failed to fetch applications count')
      return response.json()
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
