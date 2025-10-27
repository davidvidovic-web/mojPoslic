'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-keys'
import type { Database } from '@/types/supabase'

type ApplicationInsert = Database['public']['Tables']['applications']['Insert']
type ApplicationUpdate = Database['public']['Tables']['applications']['Update']

export function useApplicationsQuery(jobId?: string) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryKey: jobId ? queryKeys.jobs.applications(jobId as any) : queryKeys.applications.all,
    queryFn: async () => {
      let query = supabase
        .from('applications')
        .select(`
          *,
          user:users(*),
          job:job_listings(*)
        `)
        .order('applied_at', { ascending: false })

      if (jobId) {
        query = query.eq('job_id', jobId)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: !!jobId || true,
  })
}

export function useUserApplicationsQuery(userId?: string) {
  return useQuery({
    queryKey: queryKeys.applications.user(userId || ''),
    queryFn: async () => {
      if (!userId) {
        return []
      }
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:job_listings(
            *,
            posted_by:users(name, company_name, avatar_url)
          )
        `)
        .eq('user_id', userId)
        .order('applied_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!userId,
  })
}

export function useCreateApplicationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (applicationData: ApplicationInsert) => {
      const { data, error } = await supabase
        .from('applications')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert([applicationData as any])
        .select(`
          *,
          user:users(*),
          job:job_listings(*)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (newApplication) => {
      // Invalidate related queries
      if (newApplication.job_id) {
        queryClient.invalidateQueries({ 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          queryKey: queryKeys.jobs.applications(newApplication.job_id as any)
        })
      }
      if (newApplication.user_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.applications.user(newApplication.user_id)
        })
      }
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.applications.all
      })
    },
  })
}

export function useUpdateApplicationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ApplicationUpdate }) => {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          user:users(*),
          job:job_listings(*)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (updatedApplication) => {
      // Update cache with new data
      queryClient.setQueryData(
        queryKeys.applications.detail(updatedApplication.id),
        updatedApplication
      )
      
      // Invalidate related queries
      if (updatedApplication.job_id) {
        queryClient.invalidateQueries({ 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          queryKey: queryKeys.jobs.applications(updatedApplication.job_id as any)
        })
      }
      if (updatedApplication.user_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.applications.user(updatedApplication.user_id)
        })
      }
    },
  })
}

export function useBulkUpdateApplicationsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      applicationIds, 
      updates 
    }: { 
      applicationIds: string[]
      updates: ApplicationUpdate 
    }) => {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .in('id', applicationIds)
        .select(`
          *,
          user:users(*),
          job:job_listings(*)
        `)

      if (error) throw error
      return data
    },
    onSuccess: (updatedApplications) => {
      // Invalidate all related queries
      const jobIds = [...new Set(updatedApplications.map(app => app.job_id).filter(Boolean))]
      const userIds = [...new Set(updatedApplications.map(app => app.user_id).filter(Boolean))]

      jobIds.forEach(jobId => {
        if (jobId) {
          queryClient.invalidateQueries({ 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queryKey: queryKeys.jobs.applications(jobId as any)
          })
        }
      })

      userIds.forEach(userId => {
        if (userId) {
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.applications.user(userId)
          })
        }
      })

      queryClient.invalidateQueries({ 
        queryKey: queryKeys.applications.all
      })
    },
  })
}

/**
 * Query hook for fetching active job assignments for a tasker
 * This replaces the manual fetch call to /api/tasker/active-jobs
 * Uses TanStack Query pattern with existing API route during migration phase
 */
export function useActiveJobsQuery() {
  return useQuery({
    queryKey: ['activeJobs'],
    queryFn: async () => {
      const response = await fetch('/api/tasker/active-jobs')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch active jobs')
      }

      const result = await response.json()
      return result.activeJobs || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('Unauthorized')) {
        return false
      }
      return failureCount < 3
    },
  })
}
