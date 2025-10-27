/**
 * TanStack Query hooks for miscellaneous low-priority APIs
 * Completes the Phase 3 migration by replacing remaining fetch() calls  
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useDashboardTranslations } from './use-translations'

// Types
interface SiteStats {
  totalJobs: number
  totalUsers: number
  totalApplications: number
  activeJobs: number
}

interface JobTodayCount {
  count: number
  hasPostedToday: boolean
}

interface TransferTokenData {
  token: string
  redirectUrl: string
}

// Query Keys
export const miscKeys = {
  all: ['misc'] as const,
  stats: () => [...miscKeys.all, 'stats'] as const,
  jobTodayCount: () => [...miscKeys.all, 'job-today-count'] as const,
  savedJobs: () => [...miscKeys.all, 'saved-jobs'] as const,
}

// API Functions using Supabase instead of fetch()
async function fetchSiteStats(): Promise<SiteStats> {
  // Get total jobs
  const { count: totalJobs } = await supabase
    .from('job_listings')
    .select('*', { count: 'exact', head: true })

  // Get active jobs  
  const { count: activeJobs } = await supabase
    .from('job_listings')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // Get total applications
  const { count: totalApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })

  return {
    totalJobs: totalJobs || 0,
    totalUsers: totalUsers || 0,
    totalApplications: totalApplications || 0,
    activeJobs: activeJobs || 0
  }
}

async function fetchJobTodayCount(userId: string): Promise<JobTodayCount> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { count } = await supabase
    .from('job_listings')
    .select('*', { count: 'exact', head: true })
    .eq('posted_by_id', userId)
    .gte('created_at', today.toISOString())

  return {
    count: count || 0,
    hasPostedToday: (count || 0) > 0
  }
}

async function fetchSavedJobs(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('job_id')
    .eq('user_id', userId)

  if (error) throw error
  return data?.map(item => item.job_id) || []
}

async function toggleSavedJob(userId: string, jobId: string): Promise<boolean> {
  // Check if job is already saved
  const { data: existing } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('user_id', userId)
    .eq('job_id', jobId)
    .single()

  if (existing) {
    // Remove from saved jobs
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId)

    if (error) throw error
    return false
  } else {
    // Add to saved jobs
    const { error } = await (supabase as any)
      .from('saved_jobs')
      .insert({
        user_id: userId,
        job_id: jobId
      })

    if (error) throw error
    return true
  }
}

async function createTransferToken(targetLanguage: string): Promise<TransferTokenData> {
  // For now, return a simple redirect URL
  // In a full migration, this would create a proper transfer token
  const currentUrl = window.location.href
  const newUrl = targetLanguage === 'en' 
    ? currentUrl.replace('://mojposlic.com', '://en.mojposlic.com')
    : currentUrl.replace('://en.mojposlic.com', '://mojposlic.com')

  return {
    token: 'temp-token', // Would be a real JWT token
    redirectUrl: newUrl
  }
}

// Query Hooks
export function useSiteStats() {
  return useQuery({
    queryKey: miscKeys.stats(),
    queryFn: fetchSiteStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  })
}

export function useJobTodayCount(userId?: string) {
  return useQuery({
    queryKey: [...miscKeys.jobTodayCount(), userId],
    queryFn: () => fetchJobTodayCount(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute - needs to be fresh for daily limits
  })
}

export function useSavedJobs(userId?: string) {
  return useQuery({
    queryKey: [...miscKeys.savedJobs(), userId],
    queryFn: () => fetchSavedJobs(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Mutation Hooks
export function useToggleSavedJob() {
  const queryClient = useQueryClient()
  const t = useDashboardTranslations()
  
  return useMutation({
    mutationFn: ({ userId, jobId }: { userId: string; jobId: string }) => 
      toggleSavedJob(userId, jobId),
    onSuccess: (isSaved, { userId }) => {
      // Update saved jobs cache
      queryClient.invalidateQueries({ 
        queryKey: [...miscKeys.savedJobs(), userId] 
      })
      
      // Show user feedback
      toast.success(isSaved ? t('toast.jobSaved') : t('toast.jobUnsaved'))
    },
    onError: () => {
      toast.error(t('toast.jobSaveFailed'))
    },
  })
}

export function useCreateTransferToken() {
  const t = useDashboardTranslations()
  
  return useMutation({
    mutationFn: createTransferToken,
    onSuccess: (data) => {
      // Redirect to new language domain
      window.location.href = data.redirectUrl
    },
    onError: () => {
      toast.error(t('toast.languageSwitchFailed'))
    },
  })
}

// Combined manager hook for miscellaneous features
export function useMiscManager(userId?: string) {
  const statsQuery = useSiteStats()
  const todayCountQuery = useJobTodayCount(userId)
  const savedJobsQuery = useSavedJobs(userId)
  const toggleSavedMutation = useToggleSavedJob()
  const transferTokenMutation = useCreateTransferToken()

  return {
    // Site statistics
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    
    // Today's job count for user
    todayCount: todayCountQuery.data,
    isLoadingTodayCount: todayCountQuery.isLoading,
    
    // Saved jobs
    savedJobs: savedJobsQuery.data || [],
    isLoadingSavedJobs: savedJobsQuery.isLoading,
    
    // Mutations
    toggleSavedJob: toggleSavedMutation.mutate,
    isTogglingSaved: toggleSavedMutation.isPending,
    
    createTransferToken: transferTokenMutation.mutate,
    isCreatingToken: transferTokenMutation.isPending,
    
    // Combined loading states
    isLoading: statsQuery.isLoading || todayCountQuery.isLoading || savedJobsQuery.isLoading,
    isError: statsQuery.isError || todayCountQuery.isError || savedJobsQuery.isError,
    error: statsQuery.error || todayCountQuery.error || savedJobsQuery.error,
    
    // Utility functions
    refetchAll: () => {
      statsQuery.refetch()
      todayCountQuery.refetch()
      savedJobsQuery.refetch()
    },
  }
}
